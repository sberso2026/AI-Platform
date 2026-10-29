import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Untyped client — @rtb/database generated types do not include Review AI tables yet.
 * Domain contracts are mapped in supabase-store.ts; row types never leave this package.
 */
export type ReviewSqlClient = SupabaseClient<any, "public", any>;

export type ReviewClientKind = "authenticated" | "service" | "anon";

export function createAnonReviewClient(url: string, anonKey: string): ReviewSqlClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createServiceReviewClient(url: string, serviceKey: string): ReviewSqlClient {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAuthenticatedReviewClient(
  url: string,
  anonKey: string,
  accessToken: string,
): ReviewSqlClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export async function signInAccessToken(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<string> {
  const client = createAnonReviewClient(url, anonKey);
  let detail = "unknown";
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (data.session?.access_token) return data.session.access_token;
    detail = error?.message ?? "no_session";
    await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
  }
  throw new Error(`JWT sign-in failed for ${email}: ${detail}`);
}
