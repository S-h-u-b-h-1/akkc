import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient, TaskStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env.DATABASE_URL;
const SALT_ROUNDS = 12;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL })
});

const ids = Object.freeze({
  admin: '2f5a6b4a-8dc5-4e9e-bd6f-b2f2a1a57a11',
  employeeAudit: 'db27f099-a327-492e-a9f0-3513ab4c5b7e',
  employeeTax: '5ab62f7c-3b8f-4944-9f27-63671a7f3e54',
  employeeGst: '66ab9d93-e537-4d80-a043-28c06ecda784',
  taskGst: 'a20d7f12-b8e6-4681-84c6-f97d6f3d9c22',
  taskAudit: 'c76251bb-cf70-40e3-bcc4-7c071dcc62e9',
  taskTds: 'e729f7de-7240-4927-a821-fbe4535afab8',
  taskRoc: '906092cb-fd02-4f4c-8e41-77848e655ef3',
  taskItr: 'a61f93cd-2c26-4fa2-9a2b-2bd8da83928f',
  taskBooks: 'f5215f72-28fb-40a1-b0a9-a61a71e36f29',
  auditUpdate: 'df1e8725-1360-4fb7-b17c-d8a899cd59c7',
  tdsUpdate: '7e41324c-d624-4e47-8fe9-744c8fd8cadb'
});

