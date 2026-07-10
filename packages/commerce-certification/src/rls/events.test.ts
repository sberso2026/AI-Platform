import { describe, expect, it } from "vitest";

import { expectUpdateDenied } from "../lib/rls-helpers.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — events", () => {
  initRlsSuite();

  it("tenant member can read own subscription events", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data, error } = await clients.tenantA.viewer
      .from("commercial_subscription_events")
      .select("id")
      .eq("tenant_id", tenantA.id);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it("subscription events cannot be updated", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.admin
      .from("commercial_subscription_events")
      .select("id")
      .eq("tenant_id", tenantA.id)
      .limit(1)
      .single();
    if (!data?.id) return;
    await expectUpdateDenied(clients.tenantA.admin, "commercial_subscription_events", data.id, {
      event_type: "tampered",
    });
  });

  it("subscription events cannot be deleted", async () => {
    const { clients, tenantA } = useRlsContext();
    const { data } = await clients.tenantA.admin
      .from("commercial_subscription_events")
      .select("id")
      .eq("tenant_id", tenantA.id)
      .limit(1)
      .single();
    if (!data?.id) return;
    const { error, count } = await clients.tenantA.admin
      .from("commercial_subscription_events")
      .delete({ count: "exact" })
      .eq("id", data.id);
    expect(error !== null || count === 0).toBe(true);
  });

  it("ordinary users cannot read outbox events", async () => {
    const { clients } = useRlsContext();
    const { data } = await clients.tenantA.admin.from("commercial_outbox_events").select("id");
    expect(data ?? []).toHaveLength(0);
  });

  it("ordinary users cannot mutate outbox events", async () => {
    const { clients, tenantA } = useRlsContext();
    const { error } = await clients.tenantA.admin.from("commercial_outbox_events").insert({
      tenant_id: tenantA.id,
      aggregate_type: "cert",
      aggregate_id: tenantA.id,
      event_type: "cert.probe",
      payload: {},
    } as never);
    expect(error).not.toBeNull();
  });
});
