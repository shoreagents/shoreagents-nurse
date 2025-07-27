-- Migration: Remove firstName and lastName, add fullName
-- This migration replaces the separate first_name and last_name columns
-- with a single full_name column in the clinic_logs table

-- Add the new full_name column
ALTER TABLE clinic_logs ADD COLUMN full_name VARCHAR(255);

-- Update existing records to combine first_name and last_name into full_name
UPDATE clinic_logs 
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL;

-- Make the full_name column NOT NULL after populating it
ALTER TABLE clinic_logs ALTER COLUMN full_name SET NOT NULL;

-- Add a comment to the new column
COMMENT ON COLUMN clinic_logs.full_name IS 'Patient full name';

-- Drop the old columns
ALTER TABLE clinic_logs DROP COLUMN first_name;
ALTER TABLE clinic_logs DROP COLUMN last_name;

-- Create an index on the new full_name column
CREATE INDEX idx_clinic_logs_full_name ON clinic_logs(full_name); 