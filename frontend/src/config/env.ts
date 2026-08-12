type AppEnv = {
  apiBaseUrl: string;
  appName: string;
  registrationEnabled: boolean;
};

const requireEnv = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

export const env: AppEnv = {
  apiBaseUrl: requireEnv(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL'),
  appName: import.meta.env.VITE_APP_NAME || 'Schedow',
  registrationEnabled: parseBoolean(import.meta.env.VITE_REGISTRATION_ENABLED, true),
};
