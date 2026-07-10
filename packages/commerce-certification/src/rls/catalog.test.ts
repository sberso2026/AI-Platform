import { describe, expect, it } from "vitest";

import { expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — catalogue", () => {
  initRlsSuite();

  it("tenant user can read commercial_plan_entitlements", async () => {
    const { clients } = useRlsContext();
    const { data, error } = await clients.tenantA.viewer
      .from("commercial_plan_entitlements")
      .select("id")
      .limit(5);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it("tenant user cannot mutate commercial_products", async () => {
    const { clients } = useRlsContext();
    await expectWriteDenied(clients.tenantA.admin, "commercial_products", {
      slug: "cert-forged-product",
      name: "Forged",
      product_type: "application",
      lifecycle_status: "active",
      visibility: "public",
    });
  });

  it("tenant user cannot mutate commercial_plan_entitlements", async () => {
    const { clients } = useRlsContext();
    const { error } = await clients.tenantA.admin
      .from("commercial_plan_entitlements")
      .insert({
        plan_id: "d1000000-0000-4000-8000-000000000001",
        entitlement_type: "product_access",
        entitlement_key: "cert-forged",
        value_type: "boolean",
        boolean_value: true,
      } as never);
    expect(error).not.toBeNull();
  });

  it("tenant user can read commercial_features", async () => {
    const { clients } = useRlsContext();
    const { data, error } = await clients.tenantA.viewer.from("commercial_features").select("id").limit(3);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });
});
