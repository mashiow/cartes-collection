"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Card = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  series: string;
};

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

export default function BoosterOpener({
  coins,
  price,
}: {
  coins: number;
  price: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openBooster() {
    setLoading(true);
    setError(null);
    setCard(null);
    try {
      const res = await fetch("/api/booster/open", { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erreur");
      else setCard(data.card);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-xl">
        Ta monnaie : <strong>{coins}</strong> 🪙
      </p>

      <button
        onClick={openBooster}
        disabled={loading || coins < price}
        className="btn-sakura rounded bg-[#454545] px-6 py-3 text-lg text-white hover:bg-[#5a5a5a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Ouverture..." : `Ouvrir un booster (${price} 🪙)`}
      </button>

      {error && <p className="text-red-400">{error}</p>}

      {card && (
        <div
          className={`w-56 rounded-lg border-2 p-4 text-center ${
            rarityStyles[card.rarity]
          }`}
        >
          <div className="mb-3 flex aspect-[2/3] items-center justify-center rounded bg-black/30 text-6xl">
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
          <p className="text-lg font-bold">{card.name}</p>
          <p className="text-sm text-gray-300">{rarityLabels[card.rarity]}</p>
        </div>
      )}
    </div>
  );
}