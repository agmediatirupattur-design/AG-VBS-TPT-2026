import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin, allowedFor = [] }) => {
  const { isAuthenticated, role, username } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    if (!allowedFor.includes(username)) {
      return <Navigate to="/" replace />; // Redirect non-admins away if not explicitly allowed
    }
  }

  return children;
};

export default ProtectedRoute;
