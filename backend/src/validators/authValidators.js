import { z } from 'zod';

const email = z.email().trim().toLowerCase().max(255);
const password = z.string().min(8).max(72);

export const adminSignupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email,
    password
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
