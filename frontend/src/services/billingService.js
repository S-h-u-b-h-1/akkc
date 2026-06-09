import { httpClient } from '../api/httpClient.js';

export const getEntities = async () => {
  return httpClient('/admin/billing/entities');
};

export const updateEntity = async (id, data) => {
  return httpClient(`/admin/billing/entities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const getEligibleTasksForBilling = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.clientName) query.append('clientName', filters.clientName);
  if (filters.employeeId) query.append('employeeId', filters.employeeId);
  if (filters.dateFrom) query.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) query.append('dateTo', filters.dateTo);

  return httpClient(`/admin/billing/eligible-tasks?${query.toString()}`);
};

export const createBill = async (taskIds, billingEntityId, billDate) => {
  return httpClient('/admin/billing/bills', {
    method: 'POST',
    body: JSON.stringify({ taskIds, billingEntityId, billDate })
  });
};

export const createManualBill = async (data) => {
  return httpClient('/admin/billing/bills/manual', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const createClubbedBill = async (data) => {
  return httpClient('/admin/billing/bills/clubbed', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateBill = async (id, data) => {
  return httpClient(`/admin/billing/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const getBills = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.clientName) query.append('clientName', filters.clientName);
  if (filters.status) query.append('status', filters.status);
  if (filters.sourceType) query.append('sourceType', filters.sourceType);
  if (filters.billingEntityId) query.append('billingEntityId', filters.billingEntityId);
  if (filters.isUnclubbed) query.append('isUnclubbed', filters.isUnclubbed);
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
