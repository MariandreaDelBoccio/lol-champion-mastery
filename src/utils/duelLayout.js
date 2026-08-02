/**
 * Split comparison rows into shared vs exclusive for duel UI.
 */
export function splitDuelRows(comparison) {
  const shared = comparison.rows.filter((r) => !r.exclusive);
  const soloA = comparison.rows.filter((r) => r.exclusive && r.winner === 'a');
  const soloB = comparison.rows.filter((r) => r.exclusive && r.winner === 'b');

  const totalPtsA = comparison.rows.reduce((s, r) => s + (r.a?.points || 0), 0);
  const totalPtsB = comparison.rows.reduce((s, r) => s + (r.b?.points || 0), 0);
  const sum = totalPtsA + totalPtsB || 1;

  return {
    shared,
    soloA,
    soloB,
    totalPtsA,
    totalPtsB,
    pctA: Math.round((totalPtsA / sum) * 100),
    pctB: Math.round((totalPtsB / sum) * 100),
  };
}
