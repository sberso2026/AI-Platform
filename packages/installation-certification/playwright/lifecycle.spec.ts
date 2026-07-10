import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Installation lifecycle UI", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("product health page loads for installed product", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products/engineering-os/health");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/health|install|status/i);
  });
});
