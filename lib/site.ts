import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const SETTINGS_ID = "main";

// Par défaut : écran d'attente jusqu'au 16/10/2026 à 00h00 (heure de Paris,
// soit 22h00 UTC la veille)
const DEFAULT_LAUNCH = new Date("2026-10-15T22:00:00.000Z");

export async function getSettings() {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: SETTINGS_ID },
  });
  if (existing) return existing;

  try {
    return await prisma.siteSettings.create({
      data: { id: SETTINGS_ID, waitingEnabled: true, launchAt: DEFAULT_LAUNCH },
    });
  } catch (e) {
    // Deux requêtes en même temps : l'autre a déjà créé la ligne
    const again = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (again) return again;
    throw e;
  }
}

// Le site est verrouillé si l'attente est active et que la date n'est pas passée
export function isLocked(settings: {
  waitingEnabled: boolean;
  launchAt: Date | null;
}) {
  return (
    settings.waitingEnabled &&
    (!settings.launchAt || settings.launchAt.getTime() > Date.now())
  );
}

// Pour les routes du jeu : renvoie une réponse d'erreur si le site est verrouillé
// et que le joueur n'est pas admin, sinon null
export async function lockedResponse(userId: string) {
  const settings = await getSettings();
  if (!isLocked(settings)) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  if (user?.isAdmin) return null;

  return NextResponse.json(
    { error: "Le jeu n'est pas encore ouvert. Rendez-vous le jour du lancement !" },
    { status: 403 }
  );
}