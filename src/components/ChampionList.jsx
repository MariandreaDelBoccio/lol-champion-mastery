import ChampionCard from './ChampionCard';
import './ChampionList.css';

/**
 * ChampionList component displays a grid of champion cards
 * Handles empty states and organizes champion mastery data
 */
function ChampionList({ champions, masteryData }) {
  // Show message if no champions to display
  if (!champions || champions.length === 0) {
    return (
      <div className="empty-state">
        <h3>No champions found</h3>
        <p>Try searching for a different summoner name.</p>
      </div>
    );
  }

  /**
   * Find mastery data for a specific champion
   * @param {number} championId - The champion's ID
   * @returns {object|null} - Mastery data or null if not found
   */
  const getMasteryForChampion = (championId) => {
    if (!masteryData) return null;
    return masteryData.find(mastery => mastery.championId === parseInt(championId));
  };

  return (
    <div className="champion-list">
      <div className="champion-grid">
        {champions.map((champion) => {
          const mastery = getMasteryForChampion(champion.key);
          
          return (
            <ChampionCard
              key={champion.key}
              champion={champion}
              masteryData={mastery}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ChampionList;