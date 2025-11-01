"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/supabase/client";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      console.log("\n=== LOGIN ATTEMPT ===");
      console.log("Email:", data.email);
      
      // CRITICAL: Clear ALL Supabase cookies before login
      // The large sb-*-auth-token cookie causes 431 errors
      // Auth MUST use localStorage only, NOT cookies
      const cookies = document.cookie.split(";").filter(c => c.trim());
      console.log("Cookies before cleanup:", cookies.length);
      
      // Get all cookie names that need clearing
      const cookiesToClear: string[] = [];
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        // Clear ALL Supabase-related cookies
        if (name.toLowerCase().includes("supabase") || 
            name.toLowerCase().includes("sb-") ||
            name.toLowerCase().startsWith("sb-")) {
          cookiesToClear.push(name);
        }
      });
      
      console.log("Found Supabase cookies to clear:", cookiesToClear);
      
      // Aggressively clear all Supabase cookies with all possible paths/domains
      const domains = [window.location.hostname, `.${window.location.hostname}`, "localhost", ".localhost", ""];
      const paths = ["/", "/dashboard", "/auth", ""];
      
      cookiesToClear.forEach((name) => {
        domains.forEach((domain) => {
          paths.forEach((path) => {
            try {
              if (domain) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`;
              } else {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
              }
              document.cookie = `${name}=; Max-Age=0; path=${path}`;
              document.cookie = `${name}=; Max-Age=-1; path=${path}`;
            } catch (e) {
              // Ignore errors
            }
          });
        });
        console.log("Cleared cookie:", name);
      });

      // Check localStorage before login
      const localStorageKeys = Object.keys(localStorage).filter(k => k.includes("supabase"));
      console.log("LocalStorage Supabase keys:", localStorageKeys);

      // Sign in - auth state will be stored in browser localStorage only
      console.log("Attempting sign in...");
      const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      console.log("Sign in result - Error:", error?.message || "None");
      console.log("Sign in result - User:", authData?.user?.email || "None");

      if (error) {
        toast.error("Login failed", {
          description: error.message,
        });
        return;
      }

      if (!authData.user) {
        toast.error("Login failed", {
          description: "No user data returned",
        });
        return;
      }

      // Check if email is verified
      if (!authData.user.email_confirmed_at) {
        toast.error("Email not verified", {
          description: "Please verify your email before logging in.",
        });
        // Optionally sign out and redirect to verify email page
        await supabaseClient.auth.signOut();
        router.push("/auth/verify-email?email=" + encodeURIComponent(data.email));
        return;
      }

      // Wait for session to be fully saved to localStorage
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Verify session is saved - try multiple times
      let sessionCheck = await supabaseClient.auth.getSession();
      let retries = 0;
      const maxRetries = 3;
      
      while (!sessionCheck.data.session && retries < maxRetries) {
        console.warn(`Session not saved, retry ${retries + 1}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        sessionCheck = await supabaseClient.auth.getSession();
        retries++;
      }
      
      if (!sessionCheck.data.session) {
        console.error("❌ Session not established after multiple retries");
        toast.error("Storage issue", {
          description: "LocalStorage is full. Please clear browser storage and try again.",
        });
        return;
      }
      
      console.log("✅ Session verified:", sessionCheck.data.session.user.email);

      toast.success("Login successful!", {
        description: `Welcome back, ${authData.user.user_metadata?.name || authData.user.email}`,
      });

      // Check localStorage after login
      const localStorageKeysAfter = Object.keys(localStorage).filter(k => k.includes("supabase"));
      console.log("LocalStorage Supabase keys after login:", localStorageKeysAfter);
      console.log("Session saved:", !!sessionCheck.data.session);
      
      // Check cookies after login
      const cookiesAfter = document.cookie.split(";").filter(c => c.trim());
      console.log("Cookies after login:", cookiesAfter.length);
      if (cookiesAfter.length > 0) {
        console.log("⚠️ WARNING: Cookies still present after login:", cookiesAfter.map(c => c.split("=")[0].trim()));
      }
      
      console.log("Redirecting to /dashboard/overview...");
      console.log("====================\n");

      // Use window.location for full page reload to ensure session is established
      window.location.href = "/dashboard/overview";
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                Remember me for 30 days
              </FormLabel>
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
