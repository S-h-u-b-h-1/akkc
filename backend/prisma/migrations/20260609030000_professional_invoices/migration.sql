-- AlterTable
ALTER TABLE "BillingEntity" 
ADD COLUMN "invoicePrefix" VARCHAR(20) NOT NULL DEFAULT 'INV',
ADD COLUMN "city" VARCHAR(100),
ADD COLUMN "state" VARCHAR(100),
ADD COLUMN "pincode" VARCHAR(20),
ADD COLUMN "country" VARCHAR(100),
ADD COLUMN "accountHolderName" VARCHAR(160),
ADD COLUMN "branchName" VARCHAR(120),
ADD COLUMN "signatureUrl" TEXT,
ADD COLUMN "declarationText" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Bill"
ADD COLUMN "clientDetails" JSONB,
ADD COLUMN "invoiceDetails" JSONB,
ADD COLUMN "taxDetails" JSONB;

-- AlterTable
ALTER TABLE "BillItem"
ADD COLUMN "hsnSac" VARCHAR(50),
ADD COLUMN "rate" DECIMAL(10,2),
ADD COLUMN "per" VARCHAR(50) DEFAULT 'Nos';
