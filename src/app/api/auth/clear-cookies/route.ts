import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Clear all Supabase-related cookies
    const supabaseCookieNames = allCookies
      .filter((cookie) => {
        const name = cookie.name.toLowerCase();
        return (
          name.includes("supabase") ||
          name.includes("sb-") ||
          name.includes("auth-token") ||
          name.includes("access-token") ||
          name.includes("refresh-token")
        );
      })
      .map((cookie) => cookie.name);

    const response = NextResponse.json({
      success: true,
      message: "Cookies cleared",
      cleared: supabaseCookieNames,
    });

    // Clear cookies in response
    supabaseCookieNames.forEach((name) => {
      response.cookies.set({
        name,
        value: "",
        maxAge: 0,
        path: "/",
      });
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to clear cookies",
      },
      { status: 500 },
    );
  }
}

