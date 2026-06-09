-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'NOT_DONE', 'DELAYED');

-- CreateEnum
CREATE TYPE "BillingApprovalStatus" AS ENUM ('NOT_REQUIRED', 'PENDING_EMPLOYEE_CONFIRMATION', 'APPROVED_FOR_BILLING', 'REJECTED_FOR_BILLING');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'GENERATED', 'EMAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillSourceType" AS ENUM ('TASK_BASED', 'MANUAL', 'CLUBBED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "username" VARCHAR(60) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdByAdminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "username" VARCHAR(60) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdByAdminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "domain" VARCHAR(120) NOT NULL,
    "clientName" VARCHAR(160) NOT NULL,
    "clientEmail" VARCHAR(255),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "isHighPriority" BOOLEAN NOT NULL DEFAULT false,
    "isBillable" BOOLEAN NOT NULL DEFAULT false,
    "billingApprovalStatus" "BillingApprovalStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "billAmount" DECIMAL(10,2),
    "billingRemarks" TEXT,
    "assignedDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "assignedEmployeeId" UUID,
    "createdByAdminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskUpdate" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "employeeId" UUID,
    "status" "TaskStatus" NOT NULL,
    "remark" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEntity" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" TEXT,
    "gstNumber" VARCHAR(50),
    "panNumber" VARCHAR(50),
    "bankName" VARCHAR(120),
    "bankAccountNumber" VARCHAR(100),
    "ifscCode" VARCHAR(50),
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillSequence" (
    "id" UUID NOT NULL,
    "billingEntityId" UUID NOT NULL,
    "financialYear" VARCHAR(20) NOT NULL,
    "lastSequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BillSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" UUID NOT NULL,
    "billNumber" VARCHAR(100) NOT NULL,
    "billingEntityId" UUID NOT NULL,
    "sourceType" "BillSourceType" NOT NULL DEFAULT 'TASK_BASED',
    "clubbedIntoId" UUID,
    "billDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" VARCHAR(160) NOT NULL,
    "clientEmail" VARCHAR(255),
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "pdfUrl" TEXT,
    "generatedAt" TIMESTAMPTZ,
    "emailedAt" TIMESTAMPTZ,
    "createdByAdminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" UUID NOT NULL,
    "billId" UUID NOT NULL,
    "taskId" UUID,
    "taskTitle" VARCHAR(180) NOT NULL,
    "taskDomain" VARCHAR(120) NOT NULL,
    "clientName" VARCHAR(160) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE INDEX "Admin_createdByAdminId_idx" ON "Admin"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Admin_createdAt_idx" ON "Admin"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE INDEX "Employee_createdByAdminId_idx" ON "Employee"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Employee_createdAt_idx" ON "Employee"("createdAt");

-- CreateIndex
CREATE INDEX "Task_assignedEmployeeId_idx" ON "Task"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "Task_createdByAdminId_idx" ON "Task"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Task_status_dueDate_idx" ON "Task"("status", "dueDate");

-- CreateIndex
CREATE INDEX "Task_isHighPriority_dueDate_idx" ON "Task"("isHighPriority", "dueDate");

-- CreateIndex
CREATE INDEX "Task_assignedDate_idx" ON "Task"("assignedDate");

-- CreateIndex
CREATE INDEX "Task_domain_idx" ON "Task"("domain");

-- CreateIndex
CREATE INDEX "Task_clientName_idx" ON "Task"("clientName");

-- CreateIndex
CREATE INDEX "TaskUpdate_taskId_idx" ON "TaskUpdate"("taskId");

-- CreateIndex
CREATE INDEX "TaskUpdate_employeeId_idx" ON "TaskUpdate"("employeeId");

-- CreateIndex
CREATE INDEX "TaskUpdate_status_idx" ON "TaskUpdate"("status");

-- CreateIndex
CREATE INDEX "TaskUpdate_createdAt_idx" ON "TaskUpdate"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntity_name_key" ON "BillingEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntity_code_key" ON "BillingEntity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BillSequence_billingEntityId_financialYear_key" ON "BillSequence"("billingEntityId", "financialYear");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_billingEntityId_idx" ON "Bill"("billingEntityId");

-- CreateIndex
CREATE INDEX "Bill_createdByAdminId_idx" ON "Bill"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Bill_clientName_idx" ON "Bill"("clientName");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_createdAt_idx" ON "Bill"("createdAt");

-- CreateIndex
CREATE INDEX "Bill_clubbedIntoId_idx" ON "Bill"("clubbedIntoId");

-- CreateIndex
CREATE UNIQUE INDEX "BillItem_taskId_key" ON "BillItem"("taskId");

-- CreateIndex
CREATE INDEX "BillItem_billId_idx" ON "BillItem"("billId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillSequence" ADD CONSTRAINT "BillSequence_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_clubbedIntoId_fkey" FOREIGN KEY ("clubbedIntoId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

