import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { SETTINGS_ID, getSettings } from "@/lib/site";

export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const current = await getSettings();
  let waitingEnabled = current.waitingEnabled;
  let launchAt = current.launchAt;

  if (typeof body.waitingEnabled === "boolean") {
    waitingEnabled = body.waitingEnabled;
  }

  if (body.launchAt === null) {
    launchAt = null;
  } else if (typeof body.launchAt === "string") {
    const date = new Date(body.launchAt);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date invalide." }, { status: 400 });
    }
    launchAt = date;
  }

  if (waitingEnabled && launchAt && launchAt.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Choisis une date de lancement dans le futur, ou enlève la date." },
      { status: 400 }
    );
  }

  await prisma.siteSettings.update({
    where: { id: SETTINGS_ID },
    data: { waitingEnabled, launchAt },
  });

  console.log(
    `[admin] ${admin.name} : écran d'attente ${waitingEnabled ? "activé" : "désactivé"}, lancement ${launchAt ? launchAt.toISOString() : "sans date"}`
  );
  return NextResponse.json({ ok: true });
}