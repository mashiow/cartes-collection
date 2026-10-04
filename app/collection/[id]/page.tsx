import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const rarityFrame: Record<string, string> = {
  COMMON: "border-gray-400",
  RARE: "border-blue-400",
  EPIC: "border-purple-400",
  LEGENDARY: "border-yellow-400",
};

const rarityBadge: Record<string, string> = {
  COMMON: "bg-gray-600 text-white",
  RARE: "bg-blue-600 text-white",
  EPIC: "bg-purple-600 text-white",
  LEGENDARY: "bg-yellow-500 text-black",
};

const rarityLabels: Record<string, string> = {
  COMMON: "Commune",
  RARE: "Rare",
  EPIC: "Épique",
  LEGENDARY: "Légendaire",
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const owned = session
    ? await prisma.userCard.findUnique({
        where: { userId_cardId: { userId: session.user.id, cardId: card.id } },
      })
    : null;
  const quantity = owned?.quantity ?? 0;

  if (quantity === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-5xl">🔒</p>
        <h1 className="text-2xl font-bold">Carte non découverte</h1>
        <p className="text-gray-400">
          Ouvre des boosters pour débloquer cette carte.
        </p>
        <Link href="/collection" className="underline">
          Retour à la collection
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/collection" className="mb-6 inline-block underline">
        ← Retour à la collection
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Image entière sur le côté */}
        <div
          className={`w-full shrink-0 rounded-xl border-4 bg-black/30 p-2 md:w-80 ${rarityFrame[card.rarity]}`}
        >
          <div className="flex aspect-[2/3] items-center justify-center">
            {card.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imageUrl}
                alt={card.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-7xl">🃏</span>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">{card.name}</h1>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${rarityBadge[card.rarity]}`}
            >
              {rarityLabels[card.rarity]}
            </span>
            <span className="text-gray-400">{card.series}</span>
          </div>

          <p className="whitespace-pre-line text-lg leading-relaxed text-gray-200">
            {card.bio || "Aucune description pour le moment."}
          </p>

          <p className="mt-auto text-gray-400">
            Tu possèdes <strong className="text-white">{quantity}</strong>{" "}
            exemplaire{quantity > 1 ? "s" : ""} de cette carte.
          </p>
        </div>
      </div>
    </main>
  );
}