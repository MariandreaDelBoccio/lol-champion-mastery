import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchAccountByRiotId } from '../services/apiClient';
import './SearchPage.css';

/**
 * SearchPage component - Enhanced search interface
 * Uses the new Riot ID format (Game Name + Tag Line)
 */
function SearchPage() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('EUW');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Available tag lines (regions)
  const tagLines = [
    { value: 'EUW', label: 'EUW', fullName: 'Europe West' },
    { value: 'EUNE', label: 'EUNE', fullName: 'Europe Nordic & East' },
    { value: 'NA1', label: 'NA1', fullName: 'North America' },
    { value: 'BR1', label: 'BR1', fullName: 'Brazil' },
    { value: 'JP1', label: 'JP1', fullName: 'Japan' },
    { value: 'KR1', label: 'KR1', fullName: 'Korea' },
    { value: 'LA1', label: 'LA1', fullName: 'Latin America North' },
    { value: 'LA2', label: 'LA2', fullName: 'Latin America South' },
    { value: 'OC1', label: 'OC1', fullName: 'Oceania' },
    { value: 'TR1', label: 'TR1', fullName: 'Turkey' },
    { value: 'RU', label: 'RU', fullName: 'Russia' }
  ];

  // Popular players for quick testing
  const popularPlayers = [
    { gameName: 'Caps', tagLine: 'EUW', label: 'Caps#EUW' },
    { gameName: 'Doublelift', tagLine: 'NA1', label: 'Doublelift#NA1' }
  ];

  /**
   * Handle search form submission
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!gameName.trim()) {
      setError('Please enter a game name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accountData = await fetchAccountByRiotId(gameName.trim(), tagLine);
      navigate(`/profile/${encodeURIComponent(gameName.trim())}?tagLine=${tagLine}&puuid=${encodeURIComponent(accountData.puuid)}`);
    } catch (err) {
      setError(err.message || 'Failed to find player');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle popular player click
   */
  const handlePopularPlayer = (player) => {
    setGameName(player.gameName);
    setTagLine(player.tagLine);
    setError('');
  };

  return (
    <div className="search-page">
      <main className="search-main">
        {/* Header with Logo */}
        <div className="search-header">
          <div className="search-logo">
            <div className="logo-icon-container">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="logo-swords"
              >
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
                <line x1="13" x2="19" y1="19" y2="13"></line>
                <line x1="16" x2="20" y1="16" y2="20"></line>
                <line x1="19" x2="21" y1="21" y2="19"></line>
                <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline>
                <line x1="5" x2="9" y1="14" y2="18"></line>
                <line x1="7" x2="4" y1="17" y2="20"></line>
                <line x1="3" x2="5" y1="19" y2="21"></line>
              </svg>
              <div className="logo-glow"></div>
            </div>
          </div>
          <h1 className="search-title">
            Champion <span className="text-gradient-gold">Mastery</span> Tracker
          </h1>
          <p className="search-subtitle">
            Search for any summoner to view their champion mastery progress, stats, and achievements.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            {/* Tag Line Selector */}
            <div className="region-selector">
              <div className="region-button">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="globe-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                  <path d="M2 12h20"></path>
                </svg>
                <select
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value)}
                  className="region-select"
                  disabled={loading}
                >
                  {tagLines.map((tagLineOption) => (
                    <option key={tagLineOption.value} value={tagLineOption.value}>
                      {tagLineOption.label} - {tagLineOption.fullName}
                    </option>
                  ))}
                </select>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="chevron-icon"
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </div>
            </div>

            {/* Search Input */}
            <div className="search-input-container">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter Game Name (e.g., Caps)"
                className="search-input"
                disabled={loading}
              />
            </div>

            {/* Search Button */}
            <button 
              type="submit" 
              className="search-button"
              disabled={loading || !gameName.trim()}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <p className="search-hint">
            Enter your Game Name and select your Tag Line (e.g., <span className="highlight">Caps</span> with <span className="highlight">EUW</span>)
          </p>
        </form>

        {/* Loading State */}
        {loading && (
          <Loading message="Searching for player..." />
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage 
            message={error}
            onRetry={gameName.trim() ? () => handleSearch({ preventDefault: () => {} }) : null}
          />
        )}

        {/* Popular Searches */}
        {!loading && !error && (
          <div className="popular-searches">
            <h2 className="popular-title">Popular Searches</h2>
            <div className="popular-buttons">
              {popularPlayers.map((player, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularPlayer(player)}
                  className="popular-button"
                  type="button"
                >
                  {player.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;