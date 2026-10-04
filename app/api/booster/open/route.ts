import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BOOSTER_PRICE, rollRarity } from "@/lib/booster";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const userId = session.user.id;
  const rarity = rollRarity();

  try {
    const card = await prisma.$transaction(async (tx) => {
      // On retire la monnaie seulement s'il y en a assez
      const debit = await tx.user.updateMany({
        where: { id: userId, coins: { gte: BOOSTER_PRICE } },
        data: { coins: { decrement: BOOSTER_PRICE } },
      });
      if (debit.count === 0) throw new Error("NOT_ENOUGH_COINS");

      let candidates = await tx.card.findMany({ where: { rarity } });
      if (candidates.length === 0) candidates = await tx.card.findMany();
      if (candidates.length === 0) throw new Error("NO_CARDS");

      const picked = candidates[randomInt(candidates.length)];

      await tx.userCard.upsert({
        where: { userId_cardId: { userId, cardId: picked.id } },
        update: { quantity: { increment: 1 } },
        create: { userId, cardId: picked.id, quantity: 1 },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -BOOSTER_PRICE,
          reason: "Ouverture d'un booster",
        },
      });

      return picked;
    });

    return NextResponse.json({ card });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_ENOUGH_COINS") {
      return NextResponse.json({ error: "Pas assez de monnaie" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}