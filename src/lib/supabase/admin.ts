import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// Admin client bypasses RLS — use only in server-side code (API routes)
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
