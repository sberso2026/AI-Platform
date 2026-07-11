import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { requireFixtures } from "./fixtures.js";
import {
  assertExactUninstallStatus,
  assertNoServerError,
  parseUninstallError,
  parseUninstallSuccess,
  UNINSTALL_ERROR_CODES,
} from "../src/lib/uninstall-contract.js";

test.describe.configure({ mode: "serial" });

test.describe("Flow N — Logical uninstall scenarios", () => {
  function fx() {
    return requireFixtures();
  }

  function uninstallFixtures() {
    const manifest = fx();
    if (!manifest.uninstallFixtures) {
      throw new Error("uninstallFixtures missing from phase4 manifest");
    }
    return manifest.uninstallFixtures;
  }

  test("N — 401 unauthenticated uninstall", async ({ page }) => {
    const fixtures = uninstallFixtures();
    const res = await page.request.post(
      `/api/platform/installations/${fixtures.happyPathInstallationId}/uninstall`,
      { data: { reason: "cert" } }
    );
    assertExactUninstallStatus(res.status(), 401);
  });

  test("N — 403 viewer uninstall", async ({ page, context }) => {
    const manifest = fx();
    const fixtures = uninstallFixtures();
    await signInAs(context, manifest.tenantA.users.viewer.email);
    const res = await page.request.post(
      `/api/platform/installations/${fixtures.withDependenciesInstallationId}/uninstall`,
      { data: { reason: "cert" } }
    );
    assertExactUninstallStatus(res.status(), 403);
  });

  test("N — 403 engineer uninstall", async ({ page, context }) => {
    const manifest = fx();
    const fixtures = uninstallFixtures();
    await signInAs(context, manifest.tenantA.users.engineer.email);
    const res = await page.request.post(
      `/api/platform/installations/${fixtures.withDependenciesInstallationId}/uninstall`,
      { data: { reason: "cert" } }
    );
    assertExactUninstallStatus(res.status(), 403);
  });

  test("N — 404 missing installation", async ({ page, context }) => {
    const manifest = fx();
    const fixtures = uninstallFixtures();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.request.post(
      `/api/platform/installations/${fixtures.missingInstallationId}/uninstall`,
      { data: { reason: "cert" } }
    );
    assertExactUninstallStatus(res.status(), 404);
    const body = parseUninstallError(await res.json());
    expect(body.code).toBe(UNINSTALL_ERROR_CODES.INSTALLATION_NOT_FOUND);
  });

  test("N — 409 invalid lifecycle state", async ({ page, context }) => {
    const manifest = fx();
    const fixtures = uninstallFixtures();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.request.post(
      `/api/platform/installations/${fixtures.invalidStateInstallationId}/uninstall`,
      { data: { reason: "cert" } }
    );
    assertExactUninstallStatus(res.status(), 409);
    const body = parseUninstallError(await res.json());
    expect(body.code).toBe(UNINSTALL_ERROR_CODES.INVALID_INSTALLATION_TRANSITION);
  });

  test("N — 422 active dependent applications", async ({ page, context }) => {
    const manifest = fx();
    const fixtures = uninstallFixtures();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.request.post(
      `/api/platform/installations/${fixtures.withDependenciesInstallationId}/uninstall`,
      { data: { reason: "cert" } }
    );
    assertExactUninstallStatus(res.status(), 422);
    const body = parseUninstallError(await res.json());
    expect(body.code).toBe(UNINSTALL_ERROR_CODES.ACTIVE_DEPENDENCIES_EXIST);
  });

  test("N — happy-path uninstall state after server-side completion", async ({ page, context }) => {
    const manifest = fx();
    const fixtures = uninstallFixtures();
    await signInAs(context, manifest.tenantB.users.owner.email);
    const installationId = fixtures.happyPathInstallationId;

    const detail = await page.request.get(`/api/platform/installations/${installationId}`);
    assertNoServerError(detail.status());
    expect(detail.status()).toBe(200);
    const detailBody = (await detail.json()) as { data?: { status?: string } };
    expect(detailBody.data?.status).toBe("uninstalled");

    await page.goto(`/system/installations/${installationId}`);
    await expect(page.locator("body")).toContainText(/uninstall|status|installation/i);
  });
});
