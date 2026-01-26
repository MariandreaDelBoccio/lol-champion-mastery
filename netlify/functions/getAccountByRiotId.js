/**
 * Netlify Function: getAccountByRiotId
 * 
 * This function gets account information (including PUUID) using the new Riot ID format
 * (Game Name + Tag Line) instead of the old summoner name system.
 * 
 * Endpoint: /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
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

/**
 * Get the correct regional endpoint for account API
 * The account API uses different regional endpoints than game-specific APIs
 */
function getAccountRegion(tagLine) {
  const regionMap = {
    'EUW': 'europe',
    'EUNE': 'europe', 
    'TR1': 'europe',
    'RU': 'europe',
    'NA1': 'americas',
    'BR1': 'americas',
    'LA1': 'americas',
    'LA2': 'americas',
    'KR1': 'asia',
    'JP1': 'asia',
    'OC1': 'asia'
  };
  
  return regionMap[tagLine] || 'americas';
}

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
    const { gameName, tagLine } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!gameName || typeof gameName !== 'string') {
      return createResponse(400, {
        error: 'gameName is required and must be a string'
      });
    }

    if (!tagLine || typeof tagLine !== 'string') {
      return createResponse(400, {
        error: 'tagLine is required and must be a string'
      });
    }

    if (gameName.trim().length === 0) {
      return createResponse(400, {
        error: 'gameName cannot be empty'
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

    // Get the correct regional endpoint
    const region = getAccountRegion(tagLine);
    
    // Build the API URL
    const encodedGameName = encodeURIComponent(gameName.trim());
    const encodedTagLine = encodeURIComponent(tagLine.trim());
    const riotApiUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;

    console.log(`Fetching account: ${gameName}#${tagLine} from region: ${region}`);

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
      let errorMessage = 'Failed to fetch account data';
      
      switch (response.status) {
        case 404:
          errorMessage = `Player "${gameName}#${tagLine}" not found`;
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
    const accountData = await response.json();
    
    console.log(`Successfully fetched account data for: ${gameName}#${tagLine}`);
    
    return createResponse(200, accountData);

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