/**
 * Compare two mastery rosters for ownership / points.
 * Win = more mastery points on that champion (level as tiebreaker).
 * Exclusive champs (only on one pool) count as a win for that player.
 */
export function compareRosters(rosterA, rosterB, labelA, labelB) {
  const toId = (value) => Number(value);

  const mapA = new Map(
    rosterA
      .map((r) => [toId(r.mastery.championId), r])
      .filter(([id]) => Number.isFinite(id))
  );
  const mapB = new Map(
    rosterB
      .map((r) => [toId(r.mastery.championId), r])
      .filter(([id]) => Number.isFinite(id))
  );
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);

  const rows = [];

  ids.forEach((id) => {
    const a = mapA.get(id);
    const b = mapB.get(id);
    const ptsA = Number(a?.mastery?.championPoints) || 0;
    const ptsB = Number(b?.mastery?.championPoints) || 0;
    const lvlA = Number(a?.mastery?.championLevel) || 0;
    const lvlB = Number(b?.mastery?.championLevel) || 0;
    const champion = a?.champion || b?.champion;
    if (!champion) return;
    if (!a && !b) return;
    if (ptsA === 0 && ptsB === 0 && lvlA === 0 && lvlB === 0) return;

    let winner = 'tie';
    if (ptsA !== ptsB) {
      winner = ptsA > ptsB ? 'a' : 'b';
    } else if (lvlA !== lvlB) {
      winner = lvlA > lvlB ? 'a' : 'b';
    }

    rows.push({
      championId: id,
      champion,
      exclusive: !a || !b,
      a: a
        ? {
            level: lvlA,
            points: ptsA,
            tokens: a.mastery.tokensEarned || 0,
          }
        : null,
      b: b
        ? {
            level: lvlB,
            points: ptsB,
            tokens: b.mastery.tokensEarned || 0,
          }
        : null,
      winner,
      gap: Math.abs(ptsA - ptsB),
    });
  });

  rows.sort((x, y) => y.gap - x.gap || Number(y.exclusive) - Number(x.exclusive));

  const winsA = rows.filter((r) => r.winner === 'a').length;
  const winsB = rows.filter((r) => r.winner === 'b').length;
  const ties = rows.filter((r) => r.winner === 'tie').length;
  const exclusiveA = rows.filter((r) => r.exclusive && r.winner === 'a').length;
  const exclusiveB = rows.filter((r) => r.exclusive && r.winner === 'b').length;

  return {
    labelA,
    labelB,
    winsA,
    winsB,
    ties,
    exclusiveA,
    exclusiveB,
    sharedCompared: rows.filter((r) => !r.exclusive).length,
    rows,
  };
}
