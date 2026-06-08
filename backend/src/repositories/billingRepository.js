import { getPrisma } from '../prisma/client.js';

export const listEligibleTasksForBilling = async (adminId, filters) => {
  const where = {
    createdByAdminId: adminId,
    status: 'COMPLETED',
    isBillable: true,
    billingApprovalStatus: 'APPROVED_FOR_BILLING',
    billItem: null // ensure it is not already billed
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

  if (filters.dateFrom || filters.dateTo) {
    where.dueDate = {};
    if (filters.dateFrom) where.dueDate.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.dueDate.lte = new Date(filters.dateTo);
  }

  return getPrisma().task.findMany({
    where,
    orderBy: [{ clientName: 'asc' }, { dueDate: 'asc' }],
    include: {
      assignedEmployee: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
};

export const getTasksByIds = async (adminId, taskIds) => {
  return getPrisma().task.findMany({
    where: {
      id: { in: taskIds },
      createdByAdminId: adminId,
      status: 'COMPLETED',
      isBillable: true,
      billingApprovalStatus: 'APPROVED_FOR_BILLING',
      billItem: null
    },
    include: {
      assignedEmployee: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
};

export const createBillWithItems = async (billData, itemsData) => {
  return getPrisma().$transaction(async (tx) => {
    // We double check if any task is already billed inside transaction to be fully safe
    const taskIds = itemsData.map(item => item.taskId);
    const existingItems = await tx.billItem.findMany({
      where: { taskId: { in: taskIds } }
    });

    if (existingItems.length > 0) {
      throw new Error('One or more tasks have already been billed.');
    }

    const bill = await tx.bill.create({
      data: {
        ...billData,
        items: {
          create: itemsData
        }
      },
      include: {
        items: true
      }
    });

    return bill;
  });
};

export const listBills = async (adminId, filters) => {
  const where = {
    createdByAdminId: adminId
  };

  if (filters.clientName) {
    where.clientName = {
      contains: filters.clientName,
      mode: 'insensitive'
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  return getPrisma().bill.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

export const getBillById = async (adminId, billId) => {
  return getPrisma().bill.findFirst({
    where: {
      id: billId,
      createdByAdminId: adminId
    },
    include: {
      items: true
    }
  });
};

export const deleteBill = async (adminId, billId) => {
  return getPrisma().bill.delete({
    where: {
      id: billId,
      createdByAdminId: adminId
    }
  });
};

export const updateBillPdfStatus = async (billId, pdfUrl) => {
  return getPrisma().bill.update({
    where: { id: billId },
    data: {
      pdfUrl,
      generatedAt: new Date(),
      status: 'GENERATED'
    }
  });
};

export const updateBillEmailStatus = async (billId) => {
  return getPrisma().bill.update({
    where: { id: billId },
    data: {
      emailedAt: new Date(),
      status: 'EMAILED'
    }
  });
};
