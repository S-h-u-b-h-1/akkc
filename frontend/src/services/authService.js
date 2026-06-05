import { httpClient } from '../api/httpClient.js';

export const adminLogin = (credentials) =>
  httpClient('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

export const adminSignup = (payload) =>
  httpClient('/admin/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const employeeLogin = (credentials) =>
  httpClient('/employee/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
