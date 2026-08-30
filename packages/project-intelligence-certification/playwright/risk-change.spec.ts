import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeRiskChange = enabled ? test.describe : test.describe.skip;

describeRiskChange("PI-4 Risk & Change Intelligence browser surface", () => {
  test("Command Centre risk/change cards and dedicated view expose required states", async ({ page, context }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-risk-change")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-section-risk")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-section-change")).toBeVisible();

    await followPiNav(
      page,
      "project-intelligence-nav-risk-change",
      /\/engineering\/apps\/project-intelligence\/risk-change/,
    );
    await expect(page.getByTestId("project-intelligence-risk-change-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-risk-change")).toBeVisible();
  });
});
