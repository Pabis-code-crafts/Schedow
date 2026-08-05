import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 4,
        boxShadow: 1,
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'secondary.light',
            borderRadius: 4,
            color: 'secondary.dark',
            display: 'flex',
            height: 64,
            justifyContent: 'center',
            width: 64,
          }}
        >
          {icon ?? <InboxOutlinedIcon fontSize="large" />}
        </Box>
        <Box sx={{ maxWidth: 480 }}>
          <Typography color="text.primary" variant="h5">
            {title}
          </Typography>
          {description ? (
            <Typography color="text.secondary" mt={1} variant="body2">
              {description}
            </Typography>
          ) : null}
        </Box>
        {action ? <Box>{action}</Box> : null}
      </Stack>
    </Box>
  );
}
