import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ChampionList from '../components/ChampionList';
import { fetchSummonerByName, fetchChampionMastery } from '../services/apiClient';
import { fetchChampionData } from '../services/datadragon';
import './ProfilePage.css';

/**
 * ProfilePage component displays summoner info and champion mastery
 * Shows a list of champions with mastery data for the searched summoner
 */
function ProfilePage() {
  const { summonerName } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get('region') || 'na1';

  // State for summoner data
  const [summonerData, setSummonerData] = useState(null);
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
        // Fetch summoner data first
        const summoner = await fetchSummonerByName(summonerName, region);
        setSummonerData(summoner);

        // Fetch champion mastery data and static champion data in parallel
        const [mastery, champions] = await Promise.all([
          fetchChampionMastery(summoner.id, region),
          fetchChampionData()
        ]);

        setMasteryData(mastery);
        setChampionData(champions);
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (summonerName) {
      fetchData();
    }
  }, [summonerName, region]);

  /**
   * Retry loading data
   */
  const handleRetry = () => {
    // Trigger useEffect by clearing and resetting summoner data
    setSummonerData(null);
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
    return <Loading message="Loading summoner profile..." />;
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
          <Link to="/">← Back to Search</Link>
        </div>
      </div>
    );
  }

  const championsWithMastery = getChampionsWithMastery();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Link to="/" className="back-link">
          ← Back to Search
        </Link>
        
        {summonerData && (
          <div className="summoner-info">
            <div className="summoner-icon">
              <img 
                src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summonerData.profileIconId}.png`}
                alt="Summoner Icon"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64?text=Icon';
                }}
              />
            </div>
            <div className="summoner-details">
              <h1>{summonerData.name}</h1>
              <p>Level {summonerData.summonerLevel}</p>
              <p className="region-info">Region: {region.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mastery-section">
        <h2>Champion Mastery</h2>
        
        {championsWithMastery.length > 0 ? (
          <>
            <p className="mastery-count">
              Showing {championsWithMastery.length} champions with mastery data
            </p>
            <div className="champions-container">
              {championsWithMastery.map(({ champion, mastery }) => (
                <div key={champion.key} className="champion-mastery-item">
                  <Link 
                    to={`/champion/${champion.key}`}
                    className="champion-mastery-link"
                  >
                    <img 
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${champion.id}.png`}
                      alt={champion.name}
                      className="champion-icon"
                    />
                    <div className="champion-mastery-info">
                      <h3>{champion.name}</h3>
                      <p className="champion-title">{champion.title}</p>
                      <div className="mastery-stats">
                        <span className="mastery-level">Level {mastery.championLevel}</span>
                        <span className="mastery-points">{mastery.championPoints.toLocaleString()} points</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-mastery">
            <h3>No champion mastery data found</h3>
            <p>This summoner hasn't played any champions yet, or the data is not available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;