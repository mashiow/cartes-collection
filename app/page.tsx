import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Bienvenue sur le jeu Anetsuki</h1>
      <AuthButton />
      <Link
        href="/collection"
        className="rounded bg-[#454545] px-4 py-2 text-white hover:bg-[#5a5a5a]"
      >
        Voir la collection
      </Link>
            <Link
        href="/booster"
        className="rounded bg-[#454545] px-4 py-2 text-white hover:bg-[#5a5a5a]"
      >
        Ouvrir un booster
      </Link>
            <Link
        href="/echanges"
        className="rounded bg-[#454545] px-4 py-2 text-white hover:bg-[#5a5a5a]"
      >
        Échanges
      </Link>
    </main>
  );
}