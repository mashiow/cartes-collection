import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/rewards";
import { rollPrize } from "@/lib/scratch";

async function createTicket(userId: string, day: string) {
  const prize = rollPrize();
  try {
    return await prisma.scratchTicket.create({
      data: {
        userId,
        day,
        prizeCoins: prize.coins,
        prizeBoosters: prize.boosters,
      },
    });
  } catch (e) {
    // Deux clics en même temps : le ticket du jour existe déjà, on le reprend
    const existing = await prisma.scratchTicket.findUnique({
      where: { userId_day: { userId, day } },
    });
    if (existing) return existing;
    throw e;
  }
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const userId = session.user.id;
  const day = todayKey();

  try {
    // Un ticket pas encore gratté passe en premier
    let ticket = await prisma.scratchTicket.findFirst({
      where: { userId, claimedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!ticket) {
      const alreadyPlayed = await prisma.scratchTicket.findUnique({
        where: { userId_day: { userId, day } },
      });
      if (alreadyPlayed) {
        return NextResponse.json(
          { error: "Tu as déjà gratté ton ticket aujourd'hui. Reviens demain !" },
          { status: 400 }
        );
      }
      ticket = await createTicket(userId, day);
    }

    return NextResponse.json({
      ticketId: ticket.id,
      coins: ticket.prizeCoins,
      boosters: ticket.prizeBoosters,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}