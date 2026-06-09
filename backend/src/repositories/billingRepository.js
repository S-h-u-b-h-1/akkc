import { getPrisma } from '../prisma/client.js';
import { generateNextBillNumber } from '../services/billSequenceService.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/api.js';

export const listEligibleTasksForBilling = async (adminId, filters) => {
  const where = {
    createdByAdminId: adminId,
    status: 'COMPLETED',
    isBillable: true,
    billingApprovalStatus: 'APPROVED_FOR_BILLING',
    billItem: null // ensure it is not already billed
  };

  if (filters.clientName) {
    where.clientName = { contains: filters.clientName, mode: 'insensitive' };
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
      assignedEmployee: { select: { id: true, username: true } }
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
      assignedEmployee: { select: { id: true, username: true } }
    }
  });
};

export const createBillWithTransaction = async (billData, itemsData) => {
  return getPrisma().$transaction(async (tx) => {
    // Generate sequential bill number
    const billNumber = await generateNextBillNumber(tx, billData.billingEntityId, billData.billDate);
    
    // For task-based bills, double check if already billed
    if (billData.sourceType === 'TASK_BASED') {
      const taskIds = itemsData.map(item => item.taskId).filter(Boolean);
      const existingItems = await tx.billItem.findMany({
        where: { taskId: { in: taskIds } }
      });

      if (existingItems.length > 0) {
        throw new AppError('One or more tasks have already been billed.', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const bill = await tx.bill.create({
      data: {
        ...billData,
        billNumber,
        items: {
          create: itemsData
        }
      },
      include: {
        items: true,
        billingEntity: true
      }
    });

    return bill;
  });
};

export const createClubbedBillWithTransaction = async (billData, itemsData, originalBillIds) => {
  return getPrisma().$transaction(async (tx) => {
    // Check if original bills are already clubbed
    const existingBills = await tx.bill.findMany({
      where: { id: { in: originalBillIds } }
    });

    if (existingBills.some(b => b.clubbedIntoId)) {
      throw new AppError('One or more selected bills are already clubbed into another bill.', HTTP_STATUS.BAD_REQUEST);
    }

    const billNumber = await generateNextBillNumber(tx, billData.billingEntityId, billData.billDate);

    const clubbedBill = await tx.bill.create({
      data: {
        ...billData,
        billNumber,
        items: { create: itemsData }
      },
      include: {
        items: true,
        billingEntity: true
      }
    });

    await tx.bill.updateMany({
      where: { id: { in: originalBillIds } },
      data: { clubbedIntoId: clubbedBill.id }
    });

    return clubbedBill;
  });
};

export const listBills = async (adminId, filters) => {
  const where = { createdByAdminId: adminId };

  if (filters.clientName) {
    where.clientName = { contains: filters.clientName, mode: 'insensitive' };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.sourceType) {
    where.sourceType = filters.sourceType;
  }
  if (filters.billingEntityId) {
    where.billingEntityId = filters.billingEntityId;
  }
  if (filters.isUnclubbed === 'true') {
    where.clubbedIntoId = null;
  }

  return getPrisma().bill.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      billingEntity: true
    }
  });
};

export const getBillById = async (adminId, billId) => {
  return getPrisma().bill.findFirst({
    where: { id: billId, createdByAdminId: adminId },
    include: {
      items: true,
      billingEntity: true,
      clubbedBills: {
        select: { billNumber: true, totalAmount: true }
      }
    }
  });
};

export const updateBill = async (billId, data) => {
  return getPrisma().bill.update({
    where: { id: billId },
    data,
    include: { items: true, billingEntity: true }
  });
};

export const updateBillItemsWithTransaction = async (billId, itemsData) => {
  return getPrisma().$transaction(async (tx) => {
    await tx.billItem.deleteMany({ where: { billId } });
    await tx.billItem.createMany({
      data: itemsData.map(item => ({ ...item, billId }))
    });
  });
};

export const deleteBill = async (adminId, billId) => {
  return getPrisma().bill.delete({
    where: { id: billId, createdByAdminId: adminId }
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
