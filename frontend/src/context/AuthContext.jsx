import { useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants/routes.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));

  const login = (accessToken) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
