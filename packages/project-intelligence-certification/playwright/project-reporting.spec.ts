import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeReporting = enabled ? test.describe : test.describe.skip;

describeReporting("PI-9 Project Reporting Intelligence browser surface", () => {
  test("entitled owner can generate a deterministic project report without mutation controls", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await selectCanonicalProject(page, projectId);

    await followPiNav(
      page,
      "project-intelligence-nav-reports",
      /\/engineering\/apps\/project-intelligence\/reports/,
    );
    await expect(page.getByTestId("project-intelligence-reports-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-project-reporting")).toBeVisible();
    await expect(page.getByTestId("reporting-advisory-banner")).toBeVisible();
    await expect(page.getByRole("button", { name: /approve|send|close risk|commit/i })).toHaveCount(0);

    await page.getByTestId("reporting-project-select").selectOption(projectId);
    await page.getByTestId("reporting-type-select").selectOption("project_status_report");
    await page.getByTestId("reporting-generate").click();
    await expect(page.getByTestId("reporting-sections")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("reporting-section-overall_health")).toBeVisible();
    await expect(page.getByTestId("reporting-section-schedule")).toBeVisible();
    await expect(page.getByTestId("reporting-limitations")).toBeVisible();
    await expect(page.getByTestId("reporting-snapshot-meta")).toContainText("Point-in-time snapshot");
    const health = (await page.getByTestId("reporting-section-overall_health-body").innerText()).toUpperCase();
    if (health.includes("UNKNOWN")) {
      expect(health).not.toMatch(/\bGREEN\b/);
      expect(health).not.toMatch(/SCHEDULE IS ON TRACK/);
    }
    const overlay = page.getByTestId("reporting-ai-unavailable").or(page.getByTestId("reporting-ai-available"));
    await expect(overlay).toBeVisible();
  });
});
