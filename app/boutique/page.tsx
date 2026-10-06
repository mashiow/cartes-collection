import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SELL_PRICES, sellPrice } from "@/lib/shop";
import SellButton from "@/components/SellButton";

export const dynamic = "force-dynamic";

const rarityFrame: Record<string, string> = {
  COMMON: "border-gray-400",
  RARE: "border-blue-400",
  EPIC: "border-purple-400",
  LEGENDARY: "border-yellow-400",
};

const rarityLabels: Record<string, string> = {
  COMMON: "Commune",
  RARE: "Rare",
  EPIC: "Épique",
  LEGENDARY: "Légendaire",
};

export default async function ShopPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Connecte-toi pour accéder à la boutique.</p>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  const userId = session.user.id;

  const [user, owned] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { coins: true } }),
    prisma.userCard.findMany({ where: { userId }, include: { card: true } }),
  ]);

  const cards = owned
    .slice()
    .sort((a, b) => a.card.name.localeCompare(b.card.name));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Boutique de revente</h1>
        <div className="flex gap-4">
          <Link href="/booster" className="btn-sakura btn-sakura-sm">
            Boosters
          </Link>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </div>

      <div className="panel-sakura">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <p className="text-2xl">
            Ta monnaie : <strong>{user?.coins ?? 0}</strong> 🪙
          </p>
          <p className="text-gray-300">
            Prix de revente par carte : Commune {SELL_PRICES.COMMON} 🪙 · Rare{" "}
            {SELL_PRICES.RARE} 🪙 · Épique {SELL_PRICES.EPIC} 🪙 · Légendaire{" "}
            {SELL_PRICES.LEGENDARY} 🪙
          </p>
        </div>

        {cards.length === 0 ? (
          <p className="text-center text-gray-300">
            Tu n&apos;as aucune carte à vendre pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {cards.map((o) => {
              const price = sellPrice(o.card.rarity);
              const extras = o.quantity - 1;
              return (
                <div
                  key={o.id}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 bg-black/30 p-3 text-center ${rarityFrame[o.card.rarity]}`}
                >
                  <div className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded bg-black/30 text-4xl">
                    {o.quantity > 1 && (
                      <span className="absolute right-1 top-1 z-10 rounded bg-black/70 px-2 py-0.5 text-xs">
                        x{o.quantity}
                      </span>
                    )}
                    {o.card.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={o.card.imageUrl}
                        alt={o.card.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "🃏"
                    )}
                  </div>
                  <p className="font-semibold leading-tight">{o.card.name}</p>
                  <p className="text-xs text-gray-400">
                    {rarityLabels[o.card.rarity]} · {price} 🪙
                  </p>

                  <SellButton
                    cardId={o.cardId}
                    quantity={1}
                    label={`Vendre 1 (+${price} 🪙)`}
                    confirmText={`Vendre 1 exemplaire de "${o.card.name}" pour ${price} pièces ?`}
                  />
                  {extras > 0 && (
                    <SellButton
                      cardId={o.cardId}
                      quantity={extras}
                      label={`Doublons x${extras} (+${price * extras} 🪙)`}
                      confirmText={`Vendre ${extras} doublon(s) de "${o.card.name}" pour ${price * extras} pièces ? Tu en garderas 1.`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}