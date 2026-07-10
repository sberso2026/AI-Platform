import { beforeAll, describe, expect, it } from "vitest";

import { buildAuthCookies } from "../lib/auth-cookies.js";
import {
  certUserPassword,
  isCertificationMode,
  loadFixturesManifest,
  requireFixturesManifest,
} from "../lib/env.js";
import { expectStatus, httpFetch } from "../lib/http-client.js";

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Installation HTTP enforcement", () => {
  let tenantId: string;
  let workspaceId: string;
  let ownerCookies: string;
  let engineerCookies: string;
  let viewerCookies: string;
  let installationId: string;

  beforeAll(async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    tenantId = manifest.tenantA.id;
    workspaceId = manifest.tenantA.workspaces[0]!.id;
    installationId = manifest.tenantA.installations.productInstallationId;
    const password = certUserPassword();

    ownerCookies = (await buildAuthCookies(manifest.tenantA.users.owner.email, password))
      .cookieHeader;
    engineerCookies = (await buildAuthCookies(manifest.tenantA.users.engineer.email, password))
      .cookieHeader;
    viewerCookies = (await buildAuthCookies(manifest.tenantA.users.viewer.email, password))
      .cookieHeader;
  });

  const ctx = () => ({ tenantId, workspaceId });

  it("returns 401 for unauthenticated GET /api/platform/installations", async () => {
    const res = await httpFetch({ path: "/api/platform/installations", ...ctx() });
    expect(res.status).toBe(401);
  });

  it("returns 200 for owner GET /api/platform/installations", async () => {
    const res = await httpFetch({
      path: "/api/platform/installations",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data?: unknown[] };
    expect((body.data ?? []).length).toBeGreaterThan(0);
  });

  it("returns 200 for owner GET installation detail", async () => {
    const res = await httpFetch({
      path: `/api/platform/installations/${installationId}`,
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(res.status).toBe(200);
  });

  it("returns 401 for unauthenticated GET installation health", async () => {
    const res = await httpFetch({
      path: `/api/platform/installations/${installationId}/health`,
      ...ctx(),
    });
    await expectStatus(res, 401, "installation health unauthenticated");
  });

  it("returns 200 for owner GET installation health", async () => {
    const res = await httpFetch({
      path: `/api/platform/installations/${installationId}/health`,
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect([200, 503]).toContain(res.status);
  });

  it("returns 403 for viewer POST suspend installation", async () => {
    const res = await httpFetch({
      method: "POST",
      path: `/api/platform/installations/${installationId}/suspend`,
      cookieHeader: viewerCookies,
      ...ctx(),
      body: { reason: "cert viewer denied" },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("returns 200 for owner GET workspace-product-assignments", async () => {
    const res = await httpFetch({
      path: "/api/platform/workspace-product-assignments",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(res.status).toBe(200);
  });

  it("returns 200 for owner GET app-installations", async () => {
    const res = await httpFetch({
      path: "/api/platform/app-installations",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect(res.status).toBe(200);
  });
});

describe("HTTP test prerequisites", () => {
  it("fails in certification mode when fixtures missing", () => {
    if (!isCertificationMode()) return;
    expect(loadFixturesManifest()).not.toBeNull();
  });
});
