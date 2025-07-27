-- Migration: Update clinic_log_medicines and clinic_log_supplies tables
-- Date: 2024-01-23
-- Description: Update column names to match the application structure

-- Update clinic_log_medicines table
ALTER TABLE clinic_log_medicines RENAME COLUMN medicine_name TO name;
ALTER TABLE clinic_log_medicines ADD COLUMN custom_name VARCHAR(255);

-- Update clinic_log_supplies table  
ALTER TABLE clinic_log_supplies RENAME COLUMN supply_name TO name;
ALTER TABLE clinic_log_supplies ADD COLUMN custom_name VARCHAR(255);

-- Update comments
COMMENT ON COLUMN clinic_log_medicines.name IS 'Name of the medicine dispensed';
COMMENT ON COLUMN clinic_log_medicines.custom_name IS 'Custom or brand name if different from generic name';
COMMENT ON COLUMN clinic_log_supplies.name IS 'Name of the supply used';
COMMENT ON COLUMN clinic_log_supplies.custom_name IS 'Custom or specific name if different from generic name';

-- Update indexes
DROP INDEX IF EXISTS idx_clinic_log_medicines_medicine_name;
CREATE INDEX idx_clinic_log_medicines_name ON clinic_log_medicines(name);

DROP INDEX IF EXISTS idx_clinic_log_supplies_supply_name;
CREATE INDEX idx_clinic_log_supplies_name ON clinic_log_supplies(name); 