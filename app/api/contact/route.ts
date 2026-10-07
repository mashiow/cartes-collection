import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Anti-spam : 3 messages par heure et par personne
const MAX_PER_HOUR = 3;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function tooManyRequests(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_HOUR) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  // Piège à robots : ce champ caché doit rester vide
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const pseudo = clean(body.pseudo, 50);
  const email = clean(body.email, 100);
  const message = clean(body.message, 1500);

  if (!pseudo) {
    return NextResponse.json({ error: "Indique ton pseudo." }, { status: 400 });
  }
  if (message.length < 5) {
    return NextResponse.json(
      { error: "Ton message est trop court." },
      { status: 400 }
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Cette adresse e-mail n'a pas l'air valide." },
      { status: 400 }
    );
  }

  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "inconnu";
  if (tooManyRequests(ip)) {
    return NextResponse.json(
      { error: "Tu as envoyé trop de messages. Réessaie plus tard." },
      { status: 429 }
    );
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.CONTACT_CHANNEL_ID;
  if (!token || !channelId) {
    console.error("Formulaire de contact : DISCORD_BOT_TOKEN ou CONTACT_CHANNEL_ID manquant");
    return NextResponse.json(
      { error: "Le formulaire n'est pas configuré pour le moment." },
      { status: 500 }
    );
  }

  // Si la personne est connectée, on ajoute son compte pour la reconnaître
  let account = "";
  try {
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (session) account = session.user.name;
  } catch {
    /* pas grave */
  }

  const fields = [
    { name: "Pseudo", value: pseudo, inline: true },
    { name: "E-mail", value: email || "non renseigné", inline: true },
  ];
  if (account) {
    fields.push({ name: "Compte du site", value: account, inline: true });
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [
            {
              title: "📩 Nouveau message de contact",
              description: message,
              color: 16033728,
              fields,
              timestamp: new Date().toISOString(),
            },
          ],
          // Aucune mention (@everyone, @rôle...) ne sera déclenchée
          allowed_mentions: { parse: [] },
        }),
      }
    );

    if (!res.ok) {
      console.error("Discord a refusé le message :", res.status, await res.text());
      return NextResponse.json(
        { error: "Impossible d'envoyer ton message pour le moment." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}