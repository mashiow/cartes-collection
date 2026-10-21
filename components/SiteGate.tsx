import { connection } from "next/server";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, isLocked } from "@/lib/site";
import WaitingScreen from "@/components/WaitingScreen";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default async function SiteGate({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ne rien lire dans la base pendant le build : seulement quand quelqu'un visite le site
  await connection();

  const settings = await getSettings();
  const locked = isLocked(settings);

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true, coins: true },
      })
    : null;

  // Écran d'attente pour tous sauf les admins
  if (locked && !user?.isAdmin) {
    return (
      <WaitingScreen
        launchAt={settings.launchAt ? settings.launchAt.getTime() : null}
        serverNow={Date.now()}
        launchLabel={
          settings.launchAt
            ? settings.launchAt.toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null
        }
      />
    );
  }

  return (
    <>
      {locked && (
        <div className="bg-[#f4a7c0] px-4 py-2 text-center text-lg text-[#2b2b2b]">
          🔒 Écran d&apos;attente actif : seuls les admins voient le site.{" "}
          <Link href="/admin" className="font-semibold underline">
            Ouvrir le panneau admin
          </Link>
        </div>
      )}
      <NavBar
        loggedIn={!!user}
        coins={user?.coins ?? null}
        isAdmin={!!user?.isAdmin}
      />
      {children}
      <Footer />
    </>
  );
}