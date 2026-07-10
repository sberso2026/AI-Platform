import { describe, expect, it } from "vitest";

import { createAdminClient } from "../lib/supabase.js";
import { CERT_SLUG_PREFIX } from "../lib/env.js";
import { initRlsSuite, skipUnlessRlsReady, useRlsContext } from "./context.js";

describe.skipIf(skipUnlessRlsReady())("Commerce RLS — role provisioning", () => {
  initRlsSuite();

  it("owner role bypasses via has_permission for commerce admin", async () => {
    const { tenantA } = useRlsContext();
    const ownerJwt = tenantA.users.owner.jwt;
    const { createAuthedClient } = await import("../lib/supabase.js");
    const client = createAuthedClient(ownerJwt);
    const { data, error } = await client.rpc("has_permission", {
      p_resource: "commerce",
      p_action: "admin",
      p_tenant_id: tenantA.id,
    });
    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  it("admin role has manage_subscriptions permission", async () => {
    const { tenantA } = useRlsContext();
    const admin = createAdminClient();
    const { data } = await admin
      .from("roles")
      .select("permissions")
      .eq("tenant_id", tenantA.id)
      .eq("slug", "admin")
      .single();
    const perms = JSON.stringify(data?.permissions ?? []);
    expect(perms.includes("manage_subscriptions")).toBe(true);
    expect(perms.includes("manage_licences")).toBe(true);
    expect(perms.includes("manage_seats")).toBe(true);
  });

  it("engineer role does not have commerce admin", async () => {
    const { tenantA } = useRlsContext();
    const admin = createAdminClient();
    const { data } = await admin
      .from("roles")
      .select("permissions")
      .eq("tenant_id", tenantA.id)
      .eq("slug", "engineer")
      .single();
    const perms = JSON.stringify(data?.permissions ?? []);
    expect(perms.includes("manage_subscriptions")).toBe(false);
    expect(perms.includes('"action":"admin"')).toBe(false);
  });

  it("viewer role is read-only for commerce", async () => {
    const { tenantA } = useRlsContext();
    const admin = createAdminClient();
    const { data } = await admin
      .from("roles")
      .select("permissions")
      .eq("tenant_id", tenantA.id)
      .eq("slug", "viewer")
      .single();
    const perms = JSON.stringify(data?.permissions ?? []);
    expect(perms.includes("manage_subscriptions")).toBe(false);
    expect(perms.includes('"action":"read"')).toBe(true);
  });

  it("cert tenants use expected slug prefix", async () => {
    const { manifest } = useRlsContext();
    expect(manifest.tenantA.slug.startsWith(CERT_SLUG_PREFIX)).toBe(true);
    expect(manifest.tenantB.slug.startsWith(CERT_SLUG_PREFIX)).toBe(true);
  });
});
