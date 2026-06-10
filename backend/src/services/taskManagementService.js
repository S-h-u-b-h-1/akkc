import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { TASK_STATUSES } from '../constants/task.js';
import { findEmployeeByAdmin } from '../repositories/employeeRepository.js';
import {
  createTask,
  deleteTask,
  findTaskByAdmin,
  listTasksByAdmin,
  listTasksForAdminStats,
  updateTask
} from '../repositories/taskRepository.js';
import { AppError } from '../utils/appError.js';
import { toDateOnly, todayDateOnly } from '../utils/date.js';
import { getEffectiveTaskStatus, serializeTask } from '../utils/taskPresenter.js';

const assertEmployeeCanReceiveTask = async ({ employeeId }) => {
  const employee = await findEmployeeByAdmin({ id: employeeId });

  if (!employee) {
    throw new AppError(API_MESSAGES.EMPLOYEE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return employee;
};

const assertTaskExistsForAdmin = async ({ id }) => {
  const task = await findTaskByAdmin({ id });

  if (!task) {
    throw new AppError(API_MESSAGES.TASK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return task;
};

export const createAdminTask = async ({ adminId, payload }) => {
  await assertEmployeeCanReceiveTask({ employeeId: payload.employeeId });

  const today = todayDateOnly();
  const isBillable = payload.isBillable ?? false;

  const task = await createTask({
    title: payload.title,
    domain: payload.domain,
    clientName: payload.clientName,
    clientEmail: payload.clientEmail || null,
    status: TASK_STATUSES.PENDING,
    isHighPriority: payload.isHighPriority ?? false,
    isBillable,
    billAmount: isBillable ? payload.billAmount : null,
    billingApprovalStatus: isBillable ? 'PENDING_EMPLOYEE_CONFIRMATION' : 'NOT_REQUIRED',
    assignedDate: today,
    dueDate: toDateOnly(payload.dueDate),
    assignedEmployeeId: payload.employeeId,
    createdByAdminId: adminId,
    billingEntityId: isBillable ? payload.billingEntityId : null
  });

  return serializeTask(task, today);
};

export const listAdminTasks = async ({ adminId, filters = {} }) => {
  const today = todayDateOnly();
  const normalizedFilters = {
    ...filters,
    date: filters.date ? toDateOnly(filters.date) : undefined,
    isHighPriority:
      filters.isHighPriority === undefined ? undefined : filters.isHighPriority === 'true',
    today
  };
  const tasks = await listTasksByAdmin({ adminId, filters: normalizedFilters });

  return tasks.map((task) => serializeTask(task, today));
};

export const getAdminTask = async ({ adminId, taskId }) => {
  const today = todayDateOnly();
  const task = await assertTaskExistsForAdmin({ id: taskId });

  return serializeTask(task, today);
};

export const updateAdminTask = async ({ adminId, taskId, payload }) => {
  await assertTaskExistsForAdmin({ id: taskId });

  if (payload.employeeId) {
    await assertEmployeeCanReceiveTask({ employeeId: payload.employeeId });
  }

  const data = {};
  const today = todayDateOnly();

  if (payload.title !== undefined) {
    data.title = payload.title;
  }

  if (payload.domain !== undefined) {
    data.domain = payload.domain;
  }

  if (payload.clientName !== undefined) {
    data.clientName = payload.clientName;
  }

  if (payload.employeeId !== undefined) {
    data.assignedEmployeeId = payload.employeeId;
  }

  if (payload.dueDate !== undefined) {
    data.dueDate = toDateOnly(payload.dueDate);
  }

  if (payload.status !== undefined) {
    data.status = payload.status;
  }

  if (payload.isHighPriority !== undefined) {
    data.isHighPriority = payload.isHighPriority;
  }

  if (payload.isBillable !== undefined) {
    data.isBillable = payload.isBillable;
    data.billingApprovalStatus = data.isBillable ? 'PENDING_EMPLOYEE_CONFIRMATION' : 'NOT_REQUIRED';
    if (!data.isBillable) {
      data.billAmount = null;
    }
  }

  if (payload.billAmount !== undefined && payload.isBillable !== false) {
    data.billAmount = payload.billAmount;
  }

  if (payload.clientEmail !== undefined) {
    data.clientEmail = payload.clientEmail === '' ? null : payload.clientEmail;
  }

  if (payload.billingEntityId !== undefined && payload.isBillable !== false) {
    data.billingEntityId = payload.billingEntityId;
  }
  
  if (data.isBillable === false) {
    data.billingEntityId = null;
  }

  const task = await updateTask({ id: taskId, data });

  return serializeTask(task, today);
};

export const deleteAdminTask = async ({ taskId }) => {
  await assertTaskExistsForAdmin({ id: taskId });

  const task = await deleteTask(taskId);

  return serializeTask(task);
};

const createStatusSummary = () => ({
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  notDoneTasks: 0,
  delayedTasks: 0,
  highPriorityTasks: 0,
  unbilledTasks: 0,
  unbilledValue: 0,
  billedValue: 0
});

const incrementStatusSummary = (summary, task, effectiveStatus) => {
  summary.totalTasks += 1;

  if (task.isHighPriority) {
    summary.highPriorityTasks += 1;
  }

  if (effectiveStatus === TASK_STATUSES.PENDING) {
    summary.pendingTasks += 1;
  }

  if (effectiveStatus === TASK_STATUSES.COMPLETED) {
    summary.completedTasks += 1;
  }

  if (effectiveStatus === TASK_STATUSES.NOT_DONE) {
    summary.notDoneTasks += 1;
  }

  if (effectiveStatus === TASK_STATUSES.DELAYED) {
    summary.delayedTasks += 1;
  }

  if (task.billItem) {
    summary.billedValue += Number(task.billItem.amount || 0);
  } else if (
    task.status === TASK_STATUSES.COMPLETED &&
    task.isBillable &&
    task.billingApprovalStatus === 'APPROVED_FOR_BILLING'
  ) {
    summary.unbilledTasks += 1;
    summary.unbilledValue += Number(task.billAmount || 0);
  }
};

const incrementGroup = (groups, key, label, task, today) => {
  if (!groups.has(key)) {
    groups.set(key, {
      id: key,
      name: label,
      ...createStatusSummary()
    });
  }

  incrementStatusSummary(groups.get(key), task, getEffectiveTaskStatus(task, today));
};

export const getAdminStats = async ({ adminId, filters = {} }) => {
  const today = todayDateOnly();
  const normalizedFilters = {
    ...filters,
    date: filters.date ? toDateOnly(filters.date) : undefined,
    isHighPriority:
      filters.isHighPriority === undefined ? undefined : filters.isHighPriority === 'true',
    today
  };
  const tasks = await listTasksByAdmin({ adminId, filters: normalizedFilters });
  const summary = createStatusSummary();
  const clientGroups = new Map();
  const employeeGroups = new Map();

  tasks.forEach((task) => {
    const effectiveStatus = getEffectiveTaskStatus(task, today);
    incrementStatusSummary(summary, task, effectiveStatus);
    incrementGroup(clientGroups, task.clientName, task.clientName, task, today);
    const employeeLabel = task.assignedEmployee?.username ?? 'Unknown';
    incrementGroup(employeeGroups, task.assignedEmployeeId, employeeLabel, task, today);
  });

  return {
    ...summary,
    tasksByClient: Array.from(clientGroups.values()),
    tasksByEmployee: Array.from(employeeGroups.values())
  };
};
