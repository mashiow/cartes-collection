import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BOOSTER_PRICE, rollRarity } from "@/lib/booster";

const ERRORS: Record<string, string> = {
  NOT_ENOUGH_COINS: "Pas assez de monnaie",
  NO_FREE_BOOSTER: "Tu n'as pas de booster offert",
  NO_CARDS: "Aucune carte disponible",
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const useFree = body?.free === true;

  const userId = session.user.id;
  const rarity = rollRarity();

  try {
    const card = await prisma.$transaction(async (tx) => {
      if (useFree) {
        const used = await tx.user.updateMany({
          where: { id: userId, freeBoosters: { gte: 1 } },
          data: { freeBoosters: { decrement: 1 } },
        });
        if (used.count === 0) throw new Error("NO_FREE_BOOSTER");
      } else {
        const debit = await tx.user.updateMany({
          where: { id: userId, coins: { gte: BOOSTER_PRICE } },
          data: { coins: { decrement: BOOSTER_PRICE } },
        });
        if (debit.count === 0) throw new Error("NOT_ENOUGH_COINS");
      }

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
          amount: useFree ? 0 : -BOOSTER_PRICE,
          reason: useFree ? "Booster offert ouvert" : "Ouverture d'un booster",
        },
      });

      return picked;
    });

    return NextResponse.json({ card });
  } catch (e) {
    if (e instanceof Error && ERRORS[e.message]) {
      return NextResponse.json({ error: ERRORS[e.message] }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}