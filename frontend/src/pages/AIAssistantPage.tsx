import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function AIAssistantPage() {
  return (
    <PlaceholderPage
      eyebrow="AI operations"
      icon={<AutoAwesomeRoundedIcon />}
      stats={[
        { title: 'Suggestions', value: '18', helperText: 'Available to review', tone: 'primary' },
        { title: 'Risk alerts', value: '5', helperText: 'Detected patterns', tone: 'warning' },
        { title: 'Automation status', value: 'Soon', helperText: 'Coming Soon', tone: 'info' },
      ]}
      subtitle="A placeholder assistant surface for scheduling recommendations and workforce intelligence."
      title="AI Assistant"
    />
  );
}
