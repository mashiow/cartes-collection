import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ERRORS: Record<string, string> = {
  TICKET_NOT_FOUND: "Ce ticket n'existe pas.",
  ALREADY_CLAIMED: "Ce ticket a déjà été gratté.",
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ticketId = body?.ticketId;
  if (typeof ticketId !== "string") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.scratchTicket.findFirst({
        where: { id: ticketId, userId },
      });
      if (!ticket) throw new Error("TICKET_NOT_FOUND");

      // Le gain n'est donné qu'une seule fois
      const lock = await tx.scratchTicket.updateMany({
        where: { id: ticket.id, claimedAt: null },
        data: { claimedAt: new Date() },
      });
      if (lock.count === 0) throw new Error("ALREADY_CLAIMED");

      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: ticket.prizeCoins },
          freeBoosters: { increment: ticket.prizeBoosters },
        },
      });

      if (ticket.prizeCoins > 0) {
        await tx.coinTransaction.create({
          data: { userId, amount: ticket.prizeCoins, reason: "Ticket à gratter" },
        });
      }

      return { coins: ticket.prizeCoins, boosters: ticket.prizeBoosters };
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