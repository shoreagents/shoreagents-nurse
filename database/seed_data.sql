-- ==================================================
-- Shore Agents Nurse Application - Sample Data
-- Development and Testing Seed Data
-- ==================================================

-- WARNING: This file contains sample data for development only
-- DO NOT run this in production environment

BEGIN;

-- ==================================================
-- SAMPLE USERS
-- ==================================================

-- Create sample users (password is 'password123' hashed with bcrypt)
INSERT INTO users (id, name, email, password_hash, role, nurse_id, department, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Johnson', 'sarah.johnson@shoreagents.com', '$2b$12$LQv3c1yqBwUHLbW9lYzNreQ1QV1/6k.MCh7T8YGqzGSaQSdNJYLSe', 'nurse', 'N001', 'General Medicine', true),
('550e8400-e29b-41d4-a716-446655440002', 'Admin User', 'admin@shoreagents.com', '$2b$12$LQv3c1yqBwUHLbW9lYzNreQ1QV1/6k.MCh7T8YGqzGSaQSdNJYLSe', 'admin', null, 'Administration', true),
('550e8400-e29b-41d4-a716-446655440003', 'Nurse Maria Santos', 'maria.santos@shoreagents.com', '$2b$12$LQv3c1yqBwUHLbW9lYzNreQ1QV1/6k.MCh7T8YGqzGSaQSdNJYLSe', 'nurse', 'N002', 'Emergency Care', true),
('550e8400-e29b-41d4-a716-446655440004', 'Staff Member John', 'john.staff@shoreagents.com', '$2b$12$LQv3c1yqBwUHLbW9lYzNreQ1QV1/6k.MCh7T8YGqzGSaQSdNJYLSe', 'staff', null, 'Records Management', true);

-- ==================================================
-- SAMPLE CLIENTS
-- ==================================================

INSERT INTO clients (id, name, is_active, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Shore Agents Corp', true, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440002', 'Tech Solutions Inc', true, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440003', 'Maritime Services Ltd', true, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440004', 'Global Logistics Co', true, '550e8400-e29b-41d4-a716-446655440002');

-- ==================================================
-- SAMPLE ISSUERS
-- ==================================================

INSERT INTO issuers (id, name, is_active, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Main Pharmacy', true, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', 'Emergency Supply Unit', true, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', 'Wellness Center Pharmacy', true, '550e8400-e29b-41d4-a716-446655440002');

-- ==================================================
-- SAMPLE MEDICINES
-- ==================================================

INSERT INTO inventory_medicines (id, name, display_name, description, category, stock, unit, reorder_level, price, expiry_date, supplier, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Paracetamol', 'Paracetamol 500mg', 'Pain reliever and fever reducer', 'Analgesics', 150, 'tablets', 25, 0.50, '2025-12-31', 'Pharma Plus Ltd', true),
('880e8400-e29b-41d4-a716-446655440002', 'Ibuprofen', 'Ibuprofen 400mg', 'Anti-inflammatory pain reliever', 'NSAIDs', 80, 'tablets', 20, 0.75, '2025-08-15', 'MediCore Supplies', true),
('880e8400-e29b-41d4-a716-446655440003', 'Amoxicillin', 'Amoxicillin 250mg', 'Broad spectrum antibiotic', 'Antibiotics', 45, 'capsules', 15, 1.25, '2025-06-30', 'BioMed Solutions', true),
('880e8400-e29b-41d4-a716-446655440004', 'Vitamin C', 'Vitamin C 1000mg', 'Immune system support', 'Vitamins', 200, 'tablets', 30, 0.30, '2026-01-15', 'Health First Co', true),
('880e8400-e29b-41d4-a716-446655440005', 'Cough Syrup', 'Dextromethorphan Syrup', 'Cough suppressant', 'Respiratory', 25, 'bottles', 10, 3.50, '2025-09-20', 'Pharma Plus Ltd', true),
('880e8400-e29b-41d4-a716-446655440006', 'Antacid', 'Calcium Carbonate 500mg', 'Stomach acid neutralizer', 'Digestive', 120, 'tablets', 20, 0.40, '2025-11-10', 'DigestCare Inc', true);

-- ==================================================
-- SAMPLE SUPPLIES
-- ==================================================

INSERT INTO inventory_supplies (id, name, display_name, description, category, stock, unit, reorder_level, price, supplier, is_active) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Bandages', 'Elastic Bandages 4 inch', 'Elastic compression bandages', 'Wound Care', 75, 'rolls', 15, 2.50, 'MedSupply Co', true),
('990e8400-e29b-41d4-a716-446655440002', 'Gauze Pads', 'Sterile Gauze Pads 4x4', 'Sterile gauze for wound care', 'Wound Care', 500, 'pieces', 50, 0.25, 'SterileMax Ltd', true),
('990e8400-e29b-41d4-a716-446655440003', 'Syringes', 'Disposable Syringes 5ml', 'Single-use sterile syringes', 'Injection Supplies', 200, 'pieces', 25, 0.15, 'SafeInject Corp', true),
('990e8400-e29b-41d4-a716-446655440004', 'Gloves', 'Nitrile Examination Gloves', 'Powder-free nitrile gloves', 'PPE', 1000, 'pieces', 100, 0.08, 'ProtectAll Inc', true),
('990e8400-e29b-41d4-a716-446655440005', 'Thermometer', 'Digital Thermometer', 'Digital body temperature thermometer', 'Diagnostic', 15, 'pieces', 5, 12.00, 'TechMed Solutions', true),
('990e8400-e29b-41d4-a716-446655440006', 'Cotton Swabs', 'Sterile Cotton Swabs', 'Sterile cotton applicators', 'General Supplies', 300, 'pieces', 50, 0.05, 'CottonCare Ltd', true);

-- ==================================================
-- SAMPLE CLINIC LOGS
-- ==================================================

INSERT INTO clinic_logs (id, date, last_name, first_name, sex, employee_number, client, chief_complaint, issued_by, nurse_id, nurse_name, status) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'Smith', 'John', 'Male', 'EMP001', 'Shore Agents Corp', 'Headache and fever', 'Main Pharmacy', 'N001', 'Dr. Sarah Johnson', 'active'),
('aa0e8400-e29b-41d4-a716-446655440002', '2024-01-16', 'Davis', 'Emily', 'Female', 'EMP002', 'Tech Solutions Inc', 'Minor cut on hand', 'Emergency Supply Unit', 'N002', 'Nurse Maria Santos', 'active'),
('aa0e8400-e29b-41d4-a716-446655440003', '2024-01-17', 'Wilson', 'Michael', 'Male', 'EMP003', 'Maritime Services Ltd', 'Stomach pain', 'Main Pharmacy', 'N001', 'Dr. Sarah Johnson', 'active'),
('aa0e8400-e29b-41d4-a716-446655440004', '2024-01-18', 'Brown', 'Sarah', 'Female', 'EMP004', 'Global Logistics Co', 'Cough and cold symptoms', 'Wellness Center Pharmacy', 'N002', 'Nurse Maria Santos', 'active');

-- ==================================================
-- SAMPLE CLINIC LOG MEDICINES
-- ==================================================

INSERT INTO clinic_log_medicines (clinic_log_id, medicine_name, quantity) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'Paracetamol', 10),
('aa0e8400-e29b-41d4-a716-446655440001', 'Ibuprofen', 6),
('aa0e8400-e29b-41d4-a716-446655440003', 'Antacid', 8),
('aa0e8400-e29b-41d4-a716-446655440004', 'Cough Syrup', 1),
('aa0e8400-e29b-41d4-a716-446655440004', 'Vitamin C', 15);

-- ==================================================
-- SAMPLE CLINIC LOG SUPPLIES
-- ==================================================

INSERT INTO clinic_log_supplies (clinic_log_id, supply_name, quantity) VALUES
('aa0e8400-e29b-41d4-a716-446655440002', 'Gauze Pads', 3),
('aa0e8400-e29b-41d4-a716-446655440002', 'Bandages', 1),
('aa0e8400-e29b-41d4-a716-446655440002', 'Gloves', 2),
('aa0e8400-e29b-41d4-a716-446655440004', 'Thermometer', 1),
('aa0e8400-e29b-41d4-a716-446655440004', 'Cotton Swabs', 5);

-- ==================================================
-- SAMPLE REIMBURSEMENTS
-- ==================================================

INSERT INTO reimbursements (id, date, employee_id, full_name_employee, work_location, receipt_date, amount_requested, email, status, medicine_type, purpose) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '2024-01-10', 'EMP005', 'Robert Johnson', 'Office', '2024-01-09', 45.75, 'robert.johnson@techsolutions.com', 'pending', 'Prescription Medication', 'Monthly prescription refill for hypertension medication'),
('bb0e8400-e29b-41d4-a716-446655440002', '2024-01-12', 'EMP006', 'Lisa Anderson', 'WFH', '2024-01-11', 32.50, 'lisa.anderson@maritimeservices.com', 'approved', 'Over-the-counter', 'Pain medication for back pain', '550e8400-e29b-41d4-a716-446655440002', '2024-01-13 10:30:00'),
('bb0e8400-e29b-41d4-a716-446655440003', '2024-01-14', 'EMP007', 'David Chen', 'Office', '2024-01-13', 78.25, 'david.chen@globallogistics.com', 'pending', 'Prescription Medication', 'Antibiotics for respiratory infection'),
('bb0e8400-e29b-41d4-a716-446655440004', '2024-01-16', 'EMP008', 'Michelle Rodriguez', 'WFH', '2024-01-15', 25.00, 'michelle.rodriguez@shoreagents.com', 'rejected', 'Supplements', 'Vitamin supplements', '550e8400-e29b-41d4-a716-446655440002', '2024-01-17 14:15:00');

