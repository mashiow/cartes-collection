"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VisibilityToggle({ hidden }: { hidden: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });
      if (!res.ok) setError("Erreur, réessaie.");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-gray-300">
        {hidden
          ? "Tu es caché du classement : les autres ne peuvent pas voir ton profil."
          : "Tu apparais dans le classement et les autres joueurs peuvent voir ton profil."}
      </p>
      <button
        onClick={toggle}
        disabled={loading}
        className="btn-sakura btn-sakura-sm"
      >
        {hidden ? "Réapparaître dans le classement" : "Me cacher du classement"}
      </button>
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
}