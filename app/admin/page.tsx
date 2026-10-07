import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import AdminGive from "@/components/AdminGive";
import AdminNews from "@/components/AdminNews";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Accès réservé aux administrateurs.</p>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  const [players, cards, news, totals, cardCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        name: true,
        coins: true,
        freeBoosters: true,
        _count: { select: { cards: true } },
      },
    }),
    prisma.card.findMany({
      orderBy: [{ series: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.news.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.user.aggregate({ _sum: { coins: true }, _count: true }),
    prisma.card.count(),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Administration</h1>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Accueil
        </Link>
      </div>

      <div className="flex flex-col gap-12">
        <div className="panel-sakura">
          <h2 className="panel-title">Résumé</h2>
          <p className="text-center text-xl">
            <strong>{totals._count}</strong> joueur(s) ·{" "}
            <strong>{totals._sum.coins ?? 0}</strong> pièces en circulation ·{" "}
            <strong>{cardCount}</strong> carte(s) dans le jeu
          </p>
        </div>

        <div className="panel-sakura">
          <h2 className="panel-title">Joueurs</h2>
          <AdminGive
            players={players.map((p) => ({
              id: p.id,
              name: p.name,
              coins: p.coins,
              freeBoosters: p.freeBoosters,
              cardCount: p._count.cards,
            }))}
            cards={cards}
          />
        </div>

        <div className="panel-sakura">
          <h2 className="panel-title">Dernières infos</h2>
          <AdminNews
            items={news.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.body,
              date: n.createdAt.toLocaleDateString("fr-FR", {
                timeZone: "Europe/Paris",
                day: "numeric",
                month: "long",
              }),
            }))}
          />
        </div>
      </div>
    </main>
  );
}