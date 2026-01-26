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

// Mock champion mastery data
const mockMasteryData = [
  {
    championId: 103, // Ahri
    championLevel: 7,
    championPoints: 234567,
    lastPlayTime: Date.now() - 86400000, // 1 day ago
    championPointsSinceLastLevel: 12345,
    championPointsUntilNextLevel: 0,
    chestGranted: true,
    tokensEarned: 0
  },
  {
    championId: 84, // Akali
    championLevel: 6,
    championPoints: 156789,
    lastPlayTime: Date.now() - 172800000, // 2 days ago
    championPointsSinceLastLevel: 8901,
    championPointsUntilNextLevel: 3456,
    chestGranted: false,
    tokensEarned: 2
  },
  {
    championId: 1, // Annie
    championLevel: 5,
    championPoints: 89012,
    lastPlayTime: Date.now() - 259200000, // 3 days ago
    championPointsSinceLastLevel: 5678,
    championPointsUntilNextLevel: 7890,
    chestGranted: true,
    tokensEarned: 0
  }
];

/**
 * Mock function to simulate fetchSummonerByName
 */
export async function mockFetchSummonerByName(summonerName, region = 'na1') {
  console.log(`🎭 Mock API: Fetching summoner ${summonerName} in ${region}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate different responses based on summoner name
  if (summonerName.toLowerCase() === 'notfound') {
    throw new Error('Summoner not found');
  }
  
  return {
    ...mockSummonerData,
    name: summonerName
  };
}

/**
 * Mock function to simulate fetchChampionMastery
 */
export async function mockFetchChampionMastery(summonerId, region = 'na1') {
  console.log(`🎭 Mock API: Fetching champion mastery for ${summonerId} in ${region}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockMasteryData;
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