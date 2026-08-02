/**
 * API Client for Netlify Functions
 * 
 * This file handles all communication with our Netlify Functions backend.
 * It replaces direct Riot API calls with secure server-side proxy calls.
 * 
 * IMPORTANT ARCHITECTURAL CONCEPT:
 * 
 * Before (BAD - Direct API calls from frontend):
 * React App → Riot Games API (CORS issues, exposed API keys, security risks)
 * 
 * After (GOOD - Backend proxy pattern):
 * React App → Netlify Functions → Riot Games API
 * 
 * Benefits of this approach:
 * 1. Security: API keys are stored securely on Netlify servers
 * 2. CORS: No cross-origin issues since we control the backend
 * 3. Rate limiting: Backend can implement proper rate limiting
 * 4. Caching: Server can cache responses to improve performance
 * 5. Error handling: Centralized error handling on the backend
 * 6. Cost: Netlify Functions are completely FREE for reasonable usage
 * 
 * How Netlify Functions work:
 * - Functions are deployed to /.netlify/functions/[function-name]
 * - They run on AWS Lambda behind the scenes
 * - Completely serverless - no server management needed
 * - Automatic scaling based on demand
 * - Free tier: 125,000 function calls per month
 */

import { 
  mockFetchSummonerByName, 
  mockFetchChampionMastery, 
  mockFetchChampionMasteryById 
} from './mockApi.js';

/**
 * Get the base URL for Netlify Functions
 * In development: http://localhost:3000/.netlify/functions (when using netlify dev)
 * In production: https://your-site.netlify.app/.netlify/functions
 */
function getApiBaseUrl() {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // For local development with netlify dev
    // The functions are available at the same host as the dev server
    return '/.netlify/functions';
  } else {
    // Production - use the current domain
    return `${window.location.origin}/.netlify/functions`;
  }
}

/**
 * Check if we should use mock data (only when explicitly needed for testing)
 */
function shouldUseMockData() {
  // Only use mock data if explicitly set via environment variable
  return import.meta.env.VITE_USE_MOCK_DATA === 'true';
}

/**
 * Generic function to make requests to Netlify Functions
 * Handles common error scenarios and provides consistent error messages
 * 
 * @param {string} functionName - Name of the Netlify Function to call
 * @param {object} data - Data to send to the function
 * @returns {Promise<object>} - Promise that resolves to the function response
 */
async function callNetlifyFunction(functionName, data) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/${functionName}`;
  
  try {
    console.log(`🚀 Calling Netlify Function: ${functionName}`, data);
    console.log(`📍 URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log(`📡 Response status: ${response.status}`);

    // Parse the response
    const responseData = await response.json();

    // Handle non-200 status codes
    if (!response.ok) {
      console.error(`❌ Function error:`, responseData);
      // The function returned an error
      throw new Error(responseData.error || `Function call failed with status: ${response.status}`);
    }

    console.log(`✅ Successfully called ${functionName}`, responseData);
    return responseData;
    
  } catch (error) {
    console.error(`❌ Error calling ${functionName}:`, error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new Error('Invalid response from server. Please try again.');
    }
    
    // Re-throw the error with the original message
    throw error;
  }
}

/**
 * Fetch account data by Riot ID (Game Name + Tag Line)
 * 
 * This is the new way to get player information using the modern Riot ID system.
 * 
 * @param {string} gameName - The player's game name
 * @param {string} tagLine - The player's tag line (region)
 * @returns {Promise<Object>} - Promise that resolves to account data with PUUID
 */
export async function fetchAccountByRiotId(gameName, tagLine, platform) {
  // Use mock data if explicitly set
  if (shouldUseMockData()) {
    return mockFetchSummonerByName(gameName, tagLine); // Reuse mock for now
  }

  try {
    console.log(`🚀 Fetching account: ${gameName}#${tagLine} (${platform || 'auto'})`);
    
    // Call our new Netlify Function
    const accountData = await callNetlifyFunction('getAccountByRiotId', {
      gameName: gameName,
      tagLine: tagLine,
      platform: platform || undefined,
    });
    
    console.log('✅ Account data received successfully');
    return accountData;
    
  } catch (error) {
    console.error('❌ Error fetching account data:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('not found')) {
      throw new Error(`Player "${gameName}#${tagLine}" not found. Please check the spelling and tag line.`);
    } else if (error.message.includes('Rate limit exceeded')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.message.includes('API key')) {
      throw new Error('Service configuration error. Please try again later.');
    } else if (error.message.includes('Network error')) {
      throw new Error('Connection error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to fetch account data. Please try again.');
    }
  }
}

