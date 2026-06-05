import { httpClient } from '../api/httpClient.js';

export const getEmployeeTasks = () => httpClient('/employee/tasks');

export const markEmployeeTaskDone = (taskId, payload) =>
  httpClient(`/employee/tasks/${taskId}/done`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const markEmployeeTaskNotDone = (taskId, payload) =>
  httpClient(`/employee/tasks/${taskId}/not-done`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
