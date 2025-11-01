import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

// GET - Fetch all departments
export async function GET() {
  try {
    const { data: departments, error } = await supabaseAdmin.from("departments").select("*").order("name");

    if (error) {
      console.error("Error fetching departments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: departments, success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

