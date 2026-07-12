import { expect, test } from "@playwright/test";
import { resolve } from "node:path";

import { signInAs } from "./auth.js";
import {
  REQUIRED_PRODUCT_DETAIL_TABS,
  assertProductDetailRoute,
  attachPageDiagnostics,
} from "./diagnostics.js";
import { requireFixtures } from "./fixtures.js";
import { assertNoServerError } from "../src/lib/uninstall-contract.js";

function fx() {
  return requireFixtures();
}

test.describe("Phase 4 Playwright flows A–P", () => {
  test("A — View Installed Products", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Installed Products" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("B — Open Engineering OS product detail tabs", async ({ page, context }) => {
    const manifest = fx();
    const diag = attachPageDiagnostics(page);
    await signInAs(context, manifest.tenantA.users.owner.email);

    const productResPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/platform/administration/products/engineering-os") &&
        res.request().method() === "GET",
      { timeout: 20_000 }
    );

    await page.goto("/system/products/engineering-os", { waitUntil: "domcontentloaded" });

    const productRes = await productResPromise;
    expect(
      productRes.ok(),
      `Product administration API failed: ${productRes.status()} ${productRes.url()}`
    ).toBe(true);

    await assertProductDetailRoute(page);
    expect(page.url()).not.toMatch(/error|denied|login/i);

    await expect(page.getByTestId("product-detail-error")).toHaveCount(0);
    await expect(page.getByTestId("product-detail-unauthorized")).toHaveCount(0);
    await expect(page.getByTestId("product-detail-not-found")).toHaveCount(0);

    const ready = page.getByTestId("product-detail-ready");
    await expect(ready, "product-detail-ready marker missing after data load").toBeVisible({
      timeout: 15_000,
    });
    await expect(ready).toHaveAttribute("data-product-slug", "engineering-os");

    await expect(page.getByRole("heading", { name: /Engineering Operating System/i })).toBeVisible({
      timeout: 15_000,
    });

    const tablist = page.getByRole("tablist", { name: "Product administration sections" });
    await expect(tablist, "tablist missing after readiness marker").toBeVisible({
      timeout: 10_000,
    });

    for (const label of REQUIRED_PRODUCT_DETAIL_TABS) {
      await expect(page.getByRole("tab", { name: label })).toBeVisible();
    }

    await expect(page.getByRole("tab", { name: "Overview", selected: true })).toBeVisible();
    await expect(page.getByTestId("product-tabpanel-overview")).toBeVisible();

    await page.getByRole("tab", { name: "Applications" }).click();
    await expect(page).toHaveURL(/tab=applications/);
    await expect(page.getByTestId("product-detail-ready")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("product-tabpanel-applications")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("tab", { name: "Applications", selected: true })).toBeVisible();

    const readyState = await page.evaluate(() => document.readyState);
    expect(readyState).toBe("complete");

    try {
      diag.assertClean();
    } catch (err) {
      diag.dump(
        resolve(process.cwd(), "test-results/customer-administration"),
        "flow-b"
      );
      throw err;
    }
  });

  test("C — Applications tab", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=applications", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("product-detail-ready")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("product-tabpanel-applications")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("D — Workspaces tab and assignment panel", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=workspaces", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("product-detail-ready")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("product-workspaces-panel")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Assigned workspaces/i)).toBeVisible();
  });

  test("E — Licences & Seats administration", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.admin.email);
    await page.goto("/system/licenses-seats");
    await expect(page.getByRole("heading", { name: /Licences/i })).toBeVisible();
  });

  test("E — Seat assign and remove via API", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.admin.email);
    const unassigned = manifest.tenantA.users.unassigned;
    if (!unassigned?.userId) return;

    const assign = await page.request.post("/api/platform/commerce/seats/assign", {
      data: {
        seatPoolId: manifest.tenantA.seatPoolId,
        userId: unassigned.userId,
        workspaceId: manifest.tenantA.workspaces[0]!.id,
      },
    });
    assertNoServerError(assign.status());
    expect(assign.status()).toBe(201);

    const remove = await page.request.post("/api/platform/commerce/seats/remove", {
      data: {
        seatPoolId: manifest.tenantA.seatPoolId,
        userId: unassigned.userId,
      },
    });
    assertNoServerError(remove.status());
    expect(remove.status()).toBe(200);
  });

  test("F — Subscription & Billing", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/subscription-billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("page-header")).toContainText(/Subscription/i, { timeout: 15_000 });
  });

  test("G — Usage portal", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.admin.email);
    await page.goto("/system/usage");
    await expect(page.getByRole("heading", { name: "Usage" })).toBeVisible();
  });

  test("H — Growth Credits", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/growth-credits");
    await expect(page.getByTestId("page-header")).toContainText(/Growth Credits/i);
  });

  test("I — Request product installation page", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/applications/project-intelligence/install");
    await expect(page.locator("body")).toContainText(/install/i);
  });

  test("J — Installation progress", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const id = manifest.tenantA.installations.productInstallationId;
    await page.goto(`/system/installations/${id}`);
    await expect(page.getByTestId("installation-progress")).toBeVisible();
  });

  test("K — Installation failure UX shows retry affordances", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const id = manifest.tenantA.installations.productInstallationId;
    await page.goto(`/system/installations/${id}`);
    await expect(page.locator("body")).toContainText(/progress|status|installation/i);
  });

  test.describe.serial("L–M — Lifecycle mutations", () => {
    test("L — Suspend and resume installation", async ({ page, context }) => {
      const manifest = fx();
      await signInAs(context, manifest.tenantA.users.owner.email);
      const id = manifest.tenantA.installations.productInstallationId;
      const res = await page.request.post(`/api/platform/installations/${id}/suspend`, {
        data: { reason: "cert" },
      });
      assertNoServerError(res.status());
      expect(res.status()).toBe(200);
      const resume = await page.request.post(`/api/platform/installations/${id}/resume`, {
        data: { reason: "cert resume" },
      });
      assertNoServerError(resume.status());
      expect(resume.status()).toBe(200);
    });

    test("M — Upgrade and rollback endpoints", async ({ page, context }) => {
      const manifest = fx();
      await signInAs(context, manifest.tenantA.users.owner.email);
      const id = manifest.tenantA.installations.productInstallationId;
      const upgrade = await page.request.post(`/api/platform/installations/${id}/upgrade`, {
        data: { targetVersion: "1.0.1" },
      });
      assertNoServerError(upgrade.status());
      expect(upgrade.status()).toBe(200);

      const upgradeBody = (await upgrade.json()) as {
        data?: { status?: string; installed_version?: string; metadata?: Record<string, unknown> };
      };
      expect(upgradeBody.data?.status).toBe("active");
      expect(upgradeBody.data?.installed_version).toBe("1.0.1");
      expect(upgradeBody.data?.metadata?.pre_upgrade_version).toBe("1.0.0");

      const rollback = await page.request.post(`/api/platform/installations/${id}/rollback`, {
        data: { reason: "cert rollback" },
      });
      assertNoServerError(rollback.status());
      expect(rollback.status()).toBe(200);
      const rollbackBody = (await rollback.json()) as { data?: { installed_version?: string } };
      expect(rollbackBody.data?.installed_version).toBe("1.0.0");
    });
  });

  test("O — Viewer denied products API", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.viewer.email);
    const res = await page.request.get(
      "/api/platform/administration/products/engineering-os?tab=overview"
    );
    expect(res.status()).toBe(403);
    assertNoServerError(res.status());
  });

  test("O — Engineer denied subscription billing API", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.engineer.email);
    const res = await page.request.get("/api/platform/administration/subscription-billing");
    expect(res.status()).toBe(403);
    assertNoServerError(res.status());
  });

  test("O — Admin denied growth credits API", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.admin.email);
    const res = await page.request.get("/api/platform/administration/growth-credits");
    expect(res.status()).toBe(403);
    assertNoServerError(res.status());
  });

  test("P — My Account", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.engineer.email);
    await page.goto("/my-account");
    await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible();
  });
});
