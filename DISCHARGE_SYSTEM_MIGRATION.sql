-- ===================================================
-- Patient Discharge and Archive System - SQL Migration
-- ===================================================
-- Run this in Supabase SQL Editor
-- This adds discharge tracking to the existing patients table

-- ===================================================
-- 1. ADD DISCHARGE COLUMNS TO PATIENTS TABLE
-- ===================================================
-- Add discharge_date column to track when patient was discharged
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS discharge_date TIMESTAMP WITH TIME ZONE;

-- Add discharge_reason column for notes
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS discharge_reason TEXT;

-- Add last_bed_id to remember which bed the patient was in
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS last_bed_id UUID REFERENCES beds(id) ON DELETE SET NULL;

-- Add last_admission_date for re-admission tracking
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS last_admission_date DATE;

-- ===================================================
-- 2. CREATE INDEXES FOR FASTER QUERIES
-- ===================================================
-- Index for querying active vs archived patients
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients(is_active);

-- Index for discharge date queries
CREATE INDEX IF NOT EXISTS idx_patients_discharge_date ON patients(discharge_date);

-- Compound index for archived patients view
CREATE INDEX IF NOT EXISTS idx_patients_archived ON patients(is_active, discharge_date DESC) 
WHERE is_active = false;

-- ===================================================
-- 3. CREATE DISCHARGE HISTORY TABLE (Optional - for detailed history)
-- ===================================================
CREATE TABLE IF NOT EXISTS discharge_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  admission_date DATE,
  discharge_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  discharge_reason TEXT,
  discharged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  bed_ward VARCHAR(100),
  bed_number VARCHAR(50),
  stay_duration INTEGER, -- in days
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discharge_history_patient_id ON discharge_history(patient_id);
CREATE INDEX idx_discharge_history_discharge_date ON discharge_history(discharge_date);

-- ===================================================
-- 4. ENABLE RLS ON NEW TABLE
-- ===================================================
ALTER TABLE discharge_history ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read discharge history (adjust as needed)
CREATE POLICY "discharge_history_read_all" ON discharge_history
  FOR SELECT USING (true);

-- Only hospital staff can insert discharge records
CREATE POLICY "hospital_insert_discharge" ON discharge_history
  FOR INSERT WITH CHECK (true);

-- ===================================================
-- 5. VERIFICATION
-- ===================================================
-- Check columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'patients'
AND column_name IN ('discharge_date', 'discharge_reason', 'last_bed_id', 'last_admission_date');

-- Print completion message
SELECT '✅ Discharge system migration complete! New columns and history table added.' AS status;
