import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";

import { buildAuthCookies } from "./lib/auth-cookies.js";
import {
  assertNoServerError,
  parseUninstallError,
  parseUninstallSuccess,
  UNINSTALL_ERROR_CODES,
} from "./lib/uninstall-contract.js";
import { certUserPassword, fixturesManifestPath, isCertificationMode } from "./lib/env.js";
import { httpFetch } from "./lib/http-client.js";
import { createCertAdminClient } from "./lib/supabase-admin.js";

interface UninstallFixtures {
  happyPathInstallationId: string;
  happyPathTenantId: string;
  happyPathWorkspaceId: string;
  happyPathWorkspaceAssignmentId: string;
  invalidStateInstallationId: string;
  withDependenciesInstallationId: string;
  missingInstallationId: string;
}

function loadManifest() {
  const path = fixturesManifestPath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    tenantA: {
      id: string;
      subscriptionId: string;
      users: Record<string, { email: string }>;
      workspaces: Array<{ id: string }>;
      installations: { productInstallationId: string };
    };
    tenantB: {
      id: string;
      subscriptionId: string;
      users: Record<string, { email: string }>;
    };
    uninstallFixtures: UninstallFixtures;
  };
}

async function postUninstall(
  installationId: string,
  options: {
    cookieHeader?: string;
    tenantId: string;
    workspaceId: string;
  }
): Promise<Response> {
  return httpFetch({
    method: "POST",
    path: `/api/platform/installations/${installationId}/uninstall`,
    cookieHeader: options.cookieHeader,
    tenantId: options.tenantId,
    workspaceId: options.workspaceId,
    body: { reason: "Phase 4 uninstall certification" },
  });
}

