-- Convert admin and staff credential records to username-only identities.
ALTER TABLE "Admin" ADD COLUMN "username" VARCHAR(60);

WITH normalized_admins AS (
    SELECT
        "id",
        LOWER(REGEXP_REPLACE(COALESCE(NULLIF(SPLIT_PART("email", '@', 1), ''), 'admin_' || LEFT("id"::text, 8)), '[^a-z0-9._-]', '_', 'g')) AS base_username,
        ROW_NUMBER() OVER (
            PARTITION BY LEFT(LOWER(REGEXP_REPLACE(COALESCE(NULLIF(SPLIT_PART("email", '@', 1), ''), 'admin_' || LEFT("id"::text, 8)), '[^a-z0-9._-]', '_', 'g')), 51)
            ORDER BY "createdAt", "id"
        ) AS username_rank
    FROM "Admin"
)
UPDATE "Admin"
SET "username" = CASE
    WHEN normalized_admins.username_rank = 1 THEN LEFT(normalized_admins.base_username, 60)
    ELSE LEFT(normalized_admins.base_username, 51) || '_' || normalized_admins.username_rank::text
END
FROM normalized_admins
WHERE "Admin"."id" = normalized_admins."id";

ALTER TABLE "Admin" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

DROP INDEX IF EXISTS "Admin_email_key";
DROP INDEX IF EXISTS "Employee_email_key";
DROP INDEX IF EXISTS "Employee_department_idx";

ALTER TABLE "Admin" DROP COLUMN "name";
ALTER TABLE "Admin" DROP COLUMN "email";
ALTER TABLE "Employee" DROP COLUMN "name";
ALTER TABLE "Employee" DROP COLUMN "email";
ALTER TABLE "Employee" DROP COLUMN "department";
