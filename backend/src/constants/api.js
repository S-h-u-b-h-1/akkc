export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
});

export const API_MESSAGES = Object.freeze({
  HEALTH_OK: 'Service is healthy.',
  ADMIN_CREATED: 'Admin account created successfully.',
  ADMINS_FETCHED: 'Admin accounts fetched successfully.',
  ADMIN_UPDATED: 'Admin account updated successfully.',
  ADMIN_DELETED: 'Admin account deleted successfully.',
  ADMIN_PERMANENTLY_DELETED: 'Admin account permanently deleted successfully.',
  ARCHIVED_ADMINS_FETCHED: 'Archived admin accounts fetched successfully.',
  ARCHIVED_EMPLOYEES_FETCHED: 'Archived staff accounts fetched successfully.',
  EMPLOYEE_CREATED: 'Employee created successfully.',
  EMPLOYEES_FETCHED: 'Employees fetched successfully.',
  EMPLOYEE_UPDATED: 'Employee updated successfully.',
  EMPLOYEE_DELETED: 'Employee deleted successfully.',
  EMPLOYEE_PERMANENTLY_DELETED: 'Staff account permanently deleted successfully.',
  TASK_CREATED: 'Task created successfully.',
  TASKS_FETCHED: 'Tasks fetched successfully.',
  TASK_FETCHED: 'Task fetched successfully.',
  TASK_UPDATED: 'Task updated successfully.',
  TASK_DELETED: 'Task deleted successfully.',
  EMPLOYEE_TASKS_FETCHED: 'Employee tasks fetched successfully.',
  TASK_MARKED_DONE: 'Task marked as done successfully.',
  TASK_MARKED_NOT_DONE: 'Task marked as not done successfully.',
  ADMIN_STATS_FETCHED: 'Admin stats fetched successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  CURRENT_USER_FETCHED: 'Current user fetched successfully.',
  ROUTE_NOT_FOUND: 'Route not found.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  UNAUTHORIZED: 'Authentication is required.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INVALID_CREDENTIALS: 'Invalid credentials.',
  USERNAME_ALREADY_EXISTS: 'An account with this username already exists.',
  ADMIN_NOT_FOUND: 'Admin account not found.',
  EMPLOYEE_NOT_FOUND: 'Employee not found.',
  TASK_NOT_FOUND: 'Task not found.',
  VALIDATION_FAILED: 'Validation failed.',
  USER_NOT_FOUND: 'Authenticated user was not found.',
  CANNOT_DELETE_SELF: 'You cannot delete your own admin account.'
});

export const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE'
});
