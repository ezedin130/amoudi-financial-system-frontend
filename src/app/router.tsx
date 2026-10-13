import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NonIataListPage } from '@/pages/NonIataListPage';
import { NonIataDetailPage } from '@/pages/NonIataDetailPage';
import { SalesReportsPage } from '@/pages/SalesReportsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { StatementsPage } from '@/pages/StatementsPage';
import { AgingPage } from '@/pages/AgingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'non-iatas',
            element: <NonIataListPage />,
          },
          {
            path: 'non-iatas/:id',
            element: <NonIataDetailPage />,
          },
          {
            path: 'sales-reports',
            element: <SalesReportsPage />,
          },
          {
            path: 'sales',
            element: <Navigate to="/sales-reports" replace />,
          },

          {
            path: 'payments',
            element: <PaymentsPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'statements',
            element: <StatementsPage />,
          },
          {
            path: 'aging',
            element: <AgingPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
