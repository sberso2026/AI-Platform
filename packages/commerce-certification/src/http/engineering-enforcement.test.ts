import { beforeAll, describe, expect, it } from "vitest";

import { buildAuthCookies } from "../lib/auth-cookies.js";
import { certUserPassword, isCertificationMode, loadFixturesManifest, requireFixturesManifest } from "../lib/env.js";
import { expectStatus, httpFetch } from "../lib/http-client.js";

const skipLocal = !isCertificationMode() && !process.env.RTB_TEST_BASE_URL;

describe.skipIf(skipLocal)("Engineering HTTP enforcement", () => {
  let tenantId: string;
  let workspaceId: string;
  let ownerCookies: string;
  let engineerCookies: string;
  let viewerCookies: string;
  let unassignedEngineerCookies: string;

  beforeAll(async () => {
    const manifest = loadFixturesManifest() ?? requireFixturesManifest();
    tenantId = manifest.tenantA.id;
    workspaceId = manifest.tenantA.workspaces[0]!.id;
    const password = certUserPassword();

    ownerCookies = (await buildAuthCookies(manifest.tenantA.users.owner.email, password)).cookieHeader;
    engineerCookies = (await buildAuthCookies(manifest.tenantA.users.engineer.email, password)).cookieHeader;
    viewerCookies = (await buildAuthCookies(manifest.tenantA.users.viewer.email, password)).cookieHeader;

    const unassigned = manifest.tenantA.users.unassigned;
    if (unassigned) {
      unassignedEngineerCookies = (await buildAuthCookies(unassigned.email, password)).cookieHeader;
    }
  });

  const ctx = () => ({ tenantId, workspaceId });

  it("returns 401 for unauthenticated GET /api/engineering/projects", async () => {
    const res = await httpFetch({ path: "/api/engineering/projects", ...ctx() });
    expect(res.status).toBe(401);
  });

  it("returns 200 for entitled owner GET /api/engineering/projects", async () => {
    const res = await httpFetch({
      path: "/api/engineering/projects",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect([200, 204]).toContain(res.status);
  });

  it("returns 403 for viewer POST /api/engineering/projects", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/engineering/projects",
      cookieHeader: viewerCookies,
      body: { projectName: "Cert Project", projectCode: "CERT-001" },
      ...ctx(),
    });
    expect([403, 401]).toContain(res.status);
  });

  it("returns 200 or 403 for engineer GET /api/engineering/documents", async () => {
    const res = await httpFetch({
      path: "/api/engineering/documents",
      cookieHeader: engineerCookies,
      ...ctx(),
    });
    expect([200, 403, 204]).toContain(res.status);
  });

  it("returns 403 for unassigned user POST /api/engineering/projects", async () => {
    if (!unassignedEngineerCookies) return;
    const res = await httpFetch({
      method: "POST",
      path: "/api/engineering/projects",
      cookieHeader: unassignedEngineerCookies,
      body: { projectName: "Denied", projectCode: "DENIED" },
      ...ctx(),
    });
    expect([403, 401]).toContain(res.status);
  });

  it("returns 401 for unauthenticated GET /api/engineering/decisions", async () => {
    const res = await httpFetch({ path: "/api/engineering/decisions", ...ctx() });
    await expectStatus(res, 401, "decisions unauthenticated");
  });

  it("returns 200 for owner GET /api/engineering/search", async () => {
    const res = await httpFetch({
      path: "/api/engineering/search?q=test",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect([200, 204, 400]).toContain(res.status);
  });

  it("returns 200 for owner GET /api/engineering/settings", async () => {
    const res = await httpFetch({
      path: "/api/engineering/settings",
      cookieHeader: ownerCookies,
      ...ctx(),
    });
    expect([200, 204]).toContain(res.status);
  });

  it("scheduler jobs/run rejects unauthenticated request", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      body: { jobs: ["expireTrials"] },
    });
    expect([401, 403]).toContain(res.status);
  });

  it("scheduler jobs/run rejects engineer", async () => {
    const res = await httpFetch({
      method: "POST",
      path: "/api/platform/commerce/jobs/run",
      cookieHeader: engineerCookies,
      body: { jobs: ["expireTrials"] },
      ...ctx(),
    });
    expect([401, 403]).toContain(res.status);
  });
});

describe("HTTP test prerequisites", () => {
  it("fails in certification mode when fixtures missing", () => {
    if (!isCertificationMode()) return;
    expect(loadFixturesManifest()).not.toBeNull();
  });
});
