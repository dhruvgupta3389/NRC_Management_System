-- ===================================================
-- Patient Documents & Photos Migration
-- ===================================================
-- Run this in Supabase SQL Editor to enable JSONB storage
-- for documents and photos with proper structure

-- ===================================================
-- 1. ALTER COLUMNS FROM TEXT TO JSONB
-- ===================================================
-- First, convert existing data (if any) from TEXT to JSONB
-- This handles cases where data might be stored as JSON strings

-- Update documents column
ALTER TABLE patients 
ALTER COLUMN documents TYPE JSONB 
USING CASE 
  WHEN documents IS NULL OR documents = '' THEN '[]'::jsonb
  WHEN documents ~ '^\\[.*\\]$' THEN documents::jsonb
  ELSE '[]'::jsonb
END;

-- Update photos column
ALTER TABLE patients 
ALTER COLUMN photos TYPE JSONB 
USING CASE 
  WHEN photos IS NULL OR photos = '' THEN '[]'::jsonb
  WHEN photos ~ '^\\[.*\\]$' THEN photos::jsonb
  ELSE '[]'::jsonb
END;

-- Set default values for new records
ALTER TABLE patients ALTER COLUMN documents SET DEFAULT '[]'::jsonb;
ALTER TABLE patients ALTER COLUMN photos SET DEFAULT '[]'::jsonb;

-- ===================================================
-- 2. ADD COMMENTS FOR DOCUMENTATION
-- ===================================================
COMMENT ON COLUMN patients.documents IS 'Array of document objects: [{type, label, url, uploadedAt}]';
COMMENT ON COLUMN patients.photos IS 'Array of photo objects: [{url, uploadedAt}]';

-- ===================================================
-- VERIFICATION
-- ===================================================
-- Run this to verify the column types were changed:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'patients' 
-- AND column_name IN ('documents', 'photos');
