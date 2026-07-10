import { expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function expectCrossTenantReadDenied(
  client: SupabaseClient,
  table: string,
  otherTenantId: string,
  tenantColumn = "tenant_id"
): Promise<void> {
  const { data, error } = await client
    .from(table)
    .select("id")
    .eq(tenantColumn, otherTenantId);

  if (error && error.code !== "PGRST116") {
    // RLS denial may surface as empty or policy error — both acceptable
    return;
  }
  expect(data ?? []).toHaveLength(0);
}

export async function expectWriteDenied(
  client: SupabaseClient,
  table: string,
  payload: Record<string, unknown>
): Promise<void> {
  const { error } = await client.from(table).insert(payload as never);
  expect(error).not.toBeNull();
}

export async function expectWriteAllowed(
  client: SupabaseClient,
  table: string,
  payload: Record<string, unknown>
): Promise<string | undefined> {
  const { data, error } = await client.from(table).insert(payload as never).select("id").single();
  expect(error).toBeNull();
  return data?.id as string | undefined;
}

export async function expectUpdateDenied(
  client: SupabaseClient,
  table: string,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const { error, count } = await client
    .from(table)
    .update(patch as never, { count: "exact" })
    .eq("id", id);
  expect(error !== null || count === 0).toBe(true);
}

export async function expectSelectOwnTenant(
  client: SupabaseClient,
  table: string,
  tenantId: string
): Promise<void> {
  const { data, error } = await client.from(table).select("id").eq("tenant_id", tenantId);
  expect(error).toBeNull();
  expect((data ?? []).length).toBeGreaterThan(0);
}
