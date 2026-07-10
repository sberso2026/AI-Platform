import { describe, expect, it } from "vitest";

import { expectCrossTenantReadDenied, expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — cross-tenant isolation", () => {
  initRlsSuite();

  it("denies cross-tenant read on commercial_subscriptions", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_subscriptions",
      tenantB.id
    );
  });

  it("denies cross-tenant read on commercial_licenses", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(clients.tenantA.owner, "commercial_licenses", tenantB.id);
  });

  it("denies cross-tenant read on commercial_seats", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(clients.tenantA.owner, "commercial_seats", tenantB.id);
  });

  it("denies cross-tenant read on commercial_subscription_events", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_subscription_events",
      tenantB.id
    );
  });

  it("denies cross-tenant read on commercial_seat_assignments", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_seat_assignments",
      tenantB.id
    );
  });

  it("denies cross-tenant read on commercial_entitlement_overrides", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_entitlement_overrides",
      tenantB.id
    );
  });

  it("denies cross-tenant write on commercial_entitlement_overrides", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectWriteDenied(clients.tenantA.admin, "commercial_entitlement_overrides", {
      tenant_id: tenantB.id,
      override_type: "cert_test",
      effect: "allow",
      reason: "cert cross-tenant probe",
    });
  });

  it("denies cross-tenant read on commercial_outbox_events", async () => {
    const { clients, tenantB } = useRlsContext();
    const { data } = await clients.tenantA.owner
      .from("commercial_outbox_events")
      .select("id")
      .eq("tenant_id", tenantB.id);
    expect(data ?? []).toHaveLength(0);
  });
});
