import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { visibleCardsWhere } from "@/lib/limited";

export const dynamic = "force-dynamic";

const rarityStyles: Record<string, string> = {
  COMMON: "border-gray-400 bg-gray-800",
  RARE: "border-blue-400 bg-blue-950",
  EPIC: "border-purple-400 bg-purple-950",
  LEGENDARY: "border-yellow-400 bg-yellow-950",
};

const rarityLabels: Record<string, string> = {
  COMMON: "Commune",
  RARE: "Rare",
  EPIC: "Épique",
  LEGENDARY: "Légendaire",
};

const RARITY_ORDER: Record<string, number> = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
};

type SortKey = "defaut" | "nom" | "rarete";
type Order = "asc" | "desc";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ tri?: string; ordre?: string }>;
}) {
  const { tri, ordre } = await searchParams;

  const sort: SortKey = tri === "nom" || tri === "rarete" ? tri : "defaut";
  const order: Order =
    ordre === "asc" || ordre === "desc"
      ? ordre
      : sort === "rarete"
        ? "desc"
        : "asc";

  const session = await auth.api.getSession({ headers: await headers() });

  const cards = await prisma.card.findMany({
    where: visibleCardsWhere(),
    include: { limitedSeries: { select: { name: true } } },
  });

  const owned = session
    ? await prisma.userCard.findMany({ where: { userId: session.user.id } })
    : [];
  const quantities = new Map(owned.map((o) => [o.cardId, o.quantity]));

  // ---------- Tri ----------
  type CardRow = (typeof cards)[number];

  const has = (c: CardRow) => (quantities.get(c.id) ?? 0) > 0;
  const byName = (a: CardRow, b: CardRow) =>
    a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
  const dir = order === "asc" ? 1 : -1;

  // Départage : cartes découvertes d'abord (par nom), puis les autres dans un
  // ordre neutre pour ne pas révéler leurs noms
  const tie = (a: CardRow, b: CardRow) => {
    const oa = has(a);
    const ob = has(b);
    if (oa !== ob) return oa ? -1 : 1;
    if (oa && ob) return byName(a, b);
    return a.id.localeCompare(b.id);
  };

  const sorted = [...cards];
  if (sort === "nom") {
    sorted.sort((a, b) => {
      const oa = has(a);
      const ob = has(b);
      if (oa !== ob) return oa ? -1 : 1;
      if (oa && ob) return dir * byName(a, b);
      return (
        RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] ||
        a.id.localeCompare(b.id)
      );
    });
  } else if (sort === "rarete") {
    sorted.sort((a, b) => {
      const diff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      return diff !== 0 ? dir * diff : tie(a, b);
    });
  } else {
    sorted.sort(
      (a, b) => a.series.localeCompare(b.series, "fr") || byName(a, b)
    );
  }

  // ---------- Boutons de tri ----------
  function sortHref(key: SortKey) {
    if (key === "defaut") return "/collection";
    const defaultOrder: Order = key === "rarete" ? "desc" : "asc";
    const next: Order =
      sort === key ? (order === "asc" ? "desc" : "asc") : defaultOrder;
    return `/collection?tri=${key}&ordre=${next}`;
  }

  function sortLabel(key: SortKey) {
    if (key === "defaut") return "Par défaut";
    const active = sort === key;
    if (key === "nom") {
      if (!active) return "Nom";
      return order === "asc" ? "Nom (A → Z)" : "Nom (Z → A)";
    }
    if (!active) return "Rareté";
    return order === "desc"
      ? "Rareté (légendaires d'abord)"
      : "Rareté (communes d'abord)";
  }

  const sortKeys: SortKey[] = ["defaut", "nom", "rarete"];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Collection</h1>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Accueil
        </Link>
      </div>

      <p className="mb-4 text-black">
        {session
          ? `${quantities.size} / ${cards.length} cartes découvertes`
          : "Connecte-toi pour voir tes cartes."}
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="font-semibold">Trier :</span>
        {sortKeys.map((key) => (
          <Link
            key={key}
            href={sortHref(key)}
            className="btn-sakura btn-sakura-sm"
            style={
              sort === key
                ? { backgroundColor: "#f4a7c0", color: "#2b2b2b" }
                : undefined
            }
          >
            {sortLabel(key)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {sorted.map((card) => {
          const quantity = quantities.get(card.id) ?? 0;
          const hasCard = quantity > 0;

          const content = (
            <div
              className={`relative rounded-lg border-2 p-3 text-center text-white ${
                rarityStyles[card.rarity]
              } ${
                hasCard
                  ? "transition hover:scale-105"
                  : "opacity-40 grayscale"
              }`}
            >
              {card.limitedSeries && (
                <span className="absolute left-2 top-2 z-10 rounded bg-pink-600 px-2 py-0.5 text-xs font-semibold">
                  ✨ Limitée
                </span>
              )}
              {quantity > 1 && (
                <span className="absolute right-2 top-2 z-10 rounded bg-black/70 px-2 py-0.5 text-xs">
                  x{quantity}
                </span>
              )}
              <div className="mb-2 flex aspect-[2/3] items-center justify-center rounded bg-black/30 text-5xl">
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="h-full w-full rounded object-cover"
                  />
                ) : (
                  "🃏"
                )}
              </div>
              <p className="font-semibold">{hasCard ? card.name : "???"}</p>
              <p className="text-xs text-gray-400">
                {rarityLabels[card.rarity]}
              </p>
            </div>
          );

          return hasCard ? (
            <Link key={card.id} href={`/collection/${card.id}`}>
              {content}
            </Link>
          ) : (
            <div key={card.id}>{content}</div>
          );
        })}
      </div>
    </main>
  );
}