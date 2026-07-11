import { beforeAll, describe, expect, it } from "vitest";

import { buildAuthCookies } from "./lib/auth-cookies.js";
import { certUserPassword, fixturesManifestPath, isCertificationMode } from "./lib/env.js";
import { httpFetch } from "./lib/http-client.js";
import { readFileSync, existsSync } from "node:fs";

function loadManifest() {
  const path = fixturesManifestPath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    tenantA: {
      id: string;
      users: Record<string, { email: string }>;
      workspaces: Array<{ id: string }>;
      seatPoolId: string;
      installations: { productInstallationId: string };
    };
    tenantB: { id: string; users: Record<string, { email: string }> };
  };
}

describe.skipIf(!isCertificationMode() && !process.env.RTB_TEST_BASE_URL)(
  "Phase 4 — Gate D HTTP live authorization",
  () => {
    let tenantId: string;
    let workspaceId: string;
    let installationId: string;
    let seatPoolId: string;
    let ownerCookies: string;
    let adminCookies: string;
    let engineerCookies: string;
    let viewerCookies: string;
    let tenantBCookies: string;

    let tenantBId: string;

    beforeAll(async () => {
      const manifest = loadManifest();
      if (!manifest) throw new Error("phase4-cert-fixtures.json missing");
      tenantId = manifest.tenantA.id;
      tenantBId = manifest.tenantB.id;
      workspaceId = manifest.tenantA.workspaces[0]!.id;
      installationId = manifest.tenantA.installations.productInstallationId;
      seatPoolId = manifest.tenantA.seatPoolId;
      const password = certUserPassword();

      ownerCookies = (await buildAuthCookies(manifest.tenantA.users.owner.email, password))
        .cookieHeader;
      adminCookies = (await buildAuthCookies(manifest.tenantA.users.admin.email, password))
        .cookieHeader;
      engineerCookies = (await buildAuthCookies(manifest.tenantA.users.engineer.email, password))
        .cookieHeader;
      viewerCookies = (await buildAuthCookies(manifest.tenantA.users.viewer.email, password))
        .cookieHeader;
      tenantBCookies = (await buildAuthCookies(manifest.tenantB.users.owner.email, password))
        .cookieHeader;
    });

    const ctx = () => ({ tenantId, workspaceId });

    it("401 unauthenticated administration products", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/products/engineering-os?tab=overview",
        ...ctx(),
      });
      expect(res.status).toBe(401);
    });

    it("403 viewer administration products", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/products/engineering-os?tab=overview",
        cookieHeader: viewerCookies,
        ...ctx(),
      });
      expect(res.status).toBe(403);
    });

    it("403 engineer subscription billing", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/subscription-billing",
        cookieHeader: engineerCookies,
        ...ctx(),
      });
      expect(res.status).toBe(403);
    });

    it("403 admin growth credits", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/growth-credits",
        cookieHeader: adminCookies,
        ...ctx(),
      });
      expect(res.status).toBe(403);
    });

    it("200 owner subscription billing", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/subscription-billing",
        cookieHeader: ownerCookies,
        ...ctx(),
      });
      expect(res.status).toBe(200);
    });

    it("200 owner growth credits", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/growth-credits",
        cookieHeader: ownerCookies,
        ...ctx(),
      });
      expect(res.status).toBe(200);
    });

    it("200 admin licenses seats", async () => {
      const res = await httpFetch({
        path: "/api/platform/administration/licenses-seats",
        cookieHeader: adminCookies,
        ...ctx(),
      });
      expect(res.status).toBe(200);
    });

    it("403 viewer seat assign", async () => {
      const res = await httpFetch({
        method: "POST",
        path: "/api/platform/commerce/seats/assign",
        cookieHeader: viewerCookies,
        ...ctx(),
        body: { seatPoolId, userId: "00000000-0000-0000-0000-000000000001" },
      });
      expect([401, 403, 422]).toContain(res.status);
    });

    it("cross-tenant installation detail denied", async () => {
      const res = await httpFetch({
        path: `/api/platform/installations/${installationId}`,
        cookieHeader: tenantBCookies,
        tenantId: tenantBId,
      });
      expect([403, 404]).toContain(res.status);
    });
  }
);
