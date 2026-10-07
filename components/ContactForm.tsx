"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const MAX_MESSAGE = 1500;

const inputClass =
  "w-full rounded-lg border border-gray-600 bg-[#1f1f1f] p-3 text-xl text-white placeholder-gray-400";

export default function ContactForm() {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // piège à robots, doit rester vide
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(
    null
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo, email, message, website }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ text: data.error ?? "Erreur", ok: false });
      } else {
        setFeedback({
          text: "Merci ! Ton message a bien été envoyé à l'équipe.",
          ok: true,
        });
        setMessage("");
        setEmail("");
      }
    } catch {
      setFeedback({ text: "Erreur réseau, réessaie plus tard.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>Ton pseudo (Discord ou Twitch)</span>
        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          maxLength={50}
          required
          placeholder="Ton pseudo"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>
          Ton e-mail <span className="text-gray-400">(facultatif)</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={100}
          placeholder="Pour qu'on puisse te répondre"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Ton message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE}
          required
          rows={6}
          placeholder="Une question, un bug, une idée ?"
          className={inputClass}
        />
        <span className="text-right text-base text-gray-400">
          {message.length} / {MAX_MESSAGE}
        </span>
      </label>

      {/* Champ piège : invisible pour les humains */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />

      <button
        type="submit"
        disabled={loading || !pseudo.trim() || message.trim().length < 5}
        className="btn-sakura self-start px-8 py-3 text-xl"
      >
        {loading ? "Envoi..." : "Envoyer"}
      </button>

      {feedback && (
        <p className={feedback.ok ? "text-green-400" : "text-red-400"}>
          {feedback.text}
        </p>
      )}

      <p className="text-base text-gray-400">
        Ton pseudo, ton e-mail (si tu le renseignes) et ton message sont
        transmis à l&apos;équipe sur Discord pour pouvoir te répondre. Rien
        d&apos;autre n&apos;est enregistré.
      </p>
    </form>
  );
}