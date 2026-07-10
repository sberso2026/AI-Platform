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

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Installation version cache invalidation", () => {
  let tenantId: string;
  let workspaceId: string;
  let ownerCookies: string;
  let installationId: string;

  beforeAll(async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    tenantId = manifest.tenantA.id;
    workspaceId = manifest.tenantA.workspaces[0]!.id;
    installationId = manifest.tenantA.installations.productInstallationId;

    ownerCookies = (
      await buildAuthCookies(manifest.tenantA.users.owner.email, certUserPassword())
    ).cookieHeader;
  });

  const ctx = () => ({ tenantId, workspaceId });

  it("entitlement check reflects installation after version bump", async () => {
    const admin = createAdminClient();

    const before = await httpFetch({
      path: "/api/platform/installations",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(before.status).toBe(200);

    await admin.rpc("bump_commercial_installation_version", { p_tenant_id: tenantId });

    const after = await httpFetch({
      path: "/api/platform/installations",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(after.status).toBe(200);
  });

  it("installation list remains accessible after suspend and resume", async () => {
    const admin = createAdminClient();

    await admin
      .from("commercial_installations")
      .update({ status: "suspended", current_state: "suspended" })
      .eq("id", installationId);

    const suspended = await httpFetch({
      path: "/api/platform/installations",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(suspended.status).toBe(200);
    const suspendedBody = (await suspended.json()) as {
      data?: { id: string; status: string }[];
    };
    const row = (suspendedBody.data ?? []).find((r) => r.id === installationId);
    expect(row?.status).toBe("suspended");

    await admin
      .from("commercial_installations")
      .update({ status: "active", current_state: "active" })
      .eq("id", installationId);
    await admin.rpc("bump_commercial_installation_version", { p_tenant_id: tenantId });

    const resumed = await httpFetch({
      path: "/api/platform/installations",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(resumed.status).toBe(200);
    const resumedBody = (await resumed.json()) as {
      data?: { id: string; status: string }[];
    };
    const resumedRow = (resumedBody.data ?? []).find((r) => r.id === installationId);
    expect(resumedRow?.status).toBe("active");
  });
});
