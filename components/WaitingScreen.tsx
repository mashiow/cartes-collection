import type { CSSProperties } from "react";
import AuthButton from "@/components/AuthButton";
import Countdown from "@/components/Countdown";

const PETALS = [
  { x: "6%", d: "0s" },
  { x: "18%", d: "1.2s" },
  { x: "30%", d: "0.6s" },
  { x: "44%", d: "2s" },
  { x: "58%", d: "0.3s" },
  { x: "70%", d: "1.6s" },
  { x: "82%", d: "0.9s" },
  { x: "93%", d: "2.4s" },
];

export default function WaitingScreen({
  launchAt,
  serverNow,
  launchLabel,
}: {
  launchAt: number | null;
  serverNow: number;
  launchLabel: string | null;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      {/* Pétales qui tombent en fond */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="intro-petal"
            style={{ "--x": p.x, "--d": p.d } as CSSProperties}
          />
        ))}
      </div>

      <div className="title-frame px-6 py-8 md:px-14 md:py-10">
        <h1 className="title-logo text-6xl md:text-8xl">Anetsuki</h1>
        <div className="title-divider">
          <span />
        </div>
      </div>

      <div className="panel-sakura w-full max-w-3xl">
        <h2 className="panel-title">
          {launchAt ? "Ouverture dans" : "Ouverture bientôt"}
        </h2>
        <Countdown launchAt={launchAt} serverNow={serverNow} />
        {launchLabel && (
          <p className="mt-5 text-xl text-gray-200">
            Rendez-vous le <strong>{launchLabel}</strong>
          </p>
        )}
      </div>

      <AuthButton />
    </main>
  );
}