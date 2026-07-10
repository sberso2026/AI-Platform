import { describe, expect, it } from "vitest";

import { expectSelectOwnTenant, expectUpdateDenied, expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — subscriptions", () => {
  initRlsSuite();

  it("tenant member can read own subscriptions", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectSelectOwnTenant(clients.tenantA.viewer, "commercial_subscriptions", tenantA.id);
  });

  it("viewer cannot update subscription", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectUpdateDenied(clients.tenantA.viewer, "commercial_subscriptions", tenantA.subscriptionId, {
      status: "paused",
    });
  });

  it("engineer cannot update subscription", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectUpdateDenied(
      clients.tenantA.engineer,
      "commercial_subscriptions",
      tenantA.subscriptionId,
      { status: "paused" }
    );
  });

  it("admin can read own subscription", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.admin
      .from("commercial_subscriptions")
      .select("id, status")
      .eq("id", tenantA.subscriptionId)
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBe(tenantA.subscriptionId);
  });

  it("owner can read own subscription", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.owner
      .from("commercial_subscriptions")
      .select("id")
      .eq("id", tenantA.subscriptionId)
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBe(tenantA.subscriptionId);
  });

  it("viewer cannot insert subscription", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectWriteDenied(clients.tenantA.viewer, "commercial_subscriptions", {
      tenant_id: tenantA.id,
      product_id: tenantA.subscriptionId,
      status: "active",
    });
  });
});
