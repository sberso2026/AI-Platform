import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeForecasting = enabled ? test.describe : test.describe.skip;

describeForecasting("PI-6 Forecasting Intelligence browser surface", () => {
  test("Command Centre forecast card and dedicated view expose required states", async ({ page, context }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-forecasting")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-queries-decisions")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-section-forecast")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-forecast-health")).toBeVisible();
    const forecastHealth = (await page.getByTestId("command-centre-forecast-health").innerText()).toUpperCase();
    const forecastBody = await page.getByTestId("command-centre-section-forecast").innerText();
    expect(forecastBody.toLowerCase()).not.toMatch(/\d+\s*%\s*(confidence|probability|complete)/);
    expect(forecastBody.toLowerCase()).not.toMatch(/\$\s*\d/);
    if (forecastHealth.includes("UNKNOWN")) {
      expect(forecastHealth).not.toContain("GREEN");
    }

    await followPiNav(
      page,
      "project-intelligence-nav-forecasting",
      /\/engineering\/apps\/project-intelligence\/forecasting/,
    );
    await expect(page.getByTestId("project-intelligence-forecasting-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-forecasting")).toBeVisible();
  });
});
