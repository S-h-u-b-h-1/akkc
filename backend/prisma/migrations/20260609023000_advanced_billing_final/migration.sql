-- CreateEnum
CREATE TYPE "BillSourceType" AS ENUM ('TASK_BASED', 'MANUAL', 'CLUBBED');

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

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntity_name_key" ON "BillingEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntity_code_key" ON "BillingEntity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BillSequence_billingEntityId_financialYear_key" ON "BillSequence"("billingEntityId", "financialYear");

-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "billNumber" SET DATA TYPE VARCHAR(100);
ALTER TABLE "Bill" ADD COLUMN "billingEntityId" UUID NOT NULL;
ALTER TABLE "Bill" ADD COLUMN "sourceType" "BillSourceType" NOT NULL DEFAULT 'TASK_BASED';
ALTER TABLE "Bill" ADD COLUMN "clubbedIntoId" UUID;
ALTER TABLE "Bill" ADD COLUMN "billDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Bill" ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "Bill_billingEntityId_idx" ON "Bill"("billingEntityId");

-- CreateIndex
CREATE INDEX "Bill_clubbedIntoId_idx" ON "Bill"("clubbedIntoId");

-- AlterTable
ALTER TABLE "BillItem" ALTER COLUMN "taskId" DROP NOT NULL;
ALTER TABLE "BillItem" ADD COLUMN "quantity" INTEGER DEFAULT 1;

-- DropForeignKey
ALTER TABLE "BillItem" DROP CONSTRAINT "BillItem_taskId_fkey";

-- AddForeignKey
ALTER TABLE "BillSequence" ADD CONSTRAINT "BillSequence_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_clubbedIntoId_fkey" FOREIGN KEY ("clubbedIntoId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
