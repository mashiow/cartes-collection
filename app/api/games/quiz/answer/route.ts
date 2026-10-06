import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QUIZ_REWARD } from "@/lib/quiz";

const ERRORS: Record<string, string> = {
  ROUND_NOT_FOUND: "Cette partie n'existe pas.",
  INVALID_OPTION: "Réponse invalide.",
  ALREADY_ANSWERED: "Tu as déjà répondu à cette question.",
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const roundId = body?.roundId;
  const optionId = body?.optionId;

  if (typeof roundId !== "string" || typeof optionId !== "string") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const round = await tx.quizRound.findFirst({
        where: { id: roundId, userId },
      });
      if (!round) throw new Error("ROUND_NOT_FOUND");
      if (!round.optionIds.includes(optionId)) throw new Error("INVALID_OPTION");

      // On ferme la question : une seule réponse possible
      const lock = await tx.quizRound.updateMany({
        where: { id: round.id, answeredAt: null },
        data: { answeredAt: new Date(), chosenId: optionId },
      });
      if (lock.count === 0) throw new Error("ALREADY_ANSWERED");

      const card = await tx.card.findUnique({
        where: { id: round.cardId },
        select: { name: true },
      });

      const correct = optionId === round.cardId;
      if (correct) {
        await tx.user.update({
          where: { id: userId },
          data: { coins: { increment: QUIZ_REWARD } },
        });
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: QUIZ_REWARD,
            reason: "Mini-jeu : Qui est-ce ?",
          },
        });
      }

      return {
        correct,
        answerName: card?.name ?? "",
        gain: correct ? QUIZ_REWARD : 0,
      };
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