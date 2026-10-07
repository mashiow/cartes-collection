"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "upcoming" | "active" | "ended" | "paused";

type Series = {
  id: string;
  name: string;
  status: Status;
  startLabel: string;
  endLabel: string;
  dropRate: number;
  cards: string[];
};

const statusLabel: Record<Status, string> = {
  upcoming: "À venir",
  active: "En cours",
  ended: "Terminée",
  paused: "En pause",
};

const statusColor: Record<Status, string> = {
  upcoming: "bg-blue-600",
  active: "bg-green-600",
  ended: "bg-gray-600",
  paused: "bg-orange-600",
};

const inputClass =
  "rounded-lg border border-gray-600 bg-[#1f1f1f] p-2 text-lg text-white placeholder-gray-400";

export default function AdminLimited({ series }: { series: Series[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dropRate, setDropRate] = useState("15");
  const [days, setDays] = useState("14");
  const [startMode, setStartMode] = useState<"now" | "later">("now");
  const [startAt, setStartAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  async function call(
    method: "POST" | "PATCH",
    payload: Record<string, unknown>,
    successText: string
  ) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/limited", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setFeedback({ text: data.error ?? "Erreur", ok: false });
      else {
        setFeedback({ text: successText, ok: true });
        if (method === "POST") setName("");
      }
    } catch {
      setFeedback({ text: "Erreur réseau", ok: false });
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  function create() {
    call(
      "POST",
      {
        name,
        dropRate: Number(dropRate),
        durationDays: Number(days),
        startsAt:
          startMode === "later" && startAt
            ? new Date(startAt).toISOString()
            : undefined,
      },
      "Édition créée. Ajoute-lui maintenant ses cartes ci-dessous."
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 rounded-lg bg-black/30 p-4">
        <h3 className="text-xl font-semibold text-[#f4a7c0]">
          Nouvelle édition limitée
        </h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Nom (ex : Lancement)"
          className={inputClass}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            Durée
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={`${inputClass} w-24`}
            />
            jours
          </label>
          <label className="flex items-center gap-2">
            Chance par booster
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={dropRate}
              onChange={(e) => setDropRate(e.target.value)}
              className={`${inputClass} w-24`}
            />
            %
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={startMode === "now"}
              onChange={() => setStartMode("now")}
            />
            Commencer maintenant
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={startMode === "later"}
              onChange={() => setStartMode("later")}
            />
            Programmer
          </label>
          {startMode === "later" && (
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className={inputClass}
            />
          )}
        </div>
        <button
          onClick={create}
          disabled={
            busy || !name.trim() || (startMode === "later" && !startAt)
          }
          className="btn-sakura self-start px-6 py-2"
        >
          Créer l&apos;édition
        </button>
      </div>

      {feedback && (
        <p className={feedback.ok ? "text-green-400" : "text-red-400"}>
          {feedback.text}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {series.length === 0 ? (
          <p className="text-gray-300">Aucune édition limitée pour le moment.</p>
        ) : (
          series.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-lg bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-2xl font-semibold">{s.name}</p>
                <span
                  className={`rounded-full px-3 py-1 text-base font-semibold text-white ${statusColor[s.status]}`}
                >
                  {statusLabel[s.status]}
                </span>
              </div>
              <p className="text-gray-300">
                Du {s.startLabel} au {s.endLabel} · {s.dropRate} % de chance par
                booster
              </p>
              <p>
                Cartes :{" "}
                {s.cards.length === 0
                  ? "aucune pour le moment"
                  : s.cards.join(", ")}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={busy}
                  onClick={() =>
                    call(
                      "PATCH",
                      { id: s.id, action: "toggle" },
                      s.status === "paused" ? "Édition relancée." : "Édition mise en pause."
                    )
                  }
                  className="btn-sakura btn-sakura-sm"
                >
                  {s.status === "paused" ? "Reprendre" : "Pause"}
                </button>
                {s.status === "active" && (
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Terminer « ${s.name} » maintenant ?`)) {
                        call("PATCH", { id: s.id, action: "end" }, "Édition terminée.");
                      }
                    }}
                    className="btn-sakura btn-sakura-sm"
                  >
                    Terminer maintenant
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() =>
                    call(
                      "PATCH",
                      { id: s.id, action: "extend", days: 7 },
                      "Édition prolongée de 7 jours."
                    )
                  }
                  className="btn-sakura btn-sakura-sm"
                >
                  +7 jours
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}