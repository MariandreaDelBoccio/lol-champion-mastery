/**
 * Data Dragon Service
 * This file handles fetching static League of Legends data from Riot's Data Dragon
 * Data Dragon provides champion info, images, and other static game data
 */

const DDRAGON_VERSION = import.meta.env.VITE_DDRAGON_VERSION || '14.1.1';
const DDRAGON_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

// In-memory cache to avoid refetching static data
let championDataCache = null;

/**
 * Fetch all champion data from Data Dragon
 * This includes champion names, titles, images, etc.
 * Results are cached in memory to avoid repeated requests
 * @returns {Promise} - Promise that resolves to champions data object
 */
export async function fetchChampionData() {
  // Return cached data if available
  if (championDataCache) {
    return championDataCache;
  }

  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/data/en_US/champion.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch champion data: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the data for future use
    championDataCache = data.data;
    
    return championDataCache;
  } catch (error) {
    console.error('Error fetching champion data:', error);
    throw new Error('Failed to load champion information');
  }
}

/**
 * Get champion info by champion ID
 * @param {number} championId - The champion's numeric ID
 * @returns {Promise} - Promise that resolves to champion info object
 */
export async function getChampionById(championId) {
  const championData = await fetchChampionData();
  
  // Find champion by matching the key (which corresponds to championId)
  const champion = Object.values(championData).find(
    champ => parseInt(champ.key) === parseInt(championId)
  );
  
  if (!champion) {
    throw new Error(`Champion with ID ${championId} not found`);
  }
  
  return champion;
}

/**
 * Get champion square image URL
 * @param {string} championName - The champion's name (e.g., 'Ahri')
 * @returns {string} - URL to the champion's square image
 */
export function getChampionImageUrl(championName) {
  return `${DDRAGON_BASE_URL}/img/champion/${championName}.png`;
}

/**
 * Get champion splash art URL
 * @param {string} championName - The champion's name
 * @param {number} skinNum - Skin number (0 for default)
 * @returns {string} - URL to the champion's splash art
 */
export function getChampionSplashUrl(championName, skinNum = 0) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_${skinNum}.jpg`;
}

/**
 * Get mastery level badge image URL
 * @param {number} masteryLevel - The mastery level (1-7)
 * @returns {string} - URL to the mastery badge image
 */
export function getMasteryBadgeUrl(masteryLevel) {
  if (masteryLevel < 1 || masteryLevel > 7) {
    return null;
  }
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-statistics/global/default/mastery-${masteryLevel}.png`;
}

/**
 * Format mastery points with appropriate suffixes (K, M)
 * @param {number} points - The mastery points
 * @returns {string} - Formatted points string
 */
export function formatMasteryPoints(points) {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
}