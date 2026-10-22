import type { CSSProperties } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import HomeIntro from "@/components/HomeIntro";
import Reveal from "@/components/Reveal";
import RewardsPanel from "@/components/RewardsPanel";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_COINS, isWednesday, todayKey } from "@/lib/rewards";

export const dynamic = "force-dynamic";

// Ordre d'apparition des éléments du haut de page
const step = (n: number) => ({ "--i": n }) as CSSProperties;

const tiles = [
  { href: "/collection", icon: "🃏", title: "Collection", text: "Découvre toutes les cartes et retrouve celles qui te manquent." },
  { href: "/booster", icon: "🎁", title: "Boosters", text: "Ouvre des boosters pour agrandir ta collection." },
  { href: "/boutique", icon: "💰", title: "Boutique", text: "Revends tes doublons contre des pièces." },
  { href: "/echanges", icon: "🔁", title: "Échanges", text: "Échange tes cartes avec les autres joueurs." },
  { href: "/jeux", icon: "🎮", title: "Mini-jeux", text: "Joue chaque jour pour gagner des pièces." },
  { href: "/classement", icon: "🏆", title: "Classement", text: "Compare ta collection à celle des autres." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-10 w-fit rounded-xl bg-[#2b2b2b]/90 px-8 py-3 text-center text-white shadow-xl">
      <h2 className="text-3xl font-bold md:text-4xl">{children}</h2>
    </div>
  );
}

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
      {/* ---------- Haut de page : le logo ---------- */}
            <section className="relative flex flex-col items-center justify-center gap-8 px-6 pb-16 pt-12 text-center">
        <div className="reveal" style={step(0)}>
          <div className="title-frame px-6 py-8 md:px-16 md:py-12">
            <p className="mb-3 text-xl text-gray-200 md:text-3xl">
              Bienvenue sur le jeu de cartes
            </p>
            <h1 className="title-logo text-6xl md:text-9xl">Anetsuki</h1>
            <div className="title-divider">
              <span />
            </div>
          </div>
        </div>

        <p
          className="reveal max-w-2xl rounded-xl bg-[#2b2b2b]/85 px-5 py-3 text-xl text-white md:text-2xl"
          style={step(1)}
        >
          Collectionne les cartes, ouvre des boosters et échange avec la
          communauté.
        </p>

        {!session && (
          <div className="reveal" style={step(2)}>
            <AuthButton />
          </div>
        )}

        {/* Illustration entre l'accroche et les récompenses */}
        <div className="reveal" style={step(3)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/decor/mitsuri.webp"
            alt=""
            aria-hidden="true"
            className="decor-float pointer-events-none mx-auto h-[360px] w-auto select-none object-contain md:h-[460px]"
          />
        </div>
      </section>

      {/* ---------- Récompenses et infos ---------- */}
      <section
        id="contenu"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-16"
      >
        <Reveal>
          <SectionTitle>Récompenses et infos</SectionTitle>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
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
          </Reveal>

          <Reveal delay={150}>
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
                      <p className="whitespace-pre-line text-gray-200">
                        {n.body}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Par où commencer ---------- */}
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <Reveal>
          <SectionTitle>Par où commencer ?</SectionTitle>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t, i) => (
            <Reveal key={t.href} delay={(i % 3) * 120}>
              <Link
                href={t.href}
                className="panel-sakura block h-full text-center transition hover:-translate-y-2"
              >
                <p className="text-5xl">{t.icon}</p>
                <h3 className="mt-2 text-2xl font-bold">{t.title}</h3>
                <p className="mt-1 text-gray-300">{t.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </HomeIntro>
  );
}