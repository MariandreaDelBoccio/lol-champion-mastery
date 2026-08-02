const SNAPSHOTS_KEY = 'lol-mastery-snapshots-v1';
const MIN_INTERVAL_MS = 6 * 60 * 60 * 1000; // avoid spam; keep at most one every 6h unless forced

function readAll() {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(data));
}

/**
 * Compact mastery snapshot for a player.
 */
export function buildSnapshotPayload(roster, identity) {
  const byChampion = {};
  roster.forEach(({ mastery }) => {
    byChampion[mastery.championId] = {
      level: mastery.championLevel,
      points: mastery.championPoints,
      tokens: mastery.tokensEarned || 0,
      chest: !!mastery.chestGranted,
    };
  });

  return {
    at: new Date().toISOString(),
    totals: {
      champions: identity.championsTracked,
      m5Plus: identity.m5Plus,
      m7: identity.m7,
      totalPoints: roster.reduce((s, r) => s + (r.mastery.championPoints || 0), 0),
    },
    byChampion,
  };
}

export function getSnapshots(puuid) {
  if (!puuid) return [];
  return readAll()[puuid] || [];
}

export function getLatestSnapshot(puuid) {
  const list = getSnapshots(puuid);
  return list[0] || null;
}

/**
 * Save snapshot if enough time passed (or force).
 * Keeps last 30 snapshots per puuid.
 */
export function maybeSaveSnapshot(puuid, roster, identity, { force = false } = {}) {
  if (!puuid || !roster?.length) return null;
  const all = readAll();
  const list = all[puuid] || [];
  const latest = list[0];
  if (
    !force &&
    latest &&
    Date.now() - new Date(latest.at).getTime() < MIN_INTERVAL_MS
  ) {
    return latest;
  }

  const snap = buildSnapshotPayload(roster, identity);
  all[puuid] = [snap, ...list].slice(0, 30);
  writeAll(all);
  return snap;
}

/**
 * Diff current roster vs a previous snapshot.
 */
export function diffAgainstSnapshot(roster, snapshot) {
  if (!snapshot) {
    return {
      hasBaseline: false,
      pointsGained: 0,
      levelUps: [],
      newChampions: 0,
      totalsDelta: null,
    };
  }

  const prev = snapshot.byChampion || {};
  let pointsGained = 0;
  const levelUps = [];
  let newChampions = 0;

  roster.forEach(({ champion, mastery }) => {
    const before = prev[mastery.championId];
    if (!before) {
      newChampions += 1;
      pointsGained += mastery.championPoints || 0;
      return;
    }
    const deltaPts = (mastery.championPoints || 0) - (before.points || 0);
    if (deltaPts > 0) pointsGained += deltaPts;
    if ((mastery.championLevel || 0) > (before.level || 0)) {
      levelUps.push({
        name: champion.name,
        from: before.level,
        to: mastery.championLevel,
        key: champion.key,
      });
    }
  });

  const currentTotal = roster.reduce((s, r) => s + (r.mastery.championPoints || 0), 0);
  const prevTotal = snapshot.totals?.totalPoints || 0;

  return {
    hasBaseline: true,
    baselineAt: snapshot.at,
    pointsGained,
    levelUps,
    newChampions,
    totalsDelta: {
      points: currentTotal - prevTotal,
      m5Plus: (roster.filter((r) => r.mastery.championLevel >= 5).length) - (snapshot.totals?.m5Plus || 0),
      m7: (roster.filter((r) => r.mastery.championLevel >= 7).length) - (snapshot.totals?.m7 || 0),
    },
  };
}
