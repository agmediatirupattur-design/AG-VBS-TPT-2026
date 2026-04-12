import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />; // Redirect non-admins away
  }

  return children;
};

export default ProtectedRoute;
