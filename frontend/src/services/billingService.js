import { httpClient } from '../api/httpClient.js';

export const getEligibleTasksForBilling = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.clientName) query.append('clientName', filters.clientName);
  if (filters.employeeId) query.append('employeeId', filters.employeeId);
  if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) query.append('dateTo', filters.dateTo);

  return httpClient(`/admin/billing/eligible-tasks?${query.toString()}`);
};

export const createBill = async (taskIds) => {
  return httpClient('/admin/billing/bills', {
    method: 'POST',
    body: JSON.stringify({ taskIds })
  });
};

export const getBills = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.clientName) query.append('clientName', filters.clientName);
  if (filters.status) query.append('status', filters.status);
  if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) query.append('dateTo', filters.dateTo);

  return httpClient(`/admin/billing/bills?${query.toString()}`);
};

export const getBillById = async (id) => {
  return httpClient(`/admin/billing/bills/${id}`);
};

export const deleteBill = async (id) => {
  return httpClient(`/admin/billing/bills/${id}`, {
    method: 'DELETE'
  });
};

export const sendBillEmail = async (id) => {
  return httpClient(`/admin/billing/bills/${id}/send-email`, {
    method: 'POST'
  });
};
