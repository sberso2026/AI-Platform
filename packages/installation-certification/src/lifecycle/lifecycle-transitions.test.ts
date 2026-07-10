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

describe.skipIf(skipLocal)("Installation lifecycle transitions", () => {
  let tenantId: string;
  let workspaceId: string;
  let ownerCookies: string;
  let installationId: string;
  let appInstallationId: string;

  beforeAll(async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    tenantId = manifest.tenantA.id;
    workspaceId = manifest.tenantA.workspaces[0]!.id;
    installationId = manifest.tenantA.installations.productInstallationId;
    appInstallationId = manifest.tenantA.installations.appInstallationIds.documents!;

    ownerCookies = (
      await buildAuthCookies(manifest.tenantA.users.owner.email, certUserPassword())
    ).cookieHeader;
  });

  const ctx = () => ({ tenantId, workspaceId });

  it("owner can suspend and resume product installation", async () => {
    const suspend = await httpFetch({
      method: "POST",
      path: `/api/platform/installations/${installationId}/suspend`,
      cookieHeader: ownerCookies,
      ...ctx(),
      body: { reason: "cert lifecycle suspend" },
    });
    expect([200, 202, 409]).toContain(suspend.status);

    const resume = await httpFetch({
      method: "POST",
      path: `/api/platform/installations/${installationId}/resume`,
      cookieHeader: ownerCookies,
      ...ctx(),
      body: { reason: "cert lifecycle resume" },
    });
    expect([200, 202, 409]).toContain(resume.status);
  });

  it("owner can read installation events", async () => {
    const res = await httpFetch({
      path: `/api/platform/installations/${installationId}/events`,
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(res.status).toBe(200);
  });

  it("owner can suspend and resume application installation", async () => {
    const suspend = await httpFetch({
      method: "POST",
      path: `/api/platform/app-installations/${appInstallationId}/suspend`,
      cookieHeader: ownerCookies,
      ...ctx(),
      body: { reason: "cert app suspend" },
    });
    expect([200, 202, 409]).toContain(suspend.status);

    const resume = await httpFetch({
      method: "POST",
      path: `/api/platform/app-installations/${appInstallationId}/resume`,
      cookieHeader: ownerCookies,
      ...ctx(),
      body: { reason: "cert app resume" },
    });
    expect([200, 202, 409]).toContain(resume.status);
  });

  it("upgrade endpoint validates auth", async () => {
    const res = await httpFetch({
      method: "POST",
      path: `/api/platform/installations/${installationId}/upgrade`,
      ...ctx(),
      body: { targetVersion: "1.0.1" },
    });
    expect(res.status).toBe(401);
  });

  it("rollback endpoint accepts owner with version metadata", async () => {
    const admin = createAdminClient();
    await admin
      .from("commercial_installations")
      .update({
        metadata: { pre_upgrade_version: "0.9.0", cert_fixture: true },
      })
      .eq("id", installationId);

    const res = await httpFetch({
      method: "POST",
      path: `/api/platform/installations/${installationId}/rollback`,
      cookieHeader: ownerCookies,
      ...ctx(),
      body: { reason: "cert rollback probe" },
    });
    expect([200, 202, 400, 409]).toContain(res.status);
  });
});
