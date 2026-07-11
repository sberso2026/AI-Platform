import { createClient } from "@supabase/supabase-js";

import { resolveServiceRoleKey, resolveSupabaseUrl } from "./env.js";

export function createCertAdminClient() {
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key);
}
