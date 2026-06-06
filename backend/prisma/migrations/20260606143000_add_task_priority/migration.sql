-- Add admin-controlled priority for urgent client assignments.
ALTER TABLE "Task" ADD COLUMN "isHighPriority" BOOLEAN NOT NULL DEFAULT false;

-- Supports priority-first task lists and urgent-work filters.
CREATE INDEX "Task_isHighPriority_dueDate_idx" ON "Task"("isHighPriority", "dueDate");
