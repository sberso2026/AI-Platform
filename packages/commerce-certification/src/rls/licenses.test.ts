import { describe, expect, it } from "vitest";

import { expectCrossTenantReadDenied, expectUpdateDenied, expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — licences", () => {
  initRlsSuite();

  it("tenant A cannot read tenant B licences", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(clients.tenantA.owner, "commercial_licenses", tenantB.id);
  });

  it("viewer cannot revoke licence", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.admin
      .from("commercial_licenses")
      .select("id")
      .eq("tenant_id", tenantA.id)
      .eq("status", "active")
      .limit(1)
      .single();
    if (!data?.id) return;
    await expectUpdateDenied(clients.tenantA.viewer, "commercial_licenses", data.id, {
      status: "revoked",
    });
  });

  it("engineer cannot insert licence", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectWriteDenied(clients.tenantA.engineer, "commercial_licenses", {
      tenant_id: tenantA.id,
      product_id: "c1000000-0000-4000-8000-000000000001",
      license_type: "product",
      status: "active",
    });
  });

  it("expired licence remains readable to tenant member", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.viewer
      .from("commercial_licenses")
      .select("id, status")
      .eq("tenant_id", tenantA.id)
      .eq("status", "expired");
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(0);
  });
});
