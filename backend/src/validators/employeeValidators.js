import { z } from 'zod';

const employeeId = z.uuid();
const email = z.email().trim().toLowerCase().max(255);
const password = z.string().min(8).max(72);
const department = z.string().trim().min(1).max(120);

const optionalDepartmentFields = {
  department: department.optional().nullable(),
  domain: department.optional().nullable()
};

export const createEmployeeSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120),
      email,
      password,
      ...optionalDepartmentFields
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
      name: z.string().trim().min(2).max(120).optional(),
      email: email.optional(),
      password: password.optional(),
      ...optionalDepartmentFields
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
