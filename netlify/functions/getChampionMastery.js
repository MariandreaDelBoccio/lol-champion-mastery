/**
 * Netlify Function: getChampionMastery
 * 
 * This serverless function fetches champion mastery data for a specific summoner.
 * It acts as a secure proxy between our React frontend and the Riot Games API.
 * 
 * This function is called after we have a summoner's ID from getSummoner,
 * and we want to get all their champion mastery information.
 */

/**
 * Helper function to create standardized responses
 * @param {number} statusCode - HTTP status code
 * @param {object} body - Response body
 * @param {object} headers - Additional headers
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

/**
 * Main handler function for the getChampionMastery endpoint
 * 
 * @param {object} event - Contains request information
 * @param {object} context - Contains function context information
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
    // Parse request parameters
    const { summonerId, region = 'na1' } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!summonerId || typeof summonerId !== 'string') {
      return createResponse(400, {
        error: 'summonerId is required and must be a string'
      });
    }

    // Validate region
    const validRegions = ['na1', 'euw1', 'eun1', 'kr', 'jp1', 'br1', 'la1', 'la2', 'oc1', 'tr1', 'ru'];
    if (!validRegions.includes(region)) {
      return createResponse(400, {
        error: `Invalid region. Must be one of: ${validRegions.join(', ')}`
      });
    }

    // Get API key from environment variables
    const apiKey = process.env.RIOT_API_KEY;
    
    if (!apiKey) {
      console.error('RIOT_API_KEY environment variable not set');
      return createResponse(500, {
        error: 'Server configuration error. API key not found.'
      });
    }

    // Build the Riot API URL for champion mastery
    const riotApiUrl = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;

    console.log(`Fetching champion mastery for summoner ID: ${summonerId} in region: ${region}`);

    // Make the request to Riot Games API
    const response = await fetch(riotApiUrl, {
      headers: {
        'X-Riot-Token': apiKey,
        'User-Agent': 'LoL-Champion-Mastery-App/1.0'
      }
    });

    // Handle different response status codes
    if (!response.ok) {
      let errorMessage = 'Failed to fetch champion mastery data';
      
      switch (response.status) {
        case 404:
          errorMessage = 'Summoner not found or no mastery data available';
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
    
    console.log(`Successfully fetched mastery data for summoner: ${summonerId} (${masteryData.length} champions)`);
    
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