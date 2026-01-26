# League of Legends Champion Mastery App

A beginner-friendly React application for tracking League of Legends champion mastery. This educational project demonstrates proper frontend-backend separation using **Netlify Functions** as a **100% free** backend proxy to the Riot Games API.

## Architecture

```
React Frontend → Netlify Functions → Riot Games API
```

**Why this architecture?**
- **100% Free**: Netlify Functions provide 125,000 calls/month for free
- **Security**: API keys are stored securely on the server, not exposed in frontend code
- **CORS**: No cross-origin issues since we control the backend
- **Serverless**: Functions scale automatically with zero server management
- **Easy deployment**: Deploy with a single command to Netlify

## Features

- **Simple Authentication**: Fake login system for educational purposes
- **Summoner Search**: Search for any League of Legends summoner by name and region
- **Champion Mastery Display**: View champion mastery data with beautiful cards
- **Champion Details**: Detailed champion information with lore and stats
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: League of Legends inspired dark theme
- **Serverless Backend**: Secure API calls through Netlify Functions

## Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Context API** for state management
- **Fetch API** for HTTP requests
- **CSS Modules** for styling

### Backend
- **Netlify Functions** (serverless functions on AWS Lambda)
- **Node.js** runtime for functions
- **Riot Games API** for live data
- **Data Dragon** for static champion data

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Netlify account (free)
- Riot Games API key (free from [developer.riotgames.com](https://developer.riotgames.com/))

### Quick Setup

1. **Clone the project**
   ```bash
   cd lol-champion-mastery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your Riot API key:
   ```env
   RIOT_API_KEY=your_riot_api_key_here
   ```

4. **Start development server**
   
   **Option A: Quick Development (Recommended)**
   ```bash
   npm run dev
   ```
   - Fast development with mock data
   - Perfect for UI work and React development
   - No API key required
   
   **Option B: Full Development (API Testing)**
   ```bash
   npm run dev:netlify
   ```
   - Full Netlify Functions support
   - Real API calls to Riot Games
   - Requires valid API key
   - Takes longer to start (2-3 minutes first time)

5. **Deploy to Netlify** (see [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) for detailed instructions)
   - Push to GitHub
   - Connect repository to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy automatically

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API integration layer
│   ├── apiClient.js    # Netlify Functions client
│   └── datadragon.js   # Static data from Data Dragon
├── context/            # React Context
└── App.jsx             # Main app component

netlify/
└── functions/          # Serverless backend functions
    ├── getSummoner.js
    ├── getChampionMastery.js
    └── getChampionMasteryById.js

netlify.toml            # Netlify configuration
```

## Learning Objectives

This project demonstrates:

- **Frontend-Backend Separation**: Why and how to separate concerns
- **Serverless Architecture**: Using Netlify Functions (AWS Lambda)
- **API Proxy Pattern**: Secure way to handle third-party APIs
- **100% Free Deployment**: Using Netlify's generous free tier
- **useState**: Managing component state
- **useEffect**: Side effects and data fetching
- **useContext**: Global state management
- **Props**: Passing data between components
- **Conditional Rendering**: Showing different UI based on state
- **List Rendering**: Displaying arrays of data
- **Event Handling**: User interactions
- **API Integration**: Fetching and displaying external data through a backend
- **Routing**: Navigation between pages
- **Error Handling**: Graceful error states
- **Loading States**: User feedback during async operations

## Key Architecture Concepts

### 1. Why Not Direct API Calls?

**❌ Direct API calls from frontend (BAD):**
```javascript
// This doesn't work due to CORS and security issues
fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Faker', {
  headers: { 'X-Riot-Token': 'EXPOSED_API_KEY' } // Security risk!
});
```

**✅ Backend proxy pattern (GOOD):**
```javascript
// This works and is secure
const response = await fetch('/.netlify/functions/getSummoner', {
  method: 'POST',
  body: JSON.stringify({ summonerName: 'Faker', region: 'na1' })
});
```

### 2. Netlify Functions as Backend

**What are Netlify Functions?**
- Serverless functions that run on AWS Lambda
- No server management required
- Automatic scaling based on demand
- **Completely free** for 125,000 calls/month

**How they work:**
1. You write a function and deploy it to Netlify
2. Netlify gives you a URL: `/.netlify/functions/functionName`
3. Your React app calls this URL instead of the Riot API directly
4. The function makes the actual API call and returns the data

### 3. Environment Variables and Security

**Frontend (.env):**
```env
# Only for local development
RIOT_API_KEY=your_key_here
VITE_DDRAGON_VERSION=14.1.1
```

**Production (Netlify Dashboard):**
- API keys stored securely in Netlify environment variables
- Not accessible from frontend code
- Only available to serverless functions

## API Integration Layer

### Old Approach (Direct API calls - REMOVED)
```javascript
// This doesn't work due to CORS
export async function fetchSummonerByName(name, region) {
  const response = await fetch(`https://${region}.api.riotgames.com/...`);
  return response.json();
}
```

### New Approach (Netlify Functions proxy)
```javascript
// src/services/apiClient.js
export async function fetchSummonerByName(name, region) {
  const response = await fetch('/.netlify/functions/getSummoner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summonerName: name, region })
  });
  return response.json();
}
```

## Cost Breakdown (100% Free)

### Netlify Free Tier
- **Functions**: 125,000 invocations/month
- **Bandwidth**: 100 GB/month
- **Build minutes**: 300 minutes/month
- **Sites**: Unlimited

### Typical Usage for Learning Project
- **API calls**: ~100-1000 per day
- **Function duration**: ~200ms per call
- **Monthly cost**: **$0** (well within free limits)

### Comparison with Alternatives
| Platform | Free Functions/Month | After Free Tier |
|----------|---------------------|------------------|
| **Netlify** | **125,000** | **$25/month** |
| Vercel | 100,000 | Pay per use |
| Firebase | 2,000,000 | Pay per use (requires billing) |

## Common Issues and Solutions

### Netlify Setup Issues
- **"Function not found"**: Check function files are in `netlify/functions/`
- **"API key not found"**: Set `RIOT_API_KEY` in Netlify dashboard environment variables
- **CORS errors**: Functions include proper CORS headers (already configured)

### Development vs Production
- **Development**: Functions run locally with `netlify dev`
- **Production**: Functions run on AWS Lambda via Netlify
- **Environment**: Use `.env` for local, Netlify dashboard for production

## Next Steps for Learning

After understanding this project, you could:

1. **Add caching** to functions to reduce API calls and improve performance
2. **Implement rate limiting** in Netlify Functions
3. **Add function authentication** for user-specific features
4. **Set up custom domain** (free with Netlify)
5. **Add CI/CD** with GitHub integration (automatic with Netlify)
6. **Implement error monitoring** with function logs
7. **Add unit tests** for both frontend and backend
8. **Scale to production** with Netlify's paid plans

## Resources

- [React Documentation](https://react.dev/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify CLI Documentation](https://cli.netlify.com/)
- [Riot Developer Portal](https://developer.riotgames.com/)
- [Serverless Architecture Patterns](https://martinfowler.com/articles/serverless.html)

## License

This project is for educational purposes only. League of Legends is a trademark of Riot Games, Inc.