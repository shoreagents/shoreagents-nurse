-- ==================================================
-- Shore Agents Nurse Application Database Schema
-- PostgreSQL Database Schema for Clinic Management System
-- ==================================================

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================================================
-- USERS TABLE
-- Stores user authentication and profile information
-- ==================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL COMMENT 'Full name of the user',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email address used for login and communication',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password for authentication',
    role VARCHAR(20) NOT NULL CHECK (role IN ('nurse', 'admin', 'staff')) COMMENT 'User role determining access permissions: nurse (clinic operations), admin (full access), staff (limited access)',
    nurse_id VARCHAR(50) UNIQUE COMMENT 'Unique identifier for nurses, used in clinic logs and medical records',
    department VARCHAR(100) COMMENT 'Department or ward where the user is assigned',
    avatar VARCHAR(500) COMMENT 'URL or path to user profile picture',
    is_active BOOLEAN DEFAULT true COMMENT 'Whether the user account is active and can log in',
    last_login_at TIMESTAMP WITH TIME ZONE COMMENT 'Timestamp of last successful login for security tracking',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nurse_id ON users(nurse_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ==================================================
-- CLIENTS TABLE
-- Stores client/company information for clinic services
-- ==================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL COMMENT 'Name of the client company or organization',
    is_active BOOLEAN DEFAULT true COMMENT 'Whether the client is currently active for services',
    created_by UUID NOT NULL REFERENCES users(id) COMMENT 'User who created this client record',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for clients table
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- ==================================================
-- ISSUERS TABLE
-- Stores information about medicine/supply issuers (pharmacies, suppliers)
-- ==================================================
CREATE TABLE issuers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL COMMENT 'Name of the issuer (pharmacy, supplier, or department)',
    is_active BOOLEAN DEFAULT true COMMENT 'Whether the issuer is currently active for dispensing',
    created_by UUID NOT NULL REFERENCES users(id) COMMENT 'User who created this issuer record',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for issuers table
CREATE INDEX idx_issuers_name ON issuers(name);
CREATE INDEX idx_issuers_is_active ON issuers(is_active);
CREATE INDEX idx_issuers_created_by ON issuers(created_by);

-- ==================================================
-- INVENTORY_MEDICINES TABLE
-- Stores medicine inventory information
-- ==================================================
CREATE TABLE inventory_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL COMMENT 'Generic name of the medicine',
    display_name VARCHAR(255) NOT NULL COMMENT 'Display name shown in forms and reports',
    description TEXT COMMENT 'Detailed description of the medicine including dosage form',
    category VARCHAR(100) NOT NULL COMMENT 'Medicine category (e.g., Analgesics, Antibiotics, Vitamins)',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0) COMMENT 'Current stock quantity available',
    unit VARCHAR(50) NOT NULL COMMENT 'Unit of measurement (tablets, ml, grams, etc.)',
    reorder_level INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0) COMMENT 'Minimum stock level that triggers reorder alert',
    price DECIMAL(10,2) COMMENT 'Unit price of the medicine for cost tracking',
    expiry_date DATE COMMENT 'Expiration date of the current stock batch',
    supplier VARCHAR(255) COMMENT 'Primary supplier or manufacturer name',
    is_active BOOLEAN DEFAULT true COMMENT 'Whether the medicine is currently available for dispensing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for inventory_medicines table
CREATE INDEX idx_inventory_medicines_name ON inventory_medicines(name);
CREATE INDEX idx_inventory_medicines_category ON inventory_medicines(category);
CREATE INDEX idx_inventory_medicines_stock ON inventory_medicines(stock);
CREATE INDEX idx_inventory_medicines_reorder_level ON inventory_medicines(reorder_level);
CREATE INDEX idx_inventory_medicines_expiry_date ON inventory_medicines(expiry_date);
CREATE INDEX idx_inventory_medicines_is_active ON inventory_medicines(is_active);

