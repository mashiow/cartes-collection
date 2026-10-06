import { randomInt } from "node:crypto";

export const BOOSTER_PRICE = 100;

type RarityName = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export const RARITY_WEIGHTS: { rarity: RarityName; weight: number }[] = [
  { rarity: "COMMON", weight: 700 },
  { rarity: "RARE", weight: 220 },
  { rarity: "EPIC", weight: 75 },
  { rarity: "LEGENDARY", weight: 5 },
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