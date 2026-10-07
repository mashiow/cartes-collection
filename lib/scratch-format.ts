export function prizeLabel(coins: number, boosters: number): string {
  const parts: string[] = [];
  if (coins > 0) parts.push(`${coins} pièces 🪙`);
  if (boosters > 0) {
    parts.push(
      `${boosters} booster${boosters > 1 ? "s" : ""} offert${boosters > 1 ? "s" : ""} 🎁`
    );
  }
  return parts.join(" + ");
}