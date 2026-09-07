-- Make organization have a default empty string (was NOT NULL without default)
ALTER TABLE "Job" ALTER COLUMN "organization" SET DEFAULT '';

-- Make lastDate optional (was NOT NULL)
ALTER TABLE "Job" ALTER COLUMN "lastDate" DROP NOT NULL;
