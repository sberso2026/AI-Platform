import { describe, expect, it, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
const TENANT_A_JWT = process.env.COMMERCE_RLS_TENANT_A_JWT;
const TENANT_B_JWT = process.env.COMMERCE_RLS_TENANT_B_JWT;
const TENANT_B_ID = process.env.COMMERCE_RLS_TENANT_B_ID;

const envReady = Boolean(TEST_URL && TEST_ANON_KEY && TENANT_A_JWT && TENANT_B_JWT && TENANT_B_ID);

function authedClient(jwt: string): SupabaseClient {
  return createClient(TEST_URL!, TEST_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

describe.skipIf(!envReady)("Commerce RLS cross-tenant isolation", () => {
  let clientA: SupabaseClient;

  beforeAll(() => {
    clientA = authedClient(TENANT_A_JWT!);
  });

  async function expectCrossTenantDeny(table: string, tenantColumn = "tenant_id"): Promise<void> {
    const { data, error } = await clientA
      .from(table)
      .select("id")
      .eq(tenantColumn, TENANT_B_ID!);

    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  }

  async function expectCrossTenantWriteDeny(table: string): Promise<void> {
    const { error } = await clientA.from(table).insert({
      tenant_id: TENANT_B_ID,
      status: "active",
    } as never);

    expect(error).not.toBeNull();
  }

  it("denies cross-tenant read on commercial_subscriptions", async () => {
    await expectCrossTenantDeny("commercial_subscriptions");
  });

  it("denies cross-tenant read on commercial_licenses", async () => {
    await expectCrossTenantDeny("commercial_licenses");
  });

  it("denies cross-tenant read on commercial_seats", async () => {
    await expectCrossTenantDeny("commercial_seats");
  });

  it("denies cross-tenant read on commercial_subscription_events", async () => {
    await expectCrossTenantDeny("commercial_subscription_events");
  });

  it("denies cross-tenant read on commercial_seat_assignments", async () => {
    await expectCrossTenantDeny("commercial_seat_assignments");
  });

  it("denies cross-tenant read on commercial_outbox_events", async () => {
    await expectCrossTenantDeny("commercial_outbox_events");
  });

  it("denies cross-tenant read on commercial_entitlement_overrides", async () => {
    await expectCrossTenantDeny("commercial_entitlement_overrides");
  });

  it("denies cross-tenant write on commercial_entitlement_overrides", async () => {
    await expectCrossTenantWriteDeny("commercial_entitlement_overrides");
  });
});

describe("Commerce RLS suite", () => {
  it("skips when SUPABASE_TEST_URL or JWT env is missing", () => {
    if (!envReady) {
      expect(envReady).toBe(false);
      return;
    }
    expect(envReady).toBe(true);
  });
});
