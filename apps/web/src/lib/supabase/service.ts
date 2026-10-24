import { createClient } from "@supabase/supabase-js";

import type { Database } from "@rtb/database";
import { evaluateReviewRuntime } from "@rtb/engineering-review/runtime";
import { resolvePublicSupabaseConfig } from "@/lib/supabase/public-config";

function resolveServiceSupabaseConfig(): { url: string; serviceRoleKey: string; projectRef: string } {
  const { url, projectRef } = resolvePublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!serviceRoleKey) {
    throw new Error("Supabase service role configuration is missing");
  }
  const runtime = process.env.NEXT_PUBLIC_RTB_REVIEW_RUNTIME ?? process.env.RTB_REVIEW_RUNTIME;
  const decision = evaluateReviewRuntime({ url, runtime, serviceRoleKey });
  if (!decision.ok) {
    throw new Error("Supabase service role configuration is missing");
  }
  return { url, serviceRoleKey, projectRef: decision.projectRef };
}

/** Service-role Supabase client for trusted scheduler/cron invocations. */
export function createServiceClient() {
  const { url, serviceRoleKey } = resolveServiceSupabaseConfig();
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
