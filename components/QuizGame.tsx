"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  roundId: string;
  bio: string;
  options: { id: string; name: string }[];
};

type Result = { correct: boolean; answerName: string; gain: number };

export default function QuizGame({
  coins,
  remaining,
  total,
  reward,
  hasPending,
}: {
  coins: number;
  remaining: number;
  total: number;
  reward: number;
  hasPending: boolean;
}) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/games/quiz/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erreur");
      else setQuestion(data);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  async function answer(optionId: string) {
    if (!question) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId: question.roundId, optionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
      } else {
        setResult(data);
        setQuestion(null);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  const noGameLeft = remaining === 0 && !hasPending;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xl">
        <p>
          Ta monnaie : <strong>{coins}</strong> 🪙
        </p>
        <p>
          Parties restantes aujourd&apos;hui :{" "}
          <strong>
            {remaining} / {total}
          </strong>
        </p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {/* Question en cours */}
      {question && (
        <div className="flex w-full max-w-xl flex-col gap-5">
          <p className="text-center text-lg text-[#f4a7c0]">
            Qui est-ce ? Trouve la carte décrite ci-dessous.
          </p>
          <blockquote className="rounded-lg bg-black/30 p-5 text-center text-2xl italic leading-relaxed">
            « {question.bio} »
          </blockquote>
          <div className="flex flex-col gap-4">
            {question.options.map((o) => (
              <button
                key={o.id}
                onClick={() => answer(o.id)}
                disabled={loading}
                className="btn-sakura w-full px-4 py-3 text-xl"
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résultat */}
      {!question && result && (
        <div className="flex flex-col items-center gap-3 text-center">
          {result.correct ? (
            <p className="text-3xl text-green-400">
              Bravo ! +{result.gain} 🪙
            </p>
          ) : (
            <p className="text-3xl text-red-400">Raté...</p>
          )}
          <p className="text-xl">
            C&apos;était : <strong>{result.answerName}</strong>
          </p>
        </div>
      )}

      {/* Bouton jouer / rejouer */}
      {!question && (
        <>
          <button
            onClick={start}
            disabled={loading || noGameLeft}
            className="btn-sakura px-8 py-3 text-xl"
          >
            {loading
              ? "..."
              : hasPending
                ? "Reprendre ma question"
                : result
                  ? "Rejouer"
                  : `Jouer (+${reward} 🪙 si tu gagnes)`}
          </button>
          {noGameLeft && (
            <p className="text-gray-300">
              Plus de partie aujourd&apos;hui, reviens demain !
            </p>
          )}
        </>
      )}
    </div>
  );
}