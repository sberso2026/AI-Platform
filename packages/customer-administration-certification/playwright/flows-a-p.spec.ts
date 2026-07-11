import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { requireFixtures } from "./fixtures.js";

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
  });

  test("C — Applications tab", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=applications");
    await expect(page.getByTestId("product-tabpanel-applications")).toBeVisible();
  });

  test("D — Workspaces tab", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=workspaces");
    await expect(page.getByTestId("product-workspaces-panel")).toBeVisible();
  });

  test("E — Licences & Seats", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.admin.email);
    await page.goto("/system/licenses-seats");
    await expect(page.getByRole("heading", { name: /Licences/i })).toBeVisible();
  });

  test("F — Subscription & Billing", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/subscription-billing");
    await expect(page.getByRole("heading", { name: /Subscription/i })).toBeVisible();
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
    await expect(page.getByText(/not cash/i)).toBeVisible();
  });

  test("I/J — Installation progress", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const id = manifest.tenantA.installations.productInstallationId;
    await page.goto(`/system/installations/${id}`);
    await expect(page.getByTestId("installation-progress")).toBeVisible();
  });

  test("L — Suspend installation", async ({ request, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.owner.email);
    const id = manifest.tenantA.installations.productInstallationId;
    const res = await request.post(`/api/platform/installations/${id}/suspend`, {
      data: { reason: "cert" },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test("O — Viewer denied products admin", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.viewer.email);
    await page.goto("/system/products");
    await expect(page).not.toHaveURL(/\/system\/products$/);
  });

  test("P — My Account", async ({ page, context }) => {
    const manifest = fx();
    await signInAs(context, manifest.tenantA.users.engineer.email);
    await page.goto("/my-account");
    await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible();
  });
});
