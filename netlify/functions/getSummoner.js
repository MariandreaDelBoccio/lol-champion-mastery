/**
 * Netlify Function: getSummoner
 * 
 * This serverless function acts as a proxy between our React frontend
 * and the Riot Games API. It fetches summoner data by name and region.
 * 
 * Why we need this function:
 * 1. CORS: Riot API doesn't allow direct browser requests
 * 2. Security: API keys must be stored securely on the server
 * 3. Rate limiting: Better control over API usage
 * 
 * Architecture:
 * React Frontend → Netlify Function → Riot Games API
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
 * Main handler function for the getSummoner endpoint
 * This function is called when someone makes a request to /.netlify/functions/getSummoner
 * 
 * @param {object} event - Contains request information (body, headers, etc.)
 * @param {object} context - Contains function context information
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight' });
  }

  // Only allow POST requests for this function
  if (event.httpMethod !== 'POST') {
    return createResponse(405, { 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Parse the request body to get parameters
    const { summonerName, region = 'na1' } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!summonerName || typeof summonerName !== 'string') {
      return createResponse(400, {
        error: 'summonerName is required and must be a string'
      });
    }

    if (summonerName.trim().length === 0) {
      return createResponse(400, {
        error: 'summonerName cannot be empty'
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
    // Set this in Netlify dashboard: Site settings → Environment variables
    const apiKey = process.env.RIOT_API_KEY;
    
    if (!apiKey) {
      console.error('RIOT_API_KEY environment variable not set');
      return createResponse(500, {
        error: 'Server configuration error. API key not found.'
      });
    }

    // Build the Riot API URL
    const encodedSummonerName = encodeURIComponent(summonerName.trim());
    const riotApiUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedSummonerName}`;

    console.log(`Fetching summoner: ${summonerName} from region: ${region}`);

    // Make the request to Riot Games API
    const response = await fetch(riotApiUrl, {
      headers: {
        'X-Riot-Token': apiKey,
        'User-Agent': 'LoL-Champion-Mastery-App/1.0'
      }
    });

    // Handle different response status codes
    if (!response.ok) {
      let errorMessage = 'Failed to fetch summoner data';
      
      switch (response.status) {
        case 404:
          errorMessage = 'Summoner not found';
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
    const summonerData = await response.json();
    
    console.log(`Successfully fetched summoner data for: ${summonerName}`);
    
    return createResponse(200, summonerData);

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