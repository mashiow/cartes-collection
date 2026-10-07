import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 100) : "";
  const text = typeof body?.body === "string" ? body.body.trim().slice(0, 1000) : "";

  if (!title || !text) {
    return NextResponse.json({ error: "Titre et texte obligatoires" }, { status: 400 });
  }

  await prisma.news.create({ data: { title, body: text } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  await prisma.news.deleteMany({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
}