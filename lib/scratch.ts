import { randomInt } from "node:crypto";

export type ScratchPrize = { coins: number; boosters: number; weight: number };

// Plus le "weight" est grand, plus le gain est fréquent (total actuel : 1000)
export const SCRATCH_PRIZES: ScratchPrize[] = [
  { coins: 10, boosters: 0, weight: 400 },
  { coins: 25, boosters: 0, weight: 300 },
  { coins: 50, boosters: 0, weight: 180 },
  { coins: 100, boosters: 0, weight: 80 },
  { coins: 0, boosters: 1, weight: 30 },
  { coins: 250, boosters: 0, weight: 10 },
];

export function rollPrize(): ScratchPrize {
  const total = SCRATCH_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let roll = randomInt(total);

  for (const prize of SCRATCH_PRIZES) {
    if (roll < prize.weight) return prize;
    roll -= prize.weight;
  }
  return SCRATCH_PRIZES[0];
}