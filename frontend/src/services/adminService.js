import { httpClient } from '../api/httpClient.js';

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const getAdminStats = () => httpClient('/admin/stats');

export const getAdminTasks = (filters) => httpClient(`/admin/tasks${buildQueryString(filters)}`);

export const createAdminTask = (payload) =>
  httpClient('/admin/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateAdminTask = (taskId, payload) =>
  httpClient(`/admin/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteAdminTask = (taskId) =>
  httpClient(`/admin/tasks/${taskId}`, {
    method: 'DELETE'
  });

export const getAdminEmployees = () => httpClient('/admin/employees');

export const createAdminEmployee = (payload) =>
  httpClient('/admin/employees', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateAdminEmployee = (employeeId, payload) =>
  httpClient(`/admin/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteAdminEmployee = (employeeId) =>
  httpClient(`/admin/employees/${employeeId}`, {
    method: 'DELETE'
  });
