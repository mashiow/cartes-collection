import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Renvoie l'admin connecté, ou null si la personne n'est pas admin
export async function getAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, isAdmin: true },
  });
  return user?.isAdmin ? user : null;
}