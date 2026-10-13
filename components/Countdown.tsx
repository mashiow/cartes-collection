"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Box({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="rounded-xl bg-black/30 px-2 py-4">
      <p className="text-5xl font-bold md:text-7xl">
        {value === null ? "--" : String(value).padStart(2, "0")}
      </p>
      <p className="text-lg text-gray-300">{label}</p>
    </div>
  );
}

export default function Countdown({
  launchAt,
  serverNow,
}: {
  launchAt: number | null;
  serverNow: number;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number | null>(null);

  // Basé sur l'heure du serveur, pas sur l'horloge de l'ordinateur du joueur
  useEffect(() => {
    if (launchAt === null) return;
    const offset = serverNow - Date.now();
    const tick = () =>
      setRemaining(Math.max(0, launchAt - (Date.now() + offset)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [launchAt, serverNow]);

  const finished = remaining === 0;

  // Le site se rouvre tout seul : on revérifie régulièrement côté serveur
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), finished ? 3000 : 30000);
    return () => clearInterval(timer);
  }, [finished, router]);

  if (launchAt === null) {
    return (
      <p className="text-2xl">Le jeu ouvrira très bientôt, reste dans le coin !</p>
    );
  }

  if (finished) {
    return (
      <p className="text-3xl text-green-400">
        C&apos;est l&apos;heure ! Le site s&apos;ouvre...
      </p>
    );
  }

  const total = remaining === null ? null : Math.floor(remaining / 1000);

  return (
    <div className="grid grid-cols-4 gap-3">
      <Box value={total === null ? null : Math.floor(total / 86400)} label="jours" />
      <Box value={total === null ? null : Math.floor((total % 86400) / 3600)} label="heures" />
      <Box value={total === null ? null : Math.floor((total % 3600) / 60)} label="minutes" />
      <Box value={total === null ? null : total % 60} label="secondes" />
    </div>
  );
}