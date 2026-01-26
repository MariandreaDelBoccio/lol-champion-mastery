import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ChampionPage from './pages/ChampionPage';
import './App.css';

/**
 * Main App component that sets up routing and global context
 * This is the root component that wraps everything in AuthProvider
 * and defines all the routes for our application
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public route - anyone can access login */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile/:summonerName" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/champion/:championId" element={
                <ProtectedRoute>
                  <ChampionPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;