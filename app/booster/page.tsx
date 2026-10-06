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
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="panel-sakura flex flex-col items-center gap-4 text-center">
          <p className="text-xl">Connecte-toi pour ouvrir des boosters.</p>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true, freeBoosters: true },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Boosters</h1>
        <div className="flex gap-4">
          <Link href="/boutique" className="btn-sakura btn-sakura-sm">
            Boutique
          </Link>
          <Link href="/" className="btn-sakura btn-sakura-sm">
            Accueil
          </Link>
        </div>
      </div>

      <div className="panel-sakura">
        <BoosterOpener
          coins={user?.coins ?? 0}
          price={BOOSTER_PRICE}
          freeBoosters={user?.freeBoosters ?? 0}
        />
      </div>
    </main>
  );
}