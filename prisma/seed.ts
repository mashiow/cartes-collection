import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  if ((await prisma.card.count()) > 0) {
    console.log("Des cartes existent déjà, rien à faire.");
    return;
  }

  await prisma.card.createMany({
    data: [
      { name: "Chat Ninja", imageUrl: "", rarity: "COMMON", series: "Série 1" },
      { name: "Renard Rusé", imageUrl: "", rarity: "COMMON", series: "Série 1" },
      { name: "Hibou Sage", imageUrl: "", rarity: "COMMON", series: "Série 1" },
      { name: "Loup des Neiges", imageUrl: "", rarity: "RARE", series: "Série 1" },
      { name: "Panda Guerrier", imageUrl: "", rarity: "RARE", series: "Série 1" },
      { name: "Dragon Doré", imageUrl: "", rarity: "EPIC", series: "Série 1" },
      { name: "Phénix Éternel", imageUrl: "", rarity: "EPIC", series: "Série 1" },
      { name: "Roi des Étoiles", imageUrl: "", rarity: "LEGENDARY", series: "Série 1" },
    ],
  });
  console.log("8 cartes de test créées !");
}

main().finally(() => prisma.$disconnect());