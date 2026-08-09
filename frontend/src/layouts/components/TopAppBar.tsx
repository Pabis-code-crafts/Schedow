import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

import { env } from '@/config/env';
import { navigationItems } from '@/config/navigation';

type TopAppBarProps = {
  drawerWidth: number;
  onMenuClick: () => void;
};

export function TopAppBar({ drawerWidth, onMenuClick }: TopAppBarProps) {
  const location = useLocation();
  const currentItem = navigationItems.find((item) => location.pathname.startsWith(item.path));
  const title = currentItem?.label ?? env.appName;

  return (
    <AppBar
      color="inherit"
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, sm: 72 } }}>
        <Tooltip title="Open navigation">
          <IconButton
            aria-label="Open navigation"
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ minWidth: 0, display: { xs: 'block', sm: 'none' } }}>
          <Typography component="span" noWrap variant="subtitle1">
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            alignItems: 'center',
            bgcolor: (theme) => alpha(theme.palette.grey[200], 0.55),
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            color: 'text.secondary',
            display: { xs: 'none', sm: 'flex' },
            flex: 1,
            maxWidth: 520,
            minHeight: 44,
            px: 1.5,
            transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
            '&:focus-within': {
              bgcolor: 'background.paper',
              borderColor: 'primary.main',
            },
          }}
        >
          <SearchRoundedIcon fontSize="small" />
          <InputBase
            inputProps={{ 'aria-label': 'Search' }}
            placeholder="Search schedules, workers, shifts..."
            sx={{
              color: 'text.primary',
              flex: 1,
              fontSize: 14,
              ml: 1,
            }}
          />
        </Box>

        <Box sx={{ flex: 1, display: { xs: 'block', sm: 'none' } }} />

        <Stack alignItems="center" direction="row" spacing={1}>
          <Tooltip title="Notifications">
            <IconButton
              aria-label="Notifications"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.grey[200], 0.55),
                border: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                },
              }}
            >
              <NotificationsNoneRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pavithran G">
            <Avatar
              alt="Pavithran G"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: 14,
                fontWeight: 700,
                height: 40,
                width: 40,
              }}
            >
              PG
            </Avatar>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
