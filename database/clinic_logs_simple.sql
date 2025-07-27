-- Simple Clinic Log Database Schema
-- PostgreSQL Schema for Clinic Management System
-- Assumes existing tables: inventory_medical, users, personal_info, job_info, agents, members

-- ==================================================
-- CLINIC_LOGS TABLE
-- Main table for clinic visit records
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

-- ==================================================
-- CLINIC_LOG_MEDICINES TABLE
-- Junction table for medicines dispensed in clinic visits
-- ==================================================
CREATE TABLE IF NOT EXISTS clinic_log_medicines (
    id SERIAL4 NOT NULL,
    clinic_log_id INT4 NOT NULL,
    medicine_id INT4 NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT clinic_log_medicines_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_log_medicines_quantity_check CHECK (quantity > 0),
    CONSTRAINT clinic_log_medicines_clinic_log_id_fkey FOREIGN KEY (clinic_log_id) REFERENCES clinic_logs(id) ON DELETE CASCADE,
    CONSTRAINT clinic_log_medicines_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES inventory_medical(id) ON DELETE CASCADE
);

-- Create indexes for clinic_log_medicines table
CREATE INDEX IF NOT EXISTS idx_clinic_log_medicines_clinic_log_id ON clinic_log_medicines(clinic_log_id);
CREATE INDEX IF NOT EXISTS idx_clinic_log_medicines_medicine_id ON clinic_log_medicines(medicine_id);

-- ==================================================
-- CLINIC_LOG_SUPPLIES TABLE
-- Junction table for supplies used in clinic visits
-- ==================================================
CREATE TABLE IF NOT EXISTS clinic_log_supplies (
    id SERIAL4 NOT NULL,
    clinic_log_id INT4 NOT NULL,
    supply_id INT4 NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT clinic_log_supplies_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_log_supplies_quantity_check CHECK (quantity > 0),
    CONSTRAINT clinic_log_supplies_clinic_log_id_fkey FOREIGN KEY (clinic_log_id) REFERENCES clinic_logs(id) ON DELETE CASCADE,
    CONSTRAINT clinic_log_supplies_supply_id_fkey FOREIGN KEY (supply_id) REFERENCES inventory_medical(id) ON DELETE CASCADE
);

-- Create indexes for clinic_log_supplies table
CREATE INDEX IF NOT EXISTS idx_clinic_log_supplies_clinic_log_id ON clinic_log_supplies(clinic_log_id);
CREATE INDEX IF NOT EXISTS idx_clinic_log_supplies_supply_id ON clinic_log_supplies(supply_id);

-- ==================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ==================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to clinic_logs table
CREATE TRIGGER update_clinic_logs_updated_at 
    BEFORE UPDATE ON clinic_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    END as company,
    pi.phone,
    pi.birthday,
    pi.gender,
    m.badge_color,
    u.user_type
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

-- View to get clinic logs with medicines and supplies
CREATE OR REPLACE VIEW clinic_logs_with_items AS
SELECT 
    cl.id as clinic_log_id,
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
    END as company,
    pi.phone,
    pi.birthday,
    pi.gender,
    m.badge_color,
    u.user_type,
    -- Medicine information
    clm.medicine_id,
    im.name as medicine_name,
    im.item_type as medicine_type,
    clm.quantity as medicine_quantity,
    -- Supply information
    cls.supply_id,
    is.name as supply_name,
    is.item_type as supply_type,
    cls.quantity as supply_quantity
FROM clinic_logs cl
INNER JOIN personal_info pi ON cl.patient_id = pi.id
INNER JOIN users u ON pi.user_id = u.id
LEFT JOIN job_info ji ON (
    (u.user_type = 'Agent' AND ji.agent_user_id = u.id) OR
    (u.user_type = 'Internal' AND ji.internal_user_id = u.id)
)
LEFT JOIN agents a ON (u.user_type = 'Agent' AND a.user_id = u.id)
LEFT JOIN members m ON a.member_id = m.id
LEFT JOIN clinic_log_medicines clm ON cl.id = clm.clinic_log_id
LEFT JOIN inventory_medical im ON clm.medicine_id = im.id AND im.item_type = 'medicine'
LEFT JOIN clinic_log_supplies cls ON cl.id = cls.clinic_log_id
LEFT JOIN inventory_medical is ON cls.supply_id = is.id AND is.item_type = 'supply'
WHERE cl.status = 'active';

-- ==================================================
-- COMMENTS ON TABLES
-- ==================================================

COMMENT ON TABLE clinic_logs IS 'Main table for clinic visit records with patient information';
COMMENT ON TABLE clinic_log_medicines IS 'Medicines dispensed during clinic visits';
COMMENT ON TABLE clinic_log_supplies IS 'Medical supplies used during clinic visits';
COMMENT ON VIEW clinic_logs_with_patients IS 'Clinic logs with complete patient information';
COMMENT ON VIEW clinic_logs_with_items IS 'Clinic logs with medicines and supplies information'; 