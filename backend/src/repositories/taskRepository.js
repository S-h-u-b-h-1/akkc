import { getPrisma } from '../prisma/client.js';
import { TASK_STATUSES } from '../constants/task.js';

const taskSelect = Object.freeze({
  id: true,
  title: true,
  domain: true,
  clientName: true,
  status: true,
  assignedDate: true,
  dueDate: true,
  assignedEmployeeId: true,
  createdByAdminId: true,
  createdAt: true,
  updatedAt: true,
  assignedEmployee: {
    select: {
      id: true,
      name: true,
      email: true,
      department: true
    }
  },
  updates: {
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      status: true,
      remark: true,
      reason: true,
      createdAt: true,
      employeeId: true,
      employee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }
});

const buildAdminTaskWhere = (adminId, filters = {}) => {
  const where = {
    createdByAdminId: adminId
  };

  if (filters.clientName) {
    where.clientName = {
      contains: filters.clientName,
      mode: 'insensitive'
    };
  }

  if (filters.employeeId) {
    where.assignedEmployeeId = filters.employeeId;
  }

  if (filters.date) {
    where.dueDate = filters.date;
  }

  if (filters.status === TASK_STATUSES.DELAYED) {
    where.OR = [
      { status: TASK_STATUSES.DELAYED },
      {
        status: TASK_STATUSES.PENDING,
        dueDate: {
          lt: filters.today
        }
      }
    ];
  } else if (filters.status === TASK_STATUSES.PENDING) {
    where.status = TASK_STATUSES.PENDING;
    where.dueDate = {
      gte: filters.today
    };
  } else if (filters.status) {
    where.status = filters.status;
  }

  return where;
};

export const createTask = ({
  title,
  domain,
  clientName,
  status,
  assignedDate,
  dueDate,
  assignedEmployeeId,
  createdByAdminId
}) =>
  getPrisma().task.create({
    data: {
      title,
      domain,
      clientName,
      status,
      assignedDate,
      dueDate,
      assignedEmployeeId,
      createdByAdminId
    },
    select: taskSelect
  });

export const listTasksByAdmin = ({ adminId, filters }) =>
  getPrisma().task.findMany({
    where: buildAdminTaskWhere(adminId, filters),
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    select: taskSelect
  });

export const findTaskByAdmin = ({ id, adminId }) =>
  getPrisma().task.findFirst({
    where: {
      id,
      createdByAdminId: adminId
    },
    select: taskSelect
  });

export const listTasksByEmployee = (employeeId) =>
  getPrisma().task.findMany({
    where: {
      assignedEmployeeId: employeeId
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    select: taskSelect
  });

export const findTaskByEmployee = ({ id, employeeId }) =>
  getPrisma().task.findFirst({
    where: {
      id,
      assignedEmployeeId: employeeId
    },
    select: taskSelect
  });

export const updateTask = ({ id, data }) =>
  getPrisma().task.update({
    where: { id },
    data,
    select: taskSelect
  });

export const deleteTask = (id) =>
  getPrisma().task.delete({
    where: { id },
    select: taskSelect
  });

export const updateTaskStatusWithEmployeeUpdate = ({ taskId, employeeId, status, remark, reason }) =>
  getPrisma().$transaction(async (transaction) => {
    await transaction.taskUpdate.create({
      data: {
        taskId,
        employeeId,
        status,
        remark,
        reason
      }
    });

    return transaction.task.update({
      where: { id: taskId },
      data: { status },
      select: taskSelect
    });
  });

export const listTasksForAdminStats = (adminId) =>
  getPrisma().task.findMany({
    where: {
      createdByAdminId: adminId
    },
    select: taskSelect
  });
