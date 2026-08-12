const accessTokenKey = 'schedow.accessToken';
const authUserKey = 'schedow.authUser';

export type StoredAuthUser = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
};

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

export const getStoredAuthUser = (): StoredAuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(authUserKey);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuthUser;
  } catch {
    window.localStorage.removeItem(authUserKey);
    return null;
  }
};

export const setStoredAuthUser = (user: StoredAuthUser | null): void => {
  if (user) {
    window.localStorage.setItem(authUserKey, JSON.stringify(user));
    return;
  }

  window.localStorage.removeItem(authUserKey);
};

export const clearAuthStorage = (): void => {
  clearAccessToken();
  window.localStorage.removeItem(authUserKey);
};
