"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  loggedIn: boolean;
  dailyCoins: number;
  dailyAvailable: boolean;
  isWednesday: boolean;
  weeklyAvailable: boolean;
  freeBoosters: number;
};

export default function RewardsPanel({
  loggedIn,
  dailyCoins,
  dailyAvailable,
  isWednesday,
  weeklyAvailable,
  freeBoosters,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"daily" | "weekly" | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  async function claim(type: "daily" | "weekly") {
    setLoading(type);
    setMessage(null);
    try {
      const res = await fetch(`/api/rewards/${type}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error ?? "Erreur", ok: false });
      } else {
        setMessage({
          text:
            type === "daily"
              ? `+${dailyCoins} pièces récupérées !`
              : "Booster offert ajouté !",
          ok: true,
        });
      }
    } catch {
      setMessage({ text: "Erreur réseau", ok: false });
    } finally {
      setLoading(null);
      router.refresh();
    }
  }

  return (
    <div className="panel-sakura">
      <h2 className="panel-title">Récompenses</h2>

      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-black/30 p-4 text-center">
          <p className="text-sm text-[#f4a7c0]">Chaque jour</p>
          <p className="mb-3 text-2xl font-semibold">+{dailyCoins} 🪙</p>
          {!loggedIn ? (
            <p className="text-gray-300">Connecte-toi pour la récupérer.</p>
          ) : dailyAvailable ? (
            <button
              onClick={() => claim("daily")}
              disabled={loading !== null}
              className="btn-sakura px-5 py-2"
            >
              {loading === "daily" ? "..." : "Récupérer"}
            </button>
          ) : (
            <p className="text-gray-300">Déjà récupérée, reviens demain !</p>
          )}
        </div>

        <div className="rounded-lg bg-black/30 p-4 text-center">
          <p className="text-sm text-[#f4a7c0]">Chaque mercredi</p>
          <p className="mb-3 text-2xl font-semibold">1 booster offert 🎁</p>
          {!loggedIn ? (
            <p className="text-gray-300">Connecte-toi pour le récupérer.</p>
          ) : weeklyAvailable ? (
            <button
              onClick={() => claim("weekly")}
              disabled={loading !== null}
              className="btn-sakura px-5 py-2"
            >
              {loading === "weekly" ? "..." : "Récupérer"}
            </button>
          ) : isWednesday ? (
            <p className="text-gray-300">Déjà récupéré aujourd&apos;hui !</p>
          ) : (
            <p className="text-gray-300">Disponible mercredi.</p>
          )}
        </div>

        {loggedIn && freeBoosters > 0 && (
          <div className="text-center">
            <p className="mb-2">
              Tu as <strong>{freeBoosters}</strong> booster
              {freeBoosters > 1 ? "s" : ""} offert
              {freeBoosters > 1 ? "s" : ""} à ouvrir !
            </p>
            <Link href="/booster" className="btn-sakura btn-sakura-sm">
              Ouvrir
            </Link>
          </div>
        )}

        {message && (
          <p
            className={`text-center ${
              message.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}