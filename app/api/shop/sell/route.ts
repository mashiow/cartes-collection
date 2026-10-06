import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sellPrice } from "@/lib/shop";

const ERRORS: Record<string, string> = {
  CARD_NOT_FOUND: "Cette carte n'existe pas.",
  NOT_ENOUGH_CARDS: "Tu ne possèdes pas assez d'exemplaires de cette carte.",
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const cardId = body?.cardId;
  const quantity = body?.quantity;

  if (
    typeof cardId !== "string" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 1000
  ) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id: cardId } });
      if (!card) throw new Error("CARD_NOT_FOUND");

      const removed = await tx.userCard.updateMany({
        where: { userId, cardId, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (removed.count === 0) throw new Error("NOT_ENOUGH_CARDS");

      await tx.userCard.deleteMany({
        where: { userId, cardId, quantity: { lte: 0 } },
      });

      const gain = sellPrice(card.rarity) * quantity;

      await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: gain } },
      });
      await tx.coinTransaction.create({
        data: { userId, amount: gain, reason: `Vente : ${card.name} x${quantity}` },
      });

      return { gain };
    });

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error && ERRORS[e.message]) {
      return NextResponse.json({ error: ERRORS[e.message] }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}