-- ==================================================
-- INVENTORY_SUPPLIES TABLE
-- Stores medical supplies inventory information
-- ==================================================
CREATE TABLE inventory_supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL COMMENT 'Generic name of the medical supply',
    display_name VARCHAR(255) NOT NULL COMMENT 'Display name shown in forms and reports',
    description TEXT COMMENT 'Detailed description of the supply including specifications',
    category VARCHAR(100) NOT NULL COMMENT 'Supply category (e.g., Disposables, Equipment, Dressings)',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0) COMMENT 'Current stock quantity available',
    unit VARCHAR(50) NOT NULL COMMENT 'Unit of measurement (pieces, boxes, rolls, etc.)',
    reorder_level INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0) COMMENT 'Minimum stock level that triggers reorder alert',
    price DECIMAL(10,2) COMMENT 'Unit price of the supply for cost tracking',
    expiry_date DATE COMMENT 'Expiration date of the current stock batch if applicable',
    supplier VARCHAR(255) COMMENT 'Primary supplier or manufacturer name',
    is_active BOOLEAN DEFAULT true COMMENT 'Whether the supply is currently available for use',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for inventory_supplies table
CREATE INDEX idx_inventory_supplies_name ON inventory_supplies(name);
CREATE INDEX idx_inventory_supplies_category ON inventory_supplies(category);
CREATE INDEX idx_inventory_supplies_stock ON inventory_supplies(stock);
CREATE INDEX idx_inventory_supplies_reorder_level ON inventory_supplies(reorder_level);
CREATE INDEX idx_inventory_supplies_expiry_date ON inventory_supplies(expiry_date);
CREATE INDEX idx_inventory_supplies_is_active ON inventory_supplies(is_active);

-- ==================================================
-- INVENTORY_TRANSACTIONS TABLE
-- Records all inventory movements for audit trail
-- ==================================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjustment')) COMMENT 'Transaction type: stock_in (receiving inventory), stock_out (dispensing), adjustment (corrections)',
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('medicine', 'supply')) COMMENT 'Type of inventory item being transacted',
    item_id UUID NOT NULL COMMENT 'Foreign key to either inventory_medicines or inventory_supplies',
    item_name VARCHAR(255) NOT NULL COMMENT 'Name of the item at time of transaction (for historical record)',
    quantity INTEGER NOT NULL COMMENT 'Quantity involved in the transaction (positive for stock_in, negative for stock_out)',
    previous_stock INTEGER NOT NULL COMMENT 'Stock level before this transaction',
    new_stock INTEGER NOT NULL COMMENT 'Stock level after this transaction',
    reason VARCHAR(500) NOT NULL COMMENT 'Reason for the transaction (e.g., patient dispensing, stock delivery, expired items)',
    reference VARCHAR(255) COMMENT 'Reference number (e.g., clinic log ID, delivery receipt number)',
    user_id UUID NOT NULL REFERENCES users(id) COMMENT 'User who performed the transaction',
    user_name VARCHAR(255) NOT NULL COMMENT 'Name of the user at time of transaction (for historical record)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Transaction timestamp'
);

-- Create indexes for inventory_transactions table
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_transactions_item_type ON inventory_transactions(item_type);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_user_id ON inventory_transactions(user_id);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference);

-- ==================================================
-- CLINIC_LOGS TABLE
-- Main table for clinic visit records
-- ==================================================
CREATE TABLE clinic_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL COMMENT 'Date of the clinic visit',
    full_name VARCHAR(255) NOT NULL COMMENT 'Patient full name',
    sex VARCHAR(10) NOT NULL CHECK (sex IN ('Male', 'Female')) COMMENT 'Patient biological sex',
    employee_number VARCHAR(50) NOT NULL COMMENT 'Employee ID number of the patient',
    client VARCHAR(255) NOT NULL COMMENT 'Client company or organization the employee belongs to',
    chief_complaint TEXT NOT NULL COMMENT 'Primary reason for the visit or main symptom reported',
    issued_by VARCHAR(255) NOT NULL COMMENT 'Name of the issuer (pharmacy or department) that provided medicines/supplies',
    nurse_id VARCHAR(50) NOT NULL COMMENT 'ID of the nurse who handled the visit',
    nurse_name VARCHAR(255) NOT NULL COMMENT 'Name of the nurse at time of visit (for historical record)',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')) COMMENT 'Record status: active (current), archived (historical)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for clinic_logs table
