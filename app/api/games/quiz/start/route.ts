import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/rewards";
import { DAILY_GAMES, buildQuestion } from "@/lib/quiz";
import { visibleCardsWhere } from "@/lib/limited";

const ERRORS: Record<string, string> = {
  NO_GAMES_LEFT: `Tu as utilisé tes ${DAILY_GAMES} parties du jour. Reviens demain !`,
  NOT_ENOUGH_CARDS:
    "Il n'y a pas encore assez de cartes avec une bio pour jouer.",
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = todayKey();

  try {
    // Une question lancée mais pas répondue ? On la reprend, sans consommer de partie
    let round = await prisma.quizRound.findFirst({
      where: { userId, answeredAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!round) {
      round = await prisma.$transaction(async (tx) => {
        // On compte une partie : nouveau jour = compteur remis à 1
        const reset = await tx.user.updateMany({
          where: {
            id: userId,
            OR: [{ gamesDate: null }, { gamesDate: { not: today } }],
          },
          data: { gamesDate: today, gamesPlayed: 1 },
        });
        if (reset.count === 0) {
          const inc = await tx.user.updateMany({
            where: {
              id: userId,
              gamesDate: today,
              gamesPlayed: { lt: DAILY_GAMES },
            },
            data: { gamesPlayed: { increment: 1 } },
          });
          if (inc.count === 0) throw new Error("NO_GAMES_LEFT");
        }

        // La bonne réponse : une carte qui a une bio
        const candidates = await tx.card.findMany({
          where: { bio: { not: "" }, ...visibleCardsWhere() },
          select: { id: true },
        });
        if (candidates.length === 0) throw new Error("NOT_ENOUGH_CARDS");
        const answer = candidates[randomInt(candidates.length)];

        // Trois mauvaises réponses au hasard
        const others = await tx.card.findMany({
         where: { id: { not: answer.id }, ...visibleCardsWhere() },
          select: { id: true },
        });
        if (others.length < 3) throw new Error("NOT_ENOUGH_CARDS");
        const wrong = shuffle(others).slice(0, 3);

        const optionIds = shuffle([answer.id, ...wrong.map((c) => c.id)]);

        return tx.quizRound.create({
          data: { userId, cardId: answer.id, optionIds },
        });
      });
    }

    const question = await buildQuestion(round);
    if (!question) {
      // La carte de cette question a été supprimée : on abandonne la question
      await prisma.quizRound.update({
        where: { id: round.id },
        data: { answeredAt: new Date() },
      });
      return NextResponse.json(
        { error: "Question indisponible, réessaie." },
        { status: 500 }
      );
    }

    return NextResponse.json(question);
  } catch (e) {
    if (e instanceof Error && ERRORS[e.message]) {
      return NextResponse.json({ error: ERRORS[e.message] }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}