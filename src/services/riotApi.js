/**
 * Riot API Service
 * This file contains all functions for interacting with the Riot Games API
 * All API logic is isolated here to keep components clean
 */

const API_KEY = import.meta.env.VITE_RIOT_API_KEY;
const BASE_URL = 'https://americas.api.riotgames.com';

// Region mapping for different API endpoints
const REGION_MAPPING = {
  'na1': 'americas',
  'euw1': 'europe',
  'eun1': 'europe',
  'kr': 'asia',
  'jp1': 'asia',
  'br1': 'americas',
  'la1': 'americas',
  'la2': 'americas',
  'oc1': 'sea',
  'tr1': 'europe',
  'ru': 'europe'
};

/**
 * Generic function to make API requests with error handling
 * @param {string} url - The API endpoint URL
 * @returns {Promise} - Promise that resolves to the API response data
 */
async function makeApiRequest(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Summoner not found');
      } else if (response.status === 403) {
        throw new Error('Invalid API key or rate limit exceeded');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API request failed: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Fetch summoner data by name and region
 * @param {string} summonerName - The summoner's name
 * @param {string} region - The region (e.g., 'na1', 'euw1')
 * @returns {Promise} - Promise that resolves to summoner data
 */
export async function fetchSummonerByName(summonerName, region = 'na1') {
  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
  return makeApiRequest(url);
}

/**
 * Fetch champion mastery data for a summoner
 * @param {string} summonerId - The summoner's encrypted ID
 * @param {string} region - The region
 * @returns {Promise} - Promise that resolves to champion mastery array
 */
export async function fetchChampionMastery(summonerId, region = 'na1') {
  const platformRegion = REGION_MAPPING[region] || 'americas';
  const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
  return makeApiRequest(url);
}

/**
 * Fetch specific champion mastery for a summoner and champion
 * @param {string} summonerId - The summoner's encrypted ID
 * @param {number} championId - The champion ID
 * @param {string} region - The region
 * @returns {Promise} - Promise that resolves to champion mastery data
 */
export async function fetchChampionMasteryById(summonerId, championId, region = 'na1') {
  const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}/by-champion/${championId}`;
  return makeApiRequest(url);
}