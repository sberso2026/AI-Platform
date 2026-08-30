import { expect, test } from "@playwright/test";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeQueriesDecisions = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeQueriesDecisions("PI-5 Query & Decision Intelligence browser surface", () => {
  test("Command Centre query/decision/action cards and dedicated view expose required states", async ({
    page,
  }) => {
    await page.goto(basePath);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-queries-decisions")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-overview")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-schedule")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-cost-progress")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-risk-change")).toBeVisible();

    const select = page.getByTestId("command-centre-project-select");
    const options = select.locator("option");
    if ((await options.count()) > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await select.selectOption(value);
        await expect(page.getByTestId("command-centre-section-queries")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByTestId("command-centre-section-decisions")).toBeVisible();
        await expect(page.getByTestId("command-centre-section-actions")).toBeVisible();
        await expect(page.getByTestId("command-centre-section-decisions-actions")).toBeVisible();
      }
    }

    await page.getByTestId("project-intelligence-nav-queries-decisions").click();
    await expect(page).toHaveURL(/\/engineering\/apps\/project-intelligence\/queries-decisions/);
    await expect(page.getByTestId("project-intelligence-queries-decisions-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-queries-decisions")).toBeVisible();
  });
});
