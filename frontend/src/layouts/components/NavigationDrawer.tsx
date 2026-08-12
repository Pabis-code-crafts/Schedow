import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
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
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleCollapse: () => void;
};

export function NavigationDrawer({
  collapsedWidth,
  drawerWidth,
  isCollapsed,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onToggleCollapse,
}: NavigationDrawerProps) {
  const drawerContent = (collapsed: boolean, showCollapseControl: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ minHeight: { xs: 68, sm: 76 } }} />
      <Divider />
      <List sx={{ flex: 1, px: collapsed ? 1 : 1.5, py: 2.5 }}>
        {navigationItems.map((item) => {
          const listItem = (
            <ListItem disablePadding key={item.path}>
              <ListItemButton
                end
                component={item.disabled ? 'div' : NavLink}
                disabled={item.disabled}
                onClick={item.disabled ? undefined : onClose}
                sx={{
                  borderRadius: 2,
                  color: 'text.secondary',
                  gap: collapsed ? 0 : 1.25,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  minHeight: 52,
                  my: 0.35,
                  px: collapsed ? 1 : 2,
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'color', 'box-shadow', 'transform']),
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                    color: 'primary.dark',
                    transform: 'translateX(2px)',
                  },
                  '&.active, &[aria-current="page"]': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    boxShadow: (theme) => `inset 3px 0 0 ${theme.palette.primary.main}`,
                    color: 'primary.dark',
                    fontWeight: 800,
                    '& .MuiListItemIcon-root': {
                      color: 'primary.dark',
                    },
                  },
                  '&.Mui-disabled': {
                    color: 'text.disabled',
                    opacity: 1,
                  },
                }}
                to={item.disabled ? undefined : item.path}
              >
                <ListItemIcon sx={{ justifyContent: 'center', minWidth: collapsed ? 0 : 28 }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                {!collapsed ? (
                  <>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
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

      {showCollapseControl ? (
        <Box sx={{ borderTop: 1, borderColor: 'divider', p: collapsed ? 1 : 1.5 }}>
          <ButtonBase
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            sx={{
              alignItems: 'center',
              borderRadius: 2,
              color: 'text.secondary',
              display: 'flex',
              gap: 1.25,
              height: 48,
              justifyContent: collapsed ? 'center' : 'space-between',
              px: collapsed ? 0 : 2,
              width: '100%',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                color: 'primary.dark',
              },
            }}
          >
            {collapsed ? <ChevronRightRoundedIcon /> : <Stack alignItems="center" direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
              <ChevronLeftRoundedIcon />
              <Typography fontWeight={700} variant="body2">Collapse</Typography>
            </Stack>}
          </ButtonBase>
        </Box>
      ) : null}
    </Box>
  );

  return (
    <Box component="nav" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} sx={{ flexShrink: { md: 0 }, width: { md: collapsedWidth } }}>
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
        {drawerContent(false, false)}
      </Drawer>
      <Drawer
        open
        PaperProps={{ onMouseEnter, onMouseLeave }}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            boxShadow: isCollapsed ? 'none' : 3,
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create(['width', 'box-shadow'], { duration: theme.transitions.duration.shorter, easing: theme.transitions.easing.easeInOut }),
            width: isCollapsed ? collapsedWidth : drawerWidth,
          },
        }}
        variant="permanent"
      >
        {drawerContent(isCollapsed, true)}
      </Drawer>
    </Box>
  );
}



