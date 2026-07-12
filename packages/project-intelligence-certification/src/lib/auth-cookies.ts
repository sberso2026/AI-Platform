import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { resolveSupabaseAnonKey, resolveSupabaseUrl } from "../fixtures/env.js";

export interface AuthCookieSet {
  cookies: { name: string; value: string; options: CookieOptions }[];
}

/** Signs in with fixture credentials and captures the SSR cookies Supabase emits. */
export async function buildAuthCookies(email: string, password: string): Promise<AuthCookieSet> {
  const url = resolveSupabaseUrl();
  const anonKey = resolveSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required for auth cookies");
  }

  const cookies: AuthCookieSet["cookies"] = [];
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookies.map(({ name, value }) => ({ name, value })),
      setAll: (entries: { name: string; value: string; options: CookieOptions }[]) => {
        for (const entry of entries) {
          const index = cookies.findIndex((cookie) => cookie.name === entry.name);
          if (index >= 0) cookies[index] = entry;
          else cookies.push(entry);
        }
      },
    },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`signInWithPassword failed for ${email}: ${error?.message ?? "no session"}`);
  }
  return { cookies };
}
