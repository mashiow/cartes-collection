import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VisibilityToggle from "@/components/VisibilityToggle";
import { visibleCardsWhere } from "@/lib/limited";

export const dynamic = "force-dynamic";

const RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;

const rarityLabels: Record<string, string> = {
  COMMON: "Communes",
  RARE: "Rares",
  EPIC: "Épiques",
  LEGENDARY: "Légendaires",
};

const rarityFrame: Record<string, string> = {
  COMMON: "border-gray-400",
  RARE: "border-blue-400",
  EPIC: "border-purple-400",
  LEGENDARY: "border-yellow-400",
};

function Avatar({ image, name }: { image: string | null; name: string }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={name}
      className="h-24 w-24 rounded-full border-4 border-[#f4a7c0] object-cover"
    />
  ) : (
    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#f4a7c0] bg-black/40 text-4xl">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Connecte-toi pour voir les profils.</p>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      coins: true,
      freeBoosters: true,
      createdAt: true,
      hideFromLeaderboard: true,
    },
  });
  if (!profile) notFound();

  const isMe = profile.id === session.user.id;

  if (profile.hideFromLeaderboard && !isMe) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Ce joueur a choisi de garder son profil privé.</p>
          <Link href="/classement" className="btn-sakura btn-sakura-sm">
            Classement
          </Link>
        </div>
      </main>
    );
  }

  const [allCards, owned] = await Promise.all([
    prisma.card.findMany({ where: visibleCardsWhere(), select: { rarity: true } }),
    prisma.userCard.findMany({
      where: { userId: id },
      include: { card: { select: { rarity: true } } },
    }),
  ]);

  const totalByRarity: Record<string, number> = {};
  for (const c of allCards) {
    totalByRarity[c.rarity] = (totalByRarity[c.rarity] ?? 0) + 1;
  }
  const ownedByRarity: Record<string, number> = {};
  let copies = 0;
  for (const o of owned) {
    ownedByRarity[o.card.rarity] = (ownedByRarity[o.card.rarity] ?? 0) + 1;
    copies += o.quantity;
  }

  const discovered = owned.length;
  const total = allCards.length;
  const percent = total > 0 ? Math.round((discovered / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Profil</h1>
        <div className="flex gap-4">
          <Link href="/classement" className="btn-sakura btn-sakura-sm">
            Classement
          </Link>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </div>

      <div className="panel-sakura flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar image={profile.image} name={profile.name} />
          <h2 className="text-4xl font-bold">{profile.name}</h2>
          <p className="text-gray-300">
            Membre depuis{" "}
            {profile.createdAt.toLocaleDateString("fr-FR", {
              timeZone: "Europe/Paris",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-center text-2xl">
            <strong>{discovered}</strong> / {total} cartes découvertes ({percent} %)
          </p>
          <div className="h-5 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-[#f4a7c0]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-center text-gray-300">
            {copies} carte(s) au total, doublons compris
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {RARITIES.map((r) => (
            <div
              key={r}
              className={`rounded-xl border-2 bg-black/30 p-4 text-center ${rarityFrame[r]}`}
            >
              <p className="text-3xl font-bold">
                {ownedByRarity[r] ?? 0}
                <span className="text-xl text-gray-400">
                  {" "}
                  / {totalByRarity[r] ?? 0}
                </span>
              </p>
              <p className="text-gray-300">{rarityLabels[r]}</p>
            </div>
          ))}
        </div>

        {isMe && (
          <div className="flex flex-col gap-6 border-t border-gray-600 pt-6">
            <p className="text-center text-xl">
              Ta monnaie : <strong>{profile.coins}</strong> 🪙
              {profile.freeBoosters > 0 && (
                <>
                  {" "}
                  · <strong>{profile.freeBoosters}</strong> booster(s) offert(s)
                </>
              )}
            </p>
            <VisibilityToggle hidden={profile.hideFromLeaderboard} />
          </div>
        )}
      </div>
    </main>
  );
}