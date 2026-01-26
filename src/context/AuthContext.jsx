import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

/**
 * Custom hook to use the auth context
 * This makes it easy to access auth state from any component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component that manages authentication state
 * This is a simple fake authentication system for educational purposes
 * In a real app, you'd integrate with Firebase Auth or similar service
 */
export const AuthProvider = ({ children }) => {
  // State to track if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to track current user info
  const [user, setUser] = useState(null);
  // State to track loading during auth operations
  const [loading, setLoading] = useState(true);

  // Check if user was previously logged in (using localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('lol-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  /**
   * Simple login function - accepts any username/password
   * In a real app, this would validate credentials with a server
   */
  const login = async (username, password) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any non-empty credentials
    if (username.trim() && password.trim()) {
      const userData = {
        id: Date.now(), // Simple ID generation
        username: username.trim(),
        loginTime: new Date().toISOString()
      };
      
      // Save to localStorage to persist login
      localStorage.setItem('lol-user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: 'Please enter both username and password' };
    }
  };

  /**
   * Logout function - clears all auth state
   */
  const logout = () => {
    localStorage.removeItem('lol-user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // The value object that will be provided to all children
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};