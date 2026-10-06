export const SELL_PRICES: Record<string, number> = {
  COMMON: 25,
  RARE: 50,
  EPIC: 100,
  LEGENDARY: 200,
};

export function sellPrice(rarity: string): number {
  return SELL_PRICES[rarity] ?? 0;
}