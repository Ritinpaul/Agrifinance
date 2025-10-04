import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

// Usage: <ProtectedRoute roles={["farmer"]}><FarmerDashboard /></ProtectedRoute>
const ProtectedRoute = ({ roles, children }) => {
  const { user, userProfile, loading } = useSupabase();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-600 dark:text-gray-300">Checking access…</div>
    );
  }

  if (!user?.id) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    const role = userProfile?.role || 'user';
    if (!roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;


