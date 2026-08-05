import AddIcon from '@mui/icons-material/Add';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  AppCard,
  EmptyState,
  LoadingState,
  PageHeader,
  SectionTitle,
  StatCard,
} from '@/components/design-system';

export function DesignSystemShowcase() {
  return (
    <Stack spacing={5}>
      <PageHeader
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button color="primary" startIcon={<AddIcon />} variant="contained">
              Primary action
            </Button>
            <Button color="primary" variant="outlined">
              Secondary
            </Button>
          </Stack>
        }
        eyebrow="Design system"
        subtitle="Reusable interface primitives for the Schedow frontend, using warm surfaces, deep green brand accents, and consistent 8px spacing."
        title="Schedow UI foundation"
      />

      <Stack spacing={2.5}>
        <SectionTitle
          action={<Chip color="secondary" label="Light mode only" variant="outlined" />}
          description="Cards, stats, titles, empty states, and loading states use theme-owned colors, radii, spacing, and shadows."
          title="Reusable components"
        />
        <Grid container spacing={3}>
          <Grid item md={4} xs={12}>
            <StatCard
              helperText="Coverage health"
              icon={<CalendarMonthIcon />}
              title="Open shifts"
              tone="primary"
              trend={{ direction: 'down', label: '12% lower' }}
              value="28"
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <StatCard
              helperText="Active this week"
              icon={<GroupsIcon />}
              title="Team members"
              tone="success"
              trend={{ direction: 'up', label: '8 added' }}
              value="142"
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <StatCard
              helperText="Needs review"
              icon={<AutoGraphIcon />}
              title="Forecast variance"
              tone="warning"
              trend={{ direction: 'flat', label: 'Stable' }}
              value="4.2%"
            />
          </Grid>
        </Grid>
      </Stack>

      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <AppCard
            actions={
              <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                <Button color="primary" variant="contained">
                  Review component
                </Button>
                <Button color="primary">View tokens</Button>
              </CardActions>
            }
          >
            <Stack spacing={2}>
              <NotificationsNoneIcon color="primary" />
              <div>
                <Typography color="text.primary" variant="h5">
                  AppCard
                </Typography>
                <Typography color="text.secondary" mt={1} variant="body2">
                  A premium surface for repeated content, configured through the global Material UI
                  card style and local spacing props.
                </Typography>
              </div>
            </Stack>
          </AppCard>
        </Grid>
        <Grid item md={6} xs={12}>
          <LoadingState
            description="Use this for async boundaries before feature-specific skeletons exist."
            title="LoadingState"
          />
        </Grid>
      </Grid>

      <EmptyState
        action={
          <Button color="primary" startIcon={<AddIcon />} variant="contained">
            Add item
          </Button>
        }
        description="A centered, warm-neutral empty state for tables, collections, and first-run product moments."
        title="Nothing to show yet"
      />
    </Stack>
  );
}
