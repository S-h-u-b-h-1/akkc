import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/api.js';

export const getFinancialYear = (date = new Date()) => {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 3 = Apr)
  const year = date.getFullYear();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
  return `${year - 1}-${year.toString().slice(-2)}`;
};

export const generateNextBillNumber = async (transaction, billingEntityId, billDate) => {
  const financialYear = getFinancialYear(new Date(billDate || new Date()));
  
  const entity = await transaction.billingEntity.findUnique({
    where: { id: billingEntityId }
  });
  
  if (!entity) {
    throw new AppError('Billing entity not found', HTTP_STATUS.NOT_FOUND);
  }

  const sequence = await transaction.billSequence.upsert({
    where: {
      billingEntityId_financialYear: {
        billingEntityId,
        financialYear
      }
    },
    update: {
      lastSequence: { increment: 1 }
    },
    create: {
      billingEntityId,
      financialYear,
      lastSequence: 1
    }
  });

  const seqFormatted = sequence.lastSequence.toString().padStart(3, '0');
  return `${entity.code}_FY${financialYear}_${seqFormatted}`;
};
