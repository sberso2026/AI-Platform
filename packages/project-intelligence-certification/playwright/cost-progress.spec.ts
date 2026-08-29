import { expect, test } from "@playwright/test";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeCostProgress = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeCostProgress("PI-3 Cost & Progress Intelligence browser surface", () => {
  test("Command Centre cost/progress cards and dedicated view expose required states", async ({
    page,
  }) => {
    await page.goto(basePath);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-cost-progress")).toBeVisible();

    const select = page.getByTestId("command-centre-project-select");
    const options = select.locator("option");
    if ((await options.count()) > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await select.selectOption(value);
        await expect(page.getByTestId("command-centre-section-cost")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByTestId("command-centre-section-progress")).toBeVisible();
      }
    }

    await page.getByTestId("project-intelligence-nav-cost-progress").click();
    await expect(page).toHaveURL(/\/engineering\/apps\/project-intelligence\/cost-progress/);
    await expect(page.getByTestId("project-intelligence-cost-progress-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-cost-progress")).toBeVisible();
  });
});
