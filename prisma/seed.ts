import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const cards = [
  {
    name: "Anelyaa PO CONTENTE",
    image: "anelyaapocontente.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "C'est rien, elle a juste perdu sur valorant...",
  },
  {
    name: "Anelyaa Pommaléfique",
    image: "anelyaapommalefique.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Faites attention, si elle se met à distribuer des pommes, fuyez.",
  },
  {
    name: "Hibou Sage",
    image: "hibou-sage.png",
    rarity: "COMMON",
    series: "Série 1",
    bio: "Il veille la nuit et connaît toutes les histoires de la forêt.",
  },
  {
    name: "Loup des Neiges",
    image: "loup-des-neiges.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Le chef de la meute blanche. Son hurlement s'entend à des kilomètres.",
  },
  {
    name: "Panda Guerrier",
    image: "panda-guerrier.png",
    rarity: "RARE",
    series: "Série 1",
    bio: "Doux comme un nounours, redoutable au combat.",
  },
  {
    name: "Dragon Doré",
    image: "dragon-dore.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "Il dort sur un trésor que personne n'a jamais osé réclamer.",
  },
  {
    name: "Phénix Éternel",
    image: "phenix-eternel.png",
    rarity: "EPIC",
    series: "Série 1",
    bio: "Chaque fois qu'il tombe en cendres, il renaît plus brillant.",
  },
  {
    name: "Roi des Étoiles",
    image: "roi-des-etoiles.png",
    rarity: "LEGENDARY",
    series: "Série 1",
    bio: "On dit qu'il a allumé la première étoile. Peu l'ont croisé, nul ne l'a oublié.",
  },
] as const;

async function main() {
  for (const c of cards) {
    const imageUrl = `/cards/${c.image}`;
    const existing = await prisma.card.findFirst({ where: { name: c.name } });

    if (existing) {
      await prisma.card.update({
        where: { id: existing.id },
        data: { imageUrl, rarity: c.rarity, series: c.series, bio: c.bio },
      });
    } else {
      await prisma.card.create({
        data: {
          name: c.name,
          imageUrl,
          rarity: c.rarity,
          series: c.series,
          bio: c.bio,
        },
      });
    }
  }
  console.log(`${cards.length} cartes à jour !`);
}

main().finally(() => prisma.$disconnect());