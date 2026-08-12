import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';

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
        <Typography color="text.secondary" textAlign="center" variant="body2">
          New to Schedow? <Link component={RouterLink} to="/register">Create an account</Link>
        </Typography>
      </Stack>
    </AuthPageShell>
  );
}
