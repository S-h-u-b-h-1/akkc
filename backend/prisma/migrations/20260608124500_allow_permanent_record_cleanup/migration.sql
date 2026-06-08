-- Allow permanent cleanup of archived people while preserving task history.
ALTER TABLE "TaskUpdate" DROP CONSTRAINT IF EXISTS "TaskUpdate_taskId_employeeId_fkey";
ALTER TABLE "TaskUpdate" DROP CONSTRAINT IF EXISTS "TaskUpdate_employeeId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assignedEmployeeId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_createdByAdminId_fkey";
ALTER TABLE "Employee" DROP CONSTRAINT IF EXISTS "Employee_createdByAdminId_fkey";

DROP INDEX IF EXISTS "Task_id_assignedEmployeeId_key";

ALTER TABLE "Employee" ALTER COLUMN "createdByAdminId" DROP NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "assignedEmployeeId" DROP NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "createdByAdminId" DROP NOT NULL;
ALTER TABLE "TaskUpdate" ALTER COLUMN "employeeId" DROP NOT NULL;

ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
