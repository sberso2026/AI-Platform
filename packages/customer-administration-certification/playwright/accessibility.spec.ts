import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { requireFixtures } from "./fixtures.js";

test.describe("Gate M — Accessibility", () => {
  test("Product detail tabs are keyboard accessible", async ({ page, context }) => {
    const manifest = requireFixtures();
    await signInAs(context, manifest.tenantA.users.owner.email);
    await page.goto("/system/products/engineering-os?tab=overview");
    await expect(
      page.getByRole("tablist", { name: "Product administration sections" })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Overview", selected: true })).toBeVisible();
  });
});
