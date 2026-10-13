import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, isLocked } from "@/lib/site";
import WaitingScreen from "@/components/WaitingScreen";
import { connection } from "next/server";

export default async function SiteGate({
  children,
}: {
  children: React.ReactNode;
}) {
    // Ne rien lire dans la base pendant le build : seulement quand quelqu'un visite le site
  await connection();
  const settings = await getSettings();

  // Site ouvert : tout le monde passe
  if (!isLocked(settings)) return <>{children}</>;

  const session = await auth.api.getSession({ headers: await headers() });
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      })
    : null;

  // Les admins voient le site, avec un rappel
  if (user?.isAdmin) {
    return (
      <>
        <div className="bg-[#f4a7c0] px-4 py-2 text-center text-lg text-[#2b2b2b]">
          🔒 Écran d&apos;attente actif : seuls les admins voient le site.{" "}
          <Link href="/admin" className="font-semibold underline">
            Ouvrir le panneau admin
          </Link>
        </div>
        {children}
      </>
    );
  }

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