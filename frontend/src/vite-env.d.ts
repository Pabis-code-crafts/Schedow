/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_REGISTRATION_ENABLED?: string;
  readonly VITE_DEMO_ACCOUNT_EMAIL?: string;
  readonly VITE_DEMO_ACCOUNT_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

