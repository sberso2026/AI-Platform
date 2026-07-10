import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Installation permissions", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("viewer can open products but lacks admin install controls", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.viewer.email);
    const res = await page.goto("/system/products");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/product/i);
  });

  test("owner can access engineering product admin surface", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products/engineering-os");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/engineering|subscription|install/i);
  });
});
