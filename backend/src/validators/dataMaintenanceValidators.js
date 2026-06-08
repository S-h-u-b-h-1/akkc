import { z } from 'zod';

const recordId = z.uuid();

export const emptyMaintenanceQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const maintenanceRecordIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: recordId
  }),
  query: z.object({}).optional()
});
