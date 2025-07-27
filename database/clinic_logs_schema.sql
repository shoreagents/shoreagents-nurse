-- Complete Clinic Logs Schema for PostgreSQL
-- Compatible with existing patient structure from provided schema

-- ==================================================
-- CLINIC_LOGS TABLE
-- Main table for clinic visit records, now references patients
-- ==================================================
CREATE TABLE IF NOT EXISTS clinic_logs (
    id SERIAL4 NOT NULL,
    date DATE NOT NULL,
    patient_id INT4 NOT NULL,
    chief_complaint TEXT NOT NULL,
    additional_notes TEXT,
    issued_by VARCHAR(255) NOT NULL,
    nurse_id VARCHAR(50) NOT NULL,
    nurse_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT clinic_logs_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_logs_status_check CHECK (status IN ('active', 'archived')),
    CONSTRAINT clinic_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES personal_info(id) ON DELETE CASCADE
);

-- Create indexes for clinic_logs table
CREATE INDEX IF NOT EXISTS idx_clinic_logs_date ON clinic_logs(date);
CREATE INDEX IF NOT EXISTS idx_clinic_logs_patient_id ON clinic_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinic_logs_nurse_id ON clinic_logs(nurse_id);
CREATE INDEX IF NOT EXISTS idx_clinic_logs_status ON clinic_logs(status);
CREATE INDEX IF NOT EXISTS idx_clinic_logs_created_at ON clinic_logs(created_at);

-- Add trigger for updating updated_at column
CREATE OR REPLACE FUNCTION update_clinic_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinic_logs_updated_at
    BEFORE UPDATE ON clinic_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_clinic_logs_updated_at();

-- ==================================================
-- CLINIC_LOG_MEDICINES TABLE
-- Junction table for medicines dispensed in clinic visits
-- ==================================================
CREATE TABLE IF NOT EXISTS clinic_log_medicines (
    id SERIAL4 NOT NULL,
    clinic_log_id INT4 NOT NULL,
    name VARCHAR(255) NOT NULL,
    custom_name VARCHAR(255),
    quantity NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT clinic_log_medicines_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_log_medicines_quantity_check CHECK (quantity > 0),
    CONSTRAINT clinic_log_medicines_clinic_log_id_fkey FOREIGN KEY (clinic_log_id) REFERENCES clinic_logs(id) ON DELETE CASCADE
);

-- Create indexes for clinic_log_medicines table
CREATE INDEX IF NOT EXISTS idx_clinic_log_medicines_clinic_log_id ON clinic_log_medicines(clinic_log_id);
CREATE INDEX IF NOT EXISTS idx_clinic_log_medicines_name ON clinic_log_medicines(name);

-- ==================================================
-- CLINIC_LOG_SUPPLIES TABLE
-- Junction table for supplies used in clinic visits
-- ==================================================
CREATE TABLE IF NOT EXISTS clinic_log_supplies (
    id SERIAL4 NOT NULL,
    clinic_log_id INT4 NOT NULL,
    name VARCHAR(255) NOT NULL,
    custom_name VARCHAR(255),
    quantity NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT clinic_log_supplies_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_log_supplies_quantity_check CHECK (quantity > 0),
    CONSTRAINT clinic_log_supplies_clinic_log_id_fkey FOREIGN KEY (clinic_log_id) REFERENCES clinic_logs(id) ON DELETE CASCADE
);

-- Create indexes for clinic_log_supplies table
CREATE INDEX IF NOT EXISTS idx_clinic_log_supplies_clinic_log_id ON clinic_log_supplies(clinic_log_id);
CREATE INDEX IF NOT EXISTS idx_clinic_log_supplies_name ON clinic_log_supplies(name);

-- ==================================================
-- VIEWS FOR EASY QUERYING
-- ==================================================

-- View to get clinic logs with patient information
CREATE OR REPLACE VIEW clinic_logs_with_patients AS
SELECT 
    cl.id,
    cl.date,
    cl.chief_complaint,
    cl.additional_notes,
    cl.issued_by,
    cl.nurse_id,
    cl.nurse_name,
    cl.status,
    cl.created_at,
    cl.updated_at,
    pi.id as patient_id,
    CASE 
        WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
        THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
        ELSE CONCAT(pi.first_name, ' ', pi.last_name)
    END as patient_full_name,
    ji.employee_id,
    CASE 
        WHEN u.user_type = 'Internal' THEN 'Internal'
        ELSE m.company
    END as company
FROM clinic_logs cl
INNER JOIN personal_info pi ON cl.patient_id = pi.id
INNER JOIN users u ON pi.user_id = u.id
LEFT JOIN job_info ji ON (
    (u.user_type = 'Agent' AND ji.agent_user_id = u.id) OR
    (u.user_type = 'Internal' AND ji.internal_user_id = u.id)
)
LEFT JOIN agents a ON (u.user_type = 'Agent' AND a.user_id = u.id)
LEFT JOIN members m ON a.member_id = m.id
WHERE cl.status = 'active';

-- ==================================================
-- SAMPLE SEED DATA (OPTIONAL)
-- ==================================================

-- Note: This assumes you have patients in your personal_info table
-- INSERT INTO clinic_logs (date, patient_id, chief_complaint, additional_notes, issued_by, nurse_id, nurse_name)
-- VALUES 
--     (CURRENT_DATE, 1, 'Headache and fever', 'Patient appears well hydrated', 'Pharmacy', 'N001', 'Jane Smith'),
--     (CURRENT_DATE, 2, 'Cough and cold symptoms', 'Mild symptoms, no fever', 'Medical Supply', 'N002', 'John Doe'); 