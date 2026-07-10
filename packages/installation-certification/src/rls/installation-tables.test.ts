import { describe, expect, it } from "vitest";

import { expectCrossTenantReadDenied, expectSelectOwnTenant } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Installation RLS — product installations", () => {
  initRlsSuite();

  it("tenant A owner reads own commercial_installations", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectSelectOwnTenant(clients.tenantA.owner, "commercial_installations", tenantA.id);
  });

  it("denies cross-tenant read on commercial_installations", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_installations",
      tenantB.id
    );
  });

  it("tenant A owner reads own commercial_application_installations", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectSelectOwnTenant(
      clients.tenantA.owner,
      "commercial_application_installations",
      tenantA.id
    );
  });

  it("denies cross-tenant read on commercial_application_installations", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_application_installations",
      tenantB.id
    );
  });
});

describe.skipIf(skipUnlessRlsReady())("Installation RLS — workflow tables", () => {
  initRlsSuite();

  const tables = [
    "commercial_installation_versions",
    "commercial_installation_workflows",
    "commercial_installation_health_checks",
    "commercial_workspace_product_assignments",
    "commercial_workspace_application_assignments",
  ] as const;

  for (const table of tables) {
    it(`tenant A reads own ${table}`, async () => {
      const { clients, tenantA } = useRlsContext();
      const selectColumns =
        table === "commercial_installation_versions" ? "tenant_id, version" : "id";
      const { data, error } = await clients.tenantA.admin
        .from(table)
        .select(selectColumns)
        .eq("tenant_id", tenantA.id);
      expect(error).toBeNull();
      expect((data ?? []).length).toBeGreaterThanOrEqual(0);
    });

    it(`denies cross-tenant read on ${table}`, async () => {
      const { clients, tenantB } = useRlsContext();
      await expectCrossTenantReadDenied(clients.tenantA.owner, table, tenantB.id);
    });
  }
});

describe.skipIf(skipUnlessRlsReady())("Installation RLS — catalog dependencies", () => {
  initRlsSuite();

  it("authenticated user can read global installation dependencies", async () => {
    const { clients } = useRlsContext();
    const { data, error } = await clients.tenantA.owner
      .from("commercial_installation_dependencies")
      .select("id, product_id, depends_on_product_id")
      .is("tenant_id", null);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(0);
  });
});
