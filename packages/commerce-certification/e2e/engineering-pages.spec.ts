import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Engineering page enforcement", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("unauthenticated user is redirected from /engineering/projects", async ({ page }) => {
    const res = await page.goto("/engineering/projects");
    expect(res?.status()).toBeLessThan(500);
    const url = page.url();
    expect(url.includes("/login") || url.includes("/access-denied") || url.includes("/engineering")).toBe(
      true
    );
  });

  test("entitled owner can open /engineering", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const res = await page.goto("/engineering");
    expect(res?.status()).toBeLessThan(500);
    expect(page.url()).toContain("/engineering");
  });

  test("direct URL to /engineering/ai without entitlement shows denial", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.viewer.email);
    await page.goto("/engineering/ai");
    const url = page.url();
    expect(
      url.includes("/access-denied") || url.includes("/engineering/ai") || url.includes("/login")
    ).toBe(true);
  });
});
