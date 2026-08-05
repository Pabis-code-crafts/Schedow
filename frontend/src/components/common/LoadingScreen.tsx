import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function LoadingScreen() {
  return (
    <Box
      alignItems="center"
      display="flex"
      justifyContent="center"
      minHeight="100vh"
      width="100%"
    >
      <CircularProgress aria-label="Loading" />
    </Box>
  );
}
