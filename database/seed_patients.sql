-- Seed data for patient system
-- This file creates sample patients for testing the clinic log system

-- Insert sample member (company)
INSERT INTO members (id, company, address, phone, service, status) VALUES 
(1, 'ShoreAgents Inc.', '123 Business Ave, Manila, Philippines', '+63-2-123-4567', 'Virtual Assistant Services', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, user_type) VALUES 
(1, 'maria.santos@shoreagents.com', 'Agent'),
(2, 'juan.delacruz@shoreagents.com', 'Agent'),
(3, 'ana.garcia@shoreagents.com', 'Agent'),
(4, 'roberto.reyes@shoreagents.com', 'Internal'),
(5, 'carmen.lopez@shoreagents.com', 'Agent')
ON CONFLICT (email) DO NOTHING;

-- Insert personal information
INSERT INTO personal_info (user_id, first_name, middle_name, last_name, nickname, phone, birthday, country, city, address, gender) VALUES 
(1, 'Maria', 'Cruz', 'Santos', 'Ria', '09123456789', '1990-03-15', 'Philippines', 'Manila', 'Brgy. San Jose, Manila', 'Female'),
(2, 'Juan', 'Pedro', 'Dela Cruz', 'Johnny', '09234567890', '1996-07-22', 'Philippines', 'Quezon City', 'Brgy. Poblacion, Quezon City', 'Male'),
(3, 'Ana', 'Maria', 'Garcia', 'Annie', '09345678901', '1979-11-08', 'Philippines', 'Caloocan', 'Brgy. Bagong Pag-asa, Caloocan', 'Female'),
(4, 'Roberto', 'Jose', 'Reyes', 'Rob', '09456789012', '1972-05-14', 'Philippines', 'Marikina', 'Brgy. Marikina Heights, Marikina', 'Male'),
(5, 'Carmen', 'Rose', 'Lopez', 'Carm', '09567890123', '1995-09-30', 'Philippines', 'Pasig', 'Brgy. San Antonio, Pasig', 'Female')
ON CONFLICT (user_id) DO NOTHING;

-- Insert agent records (linking users to company)
INSERT INTO agents (user_id, member_id, exp_points) VALUES 
(1, 1, 2500),
(2, 1, 1800),
(3, 1, 3200),
(5, 1, 1200)
ON CONFLICT (user_id) DO NOTHING;

-- Insert job information
INSERT INTO job_info (employee_id, agent_user_id, internal_user_id, job_title, employment_status, start_date) VALUES 
('EMP001', 1, NULL, 'Senior Virtual Assistant', 'Regular', '2022-01-15'),
('EMP002', 2, NULL, 'Customer Support Specialist', 'Regular', '2023-03-10'),
('EMP003', 3, NULL, 'Team Lead - Operations', 'Regular', '2021-08-20'),
('EMP004', NULL, 4, 'HR Manager', 'Regular', '2020-06-01'),
('EMP005', 5, NULL, 'Junior Virtual Assistant', 'Probationary', '2024-01-10')
ON CONFLICT (employee_id) DO NOTHING;

-- Note: Medical history and last visited will be handled by separate medical record system
-- For now, these fields in the Patient interface will show null/empty values 