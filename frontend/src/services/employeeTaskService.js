import { httpClient } from '../api/httpClient.js';

export const getEmployeeTasks = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query.append(key, value);
    }
  });
  
  const queryString = query.toString();
  return httpClient(`/employee/tasks${queryString ? `?${queryString}` : ''}`);
};

export const markEmployeeTaskDone = (taskId, payload) =>
  httpClient(`/employee/tasks/${taskId}/done`, {
    method: 'PUT',
    body: payload instanceof FormData ? payload : JSON.stringify(payload)
  });

export const markEmployeeTaskNotDone = (taskId, payload) =>
  httpClient(`/employee/tasks/${taskId}/not-done`, {
    method: 'PUT',
    body: payload instanceof FormData ? payload : JSON.stringify(payload)
  });
