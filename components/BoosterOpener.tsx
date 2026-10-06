"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sellPrice } from "@/lib/shop";

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
  freeBoosters,
}: {
  coins: number;
  price: number;
  freeBoosters: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selling, setSelling] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [phase, setPhase] = useState<"revealed" | "kept" | "sold">("revealed");
  const [soldFor, setSoldFor] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function openBooster(free: boolean) {
    setLoading(true);
    setError(null);
    setCard(null);
    try {
      const res = await fetch("/api/booster/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ free }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        setCard(data.card);
        setPhase("revealed");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  async function sellCard() {
    if (!card) return;
    setSelling(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        setSoldFor(data.gain);
        setPhase("sold");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSelling(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-2">
      <p className="text-2xl">
        Ta monnaie : <strong>{coins}</strong> 🪙
      </p>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <button
          onClick={() => openBooster(false)}
          disabled={loading || coins < price}
          className="btn-sakura px-6 py-3 text-lg"
        >
          {loading ? "Ouverture..." : `Ouvrir un booster (${price} 🪙)`}
        </button>

        {freeBoosters > 0 && (
          <button
            onClick={() => openBooster(true)}
            disabled={loading}
            className="btn-sakura px-6 py-3 text-lg"
          >
            Ouvrir un booster offert ({freeBoosters})
          </button>
        )}
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {card && (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-56 rounded-lg border-2 p-4 text-center text-white ${
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

          {phase === "revealed" && (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={sellCard}
                disabled={selling}
                className="btn-sakura px-5 py-2"
              >
                {selling
                  ? "Vente..."
                  : `Vente rapide (+${sellPrice(card.rarity)} 🪙)`}
              </button>
              <button
                onClick={() => setPhase("kept")}
                disabled={selling}
                className="btn-sakura px-5 py-2"
              >
                Garder
              </button>
            </div>
          )}

          {phase === "kept" && (
            <p className="text-green-400">Carte ajoutée à ta collection !</p>
          )}
          {phase === "sold" && (
            <p className="text-yellow-300">
              Carte vendue pour {soldFor} pièces.
            </p>
          )}
        </div>
      )}
    </div>
  );
}