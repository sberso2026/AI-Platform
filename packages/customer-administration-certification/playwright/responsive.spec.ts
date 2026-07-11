import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { requireFixtures } from "./fixtures.js";

const viewports = [
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1600x900", width: 1600, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

for (const vp of viewports) {
  test(`Responsive ${vp.name}`, async ({ page, context }) => {
    const manifest = requireFixtures();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products");
    await expect(page.getByRole("heading", { name: "Installed Products" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(overflow).toBe(false);
    await page.screenshot({
      path: `artifacts/responsive-products-${vp.name}.png`,
      fullPage: true,
    });
  });
}
