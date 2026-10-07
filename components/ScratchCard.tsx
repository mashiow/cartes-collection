"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { prizeLabel } from "@/lib/scratch-format";

type Ticket = { ticketId: string; coins: number; boosters: number };
type Point = { x: number; y: number };

const WIDTH = 320;
const HEIGHT = 200;
const BRUSH = 24; // rayon du "grattage"
const REVEAL_AT = 0.5; // part grattée avant la révélation automatique

// Pétales qui jaillissent à la révélation (styles déjà dans globals.css)
const BURST = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist = 120 + (i % 3) * 30;
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist),
    r: (i % 2 === 0 ? 1 : -1) * (150 + i * 25),
  };
});

export default function ScratchCard({
  status,
  doneCoins,
  doneBoosters,
}: {
  status: "available" | "pending" | "done";
  doneCoins: number;
  doneBoosters: number;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<Point | null>(null);
  const lastCheck = useRef(0);
  const claiming = useRef(false);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dessine la couche grise à gratter quand le ticket apparaît
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ticket) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    grad.addColorStop(0, "#c9c9d4");
    grad.addColorStop(0.5, "#9a9aa8");
    grad.addColorStop(1, "#c9c9d4");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.globalAlpha = 0.45;
    ctx.font = "26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let row = 0; row * 48 + 24 < HEIGHT; row++) {
      const y = row * 48 + 24;
      for (let x = row % 2 === 0 ? 30 : 54; x < WIDTH; x += 48) {
        ctx.fillText("🌸", x, y);
      }
    }
    ctx.globalAlpha = 1;

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 6;
    ctx.fillText("GRATTE ICI !", WIDTH / 2, HEIGHT / 2);
    ctx.shadowBlur = 0;
  }, [ticket]);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games/scratch/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        claiming.current = false;
        setRevealed(false);
        setSaved(false);
        setTicket(data);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function reveal() {
    if (claiming.current || !ticket) return;
    claiming.current = true;
    drawing.current = false;
    setRevealed(true);

    try {
      const res = await fetch("/api/games/scratch/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.ticketId }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erreur");
      else setSaved(true);
    } catch {
      setError("Erreur réseau : recharge la page pour reprendre ton ticket.");
    } finally {
      router.refresh();
    }
  }

  function getPoint(e: ReactPointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * WIDTH) / rect.width,
      y: ((e.clientY - rect.top) * HEIGHT) / rect.height,
    };
  }

  function erase(from: Point, to: Point) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(to.x, to.y, BRUSH, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkProgress() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || claiming.current) return;

    const data = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 7) {
      total++;
      if (data[i] < 128) cleared++;
    }
    if (cleared / total >= REVEAL_AT) reveal();
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = getPoint(e);
    last.current = p;
    erase(p, p);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = getPoint(e);
    erase(last.current ?? p, p);
    last.current = p;

    const now = Date.now();
    if (now - lastCheck.current > 150) {
      lastCheck.current = now;
      checkProgress();
    }
  }

  function onPointerUp() {
    drawing.current = false;
    last.current = null;
    checkProgress();
  }

  // Pas de ticket affiché : bouton pour en obtenir un, ou message "déjà joué"
  if (!ticket) {
    if (status === "done") {
      return (
        <p className="text-center text-xl">
          Tu as déjà gratté ton ticket aujourd&apos;hui :{" "}
          <strong>{prizeLabel(doneCoins, doneBoosters)}</strong>
          <br />
          <span className="text-gray-300">Reviens demain pour un nouveau !</span>
        </p>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4">
        {error && <p className="text-red-400">{error}</p>}
        <button
          onClick={start}
          disabled={loading}
          className="btn-sakura px-8 py-3 text-xl"
        >
          {loading
            ? "..."
            : status === "pending"
              ? "Reprendre mon ticket"
              : "Obtenir mon ticket du jour"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!revealed && (
        <p className="text-center text-gray-200">
          Gratte le ticket avec ta souris ou ton doigt !
        </p>
      )}

      <div
        className="relative w-full max-w-[320px]"
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
      >
        {revealed && <div className="reveal-flash" />}
        {revealed && (
          <div className="burst">
            {BURST.map((p, i) => (
              <span
                key={i}
                className="burst-petal"
                style={
                  {
                    "--dx": p.dx,
                    "--dy": p.dy,
                    "--r": `${p.r}deg`,
                    "--k": 1.3,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* Le gain, caché sous la couche à gratter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-4 border-[#f4a7c0] bg-gradient-to-br from-[#4a2f3b] to-[#2b2b2b] text-center">
          <p className="text-sm text-[#f4a7c0]">Tu as gagné</p>
          <p
            className={`px-2 text-3xl font-bold text-yellow-300 ${
              revealed ? "animate-pulse" : ""
            }`}
          >
            {prizeLabel(ticket.coins, ticket.boosters)}
          </p>
        </div>

        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className={`absolute inset-0 h-full w-full rounded-xl transition-opacity duration-700 ${
            revealed ? "pointer-events-none opacity-0" : "cursor-pointer"
          }`}
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      {error && <p className="text-center text-red-400">{error}</p>}

      {revealed && (
        <p className="text-center text-xl">
          {saved
            ? "Gain ajouté à ton compte ! Reviens demain pour un nouveau ticket."
            : "Enregistrement..."}
        </p>
      )}
    </div>
  );
}