-- ==================================================
-- Clinic Logs Tables - Complete CREATE Statements
-- ==================================================

-- ==================================================
-- CLINIC_LOGS TABLE
-- Main table for clinic visit records
-- ==================================================
CREATE TABLE clinic_logs (
    id SERIAL4,
    patient_id INT4 NOT NULL,
    patient_diagnose TEXT NOT NULL,
    additional_notes TEXT,
    issued_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT clinic_logs_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for clinic_logs table
CREATE INDEX idx_clinic_logs_patient_id ON clinic_logs(patient_id);
CREATE INDEX idx_clinic_logs_created_at ON clinic_logs(created_at);

-- Add comments
COMMENT ON TABLE clinic_logs IS 'Patient visit records with chief complaints and treatments';
COMMENT ON COLUMN clinic_logs.id IS 'Primary key for clinic log records';
COMMENT ON COLUMN clinic_logs.patient_id IS 'Reference to users.id for patient identification';
COMMENT ON COLUMN clinic_logs.patient_diagnose IS 'Patient diagnosis and symptoms as reported by the patient';
COMMENT ON COLUMN clinic_logs.additional_notes IS 'Patient complaints, symptoms, and observations';
COMMENT ON COLUMN clinic_logs.issued_by IS 'Name of the issuer (pharmacy or department) that provided medicines/supplies';

-- ==================================================
-- CLINIC_LOG_MEDICINES TABLE
-- Junction table for medicines dispensed in clinic visits
-- ==================================================
CREATE TABLE clinic_log_medicines (
    id SERIAL4,
    clinic_log_id INT4 NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT clinic_log_medicines_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_log_medicines_clinic_log_id_fkey FOREIGN KEY (clinic_log_id) REFERENCES clinic_logs(id) ON DELETE CASCADE,
    CONSTRAINT clinic_log_medicines_quantity_check CHECK (quantity > 0)
);

-- Create indexes for clinic_log_medicines table
CREATE INDEX idx_clinic_log_medicines_clinic_log_id ON clinic_log_medicines(clinic_log_id);
CREATE INDEX idx_clinic_log_medicines_name ON clinic_log_medicines(name);

-- Add comments
COMMENT ON TABLE clinic_log_medicines IS 'Medicines dispensed during clinic visits';
COMMENT ON COLUMN clinic_log_medicines.id IS 'Primary key for clinic log medicine records';
COMMENT ON COLUMN clinic_log_medicines.clinic_log_id IS 'Reference to the clinic visit record';
COMMENT ON COLUMN clinic_log_medicines.name IS 'Name of the medicine dispensed';
COMMENT ON COLUMN clinic_log_medicines.quantity IS 'Quantity of medicine dispensed';

-- ==================================================
-- CLINIC_LOG_SUPPLIES TABLE
-- Junction table for supplies used in clinic visits
-- ==================================================
CREATE TABLE clinic_log_supplies (
    id SERIAL4,
    clinic_log_id INT4 NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT clinic_log_supplies_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_log_supplies_clinic_log_id_fkey FOREIGN KEY (clinic_log_id) REFERENCES clinic_logs(id) ON DELETE CASCADE,
    CONSTRAINT clinic_log_supplies_quantity_check CHECK (quantity > 0)
);

-- Create indexes for clinic_log_supplies table
CREATE INDEX idx_clinic_log_supplies_clinic_log_id ON clinic_log_supplies(clinic_log_id);
CREATE INDEX idx_clinic_log_supplies_name ON clinic_log_supplies(name);

-- Add comments
COMMENT ON TABLE clinic_log_supplies IS 'Medical supplies used during clinic visits';
COMMENT ON COLUMN clinic_log_supplies.id IS 'Primary key for clinic log supply records';
COMMENT ON COLUMN clinic_log_supplies.clinic_log_id IS 'Reference to the clinic visit record';
COMMENT ON COLUMN clinic_log_supplies.name IS 'Name of the supply used';
COMMENT ON COLUMN clinic_log_supplies.quantity IS 'Quantity of supply used';

-- ==================================================
-- TRIGGER FOR AUTOMATIC TIMESTAMP UPDATES
-- ==================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to clinic_logs table
CREATE TRIGGER update_clinic_logs_updated_at BEFORE UPDATE ON clinic_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply the trigger to clinic_log_medicines table
CREATE TRIGGER update_clinic_log_medicines_updated_at BEFORE UPDATE ON clinic_log_medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply the trigger to clinic_log_supplies table
CREATE TRIGGER update_clinic_log_supplies_updated_at BEFORE UPDATE ON clinic_log_supplies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==================================================
-- VIEWS FOR COMMON QUERIES
-- ==================================================

-- View for clinic logs with patient information
CREATE VIEW clinic_logs_with_patients AS
       SELECT 
           cl.id,
           cl.patient_id,
           u.email as patient_email,
           u.user_type as patient_user_type,
           pi.first_name,
           pi.middle_name,
           pi.last_name,
           CASE 
               WHEN pi.middle_name IS NOT NULL AND pi.middle_name != '' 
               THEN CONCAT(pi.first_name, ' ', pi.middle_name, ' ', pi.last_name)
               ELSE CONCAT(pi.first_name, ' ', pi.last_name)
           END as patient_full_name,
                       cl.patient_diagnose,
           cl.additional_notes,
           cl.issued_by,
           cl.created_at,
           cl.updated_at
FROM clinic_logs cl
INNER JOIN users u ON cl.patient_id = u.id
LEFT JOIN personal_info pi ON u.id = pi.user_id;

-- View for clinic logs with items summary
CREATE VIEW clinic_logs_with_items AS
SELECT 
    cl.id,
    cl.patient_id,
    cl.issued_by,
    cl.created_at,
    COUNT(clm.id) as medicine_count,
    COUNT(cls.id) as supply_count,
    COALESCE(SUM(clm.quantity), 0) as total_medicines,
    COALESCE(SUM(cls.quantity), 0) as total_supplies
FROM clinic_logs cl
LEFT JOIN clinic_log_medicines clm ON cl.id = clm.clinic_log_id
LEFT JOIN clinic_log_supplies cls ON cl.id = cls.clinic_log_id
GROUP BY cl.id, cl.patient_id, cl.issued_by, cl.created_at;

-- Add comments on views
COMMENT ON VIEW clinic_logs_with_patients IS 'Clinic logs with patient information from users and personal_info tables';
COMMENT ON VIEW clinic_logs_with_items IS 'Clinic logs with aggregated medicine and supply counts'; 