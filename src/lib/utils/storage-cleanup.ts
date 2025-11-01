/**
 * Utility functions to manage localStorage and prevent quota exceeded errors
 */

/**
 * Clears all Supabase-related items from localStorage
 */
export function clearSupabaseStorage(): number {
  try {
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter((key) => 
      key.includes('supabase') || key.includes('sb-') || key.startsWith('sb-auth-token')
    );
    
    let cleared = 0;
    supabaseKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
        cleared++;
        console.log(`Cleared localStorage key: ${key}`);
      } catch (e) {
        console.error(`Failed to remove ${key}:`, e);
      }
    });
    
    return cleared;
  } catch (error) {
    console.error('Error clearing Supabase storage:', error);
    return 0;
  }
}

/**
 * Aggressively clears localStorage to free up space
 * Only keeps critical keys if specified
 */
export function aggressiveStorageCleanup(keepKeys: string[] = []): number {
  try {
    const keysToKeep = new Set(keepKeys);
    const allKeys = Object.keys(localStorage);
    let cleared = 0;
    
    // Clear everything except keepKeys
    allKeys.forEach((key) => {
      if (!keysToKeep.has(key)) {
        try {
          localStorage.removeItem(key);
          cleared++;
        } catch (e) {
          // Ignore removal errors
        }
      }
    });
    
    console.log(`Cleared ${cleared} localStorage items`);
    return cleared;
  } catch (error) {
    console.error('Error during aggressive cleanup:', error);
    return 0;
  }
}

/**
 * Gets the size of localStorage in bytes (approximate)
 */
export function getLocalStorageSize(): number {
  let total = 0;
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
  } catch (e) {
    console.error('Error calculating localStorage size:', e);
  }
  return total;
}

/**
 * Gets localStorage size in a human-readable format
 */
export function getLocalStorageSizeFormatted(): string {
  const size = getLocalStorageSize();
  const kb = size / 1024;
  const mb = kb / 1024;
  
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  } else if (kb >= 1) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${size} bytes`;
  }
}

/**
 * Clears all localStorage (use with caution!)
 */
export function clearAllLocalStorage() {
  try {
    localStorage.clear();
    console.log('All localStorage cleared');
    return true;
  } catch (error) {
    console.error('Error clearing all localStorage:', error);
    return false;
  }
}

/**
 * Handles localStorage quota exceeded errors gracefully
 */
export function handleStorageQuotaError(error: Error, callback?: () => void): boolean {
  if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
    console.warn('LocalStorage quota exceeded. Attempting to clear Supabase storage...');
    
    try {
      const clearedCount = clearSupabaseStorage();
      console.log(`Cleared ${clearedCount} Supabase storage items`);
      
      if (callback) {
        callback();
      }
      
      return true;
    } catch (cleanupError) {
      console.error('Error during storage cleanup:', cleanupError);
      // If cleanup fails, clear all localStorage
      try {
        clearAllLocalStorage();
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (e) {
        console.error('Failed to clear all storage:', e);
      }
      return true;
    }
  }
  return false;
}

