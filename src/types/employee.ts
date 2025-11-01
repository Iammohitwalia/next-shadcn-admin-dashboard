export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  photo_url: string | null;
  department_id: string | null;
  created_at: string;
  updated_at: string;
  departments?: Department | null;
}

export interface EmployeeWithDepartment extends Employee {
  departments: Department | null;
}

