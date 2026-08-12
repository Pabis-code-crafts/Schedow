import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { env } from '@/config/env';
import { AuthPageShell, Button, Stack, TextField, Typography, authTextFieldSx } from '@/pages/AuthPageShell';
import { useAuth } from '@/hooks/useAuth';
import { useLoginUser } from '@/features/users/queries';
import { getApiErrorMessage } from '@/services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const login = useLoginUser();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/schedule';

  if (auth.isAuthenticated) {
    return <Navigate replace to={from} />;
  }

  const submit = () => {
    login.mutate(
      { email, password },
      {
        onSuccess: (response) => {
          auth.loginWithToken(response.accessToken, {
            id: String(response.user.id),
            email: response.user.email,
            name: response.user.name,
            roles: [response.user.role],
          });
          navigate(from, { replace: true });
        },
      },
    );
  };

  return (
    <AuthPageShell title="Log in" subtitle="Use your Schedow credentials to access the scheduling workspace.">
      <Stack component="form" spacing={2.25} onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <TextField autoComplete="email" autoFocus fullWidth label="Email" onChange={(event) => setEmail(event.target.value)} required sx={authTextFieldSx} type="email" value={email} />
        <TextField autoComplete="current-password" fullWidth label="Password" onChange={(event) => setPassword(event.target.value)} required sx={authTextFieldSx} type="password" value={password} />
        {login.error ? <Alert severity="error">{getApiErrorMessage(login.error, 'Could not log in.')}</Alert> : null}
        <Button disabled={login.isPending || !email || !password} type="submit" variant="contained">{login.isPending ? 'Logging in...' : 'Log in'}</Button>
        {env.demoAccount ? (
          <Box
            aria-label="Demo account credentials"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography sx={{ color: 'primary.main', fontWeight: 800, mb: 0.75 }} variant="body2">Demo account</Typography>
            <Typography color="text.secondary" variant="body2">
              Email: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{env.demoAccount.email}</Box>
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Password: <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{env.demoAccount.password}</Box>
            </Typography>
          </Box>
        ) : null}
        {env.registrationEnabled ? (
          <Typography color="text.secondary" textAlign="center" variant="body2">
            New to Schedow? <Link component={RouterLink} to="/register">Create an account</Link>
          </Typography>
        ) : null}
      </Stack>
    </AuthPageShell>
  );
}
