import { httpClient } from '../api/httpClient.js';

export const signIn = (credentials) =>
  httpClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
