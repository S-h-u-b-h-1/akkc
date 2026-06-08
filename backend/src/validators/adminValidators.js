import { z } from 'zod';

const adminId = z.uuid();
const password = z.string().min(8).max(72);
const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens.');

export const createAdminSchema = z.object({
  body: z
    .object({
      username,
      password
    })
    .strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const listAdminsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateAdminSchema = z.object({
  body: z
    .object({
      username: username.optional(),
      password: password.optional()
    })
    .strict()
    .refine((body) => Object.values(body).some((value) => value !== undefined), {
      message: 'At least one field must be provided.'
    }),
  params: z.object({
    id: adminId
  }),
  query: z.object({}).optional()
});

export const adminIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: adminId
  }),
  query: z.object({}).optional()
});
