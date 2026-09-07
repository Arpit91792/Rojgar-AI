-- Add SEO fields to Job table (all nullable — no existing data is touched)
ALTER TABLE "Job" ADD COLUMN "seoTitle"          TEXT;
ALTER TABLE "Job" ADD COLUMN "metaDescription"   TEXT;
ALTER TABLE "Job" ADD COLUMN "primaryKeyword"    TEXT;
ALTER TABLE "Job" ADD COLUMN "secondaryKeywords" TEXT;