CREATE INDEX idx_clinic_logs_date ON clinic_logs(date);
CREATE INDEX idx_clinic_logs_employee_number ON clinic_logs(employee_number);
CREATE INDEX idx_clinic_logs_client ON clinic_logs(client);
CREATE INDEX idx_clinic_logs_nurse_id ON clinic_logs(nurse_id);
CREATE INDEX idx_clinic_logs_status ON clinic_logs(status);
CREATE INDEX idx_clinic_logs_created_at ON clinic_logs(created_at);

-- ==================================================
-- CLINIC_LOG_MEDICINES TABLE
-- Junction table for medicines dispensed in clinic visits
-- ==================================================
CREATE TABLE clinic_log_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_log_id UUID NOT NULL REFERENCES clinic_logs(id) ON DELETE CASCADE COMMENT 'Reference to the clinic visit record',
    medicine_name VARCHAR(255) NOT NULL COMMENT 'Name of the medicine dispensed',
    custom_name VARCHAR(255) COMMENT 'Custom or brand name if different from generic name',
    quantity INTEGER NOT NULL CHECK (quantity > 0) COMMENT 'Quantity of medicine dispensed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp'
);

-- Create indexes for clinic_log_medicines table
CREATE INDEX idx_clinic_log_medicines_clinic_log_id ON clinic_log_medicines(clinic_log_id);
CREATE INDEX idx_clinic_log_medicines_medicine_name ON clinic_log_medicines(medicine_name);

-- ==================================================
-- CLINIC_LOG_SUPPLIES TABLE
-- Junction table for supplies used in clinic visits
-- ==================================================
CREATE TABLE clinic_log_supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_log_id UUID NOT NULL REFERENCES clinic_logs(id) ON DELETE CASCADE COMMENT 'Reference to the clinic visit record',
    supply_name VARCHAR(255) NOT NULL COMMENT 'Name of the supply used',
    custom_name VARCHAR(255) COMMENT 'Custom or specific name if different from generic name',
    quantity INTEGER NOT NULL CHECK (quantity > 0) COMMENT 'Quantity of supply used',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp'
);

-- Create indexes for clinic_log_supplies table
CREATE INDEX idx_clinic_log_supplies_clinic_log_id ON clinic_log_supplies(clinic_log_id);
CREATE INDEX idx_clinic_log_supplies_supply_name ON clinic_log_supplies(supply_name);

-- ==================================================
-- REIMBURSEMENTS TABLE
-- Tracks employee medical reimbursement requests
-- ==================================================
CREATE TABLE reimbursements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL COMMENT 'Date of the medical expense',
    employee_id VARCHAR(50) NOT NULL COMMENT 'Employee ID number making the reimbursement request',
    full_name_employee VARCHAR(255) NOT NULL COMMENT 'Full name of the employee requesting reimbursement',
    full_name_dependent VARCHAR(255) COMMENT 'Full name of dependent if reimbursement is for family member',
    work_location VARCHAR(20) NOT NULL CHECK (work_location IN ('Office', 'WFH')) COMMENT 'Employee work location: Office (on-site) or WFH (work from home)',
    receipt_date DATE NOT NULL COMMENT 'Date on the medical receipt',
    amount_requested DECIMAL(10,2) NOT NULL CHECK (amount_requested > 0) COMMENT 'Amount being requested for reimbursement',
    email VARCHAR(255) NOT NULL COMMENT 'Employee email address for communication',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) COMMENT 'Reimbursement status: pending (under review), approved (will be paid), rejected (denied)',
    medicine_type VARCHAR(255) COMMENT 'Type or category of medicine for which reimbursement is requested',
    purpose TEXT COMMENT 'Detailed explanation of what the reimbursement is for',
    receipt_file_path VARCHAR(500) COMMENT 'File path to uploaded receipt image or PDF',
    approved_by UUID REFERENCES users(id) COMMENT 'User who approved or rejected the reimbursement',
    approved_at TIMESTAMP WITH TIME ZONE COMMENT 'Timestamp when reimbursement was approved/rejected',
    approval_notes TEXT COMMENT 'Notes from approver explaining decision',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for reimbursements table
