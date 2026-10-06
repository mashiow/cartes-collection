"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellButton({
  cardId,
  quantity,
  label,
  confirmText,
}: {
  cardId: string;
  quantity: number;
  label: string;
  confirmText: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sell() {
    if (!window.confirm(confirmText)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erreur");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={sell}
        disabled={loading}
        className="btn-sakura btn-sakura-sm"
      >
        {loading ? "..." : label}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}