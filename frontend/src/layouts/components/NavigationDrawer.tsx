import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';

import { navigationItems } from '@/config/navigation';

type NavigationDrawerProps = {
  drawerWidth: number;
  isOpen: boolean;
  onClose: () => void;
};

export function NavigationDrawer({ drawerWidth, isOpen, onClose }: NavigationDrawerProps) {
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, px: 2.5 }}>
        <Stack alignItems="center" direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: 'primary.main',
              borderRadius: 3,
              boxShadow: 2,
              color: 'primary.contrastText',
              display: 'flex',
              flexShrink: 0,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="span" noWrap variant="h6">
              Schedow
            </Typography>
            <Typography color="text.secondary" display="block" noWrap variant="caption">
              Workforce intelligence
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              end
              component={NavLink}
              onClick={onClose}
              sx={{
                borderRadius: 3,
                color: 'text.secondary',
                minHeight: 44,
                my: 0.25,
                px: 1.5,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'color', 'box-shadow']),
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                  color: 'primary.dark',
                },
                '&.active': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  boxShadow: 1,
                  color: 'primary.dark',
                  fontWeight: 700,
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
              }}
              to={item.path}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: (theme) => alpha(theme.palette.secondary.light, 0.34),
            border: 1,
            borderColor: 'divider',
            borderRadius: 4,
            p: 2,
          }}
        >
          <Stack spacing={1}>
            <Chip color="secondary" label="AI-ready" size="small" sx={{ alignSelf: 'flex-start' }} />
            <Typography color="text.primary" variant="subtitle2">
              Smart scheduling shell
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Placeholder views are ready for backend integration.
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        ModalProps={{ keepMounted: true }}
        onClose={onClose}
        open={isOpen}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        variant="temporary"
      >
        {drawerContent}
      </Drawer>
      <Drawer
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        variant="permanent"
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
