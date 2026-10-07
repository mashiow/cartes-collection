import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import AdminGive from "@/components/AdminGive";
import AdminInventory from "@/components/AdminInventory";
import AdminLimited from "@/components/AdminLimited";
import AdminCardForm from "@/components/AdminCardForm";
import AdminNews from "@/components/AdminNews";

export const dynamic = "force-dynamic";

type Status = "upcoming" | "active" | "ended" | "paused";

function seriesStatus(
  s: { enabled: boolean; startsAt: Date; endsAt: Date },
  now: Date
): Status {
  if (s.startsAt <= now && s.endsAt <= now) return "ended";
  if (!s.enabled) return "paused";
  if (s.startsAt > now) return "upcoming";
  return "active";
}

function formatDate(date: Date) {
  return date.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

  const [players, cards, news, totals, cardCount, limitedSeries] =
    await Promise.all([
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
      prisma.limitedSeries.findMany({
        orderBy: { startsAt: "desc" },
        include: { cards: { select: { name: true } } },
      }),
    ]);

  const owned = await prisma.userCard.findMany({
    where: { userId: { in: players.map((p) => p.id) } },
    include: { card: { select: { name: true } } },
  });

  const inventories: Record<
    string,
    { cardId: string; name: string; quantity: number }[]
  > = {};
  for (const o of owned) {
    (inventories[o.userId] ??= []).push({
      cardId: o.cardId,
      name: o.card.name,
      quantity: o.quantity,
    });
  }
  for (const list of Object.values(inventories)) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const now = new Date();

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
          <h2 className="panel-title">Donner pièces, boosters, cartes</h2>
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
          <h2 className="panel-title">Retirer des cartes à un joueur</h2>
          <AdminInventory
            players={players.map((p) => ({ id: p.id, name: p.name }))}
            inventories={inventories}
          />
        </div>

        <div className="panel-sakura">
          <h2 className="panel-title">Éditions limitées</h2>
          <AdminLimited
            series={limitedSeries.map((s) => ({
              id: s.id,
              name: s.name,
              status: seriesStatus(s, now),
              startLabel: formatDate(s.startsAt),
              endLabel: formatDate(s.endsAt),
              dropRate: s.dropRate,
              cards: s.cards.map((c) => c.name),
            }))}
          />
        </div>

        <div className="panel-sakura">
          <h2 className="panel-title">Créer une carte</h2>
          <AdminCardForm
            series={limitedSeries.map((s) => ({ id: s.id, name: s.name }))}
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