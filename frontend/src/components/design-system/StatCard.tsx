import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement, ReactNode } from 'react';

import { AppCard } from '@/components/design-system/AppCard';

type StatTone = 'primary' | 'success' | 'warning' | 'error' | 'info';
type StatTrend = 'up' | 'down' | 'flat';

type StatCardProps = {
  title: string;
  value: string;
  helperText?: string;
  icon?: ReactNode;
  tone?: StatTone;
  trend?: {
    label: string;
    direction: StatTrend;
  };
};

const trendIcons: Record<StatTrend, ReactElement> = {
  up: <TrendingUpIcon fontSize="small" />,
  down: <TrendingDownIcon fontSize="small" />,
  flat: <TrendingFlatIcon fontSize="small" />,
};

export function StatCard({
  title,
  value,
  helperText,
  icon,
  tone = 'primary',
  trend,
}: StatCardProps) {
  return (
    <AppCard>
      <Stack spacing={2}>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
              {title}
            </Typography>
            <Typography color="text.primary" mt={0.5} variant="h4">
              {value}
            </Typography>
          </Box>
          {icon ? (
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: `${tone}.light`,
                borderRadius: 3,
                color: `${tone}.dark`,
                display: 'flex',
                flexShrink: 0,
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Stack>
        <Stack alignItems="center" direction="row" spacing={1}>
          {trend ? (
            <Chip
              color={tone}
              icon={trendIcons[trend.direction]}
              label={trend.label}
              size="small"
              variant="outlined"
            />
          ) : null}
          {helperText ? (
            <Typography color="text.secondary" variant="body2">
              {helperText}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </AppCard>
  );
}
