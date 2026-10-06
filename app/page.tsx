import type { CSSProperties } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import HomeIntro from "@/components/HomeIntro";
import RewardsPanel from "@/components/RewardsPanel";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_COINS, isWednesday, todayKey } from "@/lib/rewards";

export const dynamic = "force-dynamic";

const buttonClass = "btn-sakura px-6 py-3 text-xl";

// Ordre d'apparition : plus le numéro est grand, plus l'élément arrive tard
const step = (n: number) => ({ "--i": n }) as CSSProperties;

const menu = [
  { href: "/collection", label: "Voir la collection" },
  { href: "/booster", label: "Ouvrir un booster" },
  { href: "/boutique", label: "Boutique" },
  { href: "/echanges", label: "Échanges" },
  { href: "/jeux", label: "Mini-jeux" },
  { href: "/faq", label: "FAQ" },

];

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const today = todayKey();
  const wednesday = isWednesday();

  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { lastDailyDate: true, lastWeeklyDate: true, freeBoosters: true },
      })
    : null;

  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <HomeIntro>
      <main className="mx-auto grid min-h-screen w-full max-w-[1800px] gap-8 p-6 lg:grid-cols-[300px_minmax(0,1fr)_300px] lg:items-center lg:px-10">
        {/* Gauche : récompenses */}
        <aside className="reveal reveal-left order-2 lg:order-1" style={step(3)}>
          <RewardsPanel
            loggedIn={!!session}
            dailyCoins={DAILY_COINS}
            dailyAvailable={!!session && user?.lastDailyDate !== today}
            isWednesday={wednesday}
            weeklyAvailable={
              !!session && wednesday && user?.lastWeeklyDate !== today
            }
            freeBoosters={user?.freeBoosters ?? 0}
          />
        </aside>

        {/* Centre : titre et boutons */}
        <div className="order-1 flex flex-col items-center gap-10 text-center lg:order-2">
          <div className="reveal" style={step(0)}>
            <div className="title-frame px-6 py-8 md:px-14 md:py-10">
              <p className="mb-3 text-xl text-gray-200 md:text-3xl">
                Bienvenue sur le jeu de carte
              </p>
              <h1 className="title-logo text-6xl md:text-8xl">Anetsuki</h1>
              <div className="title-divider">
                <span />
              </div>
            </div>
          </div>

          <div className="reveal" style={step(1)}>
            <AuthButton />
          </div>

          {menu.map((item, i) => (
            <div key={item.href} className="reveal" style={step(2 + i)}>
              <Link href={item.href} className={buttonClass}>
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Droite : dernières infos */}
        <aside className="reveal reveal-right order-3" style={step(4)}>
          <div className="panel-sakura">
            <h2 className="panel-title">Dernières infos</h2>
            {news.length === 0 ? (
              <p className="text-center text-gray-300">
                Rien de nouveau pour le moment.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {news.map((n) => (
                  <article
                    key={n.id}
                    className="border-b border-gray-600 pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm text-[#f4a7c0]">
                      {n.createdAt.toLocaleDateString("fr-FR", {
                        timeZone: "Europe/Paris",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    <h3 className="text-xl font-semibold">{n.title}</h3>
                    <p className="whitespace-pre-line text-gray-200">{n.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </HomeIntro>
  );
}