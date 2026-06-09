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
	      username: 'admin',
	      passwordHash: adminPasswordHash,
	      createdByAdminId: null
	    },
	    create: {
	      id: ids.admin,
	      username: 'admin',
	      passwordHash: adminPasswordHash,
	      createdByAdminId: null
	    }
  });

  const employees = await Promise.all([
	    prisma.employee.upsert({
	      where: { id: ids.employeeAudit },
	      update: {
	        username: 'audit.associate',
	        passwordHash: employeePasswordHash,
	        createdByAdminId: admin.id
	      },
	      create: {
	        id: ids.employeeAudit,
	        username: 'audit.associate',
	        passwordHash: employeePasswordHash,
	        createdByAdminId: admin.id
	      }
	    }),
	    prisma.employee.upsert({
	      where: { id: ids.employeeTax },
	      update: {
	        username: 'tax.associate',
	        passwordHash: employeePasswordHash,
	        createdByAdminId: admin.id
	      },
	      create: {
	        id: ids.employeeTax,
	        username: 'tax.associate',
	        passwordHash: employeePasswordHash,
	        createdByAdminId: admin.id
	      }
	    }),
	    prisma.employee.upsert({
	      where: { id: ids.employeeGst },
	      update: {
	        username: 'gst.associate',
	        passwordHash: employeePasswordHash,
	        createdByAdminId: admin.id
	      },
	      create: {
	        id: ids.employeeGst,
	        username: 'gst.associate',
	        passwordHash: employeePasswordHash,
	        createdByAdminId: admin.id
	      }
	    })
  ]);

  const [auditEmployee, taxEmployee, gstEmployee] = employees;

  const declarationText = "We declare that this invoice shows the actual value of services rendered and that all particulars are true and correct.";

  const billingEntities = await Promise.all([
    prisma.billingEntity.upsert({
      where: { code: 'AKKC' },
      update: { 
        name: 'A K Kataruka and Company', invoicePrefix: 'AKKC',
        address: '41, B.B. Ganguly Street, 3rd Floor, Room No. C12', city: 'Kolkata', state: 'West Bengal', pincode: '700012', country: 'India',
        gstNumber: '19AAJFA5260D1ZM', panNumber: 'AAJFA5260D', email: 'info@akkc.co', phone: null, bankName: null, accountHolderName: 'A K Kataruka and Company', bankAccountNumber: null, ifscCode: null, branchName: null, isActive: true, declarationText
      },
      create: { 
        name: 'A K Kataruka and Company', code: 'AKKC', invoicePrefix: 'AKKC',
        address: '41, B.B. Ganguly Street, 3rd Floor, Room No. C12', city: 'Kolkata', state: 'West Bengal', pincode: '700012', country: 'India',
        gstNumber: '19AAJFA5260D1ZM', panNumber: 'AAJFA5260D', email: 'info@akkc.co', phone: null, bankName: null, accountHolderName: 'A K Kataruka and Company', bankAccountNumber: null, ifscCode: null, branchName: null, isActive: true, declarationText
      }
    }),
    prisma.billingEntity.upsert({
      where: { code: 'ASR' },
      update: { 
        name: 'ASR & Company', invoicePrefix: 'ASR',
        address: '3A, Bow Street, 3rd Floor', city: 'Kolkata', state: 'West Bengal', pincode: '700012', country: 'India',
        gstNumber: null, panNumber: null, email: null, phone: null, bankName: 'HDFC Bank Limited', accountHolderName: 'ASR & Company', bankAccountNumber: '50200100604244', ifscCode: 'HDFC0000008', branchName: 'Stephen House Branch', isActive: true, declarationText
      },
      create: { 
        name: 'ASR & Company', code: 'ASR', invoicePrefix: 'ASR',
        address: '3A, Bow Street, 3rd Floor', city: 'Kolkata', state: 'West Bengal', pincode: '700012', country: 'India',
        gstNumber: null, panNumber: null, email: null, phone: null, bankName: 'HDFC Bank Limited', accountHolderName: 'ASR & Company', bankAccountNumber: '50200100604244', ifscCode: 'HDFC0000008', branchName: 'Stephen House Branch', isActive: true, declarationText
      }
    }),
    prisma.billingEntity.upsert({
      where: { code: 'CHEV' },
      update: { 
        name: 'Cheviot Consultancy LLP', invoicePrefix: 'CCLLP',
        address: '3A, Bow Street, 3rd Floor', city: 'Kolkata', state: 'West Bengal', pincode: '700012', country: 'India',
        gstNumber: null, panNumber: 'AANFC2597D', email: null, phone: null, bankName: 'HDFC Bank', accountHolderName: 'Cheviot Consultancy LLP', bankAccountNumber: '50200031922286', ifscCode: 'HDFC0000008', branchName: 'Stephen House Branch', isActive: true, declarationText
      },
      create: { 
        name: 'Cheviot Consultancy LLP', code: 'CHEV', invoicePrefix: 'CCLLP',
        address: '3A, Bow Street, 3rd Floor', city: 'Kolkata', state: 'West Bengal', pincode: '700012', country: 'India',
        gstNumber: null, panNumber: 'AANFC2597D', email: null, phone: null, bankName: 'HDFC Bank', accountHolderName: 'Cheviot Consultancy LLP', bankAccountNumber: '50200031922286', ifscCode: 'HDFC0000008', branchName: 'Stephen House Branch', isActive: true, declarationText
      }
    })
  ]);

  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: ids.taskGst },
      update: {
        title: 'Reconcile GSTR-2B with purchase register',
        domain: 'GST Compliance',
        clientName: 'Khandelwal Industries Pvt Ltd',
        clientEmail: 'billing@khandelwal.in',
        status: TaskStatus.PENDING,
        isHighPriority: true,
        isBillable: true,
        billAmount: 15000,
        billingApprovalStatus: 'PENDING_EMPLOYEE_CONFIRMATION',
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
        clientEmail: 'billing@khandelwal.in',
        status: TaskStatus.PENDING,
        isHighPriority: true,
        isBillable: true,
        billAmount: 15000,
        billingApprovalStatus: 'PENDING_EMPLOYEE_CONFIRMATION',
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
        clientEmail: 'finance@madhavtextiles.com',
        status: TaskStatus.COMPLETED,
        isHighPriority: false,
        isBillable: true,
        billAmount: 55000,
        billingApprovalStatus: 'APPROVED_FOR_BILLING',
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
        clientEmail: 'finance@madhavtextiles.com',
        status: TaskStatus.COMPLETED,
        isHighPriority: false,
        isBillable: true,
        billAmount: 55000,
        billingApprovalStatus: 'APPROVED_FOR_BILLING',
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
        isHighPriority: true,
        isBillable: false,
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
        isHighPriority: true,
        isBillable: false,
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
        isHighPriority: true,
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
        isHighPriority: true,
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
        isHighPriority: false,
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
        isHighPriority: false,
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
        clientEmail: 'accounts@aaravretail.in',
        status: TaskStatus.PENDING,
        isHighPriority: false,
        isBillable: true,
        billAmount: 12000,
        billingApprovalStatus: 'PENDING_EMPLOYEE_CONFIRMATION',
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
        clientEmail: 'accounts@aaravretail.in',
        status: TaskStatus.PENDING,
        isHighPriority: false,
        isBillable: true,
        billAmount: 12000,
        billingApprovalStatus: 'PENDING_EMPLOYEE_CONFIRMATION',
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
  console.info('Admin username: admin');
  console.info('Admin password: Admin@12345');
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
