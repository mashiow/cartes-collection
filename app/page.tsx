import Link from "next/link";
import AuthButton from "@/components/AuthButton";

const buttonClass =
  "btn-sakura rounded bg-[#454545] px-6 py-3 text-xl text-white hover:bg-[#5a5a5a]";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6 text-center">
      <div className="title-frame px-6 py-8 md:px-14 md:py-10">
        <p className="mb-3 text-xl text-gray-200 md:text-3xl">
          Bienvenue sur le jeu de carte
        </p>
        <h1 className="title-logo text-6xl md:text-8xl">Anetsuki</h1>
        <div className="title-divider">
          <span />
        </div>
      </div>

      <AuthButton />
      <Link href="/collection" className={buttonClass}>
        Voir la collection
      </Link>
      <Link href="/booster" className={buttonClass}>
        Ouvrir un booster
      </Link>
      <Link href="/echanges" className={buttonClass}>
        Échanges
      </Link>
      <Link href="/faq" className={buttonClass}>
        FAQ
      </Link>
    </main>
  );
}