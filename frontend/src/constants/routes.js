export const ROUTES = Object.freeze({
  ROOT: '/',
  ADMIN_ROOT: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ADMINS: '/admin/admins',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_TASKS: '/admin/tasks',
  ADMIN_BILLING: '/admin/billing',
  EMPLOYEE_ROOT: '/employee',
  EMPLOYEE_LOGIN: '/employee/login',
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_TASKS: '/employee/tasks'
});

export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'employee_task_management_token',
  AUTH_USER: 'employee_task_management_user'
});

export const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE'
});
