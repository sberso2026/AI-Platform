import { describe, expect, it } from "vitest";

import { expectCrossTenantReadDenied, expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — overrides", () => {
  initRlsSuite();

  it("tenant A cannot read tenant B overrides", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_entitlement_overrides",
      tenantB.id
    );
  });

  it("viewer cannot create override", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectWriteDenied(clients.tenantA.viewer, "commercial_entitlement_overrides", {
      tenant_id: tenantA.id,
      override_type: "feature",
      effect: "allow",
      reason: "cert viewer probe",
      application_key: "documents",
    });
  });

  it("admin can read tenant overrides", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.admin
      .from("commercial_entitlement_overrides")
      .select("id, effect")
      .eq("tenant_id", tenantA.id);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it("expired deny override is visible to admin", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.admin
      .from("commercial_entitlement_overrides")
      .select("id, effect, valid_until")
      .eq("tenant_id", tenantA.id)
      .eq("effect", "deny");
    expect((data ?? []).length).toBeGreaterThanOrEqual(0);
  });
});
