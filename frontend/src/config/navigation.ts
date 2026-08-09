import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export type NavigationItem = {
  label: string;
  path: string;
  icon: SvgIconComponent;
  disabled?: boolean;
  badge?: string;
};

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardRoundedIcon,
    disabled: true,
    badge: 'Coming Soon',
  },
  {
    label: 'Schedule',
    path: '/schedule',
    icon: CalendarMonthIcon,
  },
  {
    label: 'People & Shifts',
    path: '/people-shifts',
    icon: GroupsRoundedIcon,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsRoundedIcon,
    disabled: true,
    badge: 'Coming Soon',
  },
];
