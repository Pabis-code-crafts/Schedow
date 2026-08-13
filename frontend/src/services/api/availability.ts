import { isAxiosError } from 'axios';

import { httpClient } from '@/services/api/httpClient';

const unavailableStatuses = new Set([502, 503, 504]);

export function isBackendUnavailableError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return unavailableStatuses.has(error.response.status);
}

export async function checkBackendAvailability(): Promise<boolean> {
  try {
    await httpClient.get('/api/v1/users/test', { timeout: 3000 });
    return true;
  } catch (error) {
    return !isBackendUnavailableError(error);
  }
}
