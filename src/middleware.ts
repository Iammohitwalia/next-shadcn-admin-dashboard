import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for large cookies that would cause 431 error
  // Calculate total cookie header size
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieSize = cookieHeader.length;
  const pathname = request.nextUrl.pathname;
  
  // Log all requests to dashboard routes
  if (pathname.startsWith("/dashboard")) {
    console.log("\n=== MIDDLEWARE DEBUG ===");
    console.log("Path:", pathname);
    console.log("Cookie header size:", cookieSize, "bytes");
    console.log("Cookie header length:", cookieHeader.length, "chars");
    
    // Count individual cookies
    const cookies = cookieHeader.split(";").filter(c => c.trim());
    console.log("Number of cookies:", cookies.length);
    
    // Log each cookie name and size
    cookies.forEach((cookie, index) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      const value = eqPos > -1 ? cookie.substring(eqPos + 1) : "";
      console.log(`Cookie ${index + 1}: ${name.substring(0, 30)}... (${value.length} chars)`);
    });
    
    // Check header sizes
    const allHeaders = Array.from(request.headers.entries());
    let totalHeaderSize = 0;
    allHeaders.forEach(([key, value]) => {
      const headerSize = key.length + value.length;
      totalHeaderSize += headerSize;
      if (headerSize > 1000) {
        console.log(`⚠️ Large header: ${key} = ${headerSize} bytes`);
      }
    });
    console.log("Total headers size:", totalHeaderSize, "bytes");
    console.log("====================\n");
  }
  
  // If cookies are too large (>8KB typically causes 431), redirect to clear cookies
  // This should rarely happen now since auth is browser-only, but keep as safety net
  if (cookieSize > 8000 && !pathname.startsWith("/clear-cookies")) {
    console.log("🚨 COOKIES TOO LARGE - Redirecting to clear-cookies");
    return NextResponse.redirect(new URL("/clear-cookies", request.url), 307);
  }

  // Auth is handled entirely client-side via AuthGuard and browser localStorage
  // No server-side cookie operations to prevent 431 errors
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

