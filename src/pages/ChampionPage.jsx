import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getChampionById, getChampionSplashUrl, getMasteryBadgeUrl } from '../services/datadragon';
import './ChampionPage.css';

/**
 * ChampionPage component displays detailed information about a specific champion
 * Shows champion details, abilities, and lore
 */
function ChampionPage() {
  const { championId } = useParams();
  const [championData, setChampionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch champion data when component mounts
   */
  useEffect(() => {
    const fetchChampionDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const champion = await getChampionById(championId);
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
          <Link to="/">← Back to Search</Link>
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
          <Link to="/" className="back-link">← Back to Search</Link>
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
            <Link to="/" className="back-link">
              ← Back to Search
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

        {/* Additional info */}
        <div className="champion-additional">
          <div className="champion-tips">
            <h3>Playing as {championData.name}</h3>
            {championData.allytips && championData.allytips.length > 0 ? (
              <ul>
                {championData.allytips.slice(0, 3).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p>No tips available for this champion.</p>
            )}
          </div>

          <div className="champion-tips">
            <h3>Playing against {championData.name}</h3>
            {championData.enemytips && championData.enemytips.length > 0 ? (
              <ul>
                {championData.enemytips.slice(0, 3).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p>No tips available for playing against this champion.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChampionPage;