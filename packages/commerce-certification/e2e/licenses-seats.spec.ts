import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Licence and seat administration UI", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("owner can open /system/licenses", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/licenses");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/licen/i);
  });

  test("engineer cannot see licence mutation controls", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.engineer.email);
    await page.goto("/system/licenses");
    const revoke = page.getByRole("button", { name: /revoke/i });
    await expect(revoke).toHaveCount(0);
  });

  test("owner can open /system/seats", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/system/seats");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/seat|capacity|assign/i);
  });
});
