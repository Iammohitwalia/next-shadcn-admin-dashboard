-- Seed Departments
INSERT INTO departments (name, description) VALUES
  ('HR', 'Human Resources Department'),
  ('Management', 'Management and Leadership Team'),
  ('Backend', 'Backend Development Team'),
  ('Frontend', 'Frontend Development Team'),
  ('Graphics', 'Graphics and Design Team'),
  ('SEO', 'Search Engine Optimization Team')
ON CONFLICT (name) DO NOTHING;

-- Seed Employees with dummy data
-- Get department IDs for reference
DO $$
DECLARE
  hr_dept_id UUID;
  mgmt_dept_id UUID;
  backend_dept_id UUID;
  frontend_dept_id UUID;
  graphics_dept_id UUID;
  seo_dept_id UUID;
BEGIN
  -- Get department IDs
  SELECT id INTO hr_dept_id FROM departments WHERE name = 'HR' LIMIT 1;
  SELECT id INTO mgmt_dept_id FROM departments WHERE name = 'Management' LIMIT 1;
  SELECT id INTO backend_dept_id FROM departments WHERE name = 'Backend' LIMIT 1;
  SELECT id INTO frontend_dept_id FROM departments WHERE name = 'Frontend' LIMIT 1;
  SELECT id INTO graphics_dept_id FROM departments WHERE name = 'Graphics' LIMIT 1;
  SELECT id INTO seo_dept_id FROM departments WHERE name = 'SEO' LIMIT 1;

  -- Insert employees
  INSERT INTO employees (employee_id, name, email, phone_number, department_id) VALUES
    -- Management
    ('EMP-001', 'Sonu Thakur', 'sonu211286@gmail.com', '+91-9876543210', mgmt_dept_id),
    ('EMP-002', 'Mohit Walia', 'Mohitwalia5490@gmail.com', '+91-9876543211', mgmt_dept_id),
    ('EMP-003', 'strix manager', 'manager@strixdevelopment.net', '+91-9876543212', mgmt_dept_id),
    
    -- HR
    ('EMP-004', 'Tarun Kumar', 'Tarunkumar211286@gmail.com', '+91-9876543213', hr_dept_id),
    ('EMP-005', 'Priya Sharma', 'priya.sharma@example.com', '+91-9876543214', hr_dept_id),
    ('EMP-006', 'Rajesh Patel', 'rajesh.patel@example.com', '+91-9876543215', hr_dept_id),
    
    -- Backend
    ('EMP-007', 'Amit Singh', 'amit.singh@example.com', '+91-9876543216', backend_dept_id),
    ('EMP-008', 'Vikram Kumar', 'vikram.kumar@example.com', '+91-9876543217', backend_dept_id),
    ('EMP-009', 'Deepak Verma', 'deepak.verma@example.com', '+91-9876543218', backend_dept_id),
    
    -- Frontend
    ('EMP-010', 'Sneha Reddy', 'sneha.reddy@example.com', '+91-9876543219', frontend_dept_id),
    ('EMP-011', 'Anjali Mehta', 'anjali.mehta@example.com', '+91-9876543220', frontend_dept_id),
    ('EMP-012', 'Karan Malhotra', 'karan.malhotra@example.com', '+91-9876543221', frontend_dept_id),
    
    -- Graphics
    ('EMP-013', 'Ravi Desai', 'ravi.desai@example.com', '+91-9876543222', graphics_dept_id),
    ('EMP-014', 'Meera Joshi', 'meera.joshi@example.com', '+91-9876543223', graphics_dept_id),
    ('EMP-015', 'Aditya Nair', 'aditya.nair@example.com', '+91-9876543224', graphics_dept_id),
    
    -- SEO
    ('EMP-016', 'Neha Gupta', 'neha.gupta@example.com', '+91-9876543225', seo_dept_id),
    ('EMP-017', 'Arjun Kapoor', 'arjun.kapoor@example.com', '+91-9876543226', seo_dept_id),
    ('EMP-018', 'Sara Khan', 'sara.khan@example.com', '+91-9876543227', seo_dept_id)
  ON CONFLICT (employee_id) DO NOTHING;
END $$;

-- Seed some Leave records
DO $$
DECLARE
  emp1_id UUID;
  emp2_id UUID;
  emp3_id UUID;
BEGIN
  -- Get some employee IDs
  SELECT id INTO emp1_id FROM employees WHERE employee_id = 'EMP-001' LIMIT 1;
  SELECT id INTO emp2_id FROM employees WHERE employee_id = 'EMP-004' LIMIT 1;
  SELECT id INTO emp3_id FROM employees WHERE employee_id = 'EMP-007' LIMIT 1;

  -- Insert leave records
  INSERT INTO leaves (employee_id, start_date, end_date, leave_type, reason, status) VALUES
    (emp1_id, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 'full_day', 'Personal work', 'pending'),
    (emp1_id, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 'multiple_days', 'Family vacation', 'approved'),
    (emp2_id, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days', 'half_day', 'Medical appointment', 'pending'),
    (emp2_id, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'full_day', 'Personal leave', 'approved'),
    (emp3_id, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'half_day', 'Home repair', 'pending'),
    (emp3_id, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '22 days', 'multiple_days', 'Wedding', 'pending')
  ON CONFLICT DO NOTHING;
END $$;