-- ==================================================
-- SAMPLE INVENTORY TRANSACTIONS
-- ==================================================

INSERT INTO inventory_transactions (type, item_type, item_id, item_name, quantity, previous_stock, new_stock, reason, reference, user_id, user_name) VALUES
('stock_out', 'medicine', '880e8400-e29b-41d4-a716-446655440001', 'Paracetamol', -10, 160, 150, 'Dispensed to patient John Smith', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Johnson'),
('stock_out', 'medicine', '880e8400-e29b-41d4-a716-446655440002', 'Ibuprofen', -6, 86, 80, 'Dispensed to patient John Smith', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Johnson'),
('stock_out', 'supply', '990e8400-e29b-41d4-a716-446655440002', 'Gauze Pads', -3, 503, 500, 'Used for wound care - Emily Davis', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Nurse Maria Santos'),
('stock_in', 'medicine', '880e8400-e29b-41d4-a716-446655440004', 'Vitamin C', 100, 100, 200, 'New stock delivery', 'PO-2024-001', '550e8400-e29b-41d4-a716-446655440002', 'Admin User'),
('adjustment', 'supply', '990e8400-e29b-41d4-a716-446655440001', 'Bandages', -2, 77, 75, 'Found damaged items during inventory check', null, '550e8400-e29b-41d4-a716-446655440004', 'Staff Member John');

-- ==================================================
-- SAMPLE ACTIVITY ITEMS
-- ==================================================

INSERT INTO activity_items (type, title, description, user_id, user_name, reference_id, reference_type) VALUES
('clinic_log', 'New clinic visit recorded', 'Patient John Smith treated for headache and fever', '550e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Johnson', 'aa0e8400-e29b-41d4-a716-446655440001', 'clinic_log'),
('reimbursement', 'Reimbursement request submitted', 'Lisa Anderson submitted reimbursement for $32.50', '550e8400-e29b-41d4-a716-446655440002', 'Admin User', 'bb0e8400-e29b-41d4-a716-446655440002', 'reimbursement'),
('approval', 'Reimbursement approved', 'Approved reimbursement request for Lisa Anderson', '550e8400-e29b-41d4-a716-446655440002', 'Admin User', 'bb0e8400-e29b-41d4-a716-446655440002', 'reimbursement'),
('inventory_update', 'Stock updated', 'Added 100 units of Vitamin C to inventory', '550e8400-e29b-41d4-a716-446655440002', 'Admin User', null, null),
('clinic_log', 'Minor injury treated', 'Emily Davis treated for minor cut on hand', '550e8400-e29b-41d4-a716-446655440003', 'Nurse Maria Santos', 'aa0e8400-e29b-41d4-a716-446655440002', 'clinic_log');

COMMIT;

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Uncomment these queries to verify the data was inserted correctly

/*
-- Check user count
SELECT 'Users created: ' || COUNT(*) FROM users;

-- Check inventory summary
SELECT 
    'Medicines in inventory: ' || COUNT(*) as medicine_count
FROM inventory_medicines WHERE is_active = true;

SELECT 
    'Supplies in inventory: ' || COUNT(*) as supply_count
FROM inventory_supplies WHERE is_active = true;

-- Check clinic logs
SELECT 
    'Clinic logs recorded: ' || COUNT(*) as clinic_log_count
FROM clinic_logs WHERE status = 'active';

-- Check reimbursements by status
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount_requested) as total_amount
FROM reimbursements 
GROUP BY status;

-- Check low stock items
SELECT * FROM low_stock_medicines;
SELECT * FROM low_stock_supplies;

-- Check recent activities
SELECT * FROM recent_clinic_activities;
*/ 