import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const userId = body?.userId;
  const cardId = body?.cardId;
  const all = body?.all === true;
  const quantity = body?.quantity;

  if (
    typeof userId !== "string" ||
    typeof cardId !== "string" ||
    (!all && (!Number.isInteger(quantity) || quantity < 1))
  ) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (all) {
        const res = await tx.userCard.deleteMany({ where: { userId, cardId } });
        if (res.count === 0) throw new Error("NOT_OWNED");
      } else {
        const res = await tx.userCard.updateMany({
          where: { userId, cardId, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });
        if (res.count === 0) throw new Error("NOT_OWNED");
        await tx.userCard.deleteMany({
          where: { userId, cardId, quantity: { lte: 0 } },
        });
      }
    });

    console.log(
      `[admin] ${admin.name} retire ${all ? "toutes les copies" : quantity + " copie(s)"} de la carte ${cardId} au joueur ${userId}`
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_OWNED") {
      return NextResponse.json(
        { error: "Le joueur ne possède pas cette carte en quantité suffisante." },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}