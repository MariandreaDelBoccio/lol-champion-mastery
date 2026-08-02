import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const { pathname } = useLocation();

  return (
    <header className="mos-header">
      <div className="mos-header-inner shell">
        <Link to="/" className="mos-logo">
          MASTERY <span>OS</span>
        </Link>
        <nav className="mos-nav">
          <Link
            to="/search"
            className={pathname.startsWith('/search') || pathname.startsWith('/profile') ? 'active' : ''}
          >
            Buscar
          </Link>
          <Link to="/compare" className={pathname.startsWith('/compare') ? 'active' : ''}>
            Comparar
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
