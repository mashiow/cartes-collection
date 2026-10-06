import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isWednesday, todayKey } from "@/lib/rewards";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  if (!isWednesday()) {
    return NextResponse.json(
      { error: "Le booster offert est disponible le mercredi." },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const today = todayKey();

  try {
    const claimed = await prisma.user.updateMany({
      where: {
        id: userId,
        OR: [{ lastWeeklyDate: null }, { lastWeeklyDate: { not: today } }],
      },
      data: { freeBoosters: { increment: 1 }, lastWeeklyDate: today },
    });

    if (claimed.count === 0) {
      return NextResponse.json(
        { error: "Tu as déjà récupéré ton booster offert aujourd'hui." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}