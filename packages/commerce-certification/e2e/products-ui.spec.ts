import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Product and application UI", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("owner can open /system/products", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/product|subscription|licen/i);
  });

  test("engineering product page shows commercial dimensions", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products/engineering-os");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/subscription|licen|seat|entitlement/i);
  });
});
