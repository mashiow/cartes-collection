import { prisma } from "@/lib/prisma";

// Réglages : à modifier ici
export const DAILY_GAMES = 3; // parties par jour
export const QUIZ_REWARD = 25; // pièces gagnées si bonne réponse

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Cache le nom de la carte dans sa bio pour ne pas donner la réponse
export function maskName(bio: string, name: string) {
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`,
    "giu"
  );
  return bio.replace(pattern, "▒▒▒");
}

// Reconstitue la question à envoyer au joueur (sans la réponse)
export async function buildQuestion(round: {
  id: string;
  cardId: string;
  optionIds: string[];
}) {
  const cards = await prisma.card.findMany({
    where: { id: { in: round.optionIds } },
    select: { id: true, name: true, bio: true },
  });
  const byId = new Map(cards.map((c) => [c.id, c]));

  const answer = byId.get(round.cardId);
  if (!answer) return null;

  return {
    roundId: round.id,
    bio: maskName(answer.bio, answer.name),
    options: round.optionIds.flatMap((id) => {
      const c = byId.get(id);
      return c ? [{ id: c.id, name: c.name }] : [];
    }),
  };
}