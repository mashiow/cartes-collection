import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_COINS, todayKey } from "@/lib/rewards";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = todayKey();

  try {
    await prisma.$transaction(async (tx) => {
      // Une seule récupération par jour, même en cliquant très vite
      const claimed = await tx.user.updateMany({
        where: {
          id: userId,
          OR: [{ lastDailyDate: null }, { lastDailyDate: { not: today } }],
        },
        data: { coins: { increment: DAILY_COINS }, lastDailyDate: today },
      });
      if (claimed.count === 0) throw new Error("ALREADY_CLAIMED");

      await tx.coinTransaction.create({
        data: { userId, amount: DAILY_COINS, reason: "Récompense quotidienne" },
      });
    });

    return NextResponse.json({ coins: DAILY_COINS });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_CLAIMED") {
      return NextResponse.json(
        { error: "Tu as déjà récupéré ta récompense aujourd'hui." },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}