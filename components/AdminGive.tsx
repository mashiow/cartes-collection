"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Player = {
  id: string;
  name: string;
  coins: number;
  freeBoosters: number;
  cardCount: number;
};
type CardOption = { id: string; name: string };

const inputClass =
  "rounded-lg border border-gray-600 bg-[#1f1f1f] p-2 text-lg text-white placeholder-gray-400";

export default function AdminGive({
  players,
  cards,
}: {
  players: Player[];
  cards: CardOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [coins, setCoins] = useState("");
  const [boosters, setBoosters] = useState("");
  const [cardId, setCardId] = useState(cards[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  const q = search.trim().toLowerCase();
  const filtered = players.filter((p) => p.name.toLowerCase().includes(q));
  const selected = players.find((p) => p.id === playerId);
  const options =
    selected && !filtered.includes(selected) ? [selected, ...filtered] : filtered;

  async function send(payload: Record<string, unknown>, successText: string) {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/give", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: playerId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) setFeedback({ text: data.error ?? "Erreur", ok: false });
      else setFeedback({ text: successText, ok: true });
    } catch {
      setFeedback({ text: "Erreur réseau", ok: false });
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  const coinsValue = Number(coins);
  const boostersValue = Number(boosters);
  const quantityValue = Number(quantity);

  if (players.length === 0) {
    return <p className="text-gray-300">Aucun joueur pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un joueur..."
          className={inputClass}
        />
        <select
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          className={inputClass}
        >
          {options.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.coins} pièces
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-gray-300">
            {selected.name} : <strong>{selected.coins}</strong> 🪙 ·{" "}
            <strong>{selected.freeBoosters}</strong> booster(s) offert(s) ·{" "}
            <strong>{selected.cardCount}</strong> carte(s) différente(s)
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40">Pièces (+ ou -)</span>
        <input
          type="number"
          value={coins}
          onChange={(e) => setCoins(e.target.value)}
          placeholder="ex : 100 ou -50"
          className={`${inputClass} w-40`}
        />
        <button
          disabled={loading || !Number.isInteger(coinsValue) || coinsValue === 0}
          onClick={() =>
            send({ type: "coins", amount: coinsValue }, "Pièces mises à jour.")
          }
          className="btn-sakura btn-sakura-sm"
        >
          Appliquer
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40">Boosters offerts</span>
        <input
          type="number"
          value={boosters}
          onChange={(e) => setBoosters(e.target.value)}
          placeholder="ex : 1"
          className={`${inputClass} w-40`}
        />
        <button
          disabled={
            loading || !Number.isInteger(boostersValue) || boostersValue === 0
          }
          onClick={() =>
            send({ type: "boosters", amount: boostersValue }, "Boosters mis à jour.")
          }
          className="btn-sakura btn-sakura-sm"
        >
          Appliquer
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40">Donner une carte</span>
        <select
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className={`${inputClass} w-56`}
        >
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={`${inputClass} w-24`}
        />
        <button
          disabled={
            loading ||
            !cardId ||
            !Number.isInteger(quantityValue) ||
            quantityValue < 1
          }
          onClick={() =>
            send({ type: "card", cardId, quantity: quantityValue }, "Carte donnée.")
          }
          className="btn-sakura btn-sakura-sm"
        >
          Donner
        </button>
      </div>

      {feedback && (
        <p className={feedback.ok ? "text-green-400" : "text-red-400"}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}