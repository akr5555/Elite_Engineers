-- Migration: Add job_roles column to engineers table
-- Date: 2026-01-23
-- Description: Adds job_roles TEXT field for AI compatibility scoring

ALTER TABLE engineers ADD COLUMN IF NOT EXISTS job_roles TEXT;

-- Add comment to document the column
COMMENT ON COLUMN engineers.job_roles IS 'Job roles the engineer is looking for - used by AI engine for compatibility scoring';
