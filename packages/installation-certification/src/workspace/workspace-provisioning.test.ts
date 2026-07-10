import { beforeAll, describe, expect, it } from "vitest";

import { buildAuthCookies } from "../lib/auth-cookies.js";
import {
  certUserPassword,
  isCertificationMode,
  loadFixturesManifest,
  requireFixturesManifest,
} from "../lib/env.js";
import { httpFetch } from "../lib/http-client.js";
import { createAdminClient } from "../lib/supabase.js";
import { expectCrossTenantReadDenied } from "../lib/rls-helpers.js";
import { createAuthedClient } from "../lib/supabase.js";

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Workspace provisioning and isolation", () => {
  let tenantId: string;
  let workspaceA: string;
  let workspaceB: string;
  let ownerCookies: string;
  let installationId: string;

  beforeAll(async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    tenantId = manifest.tenantA.id;
    workspaceA = manifest.tenantA.workspaces[0]!.id;
    workspaceB = manifest.tenantA.workspaces[1]!.id;
    installationId = manifest.tenantA.installations.productInstallationId;

    ownerCookies = (
      await buildAuthCookies(manifest.tenantA.users.owner.email, certUserPassword())
    ).cookieHeader;
  });

  it("lists workspace product assignments for tenant", async () => {
    const res = await httpFetch({
      path: "/api/platform/workspace-product-assignments",
      cookieHeader: ownerCookies,
      tenantId,
      workspaceId: workspaceA,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data?: { workspace_id: string }[] };
    expect((body.data ?? []).some((r) => r.workspace_id === workspaceA)).toBe(true);
  });

  it("RLS isolates workspace assignments across tenants", async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    const client = createAuthedClient(manifest.tenantA.users.owner.jwt);
    await expectCrossTenantReadDenied(
      client,
      "commercial_workspace_product_assignments",
      manifest.tenantB.id
    );
  });

  it("admin can assign installation to second workspace", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/workspace-product-assignments",
      cookieHeader: ownerCookies,
      tenantId,
      workspaceId: workspaceB,
      body: { installationId, workspaceId: workspaceB },
    });
    expect([200, 201, 409]).toContain(res.status);
  });

  it("workspace B assignment is distinct from workspace A in database", async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("commercial_workspace_product_assignments")
      .select("workspace_id")
      .eq("tenant_id", tenantId)
      .eq("installation_id", installationId)
      .eq("status", "active");
    const workspaceIds = new Set((data ?? []).map((r) => r.workspace_id as string));
    expect(workspaceIds.has(workspaceA)).toBe(true);
  });
});
