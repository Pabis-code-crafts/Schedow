import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import {
  AppCard,
  EmptyState,
  PageHeader,
  SectionTitle,
  StatCard,
} from '@/components/design-system';

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  stats: Array<{
    title: string;
    value: string;
    helperText: string;
    tone: 'primary' | 'success' | 'warning' | 'error' | 'info';
  }>;
};

export function PlaceholderPage({
  eyebrow,
  icon,
  stats,
  subtitle,
  title,
}: PlaceholderPageProps) {
  return (
    <Stack spacing={4}>
      <PageHeader
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button color="primary" startIcon={<AutoAwesomeIcon />} variant="contained">
              Ask AI
            </Button>
            <Button color="primary" endIcon={<ArrowForwardRoundedIcon />} variant="outlined">
              View workflow
            </Button>
          </Stack>
        }
        eyebrow={eyebrow}
        subtitle={subtitle}
        title={title}
      />

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item key={stat.title} md={4} xs={12}>
            <StatCard
              helperText={stat.helperText}
              icon={icon}
              title={stat.title}
              tone={stat.tone}
              trend={{ direction: 'flat', label: 'Placeholder' }}
              value={stat.value}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item lg={8} xs={12}>
          <AppCard sx={{ minHeight: 360 }}>
            <Stack spacing={3}>
              <SectionTitle
                description="This area is intentionally placeholder-only until the backend workflows are connected."
                title={`${title} workspace`}
              />
              <EmptyState
                description="The application shell, navigation, and reusable surfaces are ready. Business data and API-backed workflows can be added in the next implementation step."
                icon={icon}
                title="Placeholder content"
              />
            </Stack>
          </AppCard>
        </Grid>
        <Grid item lg={4} xs={12}>
          <Stack spacing={3}>
            <AppCard>
              <Stack spacing={2}>
                <Chip color="secondary" label="Production shell" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="h5">Designed for daily operations</Typography>
                <Typography color="text.secondary" variant="body2">
                  Responsive navigation, polished surfaces, and clear hierarchy are in place before
                  feature-specific content is introduced.
                </Typography>
              </Stack>
            </AppCard>
            <AppCard>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Layout checklist</Typography>
                {['Responsive app frame', 'Desktop sidebar', 'Mobile drawer', 'Top app bar'].map(
                  (item) => (
                    <Typography color="text.secondary" key={item} variant="body2">
                      {item}
                    </Typography>
                  ),
                )}
              </Stack>
            </AppCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
