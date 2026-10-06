import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BOOSTER_PRICE } from "@/lib/booster";
import BoosterOpener from "@/components/BoosterOpener";

export const dynamic = "force-dynamic";

export default async function BoosterPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Connecte-toi pour ouvrir des boosters.</p>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-bold">Boosters</h1>
        <Link href="/" className="btn-sakura btn-sakura-sm">
          Accueil
        </Link>
      </div>
      <BoosterOpener coins={user?.coins ?? 0} price={BOOSTER_PRICE} />
    </main>
  );
}