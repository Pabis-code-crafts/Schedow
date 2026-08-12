import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { PropsWithChildren } from 'react';

import { AppCard } from '@/components/design-system';
import { env } from '@/config/env';

export function AuthPageShell({ children, subtitle, title }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <Box sx={{ alignItems: 'center', bgcolor: 'background.default', display: 'flex', minHeight: '100vh', px: 2, py: 4 }}>
      <Stack alignItems="center" spacing={3} sx={{ mx: 'auto', width: '100%', maxWidth: 440 }}>
        <Stack alignItems="center" spacing={1.25}>
          <Box sx={{ alignItems: 'center', bgcolor: 'primary.main', borderRadius: '50%', boxShadow: 3, color: 'primary.contrastText', display: 'flex', height: 52, justifyContent: 'center', width: 52 }}>
            <AutoAwesomeIcon />
          </Box>
          <Typography sx={{ fontSize: 28, fontWeight: 850 }}>{env.appName}</Typography>
        </Stack>
        <AppCard sx={{ width: '100%', boxShadow: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography component="h1" sx={{ fontSize: 28, fontWeight: 850 }}>{title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">{subtitle}</Typography>
            </Box>
            {children}
          </Stack>
        </AppCard>
        <Typography color="text.secondary" textAlign="center" variant="caption">
          Secure access for Schedow scheduling operations.
        </Typography>
      </Stack>
    </Box>
  );
}

export const authTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.7),
  },
};

export { Button, Stack, TextField, Typography };

