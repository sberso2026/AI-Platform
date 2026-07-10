import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Product installation UI", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("owner can open /system/products", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/product|install|subscription/i);
  });

  test("engineering product install page loads", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products/engineering-os/install");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/install|product|engineering/i);
  });
});