CREATE INDEX idx_reimbursements_employee_id ON reimbursements(employee_id);
CREATE INDEX idx_reimbursements_status ON reimbursements(status);
CREATE INDEX idx_reimbursements_date ON reimbursements(date);
CREATE INDEX idx_reimbursements_receipt_date ON reimbursements(receipt_date);
CREATE INDEX idx_reimbursements_approved_by ON reimbursements(approved_by);
CREATE INDEX idx_reimbursements_created_at ON reimbursements(created_at);

-- ==================================================
-- ACTIVITY_ITEMS TABLE
-- Tracks system activities for audit and notification purposes
-- ==================================================
CREATE TABLE activity_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('clinic_log', 'reimbursement', 'approval', 'rejection', 'inventory_update', 'user_login', 'user_logout')) COMMENT 'Type of activity performed in the system',
    title VARCHAR(255) NOT NULL COMMENT 'Short descriptive title of the activity',
    description TEXT NOT NULL COMMENT 'Detailed description of what happened',
    user_id UUID NOT NULL REFERENCES users(id) COMMENT 'User who performed the activity',
    user_name VARCHAR(255) NOT NULL COMMENT 'Name of the user at time of activity (for historical record)',
    status VARCHAR(50) COMMENT 'Status related to the activity if applicable',
    metadata JSONB COMMENT 'Additional structured data related to the activity (JSON format)',
    reference_id UUID COMMENT 'Reference to related record (clinic_log_id, reimbursement_id, etc.)',
    reference_type VARCHAR(50) COMMENT 'Type of the referenced record (clinic_log, reimbursement, etc.)',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'When the activity occurred'
);

-- Create indexes for activity_items table
CREATE INDEX idx_activity_items_type ON activity_items(type);
CREATE INDEX idx_activity_items_user_id ON activity_items(user_id);
CREATE INDEX idx_activity_items_timestamp ON activity_items(timestamp);
CREATE INDEX idx_activity_items_reference_id ON activity_items(reference_id);
CREATE INDEX idx_activity_items_reference_type ON activity_items(reference_type);

-- ==================================================
-- APP_SETTINGS TABLE
-- Stores application-wide configuration settings
-- ==================================================
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL COMMENT 'Setting key identifier (e.g., theme, language, currency)',
    value TEXT NOT NULL COMMENT 'Setting value (can be string, number, or JSON)',
    description TEXT COMMENT 'Human-readable description of what this setting controls',
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')) COMMENT 'Data type of the value for proper parsing',
    is_public BOOLEAN DEFAULT false COMMENT 'Whether this setting can be accessed by non-admin users',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT 'Last modification timestamp'
);

-- Create indexes for app_settings table
CREATE INDEX idx_app_settings_key ON app_settings(key);
CREATE INDEX idx_app_settings_is_public ON app_settings(is_public);

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
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issuers_updated_at BEFORE UPDATE ON issuers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_medicines_updated_at BEFORE UPDATE ON inventory_medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_supplies_updated_at BEFORE UPDATE ON inventory_supplies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_logs_updated_at BEFORE UPDATE ON clinic_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reimbursements_updated_at BEFORE UPDATE ON reimbursements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- INITIAL DATA SEEDING
-- ==================================================

-- Insert default app settings
INSERT INTO app_settings (key, value, description, data_type, is_public) VALUES
('theme', 'light', 'Application theme preference', 'string', true),
('language', 'en', 'Default application language', 'string', true),
('currency', 'USD', 'Default currency for monetary values', 'string', true),
('items_per_page', '25', 'Default number of items to show per page', 'number', true),
('date_format', 'MM/dd/yyyy', 'Default date format for display', 'string', true),
('notifications_enabled', 'true', 'Whether notifications are enabled system-wide', 'boolean', false),
('auto_save_enabled', 'true', 'Whether auto-save is enabled for forms', 'boolean', true),
('reorder_alert_days', '30', 'Days before expiry to show reorder alerts', 'number', false),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'number', false);

