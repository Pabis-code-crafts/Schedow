import { alpha, createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const warmNeutral = {
  50: '#fbf8f1',
  100: '#f4eee3',
  200: '#e8ddcb',
  300: '#d7c8b3',
  400: '#b9a68d',
  500: '#927d63',
  600: '#6f604d',
  700: '#51483b',
  800: '#363127',
  900: '#211e18',
};

const deepGreen = {
  light: '#2f6f57',
  main: '#174d3b',
  dark: '#0f3428',
};

const olive = {
  light: '#b5bd83',
  main: '#7f8b4c',
  dark: '#596332',
};

const subtleShadows = [
  'none',
  `0 1px 2px ${alpha(warmNeutral[900], 0.06)}, 0 1px 1px ${alpha(warmNeutral[900], 0.04)}`,
  `0 4px 10px ${alpha(warmNeutral[900], 0.07)}`,
  `0 8px 18px ${alpha(warmNeutral[900], 0.08)}`,
  `0 12px 28px ${alpha(warmNeutral[900], 0.1)}`,
  `0 16px 36px ${alpha(warmNeutral[900], 0.11)}`,
  `0 20px 44px ${alpha(warmNeutral[900], 0.12)}`,
] as const;

const shadows: Shadows = [
  'none',
  subtleShadows[1],
  subtleShadows[2],
  subtleShadows[3],
  subtleShadows[4],
  subtleShadows[5],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
  subtleShadows[6],
];

export const theme = createTheme({
  spacing: 8,
  shadows,
  palette: {
    mode: 'light',
    primary: {
      ...deepGreen,
      contrastText: '#ffffff',
    },
    secondary: {
      ...olive,
      contrastText: warmNeutral[900],
    },
    background: {
      default: warmNeutral[50],
      paper: '#fffaf0',
    },
    text: {
      primary: warmNeutral[900],
      secondary: warmNeutral[600],
    },
    divider: alpha(warmNeutral[700], 0.12),
    success: {
      light: '#7ccf9a',
      main: '#2f9e5f',
      dark: '#1f6f43',
      contrastText: '#ffffff',
    },
    warning: {
      light: '#f4c96d',
      main: '#c88a1a',
      dark: '#8f5f0f',
      contrastText: warmNeutral[900],
    },
    error: {
      light: '#ef8d83',
      main: '#c8493d',
      dark: '#8f2d25',
      contrastText: '#ffffff',
    },
    info: {
      light: '#8abbd8',
      main: '#327fa6',
      dark: '#225b78',
      contrastText: '#ffffff',
    },
    grey: warmNeutral,
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 750,
      lineHeight: 1.12,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 750,
      lineHeight: 1.18,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 720,
      lineHeight: 1.22,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.28,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.32,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.45,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.58,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.45,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: warmNeutral[50],
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 18px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          border: `1px solid ${alpha(warmNeutral[700], 0.1)}`,
          boxShadow: shadows[2],
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundImage: 'none',
          backgroundColor: '#fffaf0',
          boxShadow: shadows[5],
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: alpha('#fffaf0', 0.92),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(warmNeutral[700], 0.1)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: warmNeutral[100],
          borderColor: alpha(warmNeutral[700], 0.12),
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
});
