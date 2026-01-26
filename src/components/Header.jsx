import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header component with navigation and user controls
 * Shows different content based on authentication state
 */
function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show header on intro page
  if (location.pathname === '/') {
    return null;
  }

  /**
   * Handle logout - clears auth state and redirects to intro
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo/Brand */}
        <Link to={isAuthenticated ? "/search" : "/"} className="logo">
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
            className="logo-icon"
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
          <span className="logo-text">LoL Mastery</span>
        </Link>

        {/* User section */}
        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-info">
              <span className="username">Welcome, {user?.username}</span>
              <button 
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;