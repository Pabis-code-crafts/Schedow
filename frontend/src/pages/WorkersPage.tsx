import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function WorkersPage() {
  return (
    <PlaceholderPage
      eyebrow="People"
      icon={<GroupsRoundedIcon />}
      stats={[
        { title: 'Active workers', value: '142', helperText: 'Across locations', tone: 'primary' },
        { title: 'Availability updates', value: '24', helperText: 'This week', tone: 'info' },
        { title: 'Compliance checks', value: '98%', helperText: 'Current', tone: 'success' },
      ]}
      subtitle="A placeholder worker management surface for profiles, availability, and team insights."
      title="Workers"
    />
  );
}
