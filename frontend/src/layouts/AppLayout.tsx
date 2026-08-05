import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useState, type PropsWithChildren } from 'react';

import { NavigationDrawer } from '@/layouts/components/NavigationDrawer';
import { TopAppBar } from '@/layouts/components/TopAppBar';

const drawerWidth = 280;

export function AppLayout({ children }: PropsWithChildren) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      <TopAppBar drawerWidth={drawerWidth} onMenuClick={toggleDrawer} />
      <NavigationDrawer
        drawerWidth={drawerWidth}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
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
        <Box sx={{ mx: 'auto', maxWidth: 1440, pt: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
