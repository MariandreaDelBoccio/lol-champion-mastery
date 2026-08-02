const GOALS_KEY = 'lol-mastery-goals';

/**
 * Goals shape:
 * { [puuid]: Array<
 *   | { id, type:'mastery', championId, championKey, championName, targetLevel, createdAt }
 *   | { id, type:'chests', targetCount, weekKey, createdAt }
 * > }
 */

function readAll() {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(data));
}

/** ISO week key YYYY-Www for weekly chest goals */
export function currentWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getGoalsForPlayer(puuid) {
  if (!puuid) return [];
  const all = readAll();
  return all[puuid] || [];
}

export function addGoal(puuid, goal) {
  const all = readAll();
  const list = all[puuid] || [];
  const entry = {
    id: `${Date.now()}-${goal.type || 'mastery'}-${goal.championId || goal.weekKey || 'x'}`,
    createdAt: new Date().toISOString(),
    type: goal.type || 'mastery',
    ...goal,
  };
  all[puuid] = [entry, ...list].slice(0, 12);
  writeAll(all);
  return entry;
}

export function removeGoal(puuid, goalId) {
  const all = readAll();
  all[puuid] = (all[puuid] || []).filter((g) => g.id !== goalId);
  writeAll(all);
}

export function clearGoals(puuid) {
  const all = readAll();
  delete all[puuid];
  writeAll(all);
}
