-- CreateEnum
CREATE TYPE "BillingApprovalStatus" AS ENUM ('NOT_REQUIRED', 'PENDING_EMPLOYEE_CONFIRMATION', 'APPROVED_FOR_BILLING', 'REJECTED_FOR_BILLING');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'GENERATED', 'EMAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "billAmount" DECIMAL(10,2),
ADD COLUMN     "billingApprovalStatus" "BillingApprovalStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "billingRemarks" TEXT,
ADD COLUMN     "clientEmail" VARCHAR(255),
ADD COLUMN     "isBillable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Bill" (
    "id" UUID NOT NULL,
    "billNumber" VARCHAR(50) NOT NULL,
    "clientName" VARCHAR(160) NOT NULL,
    "clientEmail" VARCHAR(255),
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "BillStatus" NOT NULL DEFAULT 'DRAFT',
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
    "taskId" UUID NOT NULL,
    "taskTitle" VARCHAR(180) NOT NULL,
    "taskDomain" VARCHAR(120) NOT NULL,
    "clientName" VARCHAR(160) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_createdByAdminId_idx" ON "Bill"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Bill_clientName_idx" ON "Bill"("clientName");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "Bill"("status");

-- CreateIndex
CREATE INDEX "Bill_createdAt_idx" ON "Bill"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillItem_taskId_key" ON "BillItem"("taskId");

-- CreateIndex
CREATE INDEX "BillItem_billId_idx" ON "BillItem"("billId");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
