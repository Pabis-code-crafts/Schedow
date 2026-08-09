import { Navigate, createBrowserRouter } from 'react-router-dom';

import { App } from '@/App';
import { DesignSystemShowcase } from '@/design-system/DesignSystemShowcase';
import { DashboardPage } from '@/pages/DashboardPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WorkersPage } from '@/pages/WorkersPage';

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
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
]);
