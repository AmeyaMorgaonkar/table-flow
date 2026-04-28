import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/Client Components.
 * This uses the anon key and handles cookies automatically.
 * Call this function in every component that needs Supabase — do NOT share instances.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
