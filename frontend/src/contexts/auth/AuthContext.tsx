import { useMemo, useState, type PropsWithChildren } from 'react';

import { AuthContext } from '@/contexts/auth/context';
import type { AuthContextValue, AuthState, AuthUser } from '@/contexts/auth/types';
import { clearAuthStorage, getAccessToken, getStoredAuthUser, setAccessToken, setStoredAuthUser } from '@/utils/tokenStorage';

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const accessToken = getAccessToken();

    return {
      accessToken,
      user: accessToken ? getStoredAuthUser() : null,
      isAuthenticated: Boolean(accessToken),
    };
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      loginWithToken: (accessToken: string, user: AuthUser | null = null) => {
        setAccessToken(accessToken);
        setStoredAuthUser(user);
        setAuthState({
          accessToken,
          user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        clearAuthStorage();
        setAuthState({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: AuthUser | null) => {
        setStoredAuthUser(user);
        setAuthState((current) => ({
          ...current,
          user,
        }));
      },
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
