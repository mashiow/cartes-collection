"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const TABS = [
  { href: "/", label: "Accueil" },
  { href: "/collection", label: "Collection" },
  { href: "/booster", label: "Boosters" },
  { href: "/boutique", label: "Boutique" },
  { href: "/echanges", label: "Échanges" },
  { href: "/jeux", label: "Jeux" },
  { href: "/classement", label: "Classement" },
  { href: "/faq", label: "FAQ" },
];

export default function NavBar({
  loggedIn,
  coins,
  isAdmin,
}: {
  loggedIn: boolean;
  coins: number | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Le menu mobile se referme quand on change de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const tabs = isAdmin ? [...TABS, { href: "/admin", label: "Admin" }] : TABS;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const tabClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-base transition ${
      active
        ? "bg-[#f4a7c0] font-semibold text-[#2b2b2b]"
        : "text-gray-200 hover:bg-white/10 hover:text-white"
    }`;

  function login() {
    authClient.signIn.social({ provider: "discord", callbackURL: pathname });
  }

  async function logout() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#f4a7c0] bg-[#2b2b2b]/95 text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-4 px-4 xl:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-2xl font-bold tracking-widest"
        >
          <span className="nav-flower" />
          ANETSUKI
        </Link>

        {/* Onglets (grand écran) */}
        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={tabClass(isActive(t.href))}>
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 xl:ml-0">
          {loggedIn && coins !== null && (
            <span
              className="rounded-full bg-black/40 px-3 py-1 text-base"
              title="Ta monnaie"
            >
              🪙 {coins}
            </span>
          )}

          <div className="hidden items-center gap-2 xl:flex">
            {loggedIn ? (
              <>
                <Link
                  href="/profil"
                  className={`rounded-full px-3 py-1 text-base transition ${
                    isActive("/profil")
                      ? "bg-[#f4a7c0] text-[#2b2b2b]"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  👤 Profil
                </Link>
                <button
                  onClick={logout}
                  title="Se déconnecter"
                  className="rounded-full bg-white/10 px-3 py-1 text-base hover:bg-white/20"
                >
                  ⎋
                </button>
              </>
            ) : (
              <button onClick={login} className="btn-sakura btn-sakura-sm">
                Se connecter
              </button>
            )}
          </div>

          {/* Bouton menu (petit écran) */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="rounded-lg bg-white/10 px-3 py-1 text-2xl xl:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Menu déroulant (petit écran) */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-600 px-4 pb-4 pt-2 xl:hidden">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={tabClass(isActive(t.href))}>
              {t.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link href="/profil" className={tabClass(isActive("/profil"))}>
                👤 Mon profil
              </Link>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-2 text-left text-base text-gray-200 hover:bg-white/10"
              >
                ⎋ Se déconnecter
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="rounded-lg px-3 py-2 text-left text-base text-[#f4a7c0] hover:bg-white/10"
            >
              Se connecter avec Discord
            </button>
          )}
        </nav>
      )}
    </header>
  );
}