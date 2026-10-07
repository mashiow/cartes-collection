import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/rewards";
import { DAILY_GAMES, QUIZ_REWARD } from "@/lib/quiz";
import QuizGame from "@/components/QuizGame";
import ScratchCard from "@/components/ScratchCard";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Connecte-toi pour jouer.</p>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  const userId = session.user.id;
  const today = todayKey();

  const [user, pendingQuiz, pendingTicket, todayTicket] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, gamesDate: true, gamesPlayed: true },
    }),
    prisma.quizRound.findFirst({
      where: { userId, answeredAt: null },
      select: { id: true },
    }),
    prisma.scratchTicket.findFirst({
      where: { userId, claimedAt: null },
      select: { id: true },
    }),
    prisma.scratchTicket.findUnique({
      where: { userId_day: { userId, day: today } },
    }),
  ]);

  const played = user?.gamesDate === today ? user.gamesPlayed : 0;
  const remaining = Math.max(0, DAILY_GAMES - played);

  const scratchStatus = pendingTicket
    ? "pending"
    : todayTicket
      ? "done"
      : "available";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Mini-jeux</h1>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Accueil
        </Link>
      </div>

      <div className="flex flex-col gap-12">
        <div className="panel-sakura">
          <h2 className="panel-title">Qui est-ce ?</h2>
          <p className="mb-6 text-center text-gray-200">
            On te montre la description d&apos;une carte, à toi de retrouver
            laquelle c&apos;est ! Une bonne réponse rapporte {QUIZ_REWARD}{" "}
            pièces, et tu as {DAILY_GAMES} parties par jour.
          </p>
          <QuizGame
            coins={user?.coins ?? 0}
            remaining={remaining}
            total={DAILY_GAMES}
            reward={QUIZ_REWARD}
            hasPending={!!pendingQuiz}
          />
        </div>

        <div className="panel-sakura">
          <h2 className="panel-title">Ticket à gratter</h2>
          <p className="mb-6 text-center text-gray-200">
            Un seul ticket par jour : gratte-le pour découvrir ton gain, des
            pièces ou même un booster offert !
          </p>
          <ScratchCard
            status={scratchStatus}
            doneCoins={todayTicket?.prizeCoins ?? 0}
            doneBoosters={todayTicket?.prizeBoosters ?? 0}
          />
        </div>
      </div>
    </main>
  );
}