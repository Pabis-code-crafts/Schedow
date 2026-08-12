import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';

import { AuthPageShell, Button, Stack, TextField, Typography, authTextFieldSx } from '@/pages/AuthPageShell';
import { useAuth } from '@/hooks/useAuth';
import { useRegisterUser } from '@/features/users/queries';
import type { RegisterUserPayload, UserRole } from '@/features/users/types';
import { getApiErrorMessage } from '@/services/api';

const initialForm: RegisterUserPayload = {
  name: '',
  email: '',
  password: '',
  role: 'SUPERVISOR',
  site: 'Hatfield',
  contractedHours: 0,
};

export function RegisterPage() {
  const [form, setForm] = useState<RegisterUserPayload>(initialForm);
  const auth = useAuth();
  const register = useRegisterUser();
  const navigate = useNavigate();

  if (auth.isAuthenticated) {
    return <Navigate replace to="/schedule" />;
  }

  const update = <TKey extends keyof RegisterUserPayload>(key: TKey, value: RegisterUserPayload[TKey]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    register.mutate(form, {
      onSuccess: () => navigate('/login', { replace: true }),
    });
  };

  return (
    <AuthPageShell title="Create account" subtitle="Register a Schedow user. Passwords are hashed before storage.">
      <Stack component="form" spacing={2} onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <TextField autoComplete="name" autoFocus fullWidth label="Name" onChange={(event) => update('name', event.target.value)} required sx={authTextFieldSx} value={form.name} />
        <TextField autoComplete="email" fullWidth label="Email" onChange={(event) => update('email', event.target.value)} required sx={authTextFieldSx} type="email" value={form.email} />
        <TextField autoComplete="new-password" fullWidth helperText="Minimum 8 characters" label="Password" onChange={(event) => update('password', event.target.value)} required sx={authTextFieldSx} type="password" value={form.password} />
        <TextField fullWidth label="Role" onChange={(event) => update('role', event.target.value as UserRole)} select sx={authTextFieldSx} value={form.role}>
          <MenuItem disabled value="ADMIN">Admin - Coming Soon</MenuItem>
          <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
          <MenuItem disabled value="WORKER">Worker - Coming Soon</MenuItem>
        </TextField>
        <TextField fullWidth label="Site" onChange={(event) => update('site', event.target.value)} required sx={authTextFieldSx} value={form.site} />
        <TextField fullWidth label="Contracted hours" onChange={(event) => update('contractedHours', Number(event.target.value))} required sx={authTextFieldSx} type="number" value={form.contractedHours} />
        {register.error ? <Alert severity="error">{getApiErrorMessage(register.error, 'Could not register.')}</Alert> : null}
        {register.isSuccess ? <Alert severity="success">Account created. You can now log in.</Alert> : null}
        <Button disabled={register.isPending || !form.name || !form.email || form.password.length < 8} type="submit" variant="contained">{register.isPending ? 'Creating account...' : 'Create account'}</Button>
        <Typography color="text.secondary" textAlign="center" variant="body2">
          Already have an account? <Link component={RouterLink} to="/login">Log in</Link>
        </Typography>
      </Stack>
    </AuthPageShell>
  );
}

