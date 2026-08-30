import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeQueriesDecisions = enabled ? test.describe : test.describe.skip;

describeQueriesDecisions("PI-5 Query & Decision Intelligence browser surface", () => {
  test("Command Centre query/decision/action cards and dedicated view expose required states", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-queries-decisions")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-overview")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-schedule")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-cost-progress")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-nav-risk-change")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-section-queries")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-section-decisions")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-actions")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-decisions-actions")).toBeVisible();

    await followPiNav(
      page,
      "project-intelligence-nav-queries-decisions",
      /\/engineering\/apps\/project-intelligence\/queries-decisions/,
    );
    await expect(page.getByTestId("project-intelligence-queries-decisions-ready")).toBeVisible();
    await expect(page.getByTestId("project-intelligence-queries-decisions")).toBeVisible();
  });
});
