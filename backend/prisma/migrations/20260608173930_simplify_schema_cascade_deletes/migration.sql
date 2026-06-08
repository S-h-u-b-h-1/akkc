/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedEmployeeId_fkey";

-- DropIndex
DROP INDEX "Admin_deletedAt_idx";

-- DropIndex
DROP INDEX "Employee_deletedAt_idx";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "deletedAt";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
