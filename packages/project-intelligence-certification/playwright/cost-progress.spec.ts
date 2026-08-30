import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeCostProgress = enabled ? test.describe : test.describe.skip;

describeCostProgress("PI-3 Cost & Progress Intelligence browser surface", () => {
  test("Command Centre cost/progress cards and dedicated view expose required states", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-cost-progress")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-section-cost")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-section-progress")).toBeVisible();

    await followPiNav(
      page,
      "project-intelligence-nav-cost-progress",
      /\/engineering\/apps\/project-intelligence\/cost-progress/,
    );
    await expect(page.getByTestId("project-intelligence-cost-progress-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-cost-progress")).toBeVisible();
  });
});
