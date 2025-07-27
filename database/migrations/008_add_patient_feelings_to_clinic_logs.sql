-- ==================================================
-- Migration: Add patient_feelings field to clinic_logs
-- ==================================================

-- Add patient_diagnose column to clinic_logs table (stores patient diagnosis)
ALTER TABLE clinic_logs 
ADD COLUMN patient_diagnose TEXT NOT NULL;

-- Add comment for the new column
COMMENT ON COLUMN clinic_logs.patient_diagnose IS 'Patient diagnosis and symptoms as reported by the patient'; 