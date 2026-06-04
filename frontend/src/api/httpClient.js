export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001/api/v1';

export const httpClient = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? 'Request failed.');
  }

  return data;
};
