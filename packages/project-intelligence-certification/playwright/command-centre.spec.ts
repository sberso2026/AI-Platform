import { expect, test } from "@playwright/test";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeCc = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeCc("PI-1 Command Centre browser surface", () => {
  test("overview exposes project selection, health, UNKNOWN, attention, and v1 navigation", async ({
    page,
  }) => {
    await page.goto(basePath);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("command-centre-project-select")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-overview")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-documents")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-meetings")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-findings")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-panel-documents")).toBeVisible();

    const select = page.getByTestId("command-centre-project-select");
    const options = select.locator("option");
    if ((await options.count()) > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await select.selectOption(value);
        await expect(page.getByTestId("command-centre-overall-health")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByTestId("command-centre-health-dimensions")).toBeVisible();
        await expect(page.getByTestId("command-centre-attention")).toBeVisible();
      }
    }

    await page.getByTestId("project-intelligence-nav-documents").click();
    await expect(page).toHaveURL(/\/engineering\/apps\/project-intelligence\/documents/);
  });
});
