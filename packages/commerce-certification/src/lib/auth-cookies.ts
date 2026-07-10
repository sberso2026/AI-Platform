import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { resolveSupabaseAnonKey, resolveSupabaseUrl } from "./env.js";

export interface AuthCookieSet {
  cookieHeader: string;
  cookies: { name: string; value: string; options: CookieOptions }[];
  accessToken: string;
}

/**
 * Signs in with email/password and captures Supabase SSR auth cookies for HTTP fetch tests.
 */
export async function buildAuthCookies(
  email: string,
  password: string
): Promise<AuthCookieSet> {
  const url = resolveSupabaseUrl();
  const anonKey = resolveSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required for auth cookies");
  }

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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`signInWithPassword failed for ${email}: ${error?.message ?? "no session"}`);
  }

  const cookieHeader = cookies.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");

  return {
    cookieHeader,
    cookies,
    accessToken: data.session.access_token,
  };
}

export async function buildAuthCookiesFromJwt(jwt: string, email: string): Promise<AuthCookieSet> {
  const url = resolveSupabaseUrl();
  const anonKey = resolveSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
  }

  const projectRef = new URL(url).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify([
    {
      access_token: jwt,
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "cert-refresh-placeholder",
      user: { id: "cert-user", email },
    },
  ]);

  const cookies = [
    {
      name: cookieName,
      value: sessionPayload,
      options: { path: "/", sameSite: "lax" as const },
    },
  ];

  return {
    cookieHeader: `${cookieName}=${encodeURIComponent(sessionPayload)}`,
    cookies,
    accessToken: jwt,
  };
}
