-- Add username-based employee login credentials.
ALTER TABLE "Employee" ADD COLUMN "username" VARCHAR(60);

UPDATE "Employee"
SET "username" = CONCAT('employee_', "id"::text)
WHERE "username" IS NULL;

ALTER TABLE "Employee" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");
