import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ChampionList from '../components/ChampionList';
import { fetchChampionMasteryByPuuid } from '../services/apiClient';
import { fetchChampionData } from '../services/datadragon';
import './ProfilePage.css';

/**
 * ProfilePage component displays player info and champion mastery
 * Now uses the new PUUID-based system instead of summoner names
 */
function ProfilePage() {
  const { summonerName } = useParams(); // This is actually the gameName now
  const [searchParams] = useSearchParams();
  const tagLine = searchParams.get('tagLine') || 'EUW';
  const puuid = searchParams.get('puuid');

  // State for player data
  const [playerData, setPlayerData] = useState(null);
  const [masteryData, setMasteryData] = useState(null);
  const [championData, setChampionData] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch all required data when component mounts or params change
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Check if we have the required parameters
        if (!summonerName) {
          throw new Error('Missing player name. Please search again.');
        }

        if (!puuid) {
          throw new Error('Missing player information. Please search again.');
        }

        console.log(`🔍 Loading profile for ${summonerName}#${tagLine} with PUUID: ${puuid.substring(0, 10)}...`);

        // Set basic player data from URL params
        setPlayerData({
          gameName: summonerName,
          tagLine: tagLine,
          puuid: puuid
        });

        // Fetch champion mastery data and static champion data in parallel
        const [mastery, champions] = await Promise.all([
          fetchChampionMasteryByPuuid(puuid, tagLine),
          fetchChampionData()
        ]);

        setMasteryData(mastery);
        setChampionData(champions);
        
        console.log(`✅ Successfully loaded profile for ${summonerName}#${tagLine}`);
      } catch (err) {
        console.error('❌ Error loading profile:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (summonerName && tagLine) {
      fetchData();
    } else {
      setLoading(false);
      setError('Invalid profile URL. Please search again.');
    }
  }, [summonerName, tagLine, puuid]);

  /**
   * Retry loading data
   */
  const handleRetry = () => {
    // Trigger useEffect by clearing and resetting player data
    setPlayerData(null);
    setMasteryData(null);
    setChampionData(null);
  };

  /**
   * Get champions that have mastery data, sorted by mastery points
   */
  const getChampionsWithMastery = () => {
    if (!championData || !masteryData) return [];

    return masteryData
      .map(mastery => {
        // Find the champion data for this mastery entry
        const champion = Object.values(championData).find(
          champ => parseInt(champ.key) === mastery.championId
        );
        return champion ? { champion, mastery } : null;
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b.mastery.championPoints - a.mastery.championPoints); // Sort by points descending
  };

  // Show loading state
  if (loading) {
    return <Loading message="Loading player profile..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="profile-page">
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
        />
        <div className="back-link">
          <Link to="/search">← Back to Search</Link>
        </div>
      </div>
    );
  }

  const championsWithMastery = getChampionsWithMastery();

  /**
   * Get mastery level color based on level
   */
  const getMasteryLevelColor = (level) => {
    if (level === 7) return 'mastery-7'; // Teal
    if (level >= 5) return 'mastery-5-6'; // Purple
    if (level === 4) return 'mastery-4'; // Gold
    return 'mastery-default'; // Default
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <Link to="/search" className="back-link">
            ← Back to Search
          </Link>
          
          {playerData && (
            <div className="summoner-card">
              <div className="summoner-icon">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png`}
                  alt="Player Icon"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=Icon';
                  }}
                />
              </div>
              <div className="summoner-details">
                <h1 className="summoner-name text-gradient-gold">{playerData.gameName}</h1>
                <div className="summoner-stats">
                  <span className="summoner-level">#{playerData.tagLine}</span>
                  <span className="summoner-region">{tagLine}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mastery-section">
          <div className="mastery-header">
            <h2>Champion Mastery</h2>
            {championsWithMastery.length > 0 && (
              <p className="mastery-count">
                {championsWithMastery.length} champions mastered
              </p>
            )}
          </div>
          
          {championsWithMastery.length > 0 ? (
            <div className="champions-grid">
              {championsWithMastery.map(({ champion, mastery }) => (
                <Link 
                  key={champion.key}
                  to={`/champion/${champion.key}?from=profile&player=${encodeURIComponent(playerData.gameName)}&tagLine=${tagLine}&puuid=${encodeURIComponent(playerData.puuid)}`}
                  className="champion-card"
                >
                  <div className="champion-image-container">
                    <img 
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champion.id}.png`}
                      alt={champion.name}
                      className="champion-image"
                    />
                    <div className={`mastery-badge ${getMasteryLevelColor(mastery.championLevel)}`}>
                      {mastery.championLevel}
                    </div>
                  </div>
                  <div className="champion-info">
                    <h3 className="champion-name">{champion.name}</h3>
                    <p className="champion-title">{champion.title}</p>
                    <div className="mastery-points">
                      {mastery.championPoints.toLocaleString()} pts
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-mastery-card">
              <div className="no-mastery-icon">⚔️</div>
              <h3>No Champion Mastery</h3>
              <p>This summoner hasn't earned mastery on any champions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;