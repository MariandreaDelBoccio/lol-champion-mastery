/**
 * Platform (game server) vs Riot ID tag line.
 * Tag is free text (#EUW, #0001…). Platform chooses Riot routing hosts.
 */

export const PLATFORMS = [
  { id: 'euw1', label: 'EUW', fullName: 'Europe West', accountCluster: 'europe' },
  { id: 'eun1', label: 'EUNE', fullName: 'Europe Nordic & East', accountCluster: 'europe' },
  { id: 'na1', label: 'NA', fullName: 'North America', accountCluster: 'americas' },
  { id: 'br1', label: 'BR', fullName: 'Brazil', accountCluster: 'americas' },
  { id: 'la1', label: 'LAN', fullName: 'Latin America North', accountCluster: 'americas' },
  { id: 'la2', label: 'LAS', fullName: 'Latin America South', accountCluster: 'americas' },
  { id: 'kr', label: 'KR', fullName: 'Korea', accountCluster: 'asia' },
  { id: 'jp1', label: 'JP', fullName: 'Japan', accountCluster: 'asia' },
  { id: 'oc1', label: 'OCE', fullName: 'Oceania', accountCluster: 'sea' },
  { id: 'tr1', label: 'TR', fullName: 'Turkey', accountCluster: 'europe' },
  { id: 'ru', label: 'RU', fullName: 'Russia', accountCluster: 'europe' },
  { id: 'ph2', label: 'PH', fullName: 'Philippines', accountCluster: 'sea' },
  { id: 'sg2', label: 'SG', fullName: 'Singapore', accountCluster: 'sea' },
  { id: 'th2', label: 'TH', fullName: 'Thailand', accountCluster: 'sea' },
  { id: 'tw2', label: 'TW', fullName: 'Taiwan', accountCluster: 'sea' },
  { id: 'vn2', label: 'VN', fullName: 'Vietnam', accountCluster: 'sea' },
];

const byId = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));

/** Legacy UI values → platform id */
const LEGACY_TAG_TO_PLATFORM = {
  EUW: 'euw1',
  EUNE: 'eun1',
  NA1: 'na1',
  NA: 'na1',
  BR1: 'br1',
  LA1: 'la1',
  LA2: 'la2',
  KR1: 'kr',
  KR: 'kr',
  JP1: 'jp1',
  OC1: 'oc1',
  OCE: 'oc1',
  TR1: 'tr1',
  RU: 'ru',
};

export function normalizePlatform(value) {
  if (!value) return 'euw1';
  const v = String(value).trim();
  if (byId[v]) return v;
  const upper = v.toUpperCase();
  if (LEGACY_TAG_TO_PLATFORM[upper]) return LEGACY_TAG_TO_PLATFORM[upper];
  const lower = v.toLowerCase();
  if (byId[lower]) return lower;
  return 'euw1';
}

export function getAccountCluster(platform) {
  const p = byId[normalizePlatform(platform)];
  return p?.accountCluster || 'europe';
}

export function getPlatformHost(platform) {
  return normalizePlatform(platform);
}

export function getPlatformMeta(platform) {
  return byId[normalizePlatform(platform)] || byId.euw1;
}

/**
 * Parse "Caps#EUW" or separate fields.
 * @returns {{ gameName: string, tagLine: string }}
 */
export function parseRiotId(input, fallbackTag = 'EUW') {
  const raw = (input || '').trim();
  if (!raw) return { gameName: '', tagLine: fallbackTag };

  const hash = raw.lastIndexOf('#');
  if (hash === -1) {
    return { gameName: raw, tagLine: fallbackTag };
  }

  const gameName = raw.slice(0, hash).trim();
  const tagLine = raw.slice(hash + 1).trim() || fallbackTag;
  return { gameName, tagLine };
}

/** Shared helper used by Netlify functions (duplicated logic kept in sync via comments). */
export function resolveRouting({ platform, tagLine }) {
  const plat = normalizePlatform(platform || tagLine);
  return {
    platform: plat,
    accountCluster: getAccountCluster(plat),
    platformHost: getPlatformHost(plat),
  };
}
