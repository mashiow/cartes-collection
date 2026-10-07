import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type;
  const userId = body?.userId;

  if (typeof userId !== "string") {
    return NextResponse.json({ error: "Joueur invalide" }, { status: 400 });
  }

  try {
    if (type === "coins") {
      const amount = body.amount;
      if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 100000) {
        return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        const res = await tx.user.updateMany({
          where: amount < 0 ? { id: userId, coins: { gte: -amount } } : { id: userId },
          data: { coins: { increment: amount } },
        });
        if (res.count === 0) throw new Error("NOT_ENOUGH");

        await tx.coinTransaction.create({
          data: { userId, amount, reason: `Admin (${admin.name})` },
        });
      });
      return NextResponse.json({ ok: true });
    }

    if (type === "boosters") {
      const amount = body.amount;
      if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 1000) {
        return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
      }

      const res = await prisma.user.updateMany({
        where:
          amount < 0
            ? { id: userId, freeBoosters: { gte: -amount } }
            : { id: userId },
        data: { freeBoosters: { increment: amount } },
      });
      if (res.count === 0) throw new Error("NOT_ENOUGH");
      return NextResponse.json({ ok: true });
    }

    if (type === "card") {
      const cardId = body.cardId;
      const quantity = body.quantity;
      if (
        typeof cardId !== "string" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json({ error: "Données invalides" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        const card = await tx.card.findUnique({ where: { id: cardId } });
        if (!user || !card) throw new Error("NOT_FOUND");

        await tx.userCard.upsert({
          where: { userId_cardId: { userId, cardId } },
          update: { quantity: { increment: quantity } },
          create: { userId, cardId, quantity },
        });
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_ENOUGH") {
      return NextResponse.json(
        { error: "Le joueur n'existe pas ou n'en a pas assez." },
        { status: 400 }
      );
    }
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Joueur ou carte introuvable." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}