import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useState, type PropsWithChildren } from 'react';

import { NavigationDrawer } from '@/layouts/components/NavigationDrawer';
import { TopAppBar } from '@/layouts/components/TopAppBar';

const drawerWidth = 280;
const collapsedDrawerWidth = 88;

export function AppLayout({ children }: PropsWithChildren) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopDrawerCollapsed, setIsDesktopDrawerCollapsed] = useState(false);
  const activeDrawerWidth = isDesktopDrawerCollapsed ? collapsedDrawerWidth : drawerWidth;

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((current) => !current);

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <TopAppBar drawerWidth={activeDrawerWidth} onMenuClick={toggleDrawer} />
      <NavigationDrawer
        collapsedWidth={collapsedDrawerWidth}
        isCollapsed={isDesktopDrawerCollapsed}
        drawerWidth={drawerWidth}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onToggleCollapse={() => setIsDesktopDrawerCollapsed((current) => !current)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          backgroundColor: 'background.default',
          px: { xs: 2, sm: 3, lg: 4 },
          pb: { xs: 3, sm: 4 },
        }}
      >
        <Toolbar />
        <Box sx={{ mx: 'auto', maxWidth: 1680, pt: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
