export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
});

export const API_MESSAGES = Object.freeze({
  HEALTH_OK: 'Service is healthy.',
  ROUTE_NOT_FOUND: 'Route not found.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  UNAUTHORIZED: 'Authentication is required.',
  FORBIDDEN: 'You do not have permission to perform this action.'
});

export const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
});
