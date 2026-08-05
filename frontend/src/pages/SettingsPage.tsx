import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Administration"
      icon={<SettingsRoundedIcon />}
      stats={[
        { title: 'Workspace', value: 'Schedow', helperText: 'Current tenant', tone: 'primary' },
        { title: 'Roles', value: '6', helperText: 'Configured groups', tone: 'info' },
        { title: 'Security', value: 'Ready', helperText: 'JWT shell prepared', tone: 'success' },
      ]}
      subtitle="A placeholder settings surface for workspace configuration, permissions, and preferences."
      title="Settings"
    />
  );
}
