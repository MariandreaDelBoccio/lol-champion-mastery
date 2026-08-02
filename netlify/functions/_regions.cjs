/**
 * Shared platform routing for Netlify Functions (CommonJS).
 * Keep in sync with src/utils/regions.js
 */

const PLATFORMS = {
  euw1: { accountCluster: 'europe', host: 'euw1' },
  eun1: { accountCluster: 'europe', host: 'eun1' },
  na1: { accountCluster: 'americas', host: 'na1' },
  br1: { accountCluster: 'americas', host: 'br1' },
  la1: { accountCluster: 'americas', host: 'la1' },
  la2: { accountCluster: 'americas', host: 'la2' },
  kr: { accountCluster: 'asia', host: 'kr' },
  jp1: { accountCluster: 'asia', host: 'jp1' },
  oc1: { accountCluster: 'sea', host: 'oc1' },
  tr1: { accountCluster: 'europe', host: 'tr1' },
  ru: { accountCluster: 'europe', host: 'ru' },
  ph2: { accountCluster: 'sea', host: 'ph2' },
  sg2: { accountCluster: 'sea', host: 'sg2' },
  th2: { accountCluster: 'sea', host: 'th2' },
  tw2: { accountCluster: 'sea', host: 'tw2' },
  vn2: { accountCluster: 'sea', host: 'vn2' },
};

const LEGACY = {
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

function normalizePlatform(value) {
  if (!value) return 'euw1';
  const v = String(value).trim();
  if (PLATFORMS[v]) return v;
  const upper = v.toUpperCase();
  if (LEGACY[upper]) return LEGACY[upper];
  const lower = v.toLowerCase();
  if (PLATFORMS[lower]) return lower;
  return 'euw1';
}

function resolveRouting(platform, tagLine) {
  const plat = normalizePlatform(platform || tagLine);
  const meta = PLATFORMS[plat];
  return {
    platform: plat,
    accountCluster: meta.accountCluster,
    platformHost: meta.host,
  };
}

module.exports = { normalizePlatform, resolveRouting };
