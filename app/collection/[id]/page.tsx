import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SecretMusic from "@/components/SecretMusic";

// Une musique cachée par carte : "Nom exact de la carte": "fichier"
const SECRET_MUSICS: Record<string, string> = {
  "Seconde Dame": "/music/seconde-dame.mp3",
};

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
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#2b2b2b] p-10 text-center text-white shadow-xl">
          <p className="text-5xl">🔒</p>
          <h1 className="text-3xl font-bold">Carte non découverte</h1>
          <p className="text-gray-300">
            Ouvre des boosters pour débloquer cette carte.
          </p>
          <Link href="/collection" className="btn-sakura btn-sakura-sm">
            Retour à la collection
          </Link>
        </div>
      </main>
    );
  }

  const musicSrc = SECRET_MUSICS[card.name];

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/collection" className="btn-sakura btn-sakura-sm mb-6">
        ← Retour à la collection
      </Link>

      <div className="flex flex-col gap-8 rounded-2xl bg-[#2b2b2b] p-6 text-white shadow-xl md:flex-row md:p-8">
        {/* Image entière sur le côté */}
        <div
          className={`relative w-full shrink-0 rounded-xl border-4 bg-black/30 p-2 md:w-80 ${rarityFrame[card.rarity]}`}
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

          {musicSrc && <SecretMusic src={musicSrc} />}
        </div>

        {/* Informations */}
        <div className="flex flex-col gap-5">
          <h1 className="text-5xl font-bold">{card.name}</h1>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-1 text-base font-semibold ${rarityBadge[card.rarity]}`}
            >
              {rarityLabels[card.rarity]}
            </span>
            <span className="text-gray-300">{card.series}</span>
          </div>

          <p className="whitespace-pre-line text-2xl leading-relaxed text-gray-100">
            {card.bio || "Aucune description pour le moment."}
          </p>

          <p className="mt-auto text-gray-300">
            Tu possèdes <strong className="text-white">{quantity}</strong>{" "}
            exemplaire{quantity > 1 ? "s" : ""} de cette carte.
          </p>
        </div>
      </div>
    </main>
  );
}