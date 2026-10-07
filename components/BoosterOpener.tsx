```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
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

// Les sons : un pour la secousse, un par rareté
const SOUNDS: Record<string, string> = {
  shake: "/sounds/pack-shake.mp3",
  COMMON: "/sounds/reveal-common.mp3",
  RARE: "/sounds/reveal-rare.mp3",
  EPIC: "/sounds/reveal-epic.mp3",
  LEGENDARY: "/sounds/reveal-legendary.mp3",
};

const MUTE_KEY = "anetsuki-sound-muted";

function playSound(src: string, volume: number): HTMLAudioElement | null {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
    return audio;
  } catch {
    return null;
  }
}

// Durée minimale de la secousse (à garder égale à pack-shake dans globals.css)
const SHAKE_MS = 1600;

// Direction de chaque pétale lors de l'éclatement
const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 110 + (i % 3) * 35;
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist),
    r: (i % 2 === 0 ? 1 : -1) * (150 + i * 25),
  };
});

function Pack({ idle = false }: { idle?: boolean }) {
  return (
    <div className={`booster-pack ${idle ? "booster-pack-idle" : ""}`}>
      <div className="booster-pack-flower" />
      <p className="booster-pack-label">ANETSUKI</p>
      <p className="text-sm text-[#f4a7c0]">BOOSTER</p>
    </div>
  );
}

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
  const shakeAudio = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [selling, setSelling] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [phase, setPhase] = useState<"revealed" | "kept" | "sold">(
    "revealed"
  );
  const [soldFor, setSoldFor] = useState(0);
  const [limited, setLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On retrouve le choix "son coupé" fait lors d'une visite précédente
  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  async function openBooster(free: boolean) {
    setLoading(true);
    setOpening(true);
    setError(null);
    setCard(null);

    if (!muted) shakeAudio.current = playSound(SOUNDS.shake, 0.8);

    try {
      // La requête et la secousse se font en même temps
      const [res] = await Promise.all([
        fetch("/api/booster/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ free }),
        }),
        new Promise((resolve) => setTimeout(resolve, SHAKE_MS)),
      ]);

      shakeAudio.current?.pause();

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        setCard(data.card);
        setPhase("revealed");
        setRevealKey((k) => k + 1);
        setLimited(!!data.limited);

        if (!muted) {
          playSound(SOUNDS[data.card.rarity] ?? SOUNDS.COMMON, 0.7);
        }
      }
    } catch {
      shakeAudio.current?.pause();
      setError("Erreur réseau");
    } finally {
      setOpening(false);
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

  const big =
    card?.rarity === "EPIC" || card?.rarity === "LEGENDARY";

  return (
    <div className="flex flex-col items-center gap-6 p-2">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <p className="text-2xl">
          Ta monnaie : <strong>{coins}</strong> 🪙
        </p>

        <button
          onClick={toggleMute}
          className="btn-sakura btn-sakura-sm"
          aria-label={muted ? "Activer le son" : "Couper le son"}
        >
          {muted ? "🔇 Son coupé" : "🔊 Son activé"}
        </button>
      </div>

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

      {/* Scène : paquet au repos, paquet qui tremble, ou carte révélée */}
      <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4">
        {opening && <Pack />}

        {!opening && !card && <Pack idle />}

        {!opening && card && (
          <div className="flex flex-col items-center gap-4">
            <div key={revealKey} className="relative">
              <div className="reveal-flash" />

              <div className="burst">
                {BURST.map((p, i) => (
                  <span
                    key={i}
                    className="burst-petal"
                    style={
                      {
                        "--dx": p.dx,
                        "--dy": p.dy,
                        "--r": `${p.r}deg`,
                        "--k": big ? 1.6 : 1,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>

              <div
                className={`card-reveal glow-${card.rarity} w-56 rounded-lg border-2 p-4 text-center text-white ${
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

                <p className="text-sm text-gray-300">
                  {rarityLabels[card.rarity]}
                </p>

                {limited && (
                  <p className="mt-1 text-sm font-semibold text-pink-300">
                    ✨ Édition limitée
                  </p>
                )}
              </div>
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
              <p className="text-green-400">
                Carte ajoutée à ta collection !
              </p>
            )}

            {phase === "sold" && (
              <p className="text-yellow-300">
                Carte vendue pour {soldFor} pièces.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```
