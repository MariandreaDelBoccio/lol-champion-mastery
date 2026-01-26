import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

/**
 * Header component with navigation and user controls
 * Shows different content based on authentication state
 */
function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle logout - clears auth state and redirects to login
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo/Brand */}
        <Link to="/" className="logo">
          <span className="logo-text">LoL Mastery</span>
        </Link>

        {/* Navigation - only show when authenticated */}
        {isAuthenticated && (
          <nav className="nav">
            <Link to="/" className="nav-link">
              Search
            </Link>
          </nav>
        )}

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