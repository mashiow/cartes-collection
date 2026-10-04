"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export default function CreateTradeForm({
  ownedCards,
  allCards,
}: {
  ownedCards: Option[];
  allCards: Option[];
}) {
  const router = useRouter();
  const [offered, setOffered] = useState("");
  const [wanted, setWanted] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

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

  if (ownedCards.length === 0) {
    return (
      <p className="text-gray-400">
        Tu n&apos;as aucune carte à proposer. Ouvre des boosters d&apos;abord !
      </p>
    );
  }

  const selectClass = "w-full rounded border border-gray-600 bg-gray-800 p-2 text-white";

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-300">Je donne</span>
        <select
          className={selectClass}
          value={offered}
          onChange={(e) => setOffered(e.target.value)}
        >
          <option value="">Choisis une de tes cartes</option>
          {ownedCards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-300">Je veux</span>
        <select
          className={selectClass}
          value={wanted}
          onChange={(e) => setWanted(e.target.value)}
        >
          <option value="">Choisis la carte que tu cherches</option>
          {allCards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={submit}
        disabled={loading || !offered || !wanted}
        className="rounded bg-[#454545] px-4 py-2 text-white hover:bg-[#5a5a5a] disabled:cursor-not-allowed disabled:opacity-50"
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