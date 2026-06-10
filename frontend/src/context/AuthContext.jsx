import { createContext, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants/routes.js';

export const AuthContext = createContext(null);

const parseStoredUser = () => {
  const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  const [user, setUser] = useState(parseStoredUser);

  const completeAuth = ({ token: accessToken, user: authenticatedUser }) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authenticatedUser));
    setToken(accessToken);
    setUser(authenticatedUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token && user?.role),
      completeAuth,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
