import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = 'Loading',
  description = 'Preparing the latest information.',
}: LoadingStateProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 4,
        boxShadow: 1,
        display: 'flex',
        justifyContent: 'center',
        minHeight: 220,
        p: 4,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress color="primary" size={36} thickness={4} />
        <Box>
          <Typography color="text.primary" variant="subtitle1">
            {title}
          </Typography>
          <Typography color="text.secondary" mt={0.5} variant="body2">
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
