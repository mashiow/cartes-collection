import Link from "next/link";
import AuthButton from "@/components/AuthButton";

const buttonClass =
  "btn-sakura rounded bg-[#454545] px-6 py-3 text-xl text-white hover:bg-[#5a5a5a]";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <h1 className="text-5xl font-bold md:text-7xl">
        Bienvenue sur le jeu de carte Anetsuki
      </h1>
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
    </main>
  );
}