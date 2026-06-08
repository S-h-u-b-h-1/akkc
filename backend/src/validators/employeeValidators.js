import { z } from 'zod';

const employeeId = z.uuid();
const password = z.string().min(8).max(72);
const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens.');

export const createEmployeeSchema = z.object({
  body: z
    .object({
      username,
      password
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const listEmployeesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateEmployeeSchema = z.object({
  body: z
    .object({
      username: username.optional(),
      password: password.optional()
    })
    .strict()
    .refine(
      (body) =>
        Object.values(body).some((value) => value !== undefined),
      { message: 'At least one field must be provided.' }
    ),
  params: z.object({
    id: employeeId
  }),
  query: z.object({}).optional()
});

export const employeeIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: employeeId
  }),
  query: z.object({}).optional()
});
