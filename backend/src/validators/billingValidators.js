import { z } from 'zod';

const date = z.union([z.string().datetime(), z.string()]);
const uuid = z.string().uuid();

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
      billingEntityId: uuid,
      billDate: date.optional(),
      taskIds: z.array(uuid).min(1, 'At least one task ID is required')
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const createManualBillSchema = z.object({
  body: z
    .object({
      billingEntityId: uuid,
      billDate: date.optional(),
      clientName: z.string().trim().min(1).max(160),
      clientEmail: z.string().email().optional().nullable(),
      notes: z.string().optional().nullable(),
      items: z.array(z.object({
        taskTitle: z.string().trim().min(1).max(180),
        taskDomain: z.string().trim().max(120).optional(),
        amount: z.number().min(0),
        quantity: z.number().int().min(1).optional(),
        remarks: z.string().optional().nullable()
      })).min(1)
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const createClubbedBillSchema = z.object({
  body: z
    .object({
      billingEntityId: uuid,
      billDate: date.optional(),
      billIds: z.array(uuid).min(2, 'At least two bills are required'),
      notes: z.string().optional().nullable()
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateBillSchema = z.object({
  body: z
    .object({
      clientName: z.string().trim().min(1).max(160).optional(),
      clientEmail: z.string().email().optional().nullable(),
      notes: z.string().optional().nullable(),
      items: z.array(z.object({
        taskTitle: z.string().trim().min(1).max(180),
        taskDomain: z.string().trim().max(120).optional(),
        amount: z.number().min(0),
        quantity: z.number().int().min(1).optional(),
        remarks: z.string().optional().nullable()
      })).optional()
    })
    .strict(),
  params: z.object({
    id: uuid
  }),
  query: z.object({}).optional()
});

export const listBillsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      clientName: z.string().trim().min(1).max(160).optional(),
      status: z.enum(['DRAFT', 'GENERATED', 'EMAILED', 'CANCELLED']).optional(),
      sourceType: z.enum(['TASK_BASED', 'MANUAL', 'CLUBBED']).optional(),
      billingEntityId: uuid.optional(),
      isUnclubbed: z.string().optional(),
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
