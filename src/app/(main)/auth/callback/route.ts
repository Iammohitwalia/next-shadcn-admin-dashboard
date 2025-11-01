import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/auth/verify-email";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Email verified successfully, redirect to success page or login
      return NextResponse.redirect(new URL("/auth/verify-email?verified=true", requestUrl.origin));
    }
  }

  // Redirect to verify email page
  return NextResponse.redirect(new URL("/auth/verify-email", requestUrl.origin));
}

