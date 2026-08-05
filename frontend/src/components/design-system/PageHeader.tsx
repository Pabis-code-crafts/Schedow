import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function PageHeader({ actions, eyebrow, subtitle, title }: PageHeaderProps) {
  return (
    <Stack
      alignItems={{ xs: 'flex-start', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      spacing={3}
    >
      <Box sx={{ maxWidth: 760 }}>
        {eyebrow ? (
          <Typography color="primary.main" mb={1} variant="subtitle2">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography color="text.primary" variant="h2">
          {title}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" mt={1.5} variant="body1">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
    </Stack>
  );
}
