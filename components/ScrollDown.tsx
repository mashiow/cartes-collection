"use client";

import { useEffect, useState } from "react";

export default function ScrollDown({ targetId }: { targetId: string }) {
  const [hidden, setHidden] = useState(false);

  // La flèche disparaît dès qu'on commence à défiler
  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      aria-label="Défiler vers le contenu"
      className={`absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full bg-[#2b2b2b]/85 px-6 py-3 text-white shadow-lg transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="text-lg">Découvre</span>
      <span className="scroll-chevron text-3xl leading-none">⌄</span>
    </button>
  );
}