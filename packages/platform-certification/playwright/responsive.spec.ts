import { test, expect } from "@playwright/test";
import { signInAs } from "./auth.js";
import { loadManifest } from "./fixtures.js";

const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

test.describe("Phase 7B responsive", () => {
  for (const vp of VIEWPORTS) {
    test(`platform home ${vp.width}x${vp.height}`, async ({ page, context }) => {
      const m = loadManifest();
      await signInAs(context, m.users.owner.email);
      await page.setViewportSize(vp);
      await page.goto("/platform/home");
      await expect(page.getByTestId("rtb-ai-platform-ready")).toBeVisible();
      const overflowX = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 1;
      });
      expect(overflowX).toBe(false);
    });

    test(`products catalogue ${vp.width}x${vp.height}`, async ({ page, context }) => {
      const m = loadManifest();
      await signInAs(context, m.users.owner.email);
      await page.setViewportSize(vp);
      const res = await page.goto("/system/products");
      expect(res?.status() ?? 200).toBeLessThan(500);
      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflowX).toBe(false);
    });

    test(`reference-os ${vp.width}x${vp.height}`, async ({ page, context }) => {
      const m = loadManifest();
      await signInAs(context, m.users.owner.email);
      await page.setViewportSize(vp);
      await page.goto("/reference-os");
      await expect(page.getByTestId("reference-os-ready")).toBeVisible();
      const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflowX).toBe(false);
    });

    test(`project intelligence ${vp.width}x${vp.height}`, async ({ page, context }) => {
      const m = loadManifest();
      await signInAs(context, m.users.owner.email);
      await page.setViewportSize(vp);
      const res = await page.goto("/engineering/apps/project-intelligence");
      expect(res?.status() ?? 200).toBeLessThan(500);
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflowX).toBe(false);
    });
  }
});
