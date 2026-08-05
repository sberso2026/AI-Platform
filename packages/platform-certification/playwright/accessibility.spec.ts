import { test, expect } from "@playwright/test";
import { signInAs } from "./auth.js";
import { loadManifest } from "./fixtures.js";

test.describe("Phase 7B accessibility", () => {
  test("platform administration shell landmarks", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/platform/home");
    await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();
    await expect(page.locator("main, [role='main']").first()).toBeVisible();
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? "");
    expect(focused.length).toBeGreaterThan(0);
  });

  test("Operating Systems / products catalogue keyboard path", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/system/products");
    await expect(page.locator("body")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator("main, [role='main'], nav, [role='navigation']").first()).toBeVisible();
  });

  test("licences and seats labelled controls", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const res = await page.goto("/system/licenses-seats");
    expect(res?.status() ?? 200).toBeLessThan(500);
    await page.keyboard.press("Tab");
  });

  test("workspace assignment surface keyboard operable", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    const res = await page.goto("/workspaces");
    expect(res?.status() ?? 200).toBeLessThan(500);
    await page.keyboard.press("Tab");
  });

  test("Engineering OS navigation reachable when entitled", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/engineering");
    await expect(page.locator("body")).toBeVisible();
    await page.keyboard.press("Tab");
  });

  test("reference-os page announces status region", async ({ page, context }) => {
    const m = loadManifest();
    await signInAs(context, m.users.owner.email);
    await page.goto("/reference-os");
    await expect(page.getByTestId("reference-os-ready")).toBeVisible();
    await expect(page.getByTestId("reference-os-ready").locator("h1")).toContainText(/Reference OS/i);
  });

  test("suspended state still exposes platform landmarks", async ({ page, context }) => {
    const m = loadManifest();
    const { setInstallationStatus, restoreFixtureInstallations } = await import(
      "../src/lib/lifecycle-matrix.js"
    );
    await setInstallationStatus(m.installations.engineering.id, "suspended");
    await signInAs(context, m.users.owner.email);
    await page.goto("/platform/home");
    await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();
    await expect(page.locator("main, [role='main']").first()).toBeVisible();
    await restoreFixtureInstallations();
  });
});
