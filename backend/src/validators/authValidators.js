import { z } from 'zod';

const password = z.string().min(8).max(72);
const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens.');

export const loginSchema = z.object({
  body: z.object({
    username,
    password
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const employeeLoginSchema = z.object({
  body: z.object({
    username,
    password
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
