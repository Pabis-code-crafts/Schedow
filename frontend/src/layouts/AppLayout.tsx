import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useState, type PropsWithChildren } from 'react';

import { NavigationDrawer } from '@/layouts/components/NavigationDrawer';
import { TopAppBar } from '@/layouts/components/TopAppBar';

const drawerWidth = 280;
const collapsedDrawerWidth = 84;

export function AppLayout({ children }: PropsWithChildren) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleNavigation = () => {
    setIsDrawerOpen((current) => !current);
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <TopAppBar onMenuClick={toggleNavigation} />
      <NavigationDrawer
        collapsedWidth={collapsedDrawerWidth}
        drawerWidth={drawerWidth}
        isCollapsed={!isDesktopExpanded}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onMouseEnter={() => setIsDesktopExpanded(true)}
        onMouseLeave={() => setIsDesktopExpanded(false)}
        onToggleCollapse={() => setIsDesktopExpanded((current) => !current)}
      />
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          minWidth: 0,
          pb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, lg: 3.5 },
          width: { md: `calc(100% - ${collapsedDrawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 68, sm: 76 } }} />
        <Box sx={{ mx: 'auto', maxWidth: 1680, pt: { xs: 2, sm: 2.5 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
