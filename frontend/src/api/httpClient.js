import { STORAGE_KEYS } from '../constants/routes.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001/api';

export const httpClient = async (path, options = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const authorizationHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authorizationHeader,
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error(data?.message ?? 'Request failed.');
    err.errors = data?.errors;
    throw err;
  }

  return data;
};
