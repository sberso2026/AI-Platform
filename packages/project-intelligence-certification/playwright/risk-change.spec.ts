import { expect, test } from "@playwright/test";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeRiskChange = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeRiskChange("PI-4 Risk & Change Intelligence browser surface", () => {
  test("Command Centre risk/change cards and dedicated view expose required states", async ({ page }) => {
    await page.goto(basePath);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-risk-change")).toBeVisible();

    const select = page.getByTestId("command-centre-project-select");
    const options = select.locator("option");
    if ((await options.count()) > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await select.selectOption(value);
        await expect(page.getByTestId("command-centre-section-risk")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByTestId("command-centre-section-change")).toBeVisible();
      }
    }

    await page.getByTestId("project-intelligence-nav-risk-change").click();
    await expect(page).toHaveURL(/\/engineering\/apps\/project-intelligence\/risk-change/);
    await expect(page.getByTestId("project-intelligence-risk-change-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-risk-change")).toBeVisible();
  });
});
