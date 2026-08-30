import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeSchedule = enabled ? test.describe : test.describe.skip;

describeSchedule("PI-2 Schedule Intelligence browser surface", () => {
  test("Command Centre schedule card and dedicated schedule view expose required states", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-schedule")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-section-schedule")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-schedule-health")).toBeVisible();
    await expect(page.getByTestId("command-centre-schedule-milestones")).toBeVisible();
    await expect(page.getByTestId("command-centre-schedule-attention")).toBeVisible();

    await followPiNav(
      page,
      "project-intelligence-nav-schedule",
      /\/engineering\/apps\/project-intelligence\/schedule/,
    );
    await expect(page.getByTestId("project-intelligence-schedule-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-schedule")).toBeVisible();
    await expect(page.getByTestId("schedule-intelligence-project-select")).toBeVisible();
  });
});
