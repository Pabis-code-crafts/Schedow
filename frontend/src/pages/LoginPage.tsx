import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthPageShell, Button, Stack, TextField, Typography, authTextFieldSx } from '@/pages/AuthPageShell';
import { useAuth } from '@/hooks/useAuth';
import { useLoginUser } from '@/features/users/queries';
import { checkBackendAvailability, getApiErrorMessage, isBackendUnavailableError } from '@/services/api';

const DEMO_ACCOUNT_EMAIL = 'demo-supervisor@example.com';
const DEMO_ACCOUNT_PASSWORD = 'SchedowDemo2026!';
const DEMO_CREDENTIALS = `Email: ${DEMO_ACCOUNT_EMAIL}
Password: ${DEMO_ACCOUNT_PASSWORD}`;
const MOBILE_NOTICE_STORAGE_KEY = 'schedow-mobile-notice-dismissed';

type CopiedTarget = 'email' | 'password' | 'credentials' | null;
type AvailabilityState = 'checking' | 'available' | 'unavailable';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);
  const [availability, setAvailability] = useState<AvailabilityState>('checking');
  const [mobileNoticeDismissed, setMobileNoticeDismissed] = useState(() => readMobileNoticeDismissed());
  const auth = useAuth();
  const login = useLoginUser();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallViewport = useMediaQuery(theme.breakpoints.down('sm'));
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/schedule';

  useEffect(() => {
    let active = true;

    void checkBackendAvailability().then((available) => {
      if (active) {
        setAvailability(available ? 'available' : 'unavailable');
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (auth.isAuthenticated) {
    return <Navigate replace to={from} />;
  }

  const copyText = async (value: string, target: Exclude<CopiedTarget, null>) => {
    await navigator.clipboard.writeText(value);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget((current) => (current === target ? null : current)), 1800);
  };

  const dismissMobileNotice = () => {
    window.sessionStorage.setItem(MOBILE_NOTICE_STORAGE_KEY, 'true');
    setMobileNoticeDismissed(true);
  };

  const submit = () => {
    login.mutate(
      { email, password },
      {
        onError: (error) => {
          if (isBackendUnavailableError(error)) {
            setAvailability('unavailable');
          }
        },
        onSuccess: (response) => {
          setAvailability('available');
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

  const showUnavailableMessage = availability === 'unavailable' || isBackendUnavailableError(login.error);

  return (
    <>
      <AuthPageShell
        sideContent={<DemoCredentialsCard copiedTarget={copiedTarget} onCopy={(value, target) => void copyText(value, target)} />}
        title="Sign in"
        subtitle="Use your Schedow credentials to access the scheduling workspace."
      >
        <Stack component="form" spacing={2.25} onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <MobileBestViewedNotice open={isSmallViewport && !mobileNoticeDismissed} onContinue={dismissMobileNotice} />
          {showUnavailableMessage ? <MaintenanceNotice /> : null}
          <TextField autoComplete="email" autoFocus fullWidth label="Email" onChange={(event) => setEmail(event.target.value)} required sx={authTextFieldSx} type="email" value={email} />
          <TextField autoComplete="current-password" fullWidth label="Password" onChange={(event) => setPassword(event.target.value)} required sx={authTextFieldSx} type="password" value={password} />
          {login.error && !isBackendUnavailableError(login.error) ? <Alert severity="error">{getApiErrorMessage(login.error, 'Could not log in.')}</Alert> : null}
          <Button disabled={login.isPending || !email || !password} type="submit" variant="contained">{login.isPending ? 'Signing in...' : 'Sign In'}</Button>
        </Stack>
      </AuthPageShell>
    </>
  );
}

function DemoCredentialsCard({ copiedTarget, onCopy }: { copiedTarget: CopiedTarget; onCopy: (value: string, target: Exclude<CopiedTarget, null>) => void }) {
  return (
    <Stack aria-label="Try the Demo credentials" spacing={2.25} sx={{ height: '100%', justifyContent: 'center' }}>
      <Box>
        <Typography component="h2" sx={{ fontSize: 24, fontWeight: 850 }}>Try the Demo</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
          Copy the credentials below and sign in as a Supervisor to explore Schedow.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        <CredentialRow copied={copiedTarget === 'email'} label="Email" value={DEMO_ACCOUNT_EMAIL} onCopy={() => onCopy(DEMO_ACCOUNT_EMAIL, 'email')} />
        <CredentialRow copied={copiedTarget === 'password'} label="Password" value={DEMO_ACCOUNT_PASSWORD} onCopy={() => onCopy(DEMO_ACCOUNT_PASSWORD, 'password')} />
      </Stack>

      <Button
        fullWidth
        onClick={() => onCopy(DEMO_CREDENTIALS, 'credentials')}
        startIcon={copiedTarget === 'credentials' ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
        variant="outlined"
      >
        {copiedTarget === 'credentials' ? 'Copied!' : 'Copy credentials'}
      </Button>

      <Typography color={copiedTarget ? 'success.main' : 'text.secondary'} sx={{ minHeight: 18 }} textAlign="center" variant="caption">
        {copiedTarget ? 'Copied!' : 'No registration is required.'}
      </Typography>
    </Stack>
  );
}

function CredentialRow({ copied, label, onCopy, value }: { copied: boolean; label: string; onCopy: () => void; value: string }) {
  return (
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.055),
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 1.5,
        py: 1.25,
      }}
    >
      <Stack alignItems="center" direction="row" spacing={1.25}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.2 }} variant="caption">{label}</Typography>
          <Typography noWrap sx={{ fontWeight: 800, mt: 0.35 }} variant="body2">{value}</Typography>
        </Box>
        <Tooltip title={copied ? 'Copied!' : `Copy ${label.toLowerCase()}`}>
          <IconButton aria-label={`Copy demo ${label.toLowerCase()}`} color={copied ? 'success' : 'primary'} onClick={onCopy} size="small">
            {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

function MobileBestViewedNotice({ onContinue, open }: { open: boolean; onContinue: () => void }) {
  const theme = useTheme();

  if (!open) {
    return null;
  }

  return (
    <Box
      role="status"
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 0.065),
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.18),
        borderRadius: 2,
        px: 2,
        py: 1.75,
      }}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography sx={{ fontWeight: 850 }} variant="subtitle2">Best viewed on a laptop or desktop</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
            Schedow is designed for a larger screen to give you the best scheduling experience. Please open Schedow on a laptop or desktop to explore the full demo.
          </Typography>
          <Typography sx={{ mt: 1, fontWeight: 700 }} variant="body2">
            Thanks for understanding!
          </Typography>
        </Box>
        <Button onClick={onContinue} size="small" variant="outlined">Continue anyway</Button>
      </Stack>
    </Box>
  );
}

function MaintenanceNotice() {
  return (
    <Alert severity="warning" sx={{ alignItems: 'flex-start' }}>
      <Typography sx={{ fontWeight: 850 }} variant="subtitle2">Schedow is temporarily unavailable</Typography>
      <Typography variant="body2">We're doing some maintenance and improvements.</Typography>
      <Typography variant="body2">Please check back in about an hour.</Typography>
      <Typography variant="body2">Thanks for your patience!</Typography>
    </Alert>
  );
}

function readMobileNoticeDismissed() {
  try {
    return window.sessionStorage.getItem(MOBILE_NOTICE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
