-- Migration 005: Create clinic logs table
-- This table stores clinic log entries with references to patients

CREATE TABLE public.clinic_logs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  patient_id INTEGER NOT NULL REFERENCES personal_info(id) ON DELETE CASCADE,
  chief_complaint TEXT NOT NULL,
  additional_notes TEXT,
  issued_by VARCHAR(255) NOT NULL,
  nurse_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  nurse_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create table for clinic log medicines
CREATE TABLE public.clinic_log_medicines (
  id SERIAL PRIMARY KEY,
  clinic_log_id INTEGER NOT NULL REFERENCES clinic_logs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  custom_name VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create table for clinic log supplies
CREATE TABLE public.clinic_log_supplies (
  id SERIAL PRIMARY KEY,
  clinic_log_id INTEGER NOT NULL REFERENCES clinic_logs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  custom_name VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_clinic_logs_patient_id ON clinic_logs(patient_id);
CREATE INDEX idx_clinic_logs_date ON clinic_logs(date);
CREATE INDEX idx_clinic_logs_nurse_id ON clinic_logs(nurse_id);
CREATE INDEX idx_clinic_logs_status ON clinic_logs(status);
CREATE INDEX idx_clinic_log_medicines_clinic_log_id ON clinic_log_medicines(clinic_log_id);
CREATE INDEX idx_clinic_log_supplies_clinic_log_id ON clinic_log_supplies(clinic_log_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_clinic_logs_updated_at 
  BEFORE UPDATE ON clinic_logs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 