import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client. Bypasses RLS — use ONLY in server-side code paths
// (webhooks, workers) that need to write on the user's behalf without a
// user session, e.g. crediting an account after a Stripe payment.
export function createAdminClient() {
  return createClient(env.supabase.url(), env.supabase.serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
