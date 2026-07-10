import { describe, expect, it } from "vitest";

import { isCertificationMode, loadFixturesManifest } from "../lib/env.js";
import { createAdminClient, createAuthedClient } from "../lib/supabase.js";

const skipLocal =
  !isCertificationMode() &&
  !(process.env.SUPABASE_TEST_URL && process.env.SUPABASE_TEST_ANON_KEY && loadFixturesManifest());

describe.skipIf(skipLocal)("SECURITY DEFINER functions", () => {
  const manifest = loadFixturesManifest();
  const tenantAId = manifest?.tenantA.id;
  const tenantBId = manifest?.tenantB.id;
  const ownerJwt = manifest?.tenantA.users.owner.jwt;
  const viewerJwt = manifest?.tenantA.users.viewer.jwt;

  it("has_permission returns true for owner commerce admin", async () => {
    if (!ownerJwt || !tenantAId) return;
    const client = createAuthedClient(ownerJwt);
    const { data, error } = await client.rpc("has_permission", {
      p_resource: "commerce",
      p_action: "admin",
      p_tenant_id: tenantAId,
    });
    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  it("has_permission returns false for viewer commerce admin", async () => {
    if (!viewerJwt || !tenantAId) return;
    const client = createAuthedClient(viewerJwt);
    const { data, error } = await client.rpc("has_permission", {
      p_resource: "commerce",
      p_action: "admin",
      p_tenant_id: tenantAId,
    });
    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  it("has_permission does not grant cross-tenant access", async () => {
    if (!ownerJwt || !tenantBId) return;
    const client = createAuthedClient(ownerJwt);
    const { data, error } = await client.rpc("has_permission", {
      p_resource: "commerce",
      p_action: "admin",
      p_tenant_id: tenantBId,
    });
    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  it("is_platform_admin returns false for ordinary tenant user", async () => {
    if (!ownerJwt) return;
    const client = createAuthedClient(ownerJwt);
    const { data, error } = await client.rpc("is_platform_admin");
    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  it("create_default_tenant_roles is idempotent for cert tenant", async () => {
    if (!tenantAId) return;
    const admin = createAdminClient();
    const { error: first } = await admin.rpc("create_default_tenant_roles", {
      p_tenant_id: tenantAId,
    });
    expect(first).toBeNull();

    const { count: before } = await admin
      .from("roles")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantAId);

    const { error: second } = await admin.rpc("create_default_tenant_roles", {
      p_tenant_id: tenantAId,
    });
    expect(second).toBeNull();

    const { count: after } = await admin
      .from("roles")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantAId);

    expect(after).toBe(before);
  });

  it("bump_commercial_entitlement_version exists for tenant", async () => {
    if (!tenantAId) return;
    const admin = createAdminClient();
    const { error } = await admin.rpc("bump_commercial_entitlement_version", {
      p_tenant_id: tenantAId,
    });
    expect(error).toBeNull();
  });
});