describe.skipIf(!isCertificationMode() && !process.env.RTB_TEST_BASE_URL)(
  "Phase 4 — uninstall HTTP certification",
  () => {
    let tenantId: string;
    let workspaceId: string;
    let happyPathTenantId: string;
    let happyPathWorkspaceId: string;
    let happyPathSubscriptionId: string;
    let fixtures: UninstallFixtures;
    let ownerCookies: string;
    let tenantBOwnerCookies: string;
    let viewerCookies: string;
    let engineerCookies: string;

    beforeAll(async () => {
      const manifest = loadManifest();
      if (!manifest?.uninstallFixtures) {
        throw new Error("phase4-cert-fixtures.json missing uninstallFixtures — run pnpm provision");
      }
      tenantId = manifest.tenantA.id;
      workspaceId = manifest.tenantA.workspaces[0]!.id;
      happyPathTenantId = manifest.uninstallFixtures.happyPathTenantId;
      happyPathWorkspaceId = manifest.uninstallFixtures.happyPathWorkspaceId;
      happyPathSubscriptionId = manifest.tenantB.subscriptionId;
      fixtures = manifest.uninstallFixtures;
      const password = certUserPassword();

      ownerCookies = (await buildAuthCookies(manifest.tenantA.users.owner.email, password))
        .cookieHeader;
      tenantBOwnerCookies = (await buildAuthCookies(manifest.tenantB.users.owner.email, password))
        .cookieHeader;
      viewerCookies = (await buildAuthCookies(manifest.tenantA.users.viewer.email, password))
        .cookieHeader;
      engineerCookies = (await buildAuthCookies(manifest.tenantA.users.engineer.email, password))
        .cookieHeader;
    });

    const ctx = () => ({ tenantId, workspaceId });

    it("401 unauthenticated uninstall", async () => {
      const res = await postUninstall(fixtures.happyPathInstallationId, ctx());
      assertNoServerError(res.status);
      expect(res.status).toBe(401);
    });

    it("403 viewer uninstall", async () => {
      const res = await postUninstall(fixtures.withDependenciesInstallationId, {
        ...ctx(),
        cookieHeader: viewerCookies,
      });
      assertNoServerError(res.status);
      expect(res.status).toBe(403);
    });

    it("403 engineer uninstall", async () => {
      const res = await postUninstall(fixtures.withDependenciesInstallationId, {
        ...ctx(),
        cookieHeader: engineerCookies,
      });
      assertNoServerError(res.status);
      expect(res.status).toBe(403);
    });

    it("404 missing installation", async () => {
      const res = await postUninstall(fixtures.missingInstallationId, {
        ...ctx(),
        cookieHeader: ownerCookies,
      });
      assertNoServerError(res.status);
      expect(res.status).toBe(404);
      const body = parseUninstallError(await res.json());
      expect(body.code).toBe(UNINSTALL_ERROR_CODES.INSTALLATION_NOT_FOUND);
    });

    it("409 invalid lifecycle state", async () => {
      const res = await postUninstall(fixtures.invalidStateInstallationId, {
        ...ctx(),
        cookieHeader: ownerCookies,
      });
      assertNoServerError(res.status);
      expect(res.status).toBe(409);
      const body = parseUninstallError(await res.json());
      expect(body.code).toBe(UNINSTALL_ERROR_CODES.INVALID_INSTALLATION_TRANSITION);
    });

    it("422 active dependent applications", async () => {
      const res = await postUninstall(fixtures.withDependenciesInstallationId, {
        ...ctx(),
        cookieHeader: ownerCookies,
      });
      assertNoServerError(res.status);
      expect(res.status).toBe(422);
      const body = parseUninstallError(await res.json());
      expect(body.code).toBe(UNINSTALL_ERROR_CODES.ACTIVE_DEPENDENCIES_EXIST);
    });

    it(
      "200 owner happy-path uninstall with lifecycle and audit proof",
      async () => {
      const admin = createCertAdminClient();
      const installationId = fixtures.happyPathInstallationId;

      const { data: beforeSub } = await admin
        .from("commercial_subscriptions")
        .select("id, status")
        .eq("id", happyPathSubscriptionId)
        .single();
      expect(beforeSub?.status).toBeTruthy();

      const res = await postUninstall(installationId, {
        tenantId: happyPathTenantId,
        workspaceId: happyPathWorkspaceId,
        cookieHeader: tenantBOwnerCookies,
      });
      assertNoServerError(res.status);
      expect(res.status).toBe(200);

      const success = parseUninstallSuccess(await res.json());
      expect(success.data.id).toBe(installationId);
      expect(success.data.status).toBe("uninstalled");

      const detail = await httpFetch({
        path: `/api/platform/installations/${installationId}`,
        cookieHeader: tenantBOwnerCookies,
        tenantId: happyPathTenantId,
        workspaceId: happyPathWorkspaceId,
      });
      assertNoServerError(detail.status);
      expect(detail.status).toBe(200);
      const detailBody = (await detail.json()) as { data?: { status?: string } };
      expect(detailBody.data?.status).toBe("uninstalled");

      const { data: activeAssignments } = await admin
        .from("commercial_workspace_product_assignments")
        .select("id, status")
        .eq("tenant_id", happyPathTenantId)
        .eq("installation_id", installationId)
        .eq("status", "active");
      expect(activeAssignments ?? []).toHaveLength(0);

      const { data: removedAssignments } = await admin
        .from("commercial_workspace_product_assignments")
        .select("id, status")
        .eq("tenant_id", happyPathTenantId)
        .eq("installation_id", installationId)
        .eq("status", "removed");
      expect((removedAssignments ?? []).length).toBeGreaterThan(0);

      const health = await httpFetch({
        path: `/api/platform/installations/${installationId}/health`,
        cookieHeader: tenantBOwnerCookies,
        tenantId: happyPathTenantId,
        workspaceId: happyPathWorkspaceId,
      });
      assertNoServerError(health.status);
      if (health.status === 200) {
        const healthBody = (await health.json()) as { data?: { status?: string } };
        expect(healthBody.data?.status).not.toBe("active");
      } else {
        expect(health.status).toBe(404);
      }

      const { data: events } = await admin
        .from("commercial_installation_events")
        .select("event_type")
        .eq("tenant_id", happyPathTenantId)
        .eq("installation_id", installationId);
      const eventTypes = (events ?? []).map((e) => e.event_type as string);
      expect(eventTypes).toContain("installation.uninstall_requested");
      expect(eventTypes).toContain("installation.uninstalling");
      expect(eventTypes).toContain("installation.uninstalled");

      const { data: afterSub } = await admin
        .from("commercial_subscriptions")
        .select("id, status")
        .eq("id", happyPathSubscriptionId)
        .single();
      expect(afterSub?.id).toBe(beforeSub?.id);
      expect(afterSub?.status).toBe(beforeSub?.status);
    },
      120_000
    );
  }
);
