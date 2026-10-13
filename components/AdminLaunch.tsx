"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "rounded-lg border border-gray-600 bg-[#1f1f1f] p-2 text-lg text-white";

// Convertit une date ISO en valeur pour le champ date/heure (heure locale)
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminLaunch({
  locked,
  launchAtIso,
  launchLabel,
}: {
  locked: boolean;
  launchAtIso: string | null;
  launchLabel: string | null;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  useEffect(() => {
    setDate(launchAtIso ? toLocalInput(launchAtIso) : "");
  }, [launchAtIso]);

  async function update(payload: Record<string, unknown>, successText: string) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setFeedback({ text: data.error ?? "Erreur", ok: false });
      else setFeedback({ text: successText, ok: true });
    } catch {
      setFeedback({ text: "Erreur réseau", ok: false });
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  const dateIso = date ? new Date(date).toISOString() : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg bg-black/30 p-4 text-center">
        {locked ? (
          <p className="text-2xl">
            🔒 Écran d&apos;attente <strong>actif</strong>
          </p>
        ) : (
          <p className="text-2xl">
            ✅ Site <strong>ouvert</strong> à tous les joueurs
          </p>
        )}
        <p className="text-gray-300">
          {launchLabel
            ? `Lancement prévu : ${launchLabel}`
            : "Aucune date de lancement"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span>Date et heure de lancement</span>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
        <button
          disabled={busy || !date}
          onClick={() => update({ launchAt: dateIso }, "Date enregistrée.")}
          className="btn-sakura btn-sakura-sm"
        >
          Enregistrer la date
        </button>
        <button
          disabled={busy}
          onClick={() =>
            update({ launchAt: null }, "Date supprimée : attente sans date.")
          }
          className="btn-sakura btn-sakura-sm"
        >
          Pas de date
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {locked ? (
          <button
            disabled={busy}
            onClick={() => {
              if (window.confirm("Ouvrir le site à tous les joueurs maintenant ?")) {
                update({ waitingEnabled: false }, "Le site est ouvert !");
              }
            }}
            className="btn-sakura px-6 py-2"
          >
            Ouvrir le site maintenant
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() =>
              update(
                { waitingEnabled: true, launchAt: dateIso },
                "Écran d'attente réactivé."
              )
            }
            className="btn-sakura px-6 py-2"
          >
            Réactiver l&apos;écran d&apos;attente
          </button>
        )}
      </div>

      {feedback && (
        <p className={feedback.ok ? "text-green-400" : "text-red-400"}>
          {feedback.text}
        </p>
      )}

      <p className="text-gray-400">
        Quand l&apos;écran est actif, les joueurs non-admin voient le compte à
        rebours et ne peuvent rien faire sur le site. Le site s&apos;ouvre tout
        seul à l&apos;heure de lancement. Pour réactiver l&apos;écran, la date
        doit être dans le futur (ou vide, pour une attente sans fin).
      </p>
    </div>
  );
}