-- ==================================================
-- VIEWS FOR COMMON QUERIES
-- ==================================================

-- View for low stock medicines
CREATE VIEW low_stock_medicines AS
SELECT 
    id,
    name,
    display_name,
    category,
    stock,
    reorder_level,
    unit,
    expiry_date,
    (stock <= reorder_level) as needs_reorder,
    (expiry_date <= CURRENT_DATE + INTERVAL '30 days') as expires_soon
FROM inventory_medicines 
WHERE is_active = true 
AND (stock <= reorder_level OR expiry_date <= CURRENT_DATE + INTERVAL '30 days');

-- View for low stock supplies
CREATE VIEW low_stock_supplies AS
SELECT 
    id,
    name,
    display_name,
    category,
    stock,
    reorder_level,
    unit,
    expiry_date,
    (stock <= reorder_level) as needs_reorder,
    (expiry_date <= CURRENT_DATE + INTERVAL '30 days') as expires_soon
FROM inventory_supplies 
WHERE is_active = true 
AND (stock <= reorder_level OR expiry_date <= CURRENT_DATE + INTERVAL '30 days');

-- View for recent clinic activities
CREATE VIEW recent_clinic_activities AS
SELECT 
    cl.id,
    cl.date,
    cl.first_name || ' ' || cl.last_name as patient_name,
    cl.employee_number,
    cl.client,
    cl.chief_complaint,
    cl.nurse_name,
    cl.created_at,
    COUNT(clm.id) as medicine_count,
    COUNT(cls.id) as supply_count
FROM clinic_logs cl
LEFT JOIN clinic_log_medicines clm ON cl.id = clm.clinic_log_id
LEFT JOIN clinic_log_supplies cls ON cl.id = cls.clinic_log_id
WHERE cl.status = 'active'
GROUP BY cl.id, cl.date, cl.first_name, cl.last_name, cl.employee_number, 
         cl.client, cl.chief_complaint, cl.nurse_name, cl.created_at
ORDER BY cl.created_at DESC;

-- View for pending reimbursements summary
CREATE VIEW pending_reimbursements_summary AS
SELECT 
    COUNT(*) as pending_count,
    SUM(amount_requested) as total_amount,
    AVG(amount_requested) as average_amount,
    MIN(date) as oldest_request_date,
    MAX(date) as newest_request_date
FROM reimbursements 
WHERE status = 'pending';

-- ==================================================
-- COMMENTS ON TABLES AND VIEWS
-- ==================================================

COMMENT ON TABLE users IS 'User accounts for authentication and role-based access control';
COMMENT ON TABLE clients IS 'Client companies or organizations that receive clinic services';
COMMENT ON TABLE issuers IS 'Entities that dispense medicines and supplies (pharmacies, departments)';
COMMENT ON TABLE inventory_medicines IS 'Medicine inventory with stock levels and metadata';
COMMENT ON TABLE inventory_supplies IS 'Medical supplies inventory with stock levels and metadata';
COMMENT ON TABLE inventory_transactions IS 'Audit trail for all inventory movements and changes';
COMMENT ON TABLE clinic_logs IS 'Patient visit records with chief complaints and treatments';
COMMENT ON TABLE clinic_log_medicines IS 'Medicines dispensed during clinic visits';
COMMENT ON TABLE clinic_log_supplies IS 'Medical supplies used during clinic visits';
COMMENT ON TABLE reimbursements IS 'Employee medical expense reimbursement requests';
COMMENT ON TABLE activity_items IS 'System activity log for audit and notification purposes';
COMMENT ON TABLE app_settings IS 'Application-wide configuration settings';

COMMENT ON VIEW low_stock_medicines IS 'Medicines that need reordering or are expiring soon';
COMMENT ON VIEW low_stock_supplies IS 'Medical supplies that need reordering or are expiring soon';
COMMENT ON VIEW recent_clinic_activities IS 'Recent clinic visits with aggregated medicine and supply counts';
COMMENT ON VIEW pending_reimbursements_summary IS 'Summary statistics for pending reimbursement requests'; 