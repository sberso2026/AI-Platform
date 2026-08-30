import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeAnalyst = enabled ? test.describe : test.describe.skip;

describeAnalyst("PI-7 AI Project Analyst browser surface", () => {
  test("unauthenticated visitor is redirected from the analyst route", async ({ page }) => {
    await page.goto("/engineering/apps/project-intelligence/analyst");
    await expect(page).toHaveURL(/\/login/, { timeout: 45_000 });
  });

  test("entitled owner can open Analyst with project context, starters, grounded UNKNOWN, and read-only UI", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-analyst-entry")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-analyst-open")).toBeVisible();

    await followPiNav(
      page,
      "project-intelligence-nav-analyst",
      /\/engineering\/apps\/project-intelligence\/analyst/,
    );
    await expect(page.getByTestId("project-intelligence-analyst-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-analyst")).toBeVisible();
    await expect(page.getByTestId("analyst-advisory-banner")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`projectId=${projectId}`));
    await expect(page.getByTestId("analyst-starters")).toBeVisible();
    await expect(page.getByRole("button", { name: /approve|send|close risk|commit/i })).toHaveCount(0);

    await page.getByTestId("analyst-starter").filter({ hasText: "What information is missing?" }).click();
    await expect(page.getByTestId("analyst-answer")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("analyst-answer-text")).toBeVisible();
    await expect(page.getByTestId("analyst-citations")).toBeVisible();
    await expect(page.getByTestId("analyst-limitations")).toBeVisible();
    const body = (await page.getByTestId("analyst-answer-text").innerText()).toUpperCase();
    expect(body).not.toMatch(/WILL FINISH \d+/);
    expect(body).not.toMatch(/COMPLETION PROBABILITY/);
    expect(body).not.toMatch(/MONTE CARLO/);
    const overlay = page.getByTestId("analyst-ai-unavailable").or(page.getByTestId("analyst-ai-available"));
    await expect(overlay).toBeVisible();
  });

  test("unsupported or missing intelligence stays insufficient and does not invent GREEN health", async ({
    page,
    context,
  }) => {
    const { projectId } = await signInPiOwner(context);
    await page.goto(`/engineering/apps/project-intelligence/analyst?projectId=${projectId}`);
    await expect(page.getByTestId("project-intelligence-analyst-ready")).toBeVisible({ timeout: 45_000 });
    await page.getByTestId("analyst-question-input").fill("What information is missing?");
    await page.getByTestId("analyst-ask").click();
    await expect(page.getByTestId("analyst-answer-text")).toBeVisible({ timeout: 45_000 });
    const text = (await page.getByTestId("analyst-answer-text").innerText()).toLowerCase();
    expect(text).toMatch(/unavailable|insufficient|unknown|missing|limitation|no additional missing/);
    expect(text).not.toMatch(/assumed green/);
  });

  test("unsupported forecast question is not invented", async ({ page, context }) => {
    const { projectId } = await signInPiOwner(context);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await page.goto(`/engineering/apps/project-intelligence/analyst?projectId=${projectId}`);
    await expect(page.getByTestId("project-intelligence-analyst-ready")).toBeVisible({ timeout: 45_000 });
    await page.getByTestId("analyst-question-input").fill("When will the project finish and what is the completion probability?");
    await page.getByTestId("analyst-ask").click();
    await expect(page.getByTestId("analyst-answer-text")).toBeVisible({ timeout: 45_000 });
    const text = (await page.getByTestId("analyst-answer-text").innerText()).toLowerCase();
    expect(text).toMatch(/qualitative|not invent|unavailable|insufficient|not produced/);
    expect(text).not.toMatch(/will finish \d+/);
    expect(text).not.toMatch(/\$\s*\d/);
    await expect(page.getByTestId("analyst-limitations")).toBeVisible();
    await expect(page.getByRole("button", { name: /approve|commit baseline|close the risk/i })).toHaveCount(0);
  });
});
