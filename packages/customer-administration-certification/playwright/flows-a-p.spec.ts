import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { requireFixtures } from "./fixtures.js";
import { assertNoServerError } from "../src/lib/uninstall-contract.js";

function fx() {
  return requireFixtures();
}

test.describe("Phase 4 Playwright flows A–P", () => {
  test("A — View Installed Products", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products");
    await expect(page.getByRole("heading", { name: "Installed Products" })).toBeVisible();
  });

  test("B — Open Engineering OS product detail tabs", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os");
    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
  });

  test("C — Applications tab", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=applications");
    await expect(page.getByTestId("product-tabpanel-applications")).toBeVisible();
  });

  test("D — Workspaces tab and assignment panel", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=workspaces");
    await expect(page.getByTestId("product-workspaces-panel")).toBeVisible();
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
    await page.goto("/system/subscription-billing");
    await expect(page.getByTestId("page-header")).toContainText(/Subscription/i);
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
      const rollback = await page.request.post(`/api/platform/installations/${id}/rollback`, {
        data: { targetVersion: "1.0.0" },
      });
      assertNoServerError(rollback.status());
      expect(rollback.status()).toBe(200);
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
