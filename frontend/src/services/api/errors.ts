import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Please try again.'): string {
  if (isAxiosError(error)) {
    const responseData: unknown = error.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    if (isRecord(responseData)) {
      const message = responseData.message ?? responseData.error ?? responseData.detail;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
