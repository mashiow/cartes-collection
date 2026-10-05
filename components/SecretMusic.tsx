"use client";

import { useEffect, useRef, useState } from "react";

export default function SecretMusic({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.src = src;
    audio.volume = 0.5;
    audio.addEventListener("ended", () => setPlaying(false));
    audioRef.current = audio;

    // La musique s'arrête quand on quitte la page
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Musique"
      className={`absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition focus:opacity-100 ${
        playing ? "opacity-100" : "opacity-10 hover:opacity-100"
      }`}
    >
      {playing ? "⏸" : "♪"}
    </button>
  );
}