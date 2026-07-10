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

export async function expectSelectOwnTenant(
  client: SupabaseClient,
  table: string,
  tenantId: string
): Promise<void> {
  const { data, error } = await client.from(table).select("id").eq("tenant_id", tenantId);
  expect(error).toBeNull();
  expect((data ?? []).length).toBeGreaterThan(0);
}
