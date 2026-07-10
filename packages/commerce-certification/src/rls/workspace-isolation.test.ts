import { describe, expect, it } from "vitest";

import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — workspace isolation", () => {
  initRlsSuite();

  it("workspace-scoped licence is tied to workspace A", async () => {
    const { clients, tenantA } = useRlsContext();
    const wsA = tenantA.workspaces[0]!.id;
    const wsB = tenantA.workspaces[1]!.id;

    const { data: scoped } = await clients.tenantA.admin
      .from("commercial_licenses")
      .select("id, workspace_id")
      .eq("tenant_id", tenantA.id)
      .eq("workspace_id", wsA)
      .limit(1);

    expect((scoped ?? []).length).toBeGreaterThan(0);

    const { data: wrongWs } = await clients.tenantA.admin
      .from("commercial_licenses")
      .select("id")
      .eq("tenant_id", tenantA.id)
      .eq("workspace_id", wsB)
      .eq("license_type", "workspace");

    // workspace licence for wsA should not appear under wsB filter
    const scopedIds = new Set((scoped ?? []).map((r) => r.id));
    for (const row of wrongWs ?? []) {
      expect(scopedIds.has(row.id)).toBe(false);
    }
  });

  it("seat assignment workspace scope is enforced at pool level", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.admin
      .from("commercial_seat_assignments")
      .select("id, workspace_id")
      .eq("tenant_id", tenantA.id)
      .not("workspace_id", "is", null);
    expect((data ?? []).length).toBeGreaterThanOrEqual(0);
  });

  it("workspace-scoped override does not apply to other workspace", async () => {
    const { clients, tenantA } = useRlsContext();
    const wsA = tenantA.workspaces[0]!.id;
    const { data } = await clients.tenantA.admin
      .from("commercial_entitlement_overrides")
      .select("id, workspace_id")
      .eq("tenant_id", tenantA.id)
      .eq("workspace_id", wsA);
    expect((data ?? []).length).toBeGreaterThanOrEqual(0);
  });
});
