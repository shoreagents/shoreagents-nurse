-- Migration: Remove sex field from clinic_logs table
-- Date: 2024-01-01
-- Description: Remove the sex field from clinic_logs table as it's no longer needed

-- Remove the sex column from clinic_logs table
ALTER TABLE clinic_logs DROP COLUMN sex;

-- Update the comment on the table to reflect the change
COMMENT ON TABLE clinic_logs IS 'Clinic visit records without patient sex information'; 