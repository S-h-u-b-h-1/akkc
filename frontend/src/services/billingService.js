import { api } from './api.js';

export const getEligibleTasksForBilling = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.clientName) query.append('clientName', filters.clientName);
  if (filters.employeeId) query.append('employeeId', filters.employeeId);
  if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) query.append('dateTo', filters.dateTo);

  const response = await api.get(`/admin/billing/eligible-tasks?${query.toString()}`);
  return response.data;
};

export const createBill = async (taskIds) => {
  const response = await api.post('/admin/billing/bills', { taskIds });
  return response.data;
};

export const getBills = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.clientName) query.append('clientName', filters.clientName);
  if (filters.status) query.append('status', filters.status);
  if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) query.append('dateTo', filters.dateTo);

  const response = await api.get(`/admin/billing/bills?${query.toString()}`);
  return response.data;
};

export const getBillById = async (id) => {
  const response = await api.get(`/admin/billing/bills/${id}`);
  return response.data;
};

export const deleteBill = async (id) => {
  const response = await api.delete(`/admin/billing/bills/${id}`);
  return response.data;
};

export const sendBillEmail = async (id) => {
  const response = await api.post(`/admin/billing/bills/${id}/send-email`);
  return response.data;
};
