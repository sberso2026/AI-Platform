import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { REQUIRED_PRODUCT_DETAIL_TABS } from "./diagnostics.js";
import { requireFixtures } from "./fixtures.js";

test.describe("Gate M — Accessibility", () => {
  test("Product detail tabs are keyboard accessible", async ({ page, context }) => {
    const manifest = requireFixtures();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=overview", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByTestId("product-detail-ready")).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("tablist", { name: "Product administration sections" })
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("tab", { name: "Overview", selected: true })).toBeVisible();

    for (const label of REQUIRED_PRODUCT_DETAIL_TABS) {
      await expect(page.getByRole("tab", { name: label })).toBeVisible();
    }

    await page.getByRole("tab", { name: "Overview" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/tab=applications/, { timeout: 10_000 });
    await expect(page.getByTestId("product-detail-ready")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("tab", { name: "Applications", selected: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("tabpanel")).toBeVisible();
  });
});
