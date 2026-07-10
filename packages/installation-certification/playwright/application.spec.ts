import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Application installation UI", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("engineering product page shows application dimensions", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/products/engineering-os");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/application|licen|install|entitlement/i);
  });
});
