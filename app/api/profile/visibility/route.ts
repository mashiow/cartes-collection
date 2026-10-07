import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.hidden !== "boolean") {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { hideFromLeaderboard: body.hidden },
  });
  return NextResponse.json({ ok: true });
}