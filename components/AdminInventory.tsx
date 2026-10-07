"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Player = { id: string; name: string };
type Item = { cardId: string; name: string; quantity: number };

const inputClass =
  "rounded-lg border border-gray-600 bg-[#1f1f1f] p-2 text-lg text-white placeholder-gray-400";

export default function AdminInventory({
  players,
  inventories,
}: {
  players: Player[];
  inventories: Record<string, Item[]>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  const q = search.trim().toLowerCase();
  const filtered = players.filter((p) => p.name.toLowerCase().includes(q));
  const selected = players.find((p) => p.id === playerId);
  const options =
    selected && !filtered.includes(selected) ? [selected, ...filtered] : filtered;
  const items = inventories[playerId] ?? [];

  async function take(item: Item, all: boolean) {
    const text = all
      ? `Retirer TOUTES les copies de "${item.name}" (x${item.quantity}) à ${selected?.name} ?`
      : `Retirer 1 exemplaire de "${item.name}" à ${selected?.name} ?`;
    if (!window.confirm(text)) return;

    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: playerId,
          cardId: item.cardId,
          quantity: 1,
          all,
        }),
      });
      const data = await res.json();
      if (!res.ok) setFeedback({ text: data.error ?? "Erreur", ok: false });
      else setFeedback({ text: "Carte retirée.", ok: true });
    } catch {
      setFeedback({ text: "Erreur réseau", ok: false });
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  if (players.length === 0) {
    return <p className="text-gray-300">Aucun joueur pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
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
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-300">Ce joueur n&apos;a aucune carte.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.cardId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-black/30 px-4 py-2"
            >
              <span className="text-lg">
                {item.name} <strong>x{item.quantity}</strong>
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => take(item, false)}
                  disabled={busy}
                  className="btn-sakura btn-sakura-sm"
                >
                  Retirer 1
                </button>
                <button
                  onClick={() => take(item, true)}
                  disabled={busy}
                  className="btn-sakura btn-sakura-sm"
                >
                  Tout retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {feedback && (
        <p className={feedback.ok ? "text-green-400" : "text-red-400"}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}