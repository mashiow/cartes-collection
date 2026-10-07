import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  const dropRate = Number(body?.dropRate);
  const durationDays = body?.durationDays;
  const startsAt = body?.startsAt ? new Date(body.startsAt) : new Date();

  if (!name) {
    return NextResponse.json({ error: "Donne un nom à l'édition." }, { status: 400 });
  }
  if (!Number.isFinite(dropRate) || dropRate < 0 || dropRate > 100) {
    return NextResponse.json({ error: "La chance doit être entre 0 et 100 %." }, { status: 400 });
  }
  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
    return NextResponse.json({ error: "Durée invalide (1 à 365 jours)." }, { status: 400 });
  }
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "Date de début invalide." }, { status: 400 });
  }

  const endsAt = new Date(startsAt.getTime() + durationDays * DAY_MS);

  await prisma.limitedSeries.create({
    data: { name, dropRate, startsAt, endsAt },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const action = body?.action;
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const series = await prisma.limitedSeries.findUnique({ where: { id } });
  if (!series) {
    return NextResponse.json({ error: "Édition introuvable" }, { status: 404 });
  }

  const now = new Date();

  if (action === "toggle") {
    await prisma.limitedSeries.update({
      where: { id },
      data: { enabled: !series.enabled },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "end") {
    if (series.startsAt > now) {
      return NextResponse.json(
        { error: "Cette édition n'a pas commencé : mets-la en pause à la place." },
        { status: 400 }
      );
    }
    await prisma.limitedSeries.update({ where: { id }, data: { endsAt: now } });
    return NextResponse.json({ ok: true });
  }

  if (action === "extend") {
    const days = body?.days;
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return NextResponse.json({ error: "Durée invalide" }, { status: 400 });
    }
    const base = series.endsAt > now ? series.endsAt : now;
    await prisma.limitedSeries.update({
      where: { id },
      data: { endsAt: new Date(base.getTime() + days * DAY_MS) },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}