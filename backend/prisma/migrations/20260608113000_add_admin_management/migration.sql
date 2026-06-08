-- Track admin accounts created from the protected admin portal.
ALTER TABLE "Admin" ADD COLUMN "createdByAdminId" UUID;
ALTER TABLE "Admin" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Admin_createdByAdminId_idx" ON "Admin"("createdByAdminId");
CREATE INDEX "Admin_deletedAt_idx" ON "Admin"("deletedAt");

ALTER TABLE "Admin" ADD CONSTRAINT "Admin_createdByAdminId_fkey"
FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
