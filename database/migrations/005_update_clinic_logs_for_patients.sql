-- Migration: Update clinic_logs table to use patient references
-- Date: 2024-01-23
-- Description: Update clinic_logs table to reference patients table and add additional_notes

-- First, add new columns
ALTER TABLE clinic_logs ADD COLUMN patient_id INT4;
ALTER TABLE clinic_logs ADD COLUMN additional_notes TEXT;

-- Add foreign key constraint to patient_id (references users.id)
ALTER TABLE clinic_logs ADD CONSTRAINT clinic_logs_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update column types to match new structure
ALTER TABLE clinic_logs ALTER COLUMN id TYPE SERIAL4;

-- Add comments for new columns
COMMENT ON COLUMN clinic_logs.patient_id IS 'Reference to users.id for patient identification';
COMMENT ON COLUMN clinic_logs.additional_notes IS 'Additional notes or observations';

-- Create index for the new patient_id column
CREATE INDEX idx_clinic_logs_patient_id ON clinic_logs(patient_id);

-- Eventually, we can remove the old columns once data is migrated:
-- ALTER TABLE clinic_logs DROP COLUMN full_name;
-- ALTER TABLE clinic_logs DROP COLUMN employee_number;
-- ALTER TABLE clinic_logs DROP COLUMN client; 