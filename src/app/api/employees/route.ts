import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

// Use admin client to bypass RLS (Row Level Security) for API routes
// This ensures we can read/write data regardless of RLS policies

// GET - Fetch all employees with departments
export async function GET() {
  try {
    const { data: employees, error } = await supabaseAdmin
      .from("employees")
      .select(`
        *,
        departments (
          id,
          name,
          description
        )
      `)
      .order("created_at", { ascending: false });

    console.log("Supabase query result - employees:", employees);
    console.log("Supabase query result - error:", error);
    console.log("Employees count:", employees?.length || 0);

    if (error) {
      console.error("Error fetching employees:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to ensure departments is always an object or null
    // Supabase might return departments as an array, so we need to handle that
    const transformedEmployees = (employees || []).map((emp: any) => {
      let department = null;
      
      // Handle if departments is an array (shouldn't happen but just in case)
      if (Array.isArray(emp.departments) && emp.departments.length > 0) {
        department = emp.departments[0];
      } else if (emp.departments && typeof emp.departments === 'object') {
        department = emp.departments;
      }

      return {
        ...emp,
        departments: department,
      };
    });

    console.log("Transformed employees:", transformedEmployees);
    console.log("First employee sample:", transformedEmployees[0]);

    return NextResponse.json({ data: transformedEmployees, success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch employees" },
      { status: 500 },
    );
  }
}

// POST - Create new employee
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employee_id, name, email, phone_number, department_id, photo_url } = body;

    // Validate required fields
    if (!employee_id || !name || !email) {
      return NextResponse.json({ error: "Employee ID, name, and email are required" }, { status: 400 });
    }

    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .insert({
        employee_id,
        name,
        email,
        phone_number: phone_number || null,
        department_id: department_id || null,
        photo_url: photo_url || null,
      })
      .select(`
        *,
        departments (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: employee, success: true }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create employee" },
      { status: 500 },
    );
  }
}

