import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthProvider';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    
    return <div>Yükleniyor...</div>;
  }

  if (!user) {
    
    return <Navigate to="/login" />;
  }

  
  return children;
};

export default ProtectedRoute;
