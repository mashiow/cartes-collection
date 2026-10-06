"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PickCard = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  quantity?: number;
};

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

function CardPicker({
  title,
  cards,
  selectedId,
  onSelect,
  emptyText,
}: {
  title: string;
  cards: PickCard[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyText: string;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = cards.filter((c) => c.name.toLowerCase().includes(q));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une carte..."
          className="w-56 rounded border border-gray-600 bg-[#1f1f1f] p-2 text-white placeholder-gray-400"
        />
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-300">{emptyText}</p>
      ) : shown.length === 0 ? (
        <p className="text-gray-300">Aucune carte ne correspond.</p>
      ) : (
        <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto p-1 sm:grid-cols-4 md:grid-cols-5">
          {shown.map((card) => {
            const selected = card.id === selectedId;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelect(selected ? "" : card.id)}
                className={`relative flex flex-col items-center gap-1 rounded-lg border-2 bg-black/30 p-2 text-center transition hover:scale-105 ${
                  rarityFrame[card.rarity]
                } ${selected ? "scale-105 ring-4 ring-white" : "opacity-80 hover:opacity-100"}`}
              >
                {card.quantity && card.quantity > 1 && (
                  <span className="absolute right-1 top-1 z-10 rounded bg-black/70 px-1.5 text-xs">
                    x{card.quantity}
                  </span>
                )}
                <div className="flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded bg-black/30 text-3xl">
                  {card.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "🃏"
                  )}
                </div>
                <span className="text-sm leading-tight">{card.name}</span>
                <span className="text-xs text-gray-400">
                  {rarityLabels[card.rarity]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PreviewCard({ card, label }: { card?: PickCard; label: string }) {
  return (
    <div className="flex w-28 flex-col items-center gap-1 text-center">
      <p className="text-sm text-gray-300">{label}</p>
      <div
        className={`flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-lg border-2 bg-black/30 ${
          card ? rarityFrame[card.rarity] : "border-dashed border-gray-500"
        }`}
      >
        {card ? (
          card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl}
              alt={card.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl">🃏</span>
          )
        ) : (
          <span className="text-2xl text-gray-500">?</span>
        )}
      </div>
      <p className="text-sm">{card ? card.name : "—"}</p>
    </div>
  );
}

export default function CreateTradeForm({
  ownedCards,
  allCards,
}: {
  ownedCards: PickCard[];
  allCards: PickCard[];
}) {
  const router = useRouter();
  const [offered, setOffered] = useState("");
  const [wanted, setWanted] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  const offeredCard = ownedCards.find((c) => c.id === offered);
  const wantedCard = allCards.find((c) => c.id === wanted);
  const wantedChoices = allCards.filter((c) => c.id !== offered);

  async function submit() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeredCardId: offered, wantedCardId: wanted }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error ?? "Erreur", ok: false });
      } else {
        setMessage({ text: "Offre publiée !", ok: true });
        setOffered("");
        setWanted("");
      }
    } catch {
      setMessage({ text: "Erreur réseau", ok: false });
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-[#2b2b2b] p-5 text-white shadow-xl">
      <CardPicker
        title="Je donne"
        cards={ownedCards}
        selectedId={offered}
        onSelect={(id) => {
          setOffered(id);
          if (id === wanted) setWanted("");
        }}
        emptyText="Tu n'as aucune carte à proposer. Ouvre des boosters d'abord !"
      />

      <CardPicker
        title="Je veux"
        cards={wantedChoices}
        selectedId={wanted}
        onSelect={setWanted}
        emptyText="Aucune carte disponible."
      />

      <div className="flex flex-wrap items-end justify-center gap-6 border-t border-gray-600 pt-6">
        <PreviewCard card={offeredCard} label="Je donne" />
        <span className="pb-12 text-3xl">⇄</span>
        <PreviewCard card={wantedCard} label="Je veux" />
      </div>

      <button
        onClick={submit}
        disabled={loading || !offered || !wanted}
        className="btn-sakura rounded bg-[#454545] px-4 py-3 text-lg text-white hover:bg-[#5a5a5a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Publication..." : "Publier l'offre"}
      </button>

      {message && (
        <p className={message.ok ? "text-green-400" : "text-red-400"}>
          {message.text}
        </p>
      )}
    </div>
  );
}