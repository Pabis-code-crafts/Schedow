const accessTokenKey = 'schedow.accessToken';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(accessTokenKey);
};

export const setAccessToken = (token: string): void => {
  window.localStorage.setItem(accessTokenKey, token);
};

export const clearAccessToken = (): void => {
  window.localStorage.removeItem(accessTokenKey);
};
