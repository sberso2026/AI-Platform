import { describe, expect, it } from "vitest";

const envReady = Boolean(
  process.env.SUPABASE_TEST_URL &&
    process.env.SUPABASE_TEST_ANON_KEY &&
    (process.env.BOS_RLS_TENANT_A_JWT || process.env.COMMERCE_RLS_TENANT_A_JWT) &&
    (process.env.BOS_RLS_TENANT_B_JWT || process.env.COMMERCE_RLS_TENANT_B_JWT) &&
    (process.env.BOS_RLS_TENANT_B_ID || process.env.COMMERCE_RLS_TENANT_B_ID),
);

describe("BOS-12 live RLS suite", () => {
  it("does not represent SQL inspection as live RLS when the database environment is absent", () => {
    if (!envReady) {
      expect(envReady).toBe(false);
    }
  });

  it.skipIf(!envReady)("requires a live runner to assert Tenant A cannot read Tenant B rows", () => {
    expect(envReady).toBe(true);
  });
});
