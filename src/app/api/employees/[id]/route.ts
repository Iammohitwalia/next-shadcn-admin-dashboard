import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

// Use admin client to bypass RLS (Row Level Security) for API routes

// GET - Fetch single employee
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .select(`
        *,
        departments (
          id,
          name,
          description
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching employee:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data: employee, success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch employee" },
      { status: 500 },
    );
  }
}

// PUT - Update employee
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { employee_id, name, email, phone_number, department_id, photo_url } = body;

    const updateData: Record<string, unknown> = {};
    if (employee_id) updateData.employee_id = employee_id;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number || null;
    if (department_id !== undefined) updateData.department_id = department_id || null;
    if (photo_url !== undefined) updateData.photo_url = photo_url || null;

    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .update(updateData)
      .eq("id", id)
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
      console.error("Error updating employee:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: employee, success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update employee" },
      { status: 500 },
    );
  }
}

// DELETE - Delete employee
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from("employees").delete().eq("id", id);

    if (error) {
      console.error("Error deleting employee:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Employee deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete employee" },
      { status: 500 },
    );
  }
}

