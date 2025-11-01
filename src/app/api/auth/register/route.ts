import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = body;

    if (!email || !password || !displayName) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, and display name are required",
        },
        { status: 400 },
      );
    }

    // Use regular signUp to send verification email automatically
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName,
          full_name: displayName,
          role: "employee",
        },
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (signUpError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          message: signUpError?.message || "Failed to create user",
        },
        { status: 400 },
      );
    }

    // Update user role in app_metadata using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      app_metadata: {
        role: "employee",
      },
    });

    if (updateError) {
      // Log error but don't fail registration - user is created, just role update failed
      console.error("Failed to update user role:", updateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. Please check your email to verify your account.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to register user",
      },
      { status: 500 },
    );
  }
}

