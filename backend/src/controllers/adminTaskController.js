import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import {
  createAdminTask,
  deleteAdminTask,
  getAdminStats,
  getAdminTask,
  listAdminTasks,
  updateAdminTask
} from '../services/taskManagementService.js';
import { logAdminActivity } from '../services/adminLogService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

export const createTask = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const task = await createAdminTask({
    adminId: req.user.id,
    payload: req.validated.body
  });

  await logAdminActivity({
    adminId: req.user.id,
    action: 'CREATE_TASK',
    entity: 'Task',
    entityId: task.id,
    details: { title: task.title, domain: task.domain }
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

  await logAdminActivity({
    adminId: req.user.id,
    action: 'UPDATE_TASK',
    entity: 'Task',
    entityId: task.id,
    details: { updatedFields: Object.keys(req.validated.body) }
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_UPDATED,
    data: { task }
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

  await logAdminActivity({
    adminId: req.user.id,
    action: 'DELETE_TASK',
    entity: 'Task',
    entityId: task.id,
    details: { title: task.title }
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_DELETED,
    data: { task }
  });
};

export const getStats = async (req, res) => {
  if (!req.user) {
    throw new AppError(API_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  const stats = await getAdminStats({
    adminId: req.user.id,
    filters: req.validated.query
  });

  return sendSuccess(res, {
    message: API_MESSAGES.ADMIN_STATS_FETCHED,
    data: { stats }
  });
};

export const viewTaskBillPdf = async (req, res) => {
  const task = await getAdminTask({
    adminId: req.user.id,
    taskId: req.validated.params.id
  });

  if (!task.uploadedBillPdfUrl) {
    throw new AppError('No bill PDF uploaded for this task.', HTTP_STATUS.NOT_FOUND);
  }

  const path = await import('path');
  const fs = await import('fs');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const BACKEND_ROOT = path.join(__dirname, '../../');
  
  const pdfPath = path.join(BACKEND_ROOT, task.uploadedBillPdfUrl);
  
  if (!fs.existsSync(pdfPath)) {
    throw new AppError('The uploaded PDF for this task is missing from the server. Please ask the employee to re-upload it.', HTTP_STATUS.NOT_FOUND);
  }

  res.sendFile(pdfPath);
};
