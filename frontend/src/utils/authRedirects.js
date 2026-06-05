import { ROUTES, USER_ROLES } from '../constants/routes.js';

export const getDashboardRouteForRole = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return ROUTES.ADMIN_DASHBOARD;
  }

  if (role === USER_ROLES.EMPLOYEE) {
    return ROUTES.EMPLOYEE_DASHBOARD;
  }

  return ROUTES.ADMIN_LOGIN;
};

export const getLoginRouteForRole = (role) => {
  if (role === USER_ROLES.EMPLOYEE) {
    return ROUTES.EMPLOYEE_LOGIN;
  }

  return ROUTES.ADMIN_LOGIN;
};
