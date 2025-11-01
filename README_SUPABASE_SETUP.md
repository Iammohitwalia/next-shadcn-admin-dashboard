# Supabase Database Setup Guide

This guide will help you set up the database tables and storage for the Strix Management dashboard.

## Step 1: Create Tables

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_tables.sql`
4. Click **Run** to execute the SQL

This will create:
- `departments` table
- `employees` table  
- `leaves` table
- Indexes and triggers

## Step 2: Seed Data

1. Still in **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/002_seed_data.sql`
3. Click **Run** to execute the SQL

This will add:
- 6 Departments (HR, Management, Backend, Frontend, Graphics, SEO)
- 18 Employees with dummy data
- Some sample Leave records

## Step 3: Create Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **New bucket**
3. Name: `strixmedia`
4. Check **Public bucket** (for public access to photos)
5. Click **Create bucket**

## Step 4: Set Up Storage Policies

1. Go back to **SQL Editor**
2. Copy and paste the contents of `supabase/setup_storage.sql`
3. Click **Run** to execute the SQL

This will create policies for:
- Authenticated users can upload files
- Public read access
- Users can manage their own uploads

## Step 5: Enable Row Level Security (RLS)

### Enable RLS on tables:

```sql
-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Enable RLS on departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on leaves table
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
```

### Create policies (optional - adjust based on your needs):

```sql
-- Allow authenticated users to read all employees
CREATE POLICY "Allow authenticated users to read employees"
ON employees FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read all departments
CREATE POLICY "Allow authenticated users to read departments"
ON departments FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read leaves
CREATE POLICY "Allow authenticated users to read leaves"
ON leaves FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert leaves
CREATE POLICY "Allow authenticated users to insert leaves"
ON leaves FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own leaves
CREATE POLICY "Allow authenticated users to update leaves"
ON leaves FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

## Database Schema Overview

### Departments Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `description` (TEXT)
- `created_at`, `updated_at` (Timestamps)

### Employees Table
- `id` (UUID, Primary Key)
- `employee_id` (VARCHAR, Unique)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique
- `phone_number` (VARCHAR)
- `photo_url` (TEXT) - Points to file in `strixmedia` bucket
- `department_id` (UUID, Foreign Key → departments.id)
- `created_at`, `updated_at` (Timestamps)

### Leaves Table
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key → employees.id)
- `start_date` (DATE)
- `end_date` (DATE)
- `leave_type` (VARCHAR) - 'half_day', 'full_day', 'multiple_days'
- `reason` (TEXT)
- `status` (VARCHAR) - 'pending', 'approved', 'rejected'
- `created_at`, `updated_at` (Timestamps)

## Storage Structure

The `strixmedia` bucket should be organized as:
```
strixmedia/
  └── avatars/
      └── {employee_id}/
          └── photo.jpg
```

## Next Steps

After setting up the database:
1. Test the connection from your Next.js app
2. Create API routes to fetch employees, departments, and leaves
3. Build the UI components to display this data
4. Add file upload functionality for employee photos

