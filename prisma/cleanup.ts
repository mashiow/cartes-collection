import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Les 8 anciennes cartes de test
const OLD_NAMES = [
  "Chat Ninja",
  "Renard Rusé",
  "Hibou Sage",
  "Loup des Neiges",
  "Panda Guerrier",
  "Dragon Doré",
  "Phénix Éternel",
  "Roi des Étoiles",
];

async function main() {
  const cards = await prisma.card.findMany({
    where: { name: { in: OLD_NAMES } },
  });
  const ids = cards.map((c) => c.id);

  console.log(`${cards.length} carte(s) trouvée(s) :`, cards.map((c) => c.name).join(", "));
  if (ids.length === 0) return;

  // Sécurité : on s'arrête si des échanges utilisent ces cartes
  const trades = await prisma.trade.count({
    where: {
      OR: [{ offeredCardId: { in: ids } }, { wantedCardId: { in: ids } }],
    },
  });
  if (trades > 0) {
    console.log(`Arrêt : ${trades} échange(s) utilisent ces cartes. Supprime-les d'abord dans la table Trade.`);
    return;
  }

  const owned = await prisma.userCard.deleteMany({ where: { cardId: { in: ids } } });
  console.log(`${owned.count} ligne(s) d'inventaire supprimée(s)`);

  const deleted = await prisma.card.deleteMany({ where: { id: { in: ids } } });
  console.log(`${deleted.count} carte(s) supprimée(s)`);
}

main().finally(() => prisma.$disconnect());