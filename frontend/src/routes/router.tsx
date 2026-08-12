import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom';

import { App } from '@/App';
import { useAuth } from '@/hooks/useAuth';
import { DesignSystemShowcase } from '@/design-system/DesignSystemShowcase';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WorkersPage } from '@/pages/WorkersPage';

function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          {
            index: true,
            element: <Navigate replace to="/schedule" />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'schedule',
            element: <SchedulePage />,
          },
          {
            path: 'people-shifts',
            element: <WorkersPage />,
          },
          {
            path: 'workers',
            element: <Navigate replace to="/people-shifts" />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'design-system',
            element: <DesignSystemShowcase />,
          },
        ],
      },
    ],
  },
]);
