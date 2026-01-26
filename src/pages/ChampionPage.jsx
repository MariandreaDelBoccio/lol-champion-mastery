import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getChampionDetailsById, getChampionSplashUrl, getMasteryBadgeUrl } from '../services/datadragon';
import './ChampionPage.css';

/**
 * ChampionPage component displays detailed information about a specific champion
 * Shows champion details, abilities, and lore
 */
function ChampionPage() {
  const { championId } = useParams();
  const [searchParams] = useSearchParams();
  const fromProfile = searchParams.get('from') === 'profile';
  const playerName = searchParams.get('player');
  const tagLine = searchParams.get('tagLine');
  const puuid = searchParams.get('puuid');
  
  const [championData, setChampionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Get the appropriate back link based on where user came from
   */
  const getBackLink = () => {
    if (fromProfile && playerName && tagLine && puuid) {
      return `/profile/${encodeURIComponent(playerName)}?tagLine=${tagLine}&puuid=${encodeURIComponent(puuid)}`;
    }
    return '/search';
  };

  const getBackText = () => {
    if (fromProfile && playerName) {
      return `← Back to ${playerName}#${tagLine}'s Profile`;
    }
    return '← Back to Search';
  };

  /**
   * Fetch champion data when component mounts
   */
  useEffect(() => {
    const fetchChampionDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const champion = await getChampionDetailsById(championId);
        setChampionData(champion);
      } catch (err) {
        setError(err.message || 'Failed to load champion data');
      } finally {
        setLoading(false);
      }
    };

    if (championId) {
      fetchChampionDetails();
    }
  }, [championId]);

  /**
   * Retry loading champion data
   */
  const handleRetry = () => {
    setChampionData(null);
  };

  // Show loading state
  if (loading) {
    return <Loading message="Loading champion details..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="champion-page">
        <ErrorMessage 
          message={error}
          onRetry={handleRetry}
        />
        <div className="back-link">
          <Link to={getBackLink()}>{getBackText()}</Link>
        </div>
      </div>
    );
  }

  if (!championData) {
    return (
      <div className="champion-page">
        <div className="champion-not-found">
          <h2>Champion not found</h2>
          <p>The requested champion could not be loaded.</p>
          <Link to={getBackLink()} className="back-link">{getBackText()}</Link>
        </div>
      </div>
    );
  }

  const splashUrl = getChampionSplashUrl(championData.id);

  return (
    <div className="champion-page">
      {/* Hero section with splash art */}
      <div className="champion-hero" style={{ backgroundImage: `url(${splashUrl})` }}>
        <div className="champion-hero-overlay">
          <div className="champion-hero-content">
            <Link to={getBackLink()} className="back-link">
              {getBackText()}
            </Link>
            <h1 className="champion-name">{championData.name}</h1>
            <p className="champion-title">{championData.title}</p>
            <div className="champion-tags">
              {championData.tags.map((tag, index) => (
                <span key={index} className="champion-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Champion details */}
      <div className="champion-content">
        <div className="champion-info-grid">
          {/* Lore section */}
          <div className="champion-lore">
            <h2>Lore</h2>
            <p>{championData.blurb}</p>
          </div>

          {/* Stats section */}
          <div className="champion-stats">
            <h2>Champion Info</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Attack:</span>
                <span className="stat-value">{championData.info.attack}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Defense:</span>
                <span className="stat-value">{championData.info.defense}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Magic:</span>
                <span className="stat-value">{championData.info.magic}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Difficulty:</span>
                <span className="stat-value">{championData.info.difficulty}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips and Strategy */}
        <div className="champion-tips-section">
          <div className="tips-container">
            <div className="champion-tips ally-tips">
              <div className="tips-header">
                <div className="tips-icon ally-icon">⚔️</div>
                <h3>Playing as {championData.name}</h3>
              </div>
              {championData.allytips && championData.allytips.length > 0 ? (
                <ul className="tips-list">
                  {championData.allytips.map((tip, index) => (
                    <li key={index} className="tip-item">
                      <span className="tip-bullet">•</span>
                      <span className="tip-text">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-tips">
                  <p>No specific tips available for playing as {championData.name}.</p>
                  <p className="tip-suggestion">Check champion guides and pro builds for strategies!</p>
                </div>
              )}
            </div>

            <div className="champion-tips enemy-tips">
              <div className="tips-header">
                <div className="tips-icon enemy-icon">🛡️</div>
                <h3>Playing against {championData.name}</h3>
              </div>
              {championData.enemytips && championData.enemytips.length > 0 ? (
                <ul className="tips-list">
                  {championData.enemytips.map((tip, index) => (
                    <li key={index} className="tip-item">
                      <span className="tip-bullet">•</span>
                      <span className="tip-text">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-tips">
                  <p>No specific tips available for playing against {championData.name}.</p>
                  <p className="tip-suggestion">Focus on their weaknesses and cooldown windows!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChampionPage;