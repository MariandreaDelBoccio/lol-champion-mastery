/**
 * Netlify Function: getChampionMasteryByPuuid
 * 
 * This function gets champion mastery data using PUUID instead of summoner ID.
 * This is the new preferred method for accessing mastery data.
 * 
 * Endpoint: /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}
 */

/**
 * Helper function to create standardized responses
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

const { resolveRouting } = require('./_regions.cjs');

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight' });
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return createResponse(405, { 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Parse request body
    const { puuid, tagLine, platform } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!puuid || typeof puuid !== 'string') {
      return createResponse(400, {
        error: 'puuid is required and must be a string'
      });
    }

    if (!tagLine && !platform) {
      return createResponse(400, {
        error: 'platform or tagLine is required for region routing'
      });
    }

    if (puuid.trim().length === 0) {
      return createResponse(400, {
        error: 'puuid cannot be empty'
      });
    }

    // Get API key from environment
    const apiKey = process.env.RIOT_API_KEY;
    
    if (!apiKey) {
      console.error('RIOT_API_KEY environment variable not set');
      return createResponse(500, {
        error: 'Server configuration error. API key not found.'
      });
    }

    // Platform host for mastery API (euw1, na1, …)
    const routing = resolveRouting(platform, tagLine);
    const region = routing.platformHost;
    
    // Build the API URL
    const encodedPuuid = encodeURIComponent(puuid.trim());
    const riotApiUrl = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodedPuuid}`;

    console.log(`Fetching champion mastery for PUUID: ${puuid.substring(0, 10)}... platform=${routing.platform} host=${region}`);

    // Make the request to Riot Games API
    const response = await fetch(riotApiUrl, {
      headers: {
        'X-Riot-Token': apiKey,
        'User-Agent': 'LoL-Champion-Mastery-App/1.0',
        'Connection': 'keep-alive'
      }
    });

    // Handle different response status codes
    if (!response.ok) {
      let errorMessage = 'Failed to fetch champion mastery data';
      
      switch (response.status) {
        case 404:
          errorMessage = 'No champion mastery data found for this player';
          break;
        case 401:
        case 403:
          errorMessage = 'Invalid API key or unauthorized access';
          console.error('API key issue - check RIOT_API_KEY environment variable');
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again later.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Riot API is currently unavailable';
          break;
      }
      
      return createResponse(response.status, { error: errorMessage });
    }

    // Parse and return the successful response
    const masteryData = await response.json();
    
    console.log(`Successfully fetched champion mastery data. Found ${masteryData.length} champions.`);
    
    return createResponse(200, masteryData);

  } catch (error) {
    console.error('Function error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return createResponse(400, {
        error: 'Invalid JSON in request body'
      });
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return createResponse(503, {
        error: 'Unable to connect to Riot API. Please try again later.'
      });
    }
    
    // Generic error handler
    return createResponse(500, {
      error: 'Internal server error'
    });
  }
};