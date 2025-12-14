-- ===================================================
-- Supabase Storage Policies for Patient Images Bucket
-- ===================================================
-- Run this in Supabase SQL Editor AFTER creating the bucket
-- Bucket name: patient-images

-- ===================================================
-- 1. CREATE THE STORAGE BUCKET (Run in Dashboard or via SQL)
-- ===================================================
-- Note: You can also create this via Supabase Dashboard → Storage → New Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-images', 'patient-images', true)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- 2. POLICY: Allow authenticated users to UPLOAD images
-- ===================================================
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-images'
  AND (storage.foldername(name))[1] = 'patients'
);

-- ===================================================
-- 3. POLICY: Allow anyone to VIEW/READ images (public bucket)
-- ===================================================
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-images');

-- ===================================================
-- 4. POLICY: Allow authenticated users to UPDATE their uploads
-- ===================================================
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-images')
WITH CHECK (bucket_id = 'patient-images');

-- ===================================================
-- 5. POLICY: Allow authenticated users to DELETE images
-- ===================================================
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-images');

-- ===================================================
-- VERIFICATION: Check policies were created
-- ===================================================
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%patient%' OR policyname LIKE '%authenticated%';

-- ===================================================
-- USAGE NOTES:
-- ===================================================
-- File path format: patients/{patient_id}/{filename}
-- Example: patients/abc123/photo.jpg
--
-- Public URL format:
-- https://{project-ref}.supabase.co/storage/v1/object/public/patient-images/patients/{patient_id}/{filename}
--
-- Upload via JavaScript:
-- const { data, error } = await supabase.storage
--   .from('patient-images')
--   .upload(`patients/${patientId}/${file.name}`, file);
--
-- Get public URL:
-- const { data } = supabase.storage
--   .from('patient-images')
--   .getPublicUrl(`patients/${patientId}/${filename}`);
-- ===================================================
