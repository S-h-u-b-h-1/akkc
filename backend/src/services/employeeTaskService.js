import { API_MESSAGES, HTTP_STATUS } from '../constants/api.js';
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

  const updatedTask = await updateTaskStatusWithEmployeeUpdate({
    taskId,
    employeeId,
    status: TASK_STATUSES.COMPLETED,
    remark,
    reason: null,
    billingApprovalStatus: newBillingApprovalStatus,
    billingRemarks
  });

  if (billPdf) {
    // If clientEmail is provided, we should update the task. Wait, we can't easily update it without modifying repo.
    // Instead, we create a Bill directly.
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find the first active billing entity
    const billingEntity = await prisma.billingEntity.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });

    if (billingEntity) {
      // Generate a unique bill number based on time
      const uniqueSuffix = Date.now().toString().slice(-6);
      const billNumber = `UPLOAD-${uniqueSuffix}`;

      const finalClientEmail = clientEmail || updatedTask.clientEmail || null;

      await prisma.bill.create({
        data: {
          billNumber,
          billingEntityId: billingEntity.id,
          sourceType: 'TASK_BASED',
          status: 'GENERATED',
          clientName: updatedTask.clientName,
          clientEmail: finalClientEmail,
          totalAmount: updatedTask.billAmount || 0,
          pdfUrl: '/uploads/bills/' + billPdf.filename,
          items: {
            create: [{
              taskId: updatedTask.id,
              taskTitle: updatedTask.title,
              taskDomain: updatedTask.domain,
              clientName: updatedTask.clientName,
              amount: updatedTask.billAmount || 0,
              quantity: 1
            }]
          }
        }
      });
      
      // Update task client email if provided
      if (clientEmail && clientEmail !== updatedTask.clientEmail) {
        await prisma.task.update({
          where: { id: updatedTask.id },
          data: { clientEmail }
        });
      }
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
