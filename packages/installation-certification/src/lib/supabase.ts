import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env.js";

function clientOptions() {
  return { auth: { persistSession: false, autoRefreshToken: false } };
}

export function createAdminClient(): SupabaseClient {
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key, clientOptions());
}

export function createAnonClient(): SupabaseClient {
  const url = resolveSupabaseUrl() ?? process.env.SUPABASE_TEST_URL;
  const key = resolveSupabaseAnonKey() ?? process.env.SUPABASE_TEST_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL and anon key are required");
  }
  return createClient(url, key, clientOptions());
}

export function createAuthedClient(jwt: string): SupabaseClient {
  const url = process.env.SUPABASE_TEST_URL ?? resolveSupabaseUrl();
  const key = process.env.SUPABASE_TEST_ANON_KEY ?? resolveSupabaseAnonKey();
  if (!url || !key) {
    throw new Error("SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY are required");
  }
  return createClient(url, key, {
    ...clientOptions(),
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}
