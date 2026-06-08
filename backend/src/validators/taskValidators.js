import { z } from 'zod';

import { TASK_STATUS_VALUES } from '../constants/task.js';

const taskId = z.uuid();
const employeeId = z.uuid();
const date = z.iso.date();
const status = z.enum(TASK_STATUS_VALUES);

export const createTaskSchema = z.object({
  body: z
    .object({
      employeeId,
      title: z.string().trim().min(2).max(180),
      domain: z.string().trim().min(1).max(120),
      clientName: z.string().trim().min(1).max(160),
      dueDate: date,
      isHighPriority: z.boolean().optional()
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const listTasksSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      status: status.optional(),
      clientName: z.string().trim().min(1).max(160).optional(),
      employeeId: employeeId.optional(),
      date: date.optional(),
      isHighPriority: z.enum(['true', 'false']).optional()
    })
    .strict()
    .optional()
});

export const taskIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: taskId
  }),
  query: z.object({}).optional()
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      employeeId: employeeId.optional(),
      title: z.string().trim().min(2).max(180).optional(),
      domain: z.string().trim().min(1).max(120).optional(),
      clientName: z.string().trim().min(1).max(160).optional(),
      dueDate: date.optional(),
      status: status.optional(),
      isHighPriority: z.boolean().optional()
    })
    .strict()
    .refine((body) => Object.values(body).some((value) => value !== undefined), {
      message: 'At least one field must be provided.'
    }),
  params: z.object({
    id: taskId
  }),
  query: z.object({}).optional()
});

export const listEmployeeTasksSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      status: status.optional(),
      clientName: z.string().trim().min(1).max(160).optional(),
      date: date.optional(),
      isHighPriority: z.enum(['true', 'false']).optional()
    })
    .strict()
    .optional()
});

export const markTaskDoneSchema = z.object({
  body: z
    .object({
      remark: z.string().trim().min(1).max(2000)
    })
    .strict(),
  params: z.object({
    id: taskId
  }),
  query: z.object({}).optional()
});

export const markTaskNotDoneSchema = z.object({
  body: z
    .object({
      reason: z.string().trim().min(1).max(2000)
    })
    .strict(),
  params: z.object({
    id: taskId
  }),
  query: z.object({}).optional()
});