const daysFromToday = (days) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const main = async () => {
  const [adminPasswordHash, employeePasswordHash] = await Promise.all([
    bcrypt.hash('Admin@12345', SALT_ROUNDS),
    bcrypt.hash('Employee@12345', SALT_ROUNDS)
  ]);

  const admin = await prisma.admin.upsert({
    where: { id: ids.admin },
    update: {
      name: 'A K Kataruka Admin',
      email: 'admin@akkataruka.com',
      passwordHash: adminPasswordHash
    },
    create: {
      id: ids.admin,
      name: 'A K Kataruka Admin',
      email: 'admin@akkataruka.com',
      passwordHash: adminPasswordHash
    }
  });

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: ids.employeeAudit },
      update: {
        name: 'Kavita Sharma',
        username: 'audit.associate',
        email: 'kavita.audit@akkataruka.com',
        passwordHash: employeePasswordHash,
        department: 'Audit & Assurance',
        createdByAdminId: admin.id,
        deletedAt: null
      },
      create: {
        id: ids.employeeAudit,
        name: 'Kavita Sharma',
        username: 'audit.associate',
        email: 'kavita.audit@akkataruka.com',
        passwordHash: employeePasswordHash,
        department: 'Audit & Assurance',
        createdByAdminId: admin.id
      }
    }),
    prisma.employee.upsert({
      where: { id: ids.employeeTax },
      update: {
        name: 'Arjun Mehta',
        username: 'tax.associate',
        email: 'arjun.tax@akkataruka.com',
        passwordHash: employeePasswordHash,
        department: 'Income Tax',
        createdByAdminId: admin.id,
        deletedAt: null
      },
      create: {
        id: ids.employeeTax,
        name: 'Arjun Mehta',
        username: 'tax.associate',
        email: 'arjun.tax@akkataruka.com',
        passwordHash: employeePasswordHash,
        department: 'Income Tax',
        createdByAdminId: admin.id
      }
    }),
    prisma.employee.upsert({
      where: { id: ids.employeeGst },
      update: {
        name: 'Meera Iyer',
        username: 'gst.associate',
        email: 'meera.gst@akkataruka.com',
        passwordHash: employeePasswordHash,
        department: 'GST & Indirect Tax',
        createdByAdminId: admin.id,
        deletedAt: null
      },
      create: {
        id: ids.employeeGst,
        name: 'Meera Iyer',
        username: 'gst.associate',
        email: 'meera.gst@akkataruka.com',
        passwordHash: employeePasswordHash,
        department: 'GST & Indirect Tax',
        createdByAdminId: admin.id
      }
    })
  ]);

  const [auditEmployee, taxEmployee, gstEmployee] = employees;

  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: ids.taskGst },
      update: {
        title: 'Reconcile GSTR-2B with purchase register',
        domain: 'GST Compliance',
        clientName: 'Khandelwal Industries Pvt Ltd',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(1),
        assignedEmployeeId: gstEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskGst,
        title: 'Reconcile GSTR-2B with purchase register',
        domain: 'GST Compliance',
        clientName: 'Khandelwal Industries Pvt Ltd',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(1),
        assignedEmployeeId: gstEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskAudit },
      update: {
        title: 'Finalize Form 3CD tax audit observations',
        domain: 'Audit & Assurance',
        clientName: 'Madhav Textiles LLP',
        status: TaskStatus.COMPLETED,
        assignedDate: daysFromToday(-2),
        dueDate: daysFromToday(0),
        assignedEmployeeId: auditEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskAudit,
        title: 'Finalize Form 3CD tax audit observations',
        domain: 'Audit & Assurance',
        clientName: 'Madhav Textiles LLP',
        status: TaskStatus.COMPLETED,
        assignedDate: daysFromToday(-2),
        dueDate: daysFromToday(0),
        assignedEmployeeId: auditEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskTds },
      update: {
        title: 'Collect missing TDS challans for Q4 return',
        domain: 'TDS Compliance',
        clientName: 'Shree Logistics',
        status: TaskStatus.NOT_DONE,
        assignedDate: daysFromToday(-1),
        dueDate: daysFromToday(0),
        assignedEmployeeId: taxEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskTds,
        title: 'Collect missing TDS challans for Q4 return',
        domain: 'TDS Compliance',
        clientName: 'Shree Logistics',
        status: TaskStatus.NOT_DONE,
        assignedDate: daysFromToday(-1),
        dueDate: daysFromToday(0),
        assignedEmployeeId: taxEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskRoc },
      update: {
        title: 'Prepare ROC annual filing checklist',
        domain: 'Company Law',
        clientName: 'Nirmal Foods Pvt Ltd',
        status: TaskStatus.DELAYED,
        assignedDate: daysFromToday(-4),
        dueDate: daysFromToday(-1),
        assignedEmployeeId: auditEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskRoc,
        title: 'Prepare ROC annual filing checklist',
        domain: 'Company Law',
        clientName: 'Nirmal Foods Pvt Ltd',
        status: TaskStatus.DELAYED,
        assignedDate: daysFromToday(-4),
        dueDate: daysFromToday(-1),
        assignedEmployeeId: auditEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskItr },
      update: {
        title: 'Review documents for individual ITR filing',
        domain: 'Income Tax',
        clientName: 'Rohit Agarwal',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(3),
        assignedEmployeeId: taxEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskItr,
        title: 'Review documents for individual ITR filing',
        domain: 'Income Tax',
        clientName: 'Rohit Agarwal',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(3),
        assignedEmployeeId: taxEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskBooks },
      update: {
        title: 'Verify monthly books and bank reconciliation',
        domain: 'Accounting Review',
        clientName: 'Aarav Retail Stores',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(2),
        assignedEmployeeId: gstEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskBooks,
        title: 'Verify monthly books and bank reconciliation',
        domain: 'Accounting Review',
        clientName: 'Aarav Retail Stores',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(2),
        assignedEmployeeId: gstEmployee.id,
        createdByAdminId: admin.id
      }
    })
  ]);

  const [, auditTask, tdsTask] = tasks;

  await Promise.all([
    prisma.taskUpdate.upsert({
      where: { id: ids.auditUpdate },
      update: {
        taskId: auditTask.id,
        employeeId: auditEmployee.id,
        status: TaskStatus.COMPLETED,
        remark: 'Reviewed depreciation, GST turnover reconciliation, and clause-wise notes.',
        reason: null
      },
      create: {
        id: ids.auditUpdate,
        taskId: auditTask.id,
        employeeId: auditEmployee.id,
        status: TaskStatus.COMPLETED,
        remark: 'Reviewed depreciation, GST turnover reconciliation, and clause-wise notes.'
      }
    }),
    prisma.taskUpdate.upsert({
      where: { id: ids.tdsUpdate },
      update: {
        taskId: tdsTask.id,
        employeeId: taxEmployee.id,
        status: TaskStatus.NOT_DONE,
        remark: null,
        reason: 'Client has not shared two challans and one revised deductee detail.'
      },
      create: {
        id: ids.tdsUpdate,
        taskId: tdsTask.id,
        employeeId: taxEmployee.id,
        status: TaskStatus.NOT_DONE,
        reason: 'Client has not shared two challans and one revised deductee detail.'
      }
    })
  ]);

  console.info('Database seeded successfully.');
  console.info('Admin login: admin@akkataruka.com / Admin@12345');
  console.info('Employee usernames: audit.associate, tax.associate, gst.associate');
  console.info('Employee sample password: Employee@12345');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
