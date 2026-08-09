import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { NavLink } from 'react-router-dom';

import { navigationItems } from '@/config/navigation';

type NavigationDrawerProps = {
  collapsedWidth: number;
  drawerWidth: number;
  isCollapsed: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export function NavigationDrawer({
  collapsedWidth,
  drawerWidth,
  isCollapsed,
  isOpen,
  onClose,
  onToggleCollapse,
}: NavigationDrawerProps) {
  const drawerContent = (collapsed: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'space-between', minHeight: { xs: 64, sm: 72 }, px: collapsed ? 1.5 : 2.5 }}>
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
          {!collapsed ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography component="span" noWrap variant="h6">
              Schedow
            </Typography>
            <Typography color="text.secondary" display="block" noWrap variant="caption">
              Workforce intelligence
            </Typography>
          </Box>
          ) : null}
        </Stack>
        {!collapsed ? (
          <Tooltip title="Collapse navigation">
            <IconButton aria-label="Collapse navigation" onClick={onToggleCollapse} size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navigationItems.map((item) => {
          const listItem = (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              end
              component={item.disabled ? 'div' : NavLink}
              disabled={item.disabled}
              onClick={item.disabled ? undefined : onClose}
              sx={{
                borderRadius: 3,
                color: 'text.secondary',
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: 44,
                my: 0.25,
                px: collapsed ? 1 : 1.5,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'color', 'box-shadow']),
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                  color: 'primary.dark',
                },
                '&.active, &[aria-current="page"]': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  boxShadow: 1,
                  color: 'primary.dark',
                  fontWeight: 700,
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                },
                '&.Mui-disabled': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              }}
              to={item.disabled ? undefined : item.path}
            >
              <ListItemIcon sx={{ justifyContent: 'center', minWidth: collapsed ? 0 : 38 }}>
                <item.icon fontSize="small" />
              </ListItemIcon>
              {!collapsed ? (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                  />
                  {item.badge ? <Chip label={item.badge} size="small" variant="outlined" /> : null}
                </>
              ) : null}
            </ListItemButton>
          </ListItem>
          );

          return collapsed ? (
            <Tooltip key={item.path} placement="right" title={`${item.label}${item.badge ? ` - ${item.badge}` : ''}`}>
              <Box>{listItem}</Box>
            </Tooltip>
          ) : (
            listItem
          );
        })}
      </List>
      {isCollapsed ? (
        <Box sx={{ px: 1.5, pb: 2 }}>
          <Tooltip title="Expand navigation" placement="right">
            <IconButton
              aria-label="Expand navigation"
              onClick={onToggleCollapse}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                width: '100%',
              }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
      {!collapsed ? <Box sx={{ p: 2 }}>
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
              Staging keeps unfinished areas marked Coming Soon.
            </Typography>
          </Stack>
        </Box>
      </Box> : null}
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: isCollapsed ? collapsedWidth : drawerWidth }, flexShrink: { md: 0 } }}>
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
        {drawerContent(false)}
      </Drawer>
      <Drawer
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width'),
            width: isCollapsed ? collapsedWidth : drawerWidth,
          },
        }}
        variant="permanent"
      >
        {drawerContent(isCollapsed)}
      </Drawer>
    </Box>
  );
}
