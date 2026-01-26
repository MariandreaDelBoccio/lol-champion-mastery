import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchSummonerByName } from '../services/apiClient';
import './HomePage.css';

/**
 * HomePage component - main search interface
 * Allows users to search for summoners by name and region
 */
function HomePage() {
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('na1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Available regions for the dropdown
  const regions = [
    { value: 'na1', label: 'North America' },
    { value: 'euw1', label: 'Europe West' },
    { value: 'eun1', label: 'Europe Nordic & East' },
    { value: 'kr', label: 'Korea' },
    { value: 'jp1', label: 'Japan' },
    { value: 'br1', label: 'Brazil' },
    { value: 'la1', label: 'Latin America North' },
    { value: 'la2', label: 'Latin America South' },
    { value: 'oc1', label: 'Oceania' },
    { value: 'tr1', label: 'Turkey' },
    { value: 'ru', label: 'Russia' }
  ];

  /**
   * Handle search form submission
   * @param {Event} e - Form submit event
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!summonerName.trim()) {
      setError('Please enter a summoner name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch summoner data to verify they exist
      const summonerData = await fetchSummonerByName(summonerName.trim(), region);
      
      // Navigate to profile page with the summoner name
      navigate(`/profile/${encodeURIComponent(summonerName.trim())}?region=${region}`);
    } catch (err) {
      setError(err.message || 'Failed to find summoner');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear the search form
   */
  const handleClear = () => {
    setSummonerName('');
    setError('');
  };

  /**
   * Retry the last search
   */
  const handleRetry = () => {
    if (summonerName.trim()) {
      handleSearch({ preventDefault: () => {} });
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h1>Champion Mastery Lookup</h1>
          <p>Search for any League of Legends summoner to view their champion mastery</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="summoner-name">Summoner Name</label>
              <input
                type="text"
                id="summoner-name"
                value={summonerName}
                onChange={(e) => setSummonerName(e.target.value)}
                placeholder="Enter summoner name..."
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="region">Region</label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                {regions.map((regionOption) => (
                  <option key={regionOption.value} value={regionOption.value}>
                    {regionOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="search-btn"
              disabled={loading || !summonerName.trim()}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            
            <button 
              type="button" 
              onClick={handleClear}
              className="clear-btn"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <Loading message="Searching for summoner..." />
        )}

        {/* Error state */}
        {error && (
          <ErrorMessage 
            message={error}
            onRetry={summonerName.trim() ? handleRetry : null}
          />
        )}

        {/* Instructions */}
        <div className="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Enter a summoner name (e.g., "Faker", "Doublelift")</li>
            <li>Select the correct region</li>
            <li>Click "Search" to view their champion mastery</li>
          </ol>
          
          <div className="api-note">
            <p><strong>Note:</strong> You need a valid Riot API key in your .env file for this to work.</p>
            <p>Get your free API key at: <a href="https://developer.riotgames.com/" target="_blank" rel="noopener noreferrer">developer.riotgames.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;