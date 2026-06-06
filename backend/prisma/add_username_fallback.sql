-- Safe fallback SQL to add a `username` column and populate unique values for existing rows.
-- Run only if you cannot run `npx prisma migrate deploy` for some reason.
-- IMPORTANT: Backup your DB before running this file.

BEGIN;

-- Add the column if it doesn't exist
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "username" varchar(60);

-- Prefer using the local-part of email where available
UPDATE "Employee"
SET "username" = LOWER(SPLIT_PART(email, '@', 1))
WHERE "username" IS NULL AND email IS NOT NULL;

-- For any remaining NULL usernames, set a unique fallback based on id
UPDATE "Employee"
SET "username" = ('user_' || LEFT(id::text, 8))
WHERE "username" IS NULL;

-- At this point, ensure uniqueness. This will fail if duplicates remain.
-- If it fails, inspect duplicates and resolve manually before proceeding.
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_username_key" ON "Employee" ("username");

-- Make column NOT NULL now that values exist
ALTER TABLE "Employee" ALTER COLUMN "username" SET NOT NULL;

COMMIT;

-- Notes:
-- 1) If any step fails due to duplicate usernames, query duplicates with:
--    SELECT username, COUNT(*) FROM "Employee" GROUP BY username HAVING COUNT(*) > 1;
-- 2) Prefer applying the repository migrations via Prisma instead of running this SQL.
