import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const StatementsPage: React.FC = () => {
  const location = useLocation();
  const search = location.search ? `${location.search}&tab=statement` : '?tab=statement';
  return <Navigate to={`/reports${search}`} replace />;
};
