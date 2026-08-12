import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { env } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';

type TopAppBarProps = {
  onMenuClick: () => void;
};

export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const profileOpen = Boolean(profileAnchorEl);
  const displayName = auth.user?.name ?? 'Schedow User';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SU';

  const logout = () => {
    setProfileAnchorEl(null);
    auth.logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      color="inherit"
      position="fixed"
      sx={{
        left: 0,
        width: '100%',
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar sx={{ gap: { xs: 1.25, sm: 1.5 }, minHeight: { xs: 68, sm: 76 }, px: { xs: 2, sm: 3 } }}>
        <Tooltip title="Toggle navigation">
          <IconButton
            aria-label="Toggle navigation"
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              height: 40,
              width: 40,
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Stack alignItems="center" direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: 'primary.main',
              borderRadius: '50%',
              boxShadow: 2,
              color: 'primary.contrastText',
              display: 'flex',
              flexShrink: 0,
              height: 44,
              justifyContent: 'center',
              width: 44,
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Typography component="span" noWrap sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 800 }}>
            {env.appName}
          </Typography>
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Stack alignItems="center" direction="row" spacing={{ xs: 1, sm: 1.25 }}>
          <Tooltip title="Notifications">
            <IconButton
              aria-label="Notifications"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                border: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                height: 40,
                width: 40,
                '&:hover': {
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                },
              }}
            >
              <Badge badgeContent={2} color="error" overlap="circular">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Stack
            alignItems="center"
            component="button"
            direction="row"
            onClick={(event) => setProfileAnchorEl(event.currentTarget)}
            spacing={1}
            sx={{ bgcolor: 'transparent', border: 0, cursor: 'pointer', minWidth: 0, p: 0 }}
          >
            <Avatar
              alt={displayName}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: 14,
                fontWeight: 800,
                height: 42,
                width: 42,
              }}
            >
              {initials}
            </Avatar>
            <Typography noWrap sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 700, maxWidth: 120 }} variant="body2">
              {displayName}
            </Typography>
            <KeyboardArrowDownRoundedIcon sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' }, fontSize: 20 }} />
          </Stack>
        </Stack>
        <Menu anchorEl={profileAnchorEl} onClose={() => setProfileAnchorEl(null)} open={profileOpen}>
          <MenuItem disabled>{auth.user?.email ?? 'Signed in'}</MenuItem>
          <MenuItem onClick={logout}>Log out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
