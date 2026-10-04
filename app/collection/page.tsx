import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export default async function CollectionPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const cards = await prisma.card.findMany({
    orderBy: [{ series: "asc" }, { name: "asc" }],
  });

  const owned = session
    ? await prisma.userCard.findMany({ where: { userId: session.user.id } })
    : [];
  const quantities = new Map(owned.map((o) => [o.cardId, o.quantity]));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Collection</h1>
        <Link href="/" className="underline">
          Accueil
        </Link>
      </div>

      <p className="mb-6 text-gray-400">
        {session
          ? `${quantities.size} / ${cards.length} cartes découvertes`
          : "Connecte-toi pour voir tes cartes."}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card) => {
          const quantity = quantities.get(card.id) ?? 0;
          const hasCard = quantity > 0;

          const content = (
            <div
              className={`relative rounded-lg border-2 p-3 text-center ${
                rarityStyles[card.rarity]
              } ${
                hasCard
                  ? "transition hover:scale-105"
                  : "opacity-40 grayscale"
              }`}
            >
              {quantity > 1 && (
                <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs">
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