import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ERRORS: Record<string, string> = {
  TRADE_UNAVAILABLE: "Cette offre n'est plus disponible.",
  OWN_TRADE: "Tu ne peux pas accepter ta propre offre.",
  NOT_OWNED: "Tu ne possèdes pas la carte demandée.",
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      const trade = await tx.trade.findUnique({ where: { id } });
      if (!trade || trade.status !== "OPEN") throw new Error("TRADE_UNAVAILABLE");
      if (trade.creatorId === userId) throw new Error("OWN_TRADE");

      // Verrou : un seul joueur peut valider cette offre
      const lock = await tx.trade.updateMany({
        where: { id, status: "OPEN" },
        data: { status: "COMPLETED", acceptedById: userId, completedAt: new Date() },
      });
      if (lock.count === 0) throw new Error("TRADE_UNAVAILABLE");

      // Celui qui accepte donne la carte demandée
      const removed = await tx.userCard.updateMany({
        where: { userId, cardId: trade.wantedCardId, quantity: { gte: 1 } },
        data: { quantity: { decrement: 1 } },
      });
      if (removed.count === 0) throw new Error("NOT_OWNED");
      await tx.userCard.deleteMany({
        where: { userId, cardId: trade.wantedCardId, quantity: { lte: 0 } },
      });

      // Le créateur reçoit la carte demandée
      await tx.userCard.upsert({
        where: {
          userId_cardId: { userId: trade.creatorId, cardId: trade.wantedCardId },
        },
        update: { quantity: { increment: 1 } },
        create: { userId: trade.creatorId, cardId: trade.wantedCardId, quantity: 1 },
      });

      // Celui qui accepte reçoit la carte offerte
      await tx.userCard.upsert({
        where: { userId_cardId: { userId, cardId: trade.offeredCardId } },
        update: { quantity: { increment: 1 } },
        create: { userId, cardId: trade.offeredCardId, quantity: 1 },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && ERRORS[e.message]) {
      return NextResponse.json({ error: ERRORS[e.message] }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}