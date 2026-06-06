import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { TASK_STATUSES } from '../constants/task.js';
import { findActiveEmployeeByAdmin } from '../repositories/employeeRepository.js';
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

const assertEmployeeCanReceiveTask = async ({ employeeId, adminId }) => {
  const employee = await findActiveEmployeeByAdmin({ id: employeeId, adminId });

  if (!employee) {
    throw new AppError(API_MESSAGES.EMPLOYEE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return employee;
};

const assertTaskExistsForAdmin = async ({ taskId, adminId }) => {
  const task = await findTaskByAdmin({ id: taskId, adminId });

  if (!task) {
    throw new AppError(API_MESSAGES.TASK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return task;
};

export const createAdminTask = async ({ adminId, payload }) => {
  await assertEmployeeCanReceiveTask({ employeeId: payload.employeeId, adminId });

  const today = todayDateOnly();
  const task = await createTask({
    title: payload.title,
    domain: payload.domain,
    clientName: payload.clientName,
    status: TASK_STATUSES.PENDING,
    isHighPriority: payload.isHighPriority ?? false,
    assignedDate: today,
    dueDate: toDateOnly(payload.dueDate),
    assignedEmployeeId: payload.employeeId,
    createdByAdminId: adminId
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
  const task = await assertTaskExistsForAdmin({ taskId, adminId });

  return serializeTask(task, today);
};

export const updateAdminTask = async ({ adminId, taskId, payload }) => {
  await assertTaskExistsForAdmin({ taskId, adminId });

  if (payload.employeeId) {
    await assertEmployeeCanReceiveTask({ employeeId: payload.employeeId, adminId });
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

  const task = await updateTask({ id: taskId, data });

  return serializeTask(task, today);
};

export const deleteAdminTask = async ({ adminId, taskId }) => {
  await assertTaskExistsForAdmin({ taskId, adminId });

  const task = await deleteTask(taskId);

  return serializeTask(task);
};

const createStatusSummary = () => ({
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  notDoneTasks: 0,
  delayedTasks: 0,
  highPriorityTasks: 0
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

export const getAdminStats = async ({ adminId }) => {
  const today = todayDateOnly();
  const tasks = await listTasksForAdminStats(adminId);
  const summary = createStatusSummary();
  const clientGroups = new Map();
  const employeeGroups = new Map();

  tasks.forEach((task) => {
    const effectiveStatus = getEffectiveTaskStatus(task, today);
    incrementStatusSummary(summary, task, effectiveStatus);
    incrementGroup(clientGroups, task.clientName, task.clientName, task, today);
    const employeeLabel = task.assignedEmployee?.name ?? 'Unknown';
    incrementGroup(employeeGroups, task.assignedEmployeeId, employeeLabel, task, today);
  });

  return {
    ...summary,
    tasksByClient: Array.from(clientGroups.values()),
    tasksByEmployee: Array.from(employeeGroups.values())
  };
};
