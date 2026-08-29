import { expect, test } from "@playwright/test";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeSchedule = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeSchedule("PI-2 Schedule Intelligence browser surface", () => {
  test("Command Centre schedule card and dedicated schedule view expose required states", async ({
    page,
  }) => {
    await page.goto(basePath);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-schedule")).toBeVisible();

    const select = page.getByTestId("command-centre-project-select");
    const options = select.locator("option");
    if ((await options.count()) > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) {
        await select.selectOption(value);
        await expect(page.getByTestId("command-centre-section-schedule")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByTestId("command-centre-schedule-health")).toBeVisible();
        await expect(page.getByTestId("command-centre-schedule-milestones")).toBeVisible();
        await expect(page.getByTestId("command-centre-schedule-attention")).toBeVisible();
      }
    }

    await page.getByTestId("project-intelligence-nav-schedule").click();
    await expect(page).toHaveURL(/\/engineering\/apps\/project-intelligence\/schedule/);
    await expect(page.getByTestId("project-intelligence-schedule-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-schedule")).toBeVisible();
    await expect(page.getByTestId("schedule-intelligence-project-select")).toBeVisible();
  });
});
