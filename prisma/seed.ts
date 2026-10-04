import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Une ligne par carte : le nom, le fichier image dans public/cards, la rareté, la série
const cards = [
  { name: "Anelyaa PO CONTENTE", image: "anelyaapocontente.png", rarity: "COMMON", series: "Série 1" },
  { name: "Anelyaa Pommaléfique", image: "anelyaapommalefique.png", rarity: "COMMON", series: "Série 1" },
  { name: "Hibou Sage", image: "hibou-sage.png", rarity: "COMMON", series: "Série 1" },
  { name: "Loup des Neiges", image: "loup-des-neiges.png", rarity: "RARE", series: "Série 1" },
  { name: "Panda Guerrier", image: "panda-guerrier.png", rarity: "RARE", series: "Série 1" },
  { name: "Dragon Doré", image: "dragon-dore.png", rarity: "EPIC", series: "Série 1" },
  { name: "Phénix Éternel", image: "phenix-eternel.png", rarity: "EPIC", series: "Série 1" },
  { name: "Roi des Étoiles", image: "roi-des-etoiles.png", rarity: "LEGENDARY", series: "Série 1" },
] as const;

async function main() {
  for (const c of cards) {
    const imageUrl = `/cards/${c.image}`;
    const existing = await prisma.card.findFirst({ where: { name: c.name } });

    if (existing) {
      await prisma.card.update({
        where: { id: existing.id },
        data: { imageUrl, rarity: c.rarity, series: c.series },
      });
    } else {
      await prisma.card.create({
        data: { name: c.name, imageUrl, rarity: c.rarity, series: c.series },
      });
    }
  }
  console.log(`${cards.length} cartes à jour !`);
}

main().finally(() => prisma.$disconnect());