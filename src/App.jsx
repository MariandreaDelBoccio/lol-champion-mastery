import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import IntroPage from './pages/IntroPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ChampionPage from './pages/ChampionPage';
import ComparePage from './pages/ComparePage';
import { warmDdragon } from './services/datadragon';
import './App.css';

// Warm patch version early so champion icons resolve on first paint after load
warmDdragon().catch(() => {});

/**
 * Mastery OS — public routes only (no fake auth gate).
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/profile/:summonerName" element={<ProfilePage />} />
            <Route path="/champion/:championId" element={<ChampionPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
