-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'NOT_DONE', 'DELAYED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "department" VARCHAR(120),
    "createdByAdminId" UUID NOT NULL,
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
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "assignedEmployeeId" UUID NOT NULL,
    "createdByAdminId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskUpdate" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "remark" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TaskUpdate_completed_remark_required" CHECK (
        "status" <> 'COMPLETED'
        OR ("remark" IS NOT NULL AND LENGTH(BTRIM("remark")) > 0)
    ),
    CONSTRAINT "TaskUpdate_not_done_reason_required" CHECK (
        "status" <> 'NOT_DONE'
        OR ("reason" IS NOT NULL AND LENGTH(BTRIM("reason")) > 0)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_createdAt_idx" ON "Admin"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_createdByAdminId_idx" ON "Employee"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE INDEX "Employee_createdAt_idx" ON "Employee"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_assignedEmployeeId_key" ON "Task"("id", "assignedEmployeeId");

-- CreateIndex
CREATE INDEX "Task_assignedEmployeeId_idx" ON "Task"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "Task_createdByAdminId_idx" ON "Task"("createdByAdminId");

-- CreateIndex
CREATE INDEX "Task_status_dueDate_idx" ON "Task"("status", "dueDate");

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

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_taskId_employeeId_fkey" FOREIGN KEY ("taskId", "employeeId") REFERENCES "Task"("id", "assignedEmployeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- HelperFunction
CREATE FUNCTION "get_task_effective_status"("taskStatus" "TaskStatus", "taskDueDate" DATE)
RETURNS "TaskStatus"
LANGUAGE SQL
STABLE
AS $$
    SELECT CASE
        WHEN "taskStatus" = 'PENDING'::"TaskStatus" AND "taskDueDate" < CURRENT_DATE THEN 'DELAYED'::"TaskStatus"
        ELSE "taskStatus"
    END;
$$;
