import { useMemo, useState, type PropsWithChildren } from 'react';

import { AuthContext } from '@/contexts/auth/context';
import type { AuthContextValue, AuthState, AuthUser } from '@/contexts/auth/types';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/utils/tokenStorage';

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const accessToken = getAccessToken();

    return {
      accessToken,
      user: null,
      isAuthenticated: Boolean(accessToken),
    };
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      loginWithToken: (accessToken: string, user: AuthUser | null = null) => {
        setAccessToken(accessToken);
        setAuthState({
          accessToken,
          user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        clearAccessToken();
        setAuthState({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: AuthUser | null) => {
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
