export const TASK_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  NOT_DONE: 'NOT_DONE',
  DELAYED: 'DELAYED'
});

export const TASK_STATUS_OPTIONS = Object.freeze([
  { label: 'Pending', value: TASK_STATUSES.PENDING },
  { label: 'Completed', value: TASK_STATUSES.COMPLETED },
  { label: 'Not done', value: TASK_STATUSES.NOT_DONE },
  { label: 'Delayed', value: TASK_STATUSES.DELAYED }
]);

export const TASK_PRIORITY_FILTER_OPTIONS = Object.freeze([
  { label: 'All priorities', value: '' },
  { label: 'High priority only', value: 'true' },
  { label: 'Standard priority only', value: 'false' }
]);
