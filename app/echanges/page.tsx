import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateTradeForm from "@/components/CreateTradeForm";
import TradeButton from "@/components/TradeButton";

export const dynamic = "force-dynamic";

const rarityLabels: Record<string, string> = {
  COMMON: "Commune",
  RARE: "Rare",
  EPIC: "Épique",
  LEGENDARY: "Légendaire",
};

const rarityFrame: Record<string, string> = {
  COMMON: "border-gray-400",
  RARE: "border-blue-400",
  EPIC: "border-purple-400",
  LEGENDARY: "border-yellow-400",
};

type MiniCard = { name: string; imageUrl: string; rarity: string };

function CardMini({ card }: { card: MiniCard }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded border-2 bg-black/30 ${rarityFrame[card.rarity]}`}
      >
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.imageUrl}
            alt={card.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl">🃏</span>
        )}
      </div>
      <div>
        <p className="text-lg font-semibold">{card.name}</p>
        <p className="text-sm text-gray-400">{rarityLabels[card.rarity]}</p>
      </div>
    </div>
  );
}

export default async function TradesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl">Connecte-toi pour échanger des cartes.</p>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  const userId = session.user.id;

  const [allCards, owned, openTrades] = await Promise.all([
    prisma.card.findMany({ orderBy: [{ series: "asc" }, { name: "asc" }] }),
    prisma.userCard.findMany({ where: { userId }, include: { card: true } }),
    prisma.trade.findMany({
      where: { status: "OPEN" },
      include: {
        creator: { select: { name: true } },
        offeredCard: true,
        wantedCard: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const ownedIds = new Set(owned.map((o) => o.cardId));

  const ownedOptions = owned
    .slice()
    .sort((a, b) => a.card.name.localeCompare(b.card.name))
    .map((o) => ({
      id: o.cardId,
      name: o.card.name,
      imageUrl: o.card.imageUrl,
      rarity: o.card.rarity,
      quantity: o.quantity,
    }));

  const allOptions = allCards.map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl,
    rarity: c.rarity,
  }));

  const mine = openTrades.filter((t) => t.creatorId === userId);
  const others = openTrades.filter((t) => t.creatorId !== userId);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Échanges</h1>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Accueil
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Publier une offre</h2>
        <CreateTradeForm ownedCards={ownedOptions} allCards={allOptions} />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">
          Offres des autres joueurs
        </h2>
        {others.length === 0 ? (
          <p>Aucune offre pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {others.map((t) => {
              const canAccept = ownedIds.has(t.wantedCardId);
              return (
                <div
                  key={t.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[#2b2b2b] p-4 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <div>
                      <p className="mb-1 text-sm text-gray-400">
                        {t.creator.name} donne
                      </p>
                      <CardMini card={t.offeredCard} />
                    </div>
                    <span className="text-3xl">⇄</span>
                    <div>
                      <p className="mb-1 text-sm text-gray-400">et veut</p>
                      <CardMini card={t.wantedCard} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <TradeButton
                      tradeId={t.id}
                      action="accept"
                      label="Accepter"
                      disabled={!canAccept}
                      className="bg-[#454545] hover:bg-[#5a5a5a]"
                    />
                    {!canAccept && (
                      <p className="text-sm text-gray-400">
                        Tu n&apos;as pas cette carte
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Mes offres ouvertes</h2>
        {mine.length === 0 ? (
          <p>Tu n&apos;as aucune offre ouverte.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-4 rounded-2xl bg-[#2b2b2b] p-4 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <div>
                    <p className="mb-1 text-sm text-gray-400">Je donne</p>
                    <CardMini card={t.offeredCard} />
                  </div>
                  <span className="text-3xl">⇄</span>
                  <div>
                    <p className="mb-1 text-sm text-gray-400">Je veux</p>
                    <CardMini card={t.wantedCard} />
                  </div>
                </div>
                <TradeButton
                  tradeId={t.id}
                  action="cancel"
                  label="Annuler"
                  className="bg-[#454545] hover:bg-[#5a5a5a]"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}