import { expect, test } from "@playwright/test";

import { signInAs } from "./auth.js";
import { loadE2EFixtures, skipE2E } from "./fixtures.js";

test.describe("Workspace installation assignments", () => {
  test.skip(skipE2E(), "cert fixtures not available");

  test("owner can access system products with workspace context", async ({ page, context }) => {
    const manifest = loadE2EFixtures();
    if (!manifest) return;

    await signInAs(context, manifest.tenantA.users.owner.email);
    const workspaceId = manifest.tenantA.workspaces[0]!.id;

    await page.goto(`/system/products?workspaceId=${workspaceId}`);
    await expect(page.locator("body")).toContainText(/product|workspace|install/i);
  });
});
