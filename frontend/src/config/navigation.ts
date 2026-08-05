import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export type NavigationItem = {
  label: string;
  path: string;
  icon: SvgIconComponent;
};

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardRoundedIcon,
  },
  {
    label: 'Schedule',
    path: '/schedule',
    icon: CalendarMonthIcon,
  },
  {
    label: 'Workers',
    path: '/workers',
    icon: GroupsRoundedIcon,
  },
  {
    label: 'AI Assistant',
    path: '/ai-assistant',
    icon: AutoAwesomeIcon,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsRoundedIcon,
  },
];
