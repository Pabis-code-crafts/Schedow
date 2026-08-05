export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
};

export type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
};

export type AuthContextValue = AuthState & {
  loginWithToken: (accessToken: string, user?: AuthUser | null) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};
