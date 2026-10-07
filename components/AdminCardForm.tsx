"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-gray-600 bg-[#1f1f1f] p-2 text-lg text-white placeholder-gray-400";

export default function AdminCardForm({
  series,
}: {
  series: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rarity, setRarity] = useState("COMMON");
  const [seriesName, setSeriesName] = useState("Série 1");
  const [limitedSeriesId, setLimitedSeriesId] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  async function create() {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          imageUrl,
          rarity,
          series: seriesName,
          limitedSeriesId: limitedSeriesId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ text: data.error ?? "Erreur", ok: false });
      } else {
        setFeedback({ text: "Carte créée !", ok: true });
        setName("");
        setBio("");
        setImageUrl("");
      }
    } catch {
      setFeedback({ text: "Erreur réseau", ok: false });
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        placeholder="Nom de la carte"
        className={inputClass}
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Bio de la carte"
        className={inputClass}
      />
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        maxLength={100}
        placeholder="Chemin de l'image (ex : /cards/ma-carte.png)"
        className={inputClass}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className={inputClass}
        >
          <option value="COMMON">Commune</option>
          <option value="RARE">Rare</option>
          <option value="EPIC">Épique</option>
          <option value="LEGENDARY">Légendaire</option>
        </select>
        <input
          value={seriesName}
          onChange={(e) => setSeriesName(e.target.value)}
          maxLength={40}
          placeholder="Série"
          className={inputClass}
        />
        <select
          value={limitedSeriesId}
          onChange={(e) => setLimitedSeriesId(e.target.value)}
          className={inputClass}
        >
          <option value="">Carte normale (pas limitée)</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              Édition limitée : {s.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={create}
        disabled={busy || !name.trim()}
        className="btn-sakura self-start px-6 py-2"
      >
        Créer la carte
      </button>
      {feedback && (
        <p className={feedback.ok ? "text-green-400" : "text-red-400"}>
          {feedback.text}
        </p>
      )}
      <p className="text-gray-400">
        Attention : une carte « normale » entre tout de suite dans les boosters.
        Pour une carte de lancement, choisis son édition limitée.
      </p>
    </div>
  );
}