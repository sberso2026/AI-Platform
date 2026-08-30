import { expect, test } from "@playwright/test";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeForecasting = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeForecasting("PI-6 Forecasting Intelligence browser surface", () => {
  test("Command Centre forecast card and dedicated view expose required states", async ({ page }) => {
    await page.goto(basePath);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-forecasting")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-queries-decisions")).toBeVisible();

    const select = page.getByTestId("command-centre-project-select");
    const options = select.locator("option");
    if ((await options.count()) > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await select.selectOption(value);
        await expect(page.getByTestId("command-centre-section-forecast")).toBeVisible({ timeout: 45_000 });
      }
    }

    await page.getByTestId("project-intelligence-nav-forecasting").click();
    await expect(page).toHaveURL(/\/engineering\/apps\/project-intelligence\/forecasting/);
    await expect(page.getByTestId("project-intelligence-forecasting-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-forecasting")).toBeVisible();
  });
});
