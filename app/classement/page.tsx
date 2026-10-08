import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { visibleCardsWhere } from "@/lib/limited";

export const dynamic = "force-dynamic";

const medals = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Connecte-toi pour voir le classement.</p>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  const [totalCards, players] = await Promise.all([
    prisma.card.count({ where: visibleCardsWhere() }),
    prisma.user.findMany({
      where: { hideFromLeaderboard: false, cards: { some: {} } },
      orderBy: [{ cards: { _count: "desc" } }, { createdAt: "asc" }],
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
        _count: { select: { cards: true } },
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Classement</h1>
        <div className="flex gap-4">
          <Link href="/profil" className="btn-sakura btn-sakura-sm">
            Mon profil
          </Link>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </div>

      <div className="panel-sakura">
        <h2 className="panel-title">Les collectionneurs</h2>
        <p className="mb-6 text-center text-gray-300">
          Classés selon le nombre de cartes différentes découvertes.
        </p>

        {players.length === 0 ? (
          <p className="text-center text-gray-300">
            Personne dans le classement pour le moment.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {players.map((p, i) => {
              const count = p._count.cards;
              const percent =
                totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
              const me = p.id === session.user.id;
              return (
                <Link
                  key={p.id}
                  href={`/profil/${p.id}`}
                  className={`flex items-center gap-4 rounded-xl bg-black/30 p-3 transition hover:bg-black/50 ${
                    me ? "border-2 border-[#f4a7c0]" : "border-2 border-transparent"
                  }`}
                >
                  <span className="w-12 shrink-0 text-center text-3xl font-bold">
                    {medals[i] ?? i + 1}
                  </span>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/40 text-xl">
                      {p.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-semibold">
                      {p.name}
                      {me && <span className="text-[#f4a7c0]"> (toi)</span>}
                    </p>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/40">
                      <div
                        className="h-full rounded-full bg-[#f4a7c0]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-lg">
                    {count} / {totalCards}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}