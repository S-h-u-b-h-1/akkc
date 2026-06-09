import { getPrisma } from '../prisma/client.js';
import { AppError } from '../utils/appError.js';
import { HTTP_STATUS } from '../constants/api.js';

export const listBillingEntities = async () => {
  return getPrisma().billingEntity.findMany({
    orderBy: { createdAt: 'asc' }
  });
};

export const updateBillingEntity = async (entityId, data) => {
  const entity = await getPrisma().billingEntity.findUnique({ where: { id: entityId } });
  if (!entity) {
    throw new AppError('Billing entity not found', HTTP_STATUS.NOT_FOUND);
  }

  return getPrisma().billingEntity.update({
    where: { id: entityId },
    data
  });
};
