"use client";

import { createClient } from "@supabase/supabase-js";
import { handleStorageQuotaError, clearSupabaseStorage, aggressiveStorageCleanup } from "@/lib/utils/storage-cleanup";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Custom storage adapter with error handling for quota exceeded
const createSafeStorage = () => {
  if (typeof window === "undefined") return undefined;

  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        if (error instanceof Error && handleStorageQuotaError(error)) {
          return null; // Retry after cleanup
        }
        throw error;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        // First try to save directly
        localStorage.setItem(key, value);
      } catch (storageError: any) {
        // If quota exceeded, clear ALL localStorage (not just Supabase)
        if (storageError?.message?.includes('quota') || storageError?.message?.includes('QUOTA_EXCEEDED') || storageError?.code === 22) {
          console.warn('⚠️ Storage quota exceeded! Clearing ALL localStorage...');
          
          try {
            // Clear all localStorage except current key we're trying to save
            const keysToKeep = new Set([key]);
            const allKeys = Object.keys(localStorage);
            
            // First clear Supabase keys
            const clearedSupabase = clearSupabaseStorage();
            console.log(`Cleared ${clearedSupabase} Supabase keys`);
            
            // If still failing, use aggressive cleanup
            try {
              localStorage.setItem(key, value);
              console.log('✅ Successfully saved after Supabase cleanup');
            } catch (retryError: any) {
              if (retryError?.message?.includes('quota') || retryError?.code === 22) {
                console.warn('⚠️ Still failing after Supabase cleanup, performing aggressive cleanup...');
                
                // Aggressive cleanup - clear everything except what we're trying to save
                aggressiveStorageCleanup([key]);
                
                // Last resort: clear everything
                try {
                  localStorage.setItem(key, value);
                  console.log('✅ Successfully saved after aggressive cleanup');
                } catch (finalError: any) {
                  if (finalError?.message?.includes('quota') || finalError?.code === 22) {
                    console.error('❌ CRITICAL: Cannot save to localStorage even after full cleanup');
                    // Clear everything and try one more time
                    localStorage.clear();
                    try {
                      localStorage.setItem(key, value);
                      console.log('✅ Successfully saved after complete clear');
                    } catch (absoluteFinalError) {
                      console.error('❌ Storage completely full - user must manually clear browser storage');
                      throw new Error('LocalStorage is completely full. Please clear your browser storage manually (F12 > Application > Clear Storage) and try again.');
                    }
                  } else {
                    throw finalError;
                  }
                }
              } else {
                throw retryError;
              }
            }
          } catch (cleanupError) {
            console.error('Error during storage cleanup:', cleanupError);
            throw cleanupError;
          }
        } else {
          // Not a quota error, rethrow
          throw storageError;
        }
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing item:", error);
      }
    },
  };
};

// Use createClient instead of createBrowserClient to have full control
// Configure to use localStorage ONLY - NO cookies to prevent 431 errors
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: createSafeStorage(),
      storageKey: "sb-auth-token",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: {},
    },
  },
);

// Log client creation (only in browser)
if (typeof window !== "undefined") {
  console.log("✅ Supabase client created (localStorage ONLY, NO cookies)");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

