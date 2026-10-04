import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      if (!trade || trade.creatorId !== userId) throw new Error("TRADE_UNAVAILABLE");

      const lock = await tx.trade.updateMany({
        where: { id, status: "OPEN" },
        data: { status: "CANCELLED" },
      });
      if (lock.count === 0) throw new Error("TRADE_UNAVAILABLE");

      // La carte mise de côté retourne à son propriétaire
      await tx.userCard.upsert({
        where: { userId_cardId: { userId, cardId: trade.offeredCardId } },
        update: { quantity: { increment: 1 } },
        create: { userId, cardId: trade.offeredCardId, quantity: 1 },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "TRADE_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Cette offre n'est plus disponible." },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}