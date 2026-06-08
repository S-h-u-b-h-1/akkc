import { z } from 'zod';

const date = z.iso.date();
const uuid = z.uuid();

export const listEligibleTasksSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      clientName: z.string().trim().min(1).max(160).optional(),
      employeeId: uuid.optional(),
      dateFrom: date.optional(),
      dateTo: date.optional()
    })
    .strict()
    .optional()
});

export const createBillSchema = z.object({
  body: z
    .object({
      taskIds: z.array(uuid).min(1, 'At least one task ID is required')
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const listBillsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      clientName: z.string().trim().min(1).max(160).optional(),
      status: z.enum(['DRAFT', 'GENERATED', 'EMAILED', 'CANCELLED']).optional(),
      dateFrom: date.optional(),
      dateTo: date.optional()
    })
    .strict()
    .optional()
});

export const billIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: uuid
  }),
  query: z.object({}).optional()
});
