import { z } from 'zod';

const adminId = z.uuid();
const email = z.email().trim().toLowerCase().max(255);
const password = z.string().min(8).max(72);

export const createAdminSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120),
      email,
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
      name: z.string().trim().min(2).max(120).optional(),
      email: email.optional(),
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
