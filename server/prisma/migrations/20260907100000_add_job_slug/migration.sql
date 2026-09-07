-- Add slug column to Job table (nullable, unique)
ALTER TABLE "Job" ADD COLUMN "slug" TEXT;

-- Create unique index on slug (sparse — only applies when slug is not NULL)
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- Create index for faster slug lookups
CREATE INDEX "Job_slug_idx" ON "Job"("slug");
