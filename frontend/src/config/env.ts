type AppEnv = {
  apiBaseUrl: string;
  appName: string;
};

const requireEnv = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env: AppEnv = {
  apiBaseUrl: requireEnv(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL'),
  appName: import.meta.env.VITE_APP_NAME || 'Schedow',
};
