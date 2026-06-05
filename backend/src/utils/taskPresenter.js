import { TASK_STATUSES } from '../constants/task.js';
import { todayDateOnly } from './date.js';

export const getEffectiveTaskStatus = (task, today = todayDateOnly()) => {
  if (task.status === TASK_STATUSES.PENDING && task.dueDate < today) {
    return TASK_STATUSES.DELAYED;
  }

  return task.status;
};

export const serializeTask = (task, today = todayDateOnly()) => {
  const effectiveStatus = getEffectiveTaskStatus(task, today);

  return {
    ...task,
    status: effectiveStatus,
    storedStatus: task.status,
    effectiveStatus
  };
};
