import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // 'user' or 'admin'
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check local storage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('vbs-auth');
    if (storedAuth) {
      const { role, username } = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setRole(role);
      setUsername(username || null);
    }
    setLoading(false);
  }, []);

  const login = (role, userIdentifier = null) => {
    setIsAuthenticated(true);
    setRole(role);
    setUsername(userIdentifier);
    localStorage.setItem('vbs-auth', JSON.stringify({ role, username: userIdentifier }));
  };

  const logout = () => {
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