/**
 * Fetch champion mastery data using PUUID
 * 
 * This is the new way to get champion mastery data using PUUID instead of summoner ID.
 * 
 * @param {string} puuid - The player's PUUID
 * @param {string} tagLine - The player's tag line (for region mapping)
 * @returns {Promise<Array>} - Promise that resolves to champion mastery array
 */
export async function fetchChampionMasteryByPuuid(puuid, tagLine, platform) {
  // Use mock data if explicitly set
  if (shouldUseMockData()) {
    return mockFetchChampionMastery(puuid, tagLine); // Reuse mock for now
  }

  try {
    console.log(`🚀 Fetching champion mastery for PUUID: ${puuid.substring(0, 10)}...`);
    
    // Call our new Netlify Function
    const masteryData = await callNetlifyFunction('getChampionMasteryByPuuid', {
      puuid: puuid,
      tagLine: tagLine,
      platform: platform || undefined,
    });
    
    console.log('✅ Champion mastery data received successfully');
    return masteryData;
    
  } catch (error) {
    console.error('❌ Error fetching champion mastery:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('not found')) {
      throw new Error('No champion mastery data found for this player.');
    } else if (error.message.includes('Rate limit exceeded')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.message.includes('API key')) {
      throw new Error('Service configuration error. Please try again later.');
    } else if (error.message.includes('Network error')) {
      throw new Error('Connection error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to fetch champion mastery data. Please try again.');
    }
  }
}

/**
 * Fetch champion mastery data for a summoner
 * 
 * This function calls our Netlify Function to get all
 * champion mastery data for a specific summoner.
 * 
 * @param {string} summonerId - The summoner's encrypted ID
 * @param {string} region - The region
 * @returns {Promise<Array>} - Promise that resolves to champion mastery array
 */
export async function fetchChampionMastery(summonerId, region = 'na1') {
  // Use mock data if Netlify Functions are not available
  if (shouldUseMockData()) {
    return mockFetchChampionMastery(summonerId, region);
  }

  try {
    console.log(`Fetching champion mastery for summoner ID: ${summonerId}`);
    
    // Call our Netlify Function
    const masteryData = await callNetlifyFunction('getChampionMastery', {
      summonerId: summonerId,
      region: region
    });
    
    console.log('Champion mastery data received successfully');
    return masteryData;
    
  } catch (error) {
    console.error('Error fetching champion mastery:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('not found')) {
      throw new Error('No champion mastery data found for this summoner.');
    } else if (error.message.includes('Rate limit exceeded')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.message.includes('API key')) {
      throw new Error('Service configuration error. Please try again later.');
    } else if (error.message.includes('Network error')) {
      throw new Error('Connection error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to fetch champion mastery data. Please try again.');
    }
  }
}

/**
 * Fetch specific champion mastery for a summoner and champion
 * 
 * This function gets mastery data for a specific champion,
 * useful for detailed champion pages.
 * 
 * @param {string} summonerId - The summoner's encrypted ID
 * @param {number} championId - The champion ID
 * @param {string} region - The region
 * @returns {Promise<Object>} - Promise that resolves to champion mastery data
 */
export async function fetchChampionMasteryById(summonerId, championId, region = 'na1') {
  // Use mock data if Netlify Functions are not available
  if (shouldUseMockData()) {
    return mockFetchChampionMasteryById(summonerId, championId, region);
  }

  try {
    console.log(`Fetching mastery for champion ${championId} and summoner ${summonerId}`);
    
    // Call our Netlify Function
    const masteryData = await callNetlifyFunction('getChampionMasteryById', {
      summonerId: summonerId,
      championId: parseInt(championId), // Ensure it's a number
      region: region
    });
    
    console.log('Specific champion mastery data received successfully');
    return masteryData;
    
  } catch (error) {
    console.error('Error fetching specific champion mastery:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('No mastery data found')) {
      throw new Error('This summoner has not played this champion yet.');
    } else if (error.message.includes('Rate limit exceeded')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.message.includes('API key')) {
      throw new Error('Service configuration error. Please try again later.');
    } else if (error.message.includes('Network error')) {
      throw new Error('Connection error. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'Failed to fetch champion mastery data. Please try again.');
    }
  }
}

/**
 * Health check function to test if our Netlify Functions are working
 * This is useful for debugging and can be called from the frontend
 * to verify that the backend is accessible.
 * 
 * @returns {Promise<Object>} - Health status information
 */
export async function healthCheck() {
  try {
    const baseUrl = getApiBaseUrl();
    console.log(`Health check - API base URL: ${baseUrl}`);
    
    // For now, just return a success message
    // In a real app, you might create a dedicated health check function
    return {
      status: 'healthy',
      message: 'Netlify Functions API client is working',
      timestamp: new Date().toISOString(),
      baseUrl: baseUrl
    };
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Backend services are not available');
  }
}