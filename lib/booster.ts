import { randomInt } from "node:crypto";

export const BOOSTER_PRICE = 100;

type RarityName = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

const RARITY_WEIGHTS: { rarity: RarityName; weight: number }[] = [
  { rarity: "COMMON", weight: 70 },
  { rarity: "RARE", weight: 20 },
  { rarity: "EPIC", weight: 8 },
  { rarity: "LEGENDARY", weight: 2 },
];

export function rollRarity(): RarityName {
  const total = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);
  let roll = randomInt(total);

  for (const { rarity, weight } of RARITY_WEIGHTS) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return "COMMON";
}