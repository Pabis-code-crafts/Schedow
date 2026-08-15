import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { env } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';

type TopAppBarProps = {
  onMenuClick: () => void;
};

type AppNotification = {
  id: string;
  title: string;
  message: string;
  href: string;
  unread: boolean;
};

const DEMO_SUPERVISOR_EMAIL = 'demo-supervisor@example.com';
const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'watch-schedow-demo',
    title: 'Watch the Schedow Demo',
    message: 'See how to use Schedow and explore the Supervisor experience.',
    href: 'https://youtu.be/_sgEuQrRHO8',
    unread: true,
  },
  {
    id: 'meet-the-developer',
    title: 'Meet the Developer',
    message: 'Learn more about the developer behind Schedow.',
    href: 'https://pavithran.duckdns.org',
    unread: true,
  },
];

export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const auth = useAuth();
  const navigate = useNavigate();
  const profileOpen = Boolean(profileAnchorEl);
  const notificationsOpen = Boolean(notificationAnchorEl);
  const displayName = auth.user?.name ?? 'Schedow User';
  const isDemoSupervisor = useMemo(() => {
    const email = auth.user?.email?.toLowerCase();
    const roles = auth.user?.roles ?? [];

    return email === DEMO_SUPERVISOR_EMAIL && roles.includes('SUPERVISOR');
  }, [auth.user?.email, auth.user?.roles]);
  const unreadNotificationCount = notifications.filter((notification) => notification.unread).length;
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SU';

  useEffect(() => {
    if (!isDemoSupervisor) {
      setNotifications([]);
      return undefined;
    }

    setNotifications([]);
    const timeoutId = window.setTimeout(() => {
      setNotifications(DEMO_NOTIFICATIONS);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [isDemoSupervisor]);

  const openNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const closeNotifications = () => {
    setNotificationAnchorEl(null);
  };

  const openNotificationLink = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const logout = () => {
    setProfileAnchorEl(null);
    setNotificationAnchorEl(null);
    setNotifications([]);
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
              onClick={openNotifications}
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
              <Badge badgeContent={unreadNotificationCount} color="error" invisible={unreadNotificationCount === 0} overlap="circular">
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
        <Menu
          anchorEl={notificationAnchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          onClose={closeNotifications}
          open={notificationsOpen}
          slotProps={{ paper: { sx: { mt: 1.25, width: 340, maxWidth: 'calc(100vw - 32px)' } } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 850 }} variant="subtitle2">Notifications</Typography>
            <Typography color="text.secondary" variant="caption">
              {notifications.length ? 'New demo resources are ready.' : 'No new notifications.'}
            </Typography>
          </Box>
          {notifications.length ? <Divider /> : null}
          {notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => openNotificationLink(notification.href)}
              sx={{ alignItems: 'flex-start', gap: 1.5, py: 1.5, whiteSpace: 'normal' }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  {notification.unread ? <Box aria-label="Unread" sx={{ bgcolor: 'error.main', borderRadius: '50%', height: 7, width: 7 }} /> : null}
                  <Typography sx={{ fontWeight: 800 }} variant="body2">{notification.title}</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="caption">{notification.message}</Typography>
              </Box>
              <OpenInNewRoundedIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.25 }} />
            </MenuItem>
          ))}
        </Menu>
        <Menu anchorEl={profileAnchorEl} onClose={() => setProfileAnchorEl(null)} open={profileOpen}>
          <MenuItem disabled>{auth.user?.email ?? 'Signed in'}</MenuItem>
          <MenuItem onClick={logout}>Log out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
