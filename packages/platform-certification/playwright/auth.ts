import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { BrowserContext } from "@playwright/test";
import { certUserPassword, resolveSupabaseAnonKey, resolveSupabaseUrl } from "../src/lib/env.js";

export async function signInAs(
  context: BrowserContext,
  email: string,
  password = certUserPassword(),
): Promise<void> {
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const cookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookies.map(({ name, value }) => ({ name, value })),
      setAll: (toSet) => {
        for (const entry of toSet) {
          const idx = cookies.findIndex((c) => c.name === entry.name);
          if (idx >= 0) cookies[idx] = entry;
          else cookies.push(entry);
        }
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const base = new URL(process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000");
  await context.addCookies(
    cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: base.hostname,
      path: "/",
    })),
  );
}
