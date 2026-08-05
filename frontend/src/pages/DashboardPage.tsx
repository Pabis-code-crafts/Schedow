import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function DashboardPage() {
  return (
    <PlaceholderPage
      eyebrow="Command center"
      icon={<InsightsRoundedIcon />}
      stats={[
        { title: 'Coverage', value: '94%', helperText: 'Across active teams', tone: 'success' },
        { title: 'Open actions', value: '12', helperText: 'Awaiting review', tone: 'warning' },
        { title: 'Forecast confidence', value: '87%', helperText: 'Next 7 days', tone: 'primary' },
      ]}
      subtitle="A placeholder dashboard surface for workforce health, coverage, and operational signals."
      title="Dashboard"
    />
  );
}
