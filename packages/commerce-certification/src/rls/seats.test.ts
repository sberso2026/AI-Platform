import { describe, expect, it } from "vitest";

import { expectCrossTenantReadDenied, expectWriteDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — seats", () => {
  initRlsSuite();

  it("tenant A cannot read tenant B seat pools", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(clients.tenantA.owner, "commercial_seats", tenantB.id);
  });

  it("tenant A cannot read tenant B seat assignments", async () => {
    const { clients, tenantB } = useRlsContext();
    await expectCrossTenantReadDenied(
      clients.tenantA.owner,
      "commercial_seat_assignments",
      tenantB.id
    );
  });

  it("viewer cannot assign seats", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectWriteDenied(clients.tenantA.viewer, "commercial_seat_assignments", {
      tenant_id: tenantA.id,
      seat_pool_id: tenantA.seatPoolId,
      user_id: tenantA.users.viewer.userId,
      status: "active",
    });
  });

  it("engineer cannot assign seats", async () => {
    const { clients, tenantA } = useRlsContext();
    await expectWriteDenied(clients.tenantA.engineer, "commercial_seat_assignments", {
      tenant_id: tenantA.id,
      seat_pool_id: tenantA.seatPoolId,
      user_id: tenantA.users.engineer.userId,
      status: "active",
    });
  });

  it("admin can read seat pool", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.admin
      .from("commercial_seats")
      .select("id")
      .eq("id", tenantA.seatPoolId)
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBe(tenantA.seatPoolId);
  });
});
