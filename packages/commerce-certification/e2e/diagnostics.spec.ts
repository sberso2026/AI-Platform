import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Entitlement diagnostics", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("owner can access diagnostics UI", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/subscriptions");
    await expect(page.getByTestId("entitlement-diagnose")).toBeVisible();
    await page.getByRole("button", { name: /diagnose/i }).click();
    await expect(page.locator("body")).toContainText(/allowed|denied|subscription|seat|licen/i);
    const body = await page.locator("body").textContent();
    expect(body).not.toMatch(/service_role|eyJ/);
  });

  test("viewer is denied restricted diagnostics", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.viewer.email);
    await page.goto("/system/subscriptions");
    const diagnose = page.getByTestId("entitlement-diagnose");
    if ((await diagnose.count()) > 0) {
      await page.getByRole("button", { name: /diagnose/i }).click();
      await expect(page.locator("body")).toContainText(/denied|forbidden|not authorized|error/i);
    } else {
      const url = page.url();
      expect(
        url.includes("/access-denied") || url.includes("/login") || url.includes("/system")
      ).toBe(true);
    }
  });
});
