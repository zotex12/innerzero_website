import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Admin client bypasses RLS - use only in server-side API routes.
// NEVER import this file from client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
