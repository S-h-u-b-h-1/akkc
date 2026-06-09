import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
import { getPrisma } from '../prisma/client.js';
import { TASK_STATUSES } from '../constants/task.js';
import { findEmployeeById } from '../repositories/employeeRepository.js';
import {
  findTaskByEmployee,
  listTasksByEmployee,
  updateTaskStatusWithEmployeeUpdate
} from '../repositories/taskRepository.js';
import { AppError } from '../utils/appError.js';
import { toDateOnly, todayDateOnly } from '../utils/date.js';
import { serializeTask } from '../utils/taskPresenter.js';

const assertActiveEmployee = async (employeeId) => {
  const employee = await findEmployeeById(employeeId);

  if (!employee || employee.deletedAt) {
    throw new AppError(API_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
  }

  return employee;
};

const assertEmployeeTask = async ({ taskId, employeeId }) => {
  const task = await findTaskByEmployee({ id: taskId, employeeId });

  if (!task) {
    throw new AppError(API_MESSAGES.TASK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  return task;
};

export const listEmployeeTasks = async ({ employeeId, filters = {} }) => {
  await assertActiveEmployee(employeeId);

  const today = todayDateOnly();
  const normalizedFilters = {
    ...filters,
    date: filters.date ? toDateOnly(filters.date) : undefined,
    isHighPriority:
      filters.isHighPriority === undefined ? undefined : filters.isHighPriority === 'true',
    today
  };
  const tasks = await listTasksByEmployee({ employeeId, filters: normalizedFilters });

  return tasks.map((task) => serializeTask(task, today));
};

export const markEmployeeTaskDone = async ({ employeeId, taskId, remark, shouldProceedForBilling, billingRemarks, billPdf, clientEmail }) => {
  await assertActiveEmployee(employeeId);
  const task = await assertEmployeeTask({ taskId, employeeId });

  let newBillingApprovalStatus;
  
  if (task.isBillable && task.billingApprovalStatus === 'PENDING_EMPLOYEE_CONFIRMATION') {
    if (shouldProceedForBilling === true) {
      newBillingApprovalStatus = 'APPROVED_FOR_BILLING';
    } else if (shouldProceedForBilling === false) {
      newBillingApprovalStatus = 'REJECTED_FOR_BILLING';
    } else {
      throw new AppError('Billing confirmation is required for billable tasks', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (task.isBillable && shouldProceedForBilling !== false && !billPdf) {
    throw new AppError('A bill PDF is mandatory when marking a billable task as done.', HTTP_STATUS.BAD_REQUEST);
  }

  const updatedTask = await updateTaskStatusWithEmployeeUpdate({
    taskId,
    employeeId,
    status: TASK_STATUSES.COMPLETED,
    remark,
    reason: null,
    billingApprovalStatus: newBillingApprovalStatus,
    billingRemarks
  });

  if (billPdf || clientEmail) {
    const prisma = getPrisma();
    
    const updateData = {};
    if (billPdf) {
      updateData.uploadedBillPdfUrl = '/uploads/bills/' + billPdf.filename;
    }
    if (clientEmail && clientEmail !== updatedTask.clientEmail) {
      updateData.clientEmail = clientEmail;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.task.update({
        where: { id: updatedTask.id },
        data: updateData
      });
      Object.assign(updatedTask, updateData);
    }
  }

  return serializeTask(updatedTask);
};

export const markEmployeeTaskNotDone = async ({ employeeId, taskId, reason }) => {
  await assertActiveEmployee(employeeId);
  await assertEmployeeTask({ taskId, employeeId });

  const task = await updateTaskStatusWithEmployeeUpdate({
    taskId,
    employeeId,
    status: TASK_STATUSES.NOT_DONE,
    remark: null,
    reason
  });

  return serializeTask(task);
};
