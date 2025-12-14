-- RUN EACH SECTION ONE AT A TIME IN SUPABASE SQL EDITOR
-- Copy and run each block separately

-- ========== BLOCK 1: Drop old policies ==========
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- ========== BLOCK 2: Create upload policy ==========
CREATE POLICY "Allow public uploads to patient-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'patient-images');

-- ========== BLOCK 3: Create read policy ==========
CREATE POLICY "Allow public read from patient-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-images');

-- ========== BLOCK 4: Create update policy ==========
CREATE POLICY "Allow public update in patient-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'patient-images')
WITH CHECK (bucket_id = 'patient-images');

-- ========== BLOCK 5: Create delete policy ==========
CREATE POLICY "Allow public delete from patient-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'patient-images');

-- ========== BLOCK 6: Ensure bucket is public ==========
UPDATE storage.buckets SET public = true WHERE id = 'patient-images';
