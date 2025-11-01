// DEPRECATED: Server-side Supabase client is disabled to prevent 431 errors
// All authentication is now handled client-side only via browser localStorage
// This file is kept for backward compatibility but should not be used

import { createServerClient } from "@supabase/ssr";

/**
 * @deprecated Do not use server-side Supabase client
 * Use client-side supabaseClient from @/lib/supabase/client instead
 * This prevents 431 errors from large server-side cookies
 */
export async function createSupabaseServerClient() {
  // Return a no-op client that does nothing
  // Authentication is handled entirely client-side
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return empty - no server-side cookies
          return [];
        },
        setAll() {
          // Do nothing - prevent server-side cookie setting
          // This prevents 431 errors
        },
      },
    },
  );
}

