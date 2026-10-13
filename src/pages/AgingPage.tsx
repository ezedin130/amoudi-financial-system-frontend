import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const AgingPage: React.FC = () => {
  const location = useLocation();
  const search = location.search ? `${location.search}&tab=aging` : '?tab=aging';
  return <Navigate to={`/reports${search}`} replace />;
};
