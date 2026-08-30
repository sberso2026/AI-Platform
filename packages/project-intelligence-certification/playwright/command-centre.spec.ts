import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeCc = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

describeCc("PI-1 Command Centre browser surface", () => {
  test("overview exposes project selection, health, UNKNOWN, attention, and v1 navigation", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("command-centre-project-select")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-overview")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-documents")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-meetings")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-findings")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-panel-documents")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-overall-health")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-health-dimensions")).toBeVisible();
    await expect(page.getByTestId("command-centre-attention")).toBeVisible();
    const overall = (await page.getByTestId("command-centre-overall-health").innerText()).toUpperCase();
    const forecastHealth = await page.getByTestId("command-centre-forecast-health").innerText();
    if (overall.includes("UNKNOWN") || forecastHealth.includes("UNKNOWN")) {
      expect(overall.includes("GREEN") && forecastHealth.includes("GREEN")).toBe(false);
    }

    await followPiNav(
      page,
      "project-intelligence-nav-documents",
      /\/engineering\/apps\/project-intelligence\/documents/,
    );
  });
});
