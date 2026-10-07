import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

const RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;
type RarityName = (typeof RARITIES)[number];

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const name = clean(body.name, 60);
  const bio = clean(body.bio, 500);
  const imageUrl = clean(body.imageUrl, 100);
  const series = clean(body.series, 40) || "Série 1";
  const rarity = body.rarity as RarityName;
  const limitedSeriesId =
    typeof body.limitedSeriesId === "string" && body.limitedSeriesId
      ? body.limitedSeriesId
      : null;

  if (!name) {
    return NextResponse.json({ error: "Donne un nom à la carte." }, { status: 400 });
  }
  if (!RARITIES.includes(rarity)) {
    return NextResponse.json({ error: "Rareté invalide." }, { status: 400 });
  }
  if (imageUrl && (!imageUrl.startsWith("/cards/") || imageUrl.includes(".."))) {
    return NextResponse.json(
      { error: "L'image doit commencer par /cards/ (ex : /cards/ma-carte.png)." },
      { status: 400 }
    );
  }

  try {
    const exists = await prisma.card.findFirst({ where: { name } });
    if (exists) {
      return NextResponse.json({ error: "Une carte porte déjà ce nom." }, { status: 400 });
    }

    if (limitedSeriesId) {
      const limited = await prisma.limitedSeries.findUnique({
        where: { id: limitedSeriesId },
      });
      if (!limited) {
        return NextResponse.json({ error: "Édition limitée introuvable." }, { status: 400 });
      }
    }

    await prisma.card.create({
      data: { name, bio, imageUrl, rarity, series, limitedSeriesId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}