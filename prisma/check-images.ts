import "dotenv/config";
import { readdirSync } from "node:fs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const files = readdirSync("public/cards");
  const exact = new Set(files);
  const lower = new Map(files.map((f) => [f.toLowerCase(), f]));

  const cards = await prisma.card.findMany({ orderBy: { name: "asc" } });

  for (const c of cards) {
    if (!c.imageUrl) {
      console.log(`❌ ${c.name} : aucune image enregistrée dans la base`);
      continue;
    }
    if (c.imageUrl.startsWith("/api/card-image/")) {
      console.log(`✅ ${c.name} : image stockée dans la base`);
      continue;
    }
    if (!c.imageUrl.startsWith("/cards/")) {
      console.log(`❌ ${c.name} : le chemin doit commencer par /cards/ (actuel : ${c.imageUrl})`);
      continue;
    }

    const file = c.imageUrl.replace(/^\/cards\//, "");
    if (exact.has(file)) {
      console.log(`✅ ${c.name} : ${file}`);
    } else if (lower.has(file.toLowerCase())) {
      console.log(`⚠️ ${c.name} : majuscules/minuscules différentes. Base : ${file} / Fichier : ${lower.get(file.toLowerCase())}`);
    } else {
      console.log(`❌ ${c.name} : fichier introuvable dans public/cards (${file})`);
    }
  }
}

main().finally(() => prisma.$disconnect());