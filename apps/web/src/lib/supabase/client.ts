import { createBrowserClient } from "@supabase/ssr";
import { resolvePublicSupabaseConfig } from "@/lib/supabase/public-config";

export function createClient() {
  const { url, anonKey } = resolvePublicSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
