import React, { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // 'user' or 'admin'
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check local storage and GitHub auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for GitHub authentication first
      try {
        const response = await fetch('/auth/user');
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setRole(data.role || 'user');
          setUsername(data.user.name || data.user.username);
          return;
        }
      } catch (err) {
        console.log('GitHub auth check failed:', err);
      }

      // Fallback to local storage
      const storedAuth = localStorage.getItem('vbs-auth');
      if (storedAuth) {
        const { role, username } = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setRole(role);
        setUsername(username || null);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (role, userIdentifier = null) => {
    setIsAuthenticated(true);
    setRole(role);
    setUsername(userIdentifier);
    localStorage.setItem('vbs-auth', JSON.stringify({ role, username: userIdentifier }));
  };

  const logout = async () => {
    try {
      // Try GitHub logout
      await fetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.log('GitHub logout failed:', err);
    }

    // Clear local state
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
    localStorage.removeItem('vbs-auth');
  };

  if (loading) {
    return <div>Loading...</div>; // Prevent flashing unprotected routes
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
