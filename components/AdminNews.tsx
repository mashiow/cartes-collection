"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; title: string; body: string; date: string };

const inputClass =
  "w-full rounded-lg border border-gray-600 bg-[#1f1f1f] p-2 text-lg text-white placeholder-gray-400";

export default function AdminNews({ items }: { items: Item[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        setTitle("");
        setBody("");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Supprimer cette info ?")) return;
    try {
      await fetch("/api/admin/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } finally {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Titre"
          className={inputClass}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Texte de l'info"
          className={inputClass}
        />
        <button
          onClick={publish}
          disabled={loading || !title.trim() || !body.trim()}
          className="btn-sakura self-start px-6 py-2"
        >
          {loading ? "..." : "Publier"}
        </button>
        {error && <p className="text-red-400">{error}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-gray-300">Aucune info publiée.</p>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between gap-4 rounded-lg bg-black/30 p-3"
            >
              <div>
                <p className="text-sm text-[#f4a7c0]">{n.date}</p>
                <p className="text-lg font-semibold">{n.title}</p>
                <p className="whitespace-pre-line text-gray-200">{n.body}</p>
              </div>
              <button
                onClick={() => remove(n.id)}
                className="btn-sakura btn-sakura-sm shrink-0"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}