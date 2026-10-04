import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Ma collection de cartes</h1>
      <AuthButton />
      <Link
        href="/collection"
        className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
      >
        Voir la collection
      </Link>
    </main>
  );
}