"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseClient } from "@/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("\n=== AUTH GUARD CHECK ===");
        console.log("Checking authentication...");
        
        // First check session (more reliable than getUser)
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.log("❌ Session error:", sessionError.message);
        }
        
        if (sessionData.session) {
          console.log("✅ Session found:", sessionData.session.user.email);
          setIsAuthenticated(true);
          return;
        }
        
        // If no session, check localStorage
        const localStorageKeys = Object.keys(localStorage).filter(k => k.includes("supabase") || k.includes("sb-"));
        console.log("LocalStorage Supabase keys:", localStorageKeys);
        
        // Wait a bit for session to initialize (in case of race condition)
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        // Try getUser as fallback
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser();

        if (error) {
          console.log("❌ Auth error:", error.message);
          router.push("/auth/login");
          return;
        }

        if (!user) {
          console.log("❌ No user found");
          router.push("/auth/login");
          return;
        }

        console.log("✅ User authenticated:", user.email);
        console.log("====================\n");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

