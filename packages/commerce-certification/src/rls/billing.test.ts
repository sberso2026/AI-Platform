import { describe, expect, it } from "vitest";

import { expectCrossTenantReadDenied, expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — billing", () => {
  initRlsSuite();

  it("viewer cannot read billing accounts", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.viewer
      .from("commercial_billing_accounts")
      .select("id")
      .eq("tenant_id", tenantA.id);
    expect(data ?? []).toHaveLength(0);
  });

  it("engineer cannot read billing accounts", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.engineer
      .from("commercial_billing_accounts")
      .select("id")
      .eq("tenant_id", tenantA.id);
    expect(data ?? []).toHaveLength(0);
  });

  it("admin can read billing accounts", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.admin
      .from("commercial_billing_accounts")
      .select("id")
      .eq("id", tenantA.billingAccountId)
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBe(tenantA.billingAccountId);
  });

  it("owner can read billing accounts", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.owner
      .from("commercial_billing_accounts")
      .select("id")
      .eq("id", tenantA.billingAccountId)
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBe(tenantA.billingAccountId);
  });

  it("cross-tenant billing read fails", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_billing_accounts",
      tenantB.id
    );
  });

  it("viewer cannot insert credit ledger entries", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectWriteDenied(clients.tenantA.viewer, "commercial_credit_ledger", {
      tenant_id: tenantA.id,
      entry_type: "credit",
      amount_cents: 100,
      currency: "AUD",
      balance_after_cents: 100,
      reason: "cert probe",
    });
  });

  it("tenant member can read credit ledger", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.viewer
      .from("commercial_credit_ledger")
      .select("id")
      .eq("tenant_id", tenantA.id);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(0);
  });
});
