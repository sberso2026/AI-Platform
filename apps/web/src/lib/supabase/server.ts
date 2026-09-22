import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolvePublicSupabaseConfig } from "@/lib/supabase/public-config";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = resolvePublicSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from Server Component — middleware handles refresh
        }
      },
    },
  });
}
