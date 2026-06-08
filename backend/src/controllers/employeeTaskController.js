import { API_MESSAGES } from '../constants/api.js';
import {
  listEmployeeTasks,
  markEmployeeTaskDone,
  markEmployeeTaskNotDone
} from '../services/employeeTaskService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const listTasks = async (req, res) => {
  const tasks = await listEmployeeTasks({
    employeeId: req.user.id,
    filters: req.validated.query
  });

  return sendSuccess(res, {
    message: API_MESSAGES.EMPLOYEE_TASKS_FETCHED,
    data: { tasks }
  });
};

export const markDone = async (req, res) => {
  const task = await markEmployeeTaskDone({
    employeeId: req.user.id,
    taskId: req.validated.params.id,
    remark: req.validated.body.remark
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_MARKED_DONE,
    data: { task }
  });
};

export const markNotDone = async (req, res) => {
  const task = await markEmployeeTaskNotDone({
    employeeId: req.user.id,
    taskId: req.validated.params.id,
    reason: req.validated.body.reason
  });

  return sendSuccess(res, {
    message: API_MESSAGES.TASK_MARKED_NOT_DONE,
    data: { task }
  });
};
