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
  employeeDesign: 'db27f099-a327-492e-a9f0-3513ab4c5b7e',
  employeeEngineering: '5ab62f7c-3b8f-4944-9f27-63671a7f3e54',
  employeeOperations: '66ab9d93-e537-4d80-a043-28c06ecda784',
  taskPending: 'a20d7f12-b8e6-4681-84c6-f97d6f3d9c22',
  taskCompleted: 'c76251bb-cf70-40e3-bcc4-7c071dcc62e9',
  taskNotDone: 'e729f7de-7240-4927-a821-fbe4535afab8',
  taskDelayed: '906092cb-fd02-4f4c-8e41-77848e655ef3',
  completedUpdate: 'df1e8725-1360-4fb7-b17c-d8a899cd59c7',
  notDoneUpdate: '7e41324c-d624-4e47-8fe9-744c8fd8cadb'
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
    where: { email: 'admin@akkc.local' },
    update: {
      name: 'System Admin',
      passwordHash: adminPasswordHash
    },
    create: {
      id: ids.admin,
      name: 'System Admin',
      email: 'admin@akkc.local',
      passwordHash: adminPasswordHash
    }
  });

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'aisha.design@akkc.local' },
      update: {
        name: 'Aisha Mehta',
        passwordHash: employeePasswordHash,
        department: 'Design',
        createdByAdminId: admin.id
      },
      create: {
        id: ids.employeeDesign,
        name: 'Aisha Mehta',
        email: 'aisha.design@akkc.local',
        passwordHash: employeePasswordHash,
        department: 'Design',
        createdByAdminId: admin.id
      }
    }),
    prisma.employee.upsert({
      where: { email: 'rohan.engineering@akkc.local' },
      update: {
        name: 'Rohan Iyer',
        passwordHash: employeePasswordHash,
        department: 'Engineering',
        createdByAdminId: admin.id
      },
      create: {
        id: ids.employeeEngineering,
        name: 'Rohan Iyer',
        email: 'rohan.engineering@akkc.local',
        passwordHash: employeePasswordHash,
        department: 'Engineering',
        createdByAdminId: admin.id
      }
    }),
    prisma.employee.upsert({
      where: { email: 'neha.operations@akkc.local' },
      update: {
        name: 'Neha Shah',
        passwordHash: employeePasswordHash,
        department: 'Operations',
        createdByAdminId: admin.id
      },
      create: {
        id: ids.employeeOperations,
        name: 'Neha Shah',
        email: 'neha.operations@akkc.local',
        passwordHash: employeePasswordHash,
        department: 'Operations',
        createdByAdminId: admin.id
      }
    })
  ]);

  const [designEmployee, engineeringEmployee, operationsEmployee] = employees;

  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: ids.taskPending },
      update: {
        title: 'Prepare daily design handoff',
        domain: 'Design',
        clientName: 'Northstar Retail',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(1),
        assignedEmployeeId: designEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskPending,
        title: 'Prepare daily design handoff',
        domain: 'Design',
        clientName: 'Northstar Retail',
        status: TaskStatus.PENDING,
        assignedDate: daysFromToday(0),
        dueDate: daysFromToday(1),
        assignedEmployeeId: designEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskCompleted },
      update: {
        title: 'Deploy attendance report endpoint',
        domain: 'Engineering',
        clientName: 'Acme Finance',
        status: TaskStatus.COMPLETED,
        assignedDate: daysFromToday(-2),
        dueDate: daysFromToday(0),
        assignedEmployeeId: engineeringEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskCompleted,
        title: 'Deploy attendance report endpoint',
        domain: 'Engineering',
        clientName: 'Acme Finance',
        status: TaskStatus.COMPLETED,
        assignedDate: daysFromToday(-2),
        dueDate: daysFromToday(0),
        assignedEmployeeId: engineeringEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskNotDone },
      update: {
        title: 'Collect vendor invoice confirmations',
        domain: 'Operations',
        clientName: 'Greenline Logistics',
        status: TaskStatus.NOT_DONE,
        assignedDate: daysFromToday(-1),
        dueDate: daysFromToday(0),
        assignedEmployeeId: operationsEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskNotDone,
        title: 'Collect vendor invoice confirmations',
        domain: 'Operations',
        clientName: 'Greenline Logistics',
        status: TaskStatus.NOT_DONE,
        assignedDate: daysFromToday(-1),
        dueDate: daysFromToday(0),
        assignedEmployeeId: operationsEmployee.id,
        createdByAdminId: admin.id
      }
    }),
    prisma.task.upsert({
      where: { id: ids.taskDelayed },
      update: {
        title: 'Finalize weekly client summary',
        domain: 'Operations',
        clientName: 'BluePeak Services',
        status: TaskStatus.DELAYED,
        assignedDate: daysFromToday(-4),
        dueDate: daysFromToday(-1),
        assignedEmployeeId: operationsEmployee.id,
        createdByAdminId: admin.id
      },
      create: {
        id: ids.taskDelayed,
        title: 'Finalize weekly client summary',
        domain: 'Operations',
        clientName: 'BluePeak Services',
        status: TaskStatus.DELAYED,
        assignedDate: daysFromToday(-4),
        dueDate: daysFromToday(-1),
        assignedEmployeeId: operationsEmployee.id,
        createdByAdminId: admin.id
      }
    })
  ]);

  const [, completedTask, notDoneTask] = tasks;

  await Promise.all([
    prisma.taskUpdate.upsert({
      where: { id: ids.completedUpdate },
      update: {
        taskId: completedTask.id,
        employeeId: engineeringEmployee.id,
        status: TaskStatus.COMPLETED,
        remark: 'Endpoint deployed and smoke tested successfully.',
        reason: null
      },
      create: {
        id: ids.completedUpdate,
        taskId: completedTask.id,
        employeeId: engineeringEmployee.id,
        status: TaskStatus.COMPLETED,
        remark: 'Endpoint deployed and smoke tested successfully.'
      }
    }),
    prisma.taskUpdate.upsert({
      where: { id: ids.notDoneUpdate },
      update: {
        taskId: notDoneTask.id,
        employeeId: operationsEmployee.id,
        status: TaskStatus.NOT_DONE,
        remark: null,
        reason: 'Two vendors have not confirmed invoice receipt yet.'
      },
      create: {
        id: ids.notDoneUpdate,
        taskId: notDoneTask.id,
        employeeId: operationsEmployee.id,
        status: TaskStatus.NOT_DONE,
        reason: 'Two vendors have not confirmed invoice receipt yet.'
      }
    })
  ]);

  console.info('Database seeded successfully.');
  console.info('Admin login: admin@akkc.local / Admin@12345');
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
