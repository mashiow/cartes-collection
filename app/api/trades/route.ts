import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_OPEN_TRADES = 10;

const ERRORS: Record<string, string> = {
  CARD_NOT_FOUND: "Cette carte n'existe pas.",
  TOO_MANY_TRADES: `Tu as déjà ${MAX_OPEN_TRADES} offres ouvertes.`,
  NOT_OWNED: "Tu ne possèdes pas la carte que tu proposes.",
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const offeredCardId = body?.offeredCardId;
  const wantedCardId = body?.wantedCardId;

  if (typeof offeredCardId !== "string" || typeof wantedCardId !== "string") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  if (offeredCardId === wantedCardId) {
    return NextResponse.json(
      { error: "Choisis deux cartes différentes." },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  try {
    const trade = await prisma.$transaction(async (tx) => {
      const wanted = await tx.card.findUnique({ where: { id: wantedCardId } });
      if (!wanted) throw new Error("CARD_NOT_FOUND");

      const openCount = await tx.trade.count({
        where: { creatorId: userId, status: "OPEN" },
      });
      if (openCount >= MAX_OPEN_TRADES) throw new Error("TOO_MANY_TRADES");

      // La carte offerte est mise de côté jusqu'à la fin de l'échange
      const removed = await tx.userCard.updateMany({
        where: { userId, cardId: offeredCardId, quantity: { gte: 1 } },
        data: { quantity: { decrement: 1 } },
      });
      if (removed.count === 0) throw new Error("NOT_OWNED");
      await tx.userCard.deleteMany({
        where: { userId, cardId: offeredCardId, quantity: { lte: 0 } },
      });

      return tx.trade.create({
        data: { creatorId: userId, offeredCardId, wantedCardId },
      });
    });

    return NextResponse.json({ trade });
  } catch (e) {
    if (e instanceof Error && ERRORS[e.message]) {
      return NextResponse.json({ error: ERRORS[e.message] }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}