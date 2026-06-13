import { mutate } from "swr";
import { createSupabaseClient } from "./supabase";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Clears all cached data and signs out the user
 * This ensures no stale data remains after logout
 */
export async function clearUserDataAndSignOut() {
  // Clear all SWR cache first
  await mutate(() => true, undefined, { revalidate: false });

  // Sign out from Supabase
  const supabase = createSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Custom hook for handling logout with proper cleanup
 */
export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    await clearUserDataAndSignOut();
    // Redirect to login page
    router.replace("/login");
  }, [router]);

  return logout;
}
