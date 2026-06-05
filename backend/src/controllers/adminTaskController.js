import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdminTask,
  deleteAdminTask,
  getAdminStats,
  getAdminTask,
  listAdminTasks,
  updateAdminTask
} from '../services/taskManagementService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createTask = async (req, res) => {
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

export const deleteTask = async (req, res) => {
  const task = await deleteAdminTask({
    adminId: req.user.id,
    taskId: req.validated.params.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_DELETED,
    data: { task }
  });
};

export const getStats = async (req, res) => {
  const stats = await getAdminStats({
    adminId: req.user.id
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_STATS_FETCHED,
    data: { stats }
  });
};
