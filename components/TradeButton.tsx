"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TradeButton({
  tradeId,
  action,
  label,
  disabled = false,
  className = "",
}: {
  tradeId: string;
  action: "accept" | "cancel";
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trades/${tradeId}/${action}`, { method: "POST" });
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
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={loading || disabled}
                className={`btn-sakura rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {loading ? "..." : label}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}