import { AppError } from '../utils/appError.js';

export const createEmployee = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const employee = await createAdminEmployee({
    adminId: req.user.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: API_MESSAGES.EMPLOYEE_CREATED,
    data: { employee }
  });
};

export const createTask = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const task = await createAdminTask({
    adminId: req.user.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: API_MESSAGES.TASK_CREATED,
    data: { task }
  });
};

export const listTasks = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const tasks = await listAdminTasks({
    adminId: req.user.id,
    filters: req.validated.query
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASKS_FETCHED,
    data: { tasks }
  });
};

export const getTask = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const task = await getAdminTask({
    adminId: req.user.id,
    taskId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_FETCHED,
    data: { task }
  });
};

export const updateTask = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const task = await updateAdminTask({
    adminId: req.user.id,
    taskId: req.validated.params.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_UPDATED,
    data: { task }
  });
};

export const updateEmployee = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const employee = await updateAdminEmployee({
    adminId: req.user.id,
    employeeId: req.validated.params.id,
    payload: req.validated.body
  });

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEE_UPDATED,
    data: { employee }
  });
};

export const deleteTask = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const task = await deleteAdminTask({
    adminId: req.user.id,
    taskId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_DELETED,
    data: { task }
  });
};

export const deleteEmployee = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const employee = await deleteAdminEmployee({
    adminId: req.user.id,
    employeeId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEE_DELETED,
    data: { employee }
  });
};

export const getStats = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  const stats = await getAdminStats({
    adminId: req.user.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_STATS_FETCHED,
    data: { stats }
  });
};
