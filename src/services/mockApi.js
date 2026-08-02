/**
 * Mock API for development without Netlify Functions
 * 
 * This file provides mock data for development when Netlify Functions
 * are not available. Useful for frontend development and testing.
 */

// Mock summoner data
const mockSummonerData = {
  id: "mock-summoner-id-12345",
  accountId: "mock-account-id-67890",
  puuid: "mock-puuid-abcdef",
  name: "MockSummoner",
  profileIconId: 4568,
  revisionDate: Date.now(),
  summonerLevel: 147
};

// Mock champion mastery data — varied activity for Pool Identity demo
const mockMasteryData = [
  {
    championId: 103, // Ahri
    championLevel: 7,
    championPoints: 534567,
    lastPlayTime: Date.now() - 2 * 86400000,
    championPointsSinceLastLevel: 12345,
    championPointsUntilNextLevel: 0,
    chestGranted: true,
    tokensEarned: 0,
  },
  {
    championId: 84, // Akali
    championLevel: 6,
    championPoints: 156789,
    lastPlayTime: Date.now() - 4 * 86400000,
    championPointsSinceLastLevel: 8901,
    championPointsUntilNextLevel: 3456,
    chestGranted: false,
    tokensEarned: 2,
  },
  {
    championId: 222, // Jinx
    championLevel: 5,
    championPoints: 112000,
    lastPlayTime: Date.now() - 45 * 86400000,
    championPointsSinceLastLevel: 4000,
    championPointsUntilNextLevel: 12000,
    chestGranted: false,
    tokensEarned: 1,
  },
  {
    championId: 1, // Annie
    championLevel: 4,
    championPoints: 89012,
    lastPlayTime: Date.now() - 120 * 86400000,
    championPointsSinceLastLevel: 5678,
    championPointsUntilNextLevel: 7890,
    chestGranted: true,
    tokensEarned: 0,
  },
  {
    championId: 64, // Lee Sin
    championLevel: 7,
    championPoints: 280000,
    lastPlayTime: Date.now() - 1 * 86400000,
    championPointsSinceLastLevel: 8000,
    championPointsUntilNextLevel: 0,
    chestGranted: false,
    tokensEarned: 0,
  },
];

/**
 * Mock account by Riot ID (matches Account-v1 shape)
 */
export async function mockFetchSummonerByName(summonerName, region = 'na1') {
  console.log(`🎭 Mock API: Fetching account ${summonerName}#${region}`);
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (summonerName.toLowerCase() === 'notfound') {
    throw new Error('Summoner not found');
  }

  return {
    puuid: `mock-puuid-${summonerName.toLowerCase().replace(/\s+/g, '-')}`,
    gameName: summonerName,
    tagLine: typeof region === 'string' ? region : 'EUW',
  };
}

/**
 * Mock function to simulate fetchChampionMastery — varies by identity so compare works
 */
export async function mockFetchChampionMastery(summonerId, region = 'na1') {
  console.log(`🎭 Mock API: Fetching champion mastery for ${summonerId} in ${region}`);
  await new Promise((resolve) => setTimeout(resolve, 300));

  const seed = String(summonerId || '').length + String(summonerId || '').charCodeAt(0);
  return mockMasteryData.map((entry, index) => ({
    ...entry,
    championPoints: entry.championPoints + (seed * 1000 + index * 777) * (seed % 2 === 0 ? 1 : -1),
    championLevel: Math.min(7, Math.max(1, entry.championLevel + ((seed + index) % 3) - 1)),
    tokensEarned: (entry.tokensEarned + seed + index) % 3,
  }));
}

/**
 * Mock function to simulate fetchChampionMasteryById
 */
export async function mockFetchChampionMasteryById(summonerId, championId, region = 'na1') {
  console.log(`🎭 Mock API: Fetching mastery for champion ${championId} and summoner ${summonerId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Find matching mastery data
  const mastery = mockMasteryData.find(m => m.championId === parseInt(championId));
  
  if (!mastery) {
    throw new Error('No mastery data found for this champion');
  }
  
  return mastery;
}