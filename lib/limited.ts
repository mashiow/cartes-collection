// Cartes visibles par les joueurs : toutes, sauf celles d'une édition limitée
// qui n'a pas encore commencé
export function visibleCardsWhere() {
  return {
    OR: [
      { limitedSeriesId: null },
      { limitedSeries: { startsAt: { lte: new Date() } } },
    ],
  };
}