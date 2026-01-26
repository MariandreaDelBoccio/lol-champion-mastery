import { Link } from 'react-router-dom';
import './IntroPage.css';

/**
 * IntroPage component - Landing page with hero section and features
 * This is the first page users see when they visit the app
 */
function IntroPage() {
  return (
    <div className="intro-page">
      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          {/* Animated Icon */}
          <div className="hero-icon">
            <div className="icon-container">
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
                className="swords-icon animate-float"
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
              <div className="icon-glow animate-pulse-glow"></div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="hero-text">
            <h1 className="hero-title">
              Master Your <span className="text-gradient-gold">Champions</span>
            </h1>
            <p className="hero-subtitle">
              The ultimate champion mastery tracker for League of Legends. 
              Search any summoner, explore their champion collection, and track mastery progress.
            </p>
          </div>

          {/* Hero Buttons */}
          <div className="hero-buttons">
            <Link to="/search" className="btn-start-tracking">
              Start Tracking
            </Link>
            <Link to="/login" className="btn-sign-in">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card animate-fade-in" style={{ animationDelay: '0ms' }}>
            <div className="feature-icon">
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
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </div>
            <h3>Mastery Tracking</h3>
            <p>View detailed mastery stats for any champion across all regions.</p>
          </div>

          <div className="feature-card animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="feature-icon">
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
                <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
            </div>
            <h3>Progress Insights</h3>
            <p>Track your journey from Mastery 1 to the coveted Mastery 7.</p>
          </div>

          <div className="feature-card animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="feature-icon">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Summoner Search</h3>
            <p>Look up any player to see their champion mastery collection.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="intro-footer">
        <div className="footer-content">
          <div className="footer-logo">
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
              className="footer-icon"
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
            <span className="text-gradient-gold">Champion Mastery</span>
          </div>
          <p className="footer-disclaimer">
            Champion Mastery Tracker is not endorsed by Riot Games and does not reflect 
            the views or opinions of Riot Games or anyone officially involved in producing 
            or managing Riot Games properties.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default IntroPage;