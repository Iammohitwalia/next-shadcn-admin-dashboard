"use client";

import { useEffect, useState } from "react";

export default function ClearCookiesPage() {
  const [status, setStatus] = useState<"clearing" | "done">("clearing");
  const [cookieCount, setCookieCount] = useState(0);

  useEffect(() => {
    const clearAllCookies = () => {
      try {
        // Get all cookies first to count them
        const allCookies = document.cookie.split(";").filter((c) => c.trim());
        setCookieCount(allCookies.length);

        // Method 1: Clear each cookie individually
        allCookies.forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

          if (!name) return;

          // Try multiple methods to ensure cookies are cleared
          const domains = [window.location.hostname, `.${window.location.hostname}`, "localhost", ".localhost"];
          const paths = ["/", "/dashboard", "/auth", ""];

          domains.forEach((domain) => {
            paths.forEach((path) => {
              try {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain};SameSite=None;Secure`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`;
                document.cookie = `${name}=; Max-Age=0; path=${path}; domain=${domain}`;
                document.cookie = `${name}=; Max-Age=-1; path=${path}; domain=${domain}`;
              } catch (e) {
                // Ignore domain/path errors
              }
            });
          });
        });

        // Method 2: Clear localStorage and sessionStorage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignore storage errors
        }

        // Method 3: Force clear by iterating through document.cookie again
        setTimeout(() => {
          document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            if (name) {
              document.cookie = `${name}=; Max-Age=0; path=/`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            }
          });
        }, 100);

        setStatus("done");

        // Redirect to login after clearing
        setTimeout(() => {
          // Force a hard reload to ensure cookies are cleared
          window.location.href = "/auth/login";
        }, 2000);
      } catch (error) {
        console.error("Error clearing cookies:", error);
        // Still redirect even if clearing fails
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    };

    // Run immediately on mount
    clearAllCookies();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center">
          {status === "clearing" ? (
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          ) : (
            <svg
              className="size-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-semibold">
          {status === "clearing" ? "Clearing cookies..." : "Cookies cleared!"}
        </h1>
        {cookieCount > 0 && (
          <p className="text-muted-foreground text-sm">
            Cleared {cookieCount} cookie{cookieCount !== 1 ? "s" : ""}
          </p>
        )}
        <p className="text-muted-foreground">
          {status === "clearing"
            ? "Please wait while we clear all cookies..."
            : "Redirecting to login page..."}
        </p>
      </div>
    </div>
  );
}
