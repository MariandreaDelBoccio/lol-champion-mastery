/**
 * Data Dragon Service — static LoL assets (champions, icons, splash).
 * Resolves patch version from Riot versions API unless VITE_DDRAGON_VERSION is set.
 */

const FORCED_VERSION = import.meta.env.VITE_DDRAGON_VERSION || '';

let resolvedVersion = FORCED_VERSION || null;
let versionPromise = null;
let championDataCache = null;
let championDetailsCache = new Map();

async function resolveDdragonVersion() {
  if (resolvedVersion) return resolvedVersion;
  if (versionPromise) return versionPromise;

  versionPromise = (async () => {
    try {
      const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      if (!response.ok) throw new Error(`versions ${response.status}`);
      const versions = await response.json();
      resolvedVersion = versions[0] || '14.1.1';
    } catch (error) {
      console.warn('Data Dragon versions failed, using fallback', error);
      resolvedVersion = '14.1.1';
    }
    return resolvedVersion;
  })();

  return versionPromise;
}

export async function getDdragonVersion() {
  return resolveDdragonVersion();
}

async function getBaseUrl() {
  const version = await resolveDdragonVersion();
  return `https://ddragon.leagueoflegends.com/cdn/${version}`;
}

/** Sync helper after version is known (images after first fetch). */
export function getDdragonBaseUrlSync() {
  const version = resolvedVersion || FORCED_VERSION || '14.1.1';
  return `https://ddragon.leagueoflegends.com/cdn/${version}`;
}

export async function fetchChampionData() {
  if (championDataCache) return championDataCache;

  try {
    const base = await getBaseUrl();
    const response = await fetch(`${base}/data/en_US/champion.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch champion data: ${response.status}`);
    }
    const data = await response.json();
    championDataCache = data.data;
    return championDataCache;
  } catch (error) {
    console.error('Error fetching champion data:', error);
    throw new Error('Failed to load champion information');
  }
}

export async function getChampionById(championId) {
  const championData = await fetchChampionData();
  const champion = Object.values(championData).find(
    (champ) => Number(champ.key) === Number(championId)
  );
  if (!champion) {
    throw new Error(`Champion with ID ${championId} not found`);
  }
  return champion;
}

export async function getChampionDetailsById(championId) {
  if (championDetailsCache.has(championId)) {
    return championDetailsCache.get(championId);
  }

  try {
    const basicChampion = await getChampionById(championId);
    const championName = basicChampion.id;
    const base = await getBaseUrl();
    const response = await fetch(`${base}/data/en_US/champion/${championName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch champion details: ${response.status}`);
    }
    const data = await response.json();
    const championDetails = data.data[championName];
    if (!championDetails) {
      throw new Error(`Champion details not found for ${championName}`);
    }
    championDetailsCache.set(championId, championDetails);
    return championDetails;
  } catch (error) {
    console.error(`Error fetching champion details for ID ${championId}:`, error);
    throw new Error('Failed to load detailed champion information');
  }
}

export function getChampionImageUrl(championName) {
  return `${getDdragonBaseUrlSync()}/img/champion/${championName}.png`;
}

export function getProfileIconUrl(iconId = 1) {
  return `${getDdragonBaseUrlSync()}/img/profileicon/${iconId}.png`;
}

export function getChampionSplashUrl(championName, skinNum = 0) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_${skinNum}.jpg`;
}

export function getMasteryBadgeUrl(masteryLevel) {
  if (masteryLevel < 1 || masteryLevel > 7) return null;
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-statistics/global/default/mastery-${masteryLevel}.png`;
}

export function formatMasteryPoints(points) {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toString();
}

/** Warm version + champion list (call early on app boot or search). */
export async function warmDdragon() {
  await resolveDdragonVersion();
  return fetchChampionData();
}
