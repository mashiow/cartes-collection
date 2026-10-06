"use client";

import { useLayoutEffect, useState } from "react";

// true = l'écran de chargement ne s'affiche qu'une fois par visite
// false = il s'affiche à chaque arrivée sur l'accueil
const SHOW_ONCE_PER_VISIT = true;

const SEEN_KEY = "anetsuki-intro-seen";

const PETALS = [
  { x: "8%", d: "0s" },
  { x: "20%", d: "0.7s" },
  { x: "34%", d: "1.4s" },
  { x: "48%", d: "0.3s" },
  { x: "62%", d: "1.1s" },
  { x: "76%", d: "1.9s" },
  { x: "88%", d: "0.5s" },
  { x: "94%", d: "1.6s" },
];

export default function HomeIntro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"intro" | "skip" | "done">("intro");

  useLayoutEffect(() => {
    let seen = false;
    if (SHOW_ONCE_PER_VISIT) {
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {
        seen = false;
      }
    }

    if (seen) {
      setPhase("skip");
      return;
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setPhase("done");
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={phase === "skip" ? "intro-skip" : "intro-play"}>
      {phase === "intro" && (
        <div className="intro-overlay" aria-hidden="true">
          {PETALS.map((p, i) => (
            <span
              key={i}
              className="intro-petal"
              style={{ "--x": p.x, "--d": p.d } as React.CSSProperties}
            />
          ))}
          <div className="intro-flower" />
          <p className="text-2xl tracking-widest">Chargement...</p>
          <div className="intro-bar" />
        </div>
      )}
      {children}
    </div>
  );
}