import { expect, test } from "@playwright/test";
import { followPiNav, openProjectIntelligence, selectCanonicalProject, signInPiOwner } from "./pi-cert-auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const describeIntegrated = enabled ? test.describe : test.describe.skip;
const basePath = "/engineering/apps/project-intelligence";

const MUTATION_LABELS = [
  /approve change/i,
  /modify schedule/i,
  /modify cost/i,
  /change progress/i,
  /close risk/i,
  /answer tq/i,
  /answer rfi/i,
  /approve decision/i,
  /close action/i,
  /modify forecast/i,
];

describeIntegrated("PI integrated certification journey", () => {
  test("unauthenticated visitor is redirected to login", async ({ page }) => {
    await page.goto(basePath);
    await expect(page).toHaveURL(/\/login/, { timeout: 45_000 });
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("entitled owner walks Command Centre through Forecasting and v1 navigation", async ({ page, context }) => {
    const failedPiApi: string[] = [];
    page.on("response", (response) => {
      const url = response.url();
      if (!url.includes("/api/engineering/project-intelligence") && !url.includes("/api/engineering/projects")) {
        return;
      }
      if (response.status() >= 500) {
        failedPiApi.push(`${response.status()} ${response.request().method()} ${url}`);
      }
    });

    const { projectId } = await signInPiOwner(context);
    await page.goto("/engineering");
    await expect(page.locator("[data-testid='engineering-os-v1-ready'], [data-testid='engineering-os-shell']").first()).toBeVisible({
      timeout: 45_000,
    });

    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("project-intelligence-command-centre")).toBeVisible();

    await selectCanonicalProject(page, projectId);
    await expect(page.getByTestId("command-centre-overall-health")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId("command-centre-section-schedule")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-cost")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-progress")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-risk")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-change")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-queries")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-decisions")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-actions")).toBeVisible();
    await expect(page.getByTestId("command-centre-section-forecast")).toBeVisible();

    const body = (await page.locator("body").innerText()).toLowerCase();
    for (const label of MUTATION_LABELS) {
      expect(body).not.toMatch(label);
    }

    const routes = [
      { nav: "project-intelligence-nav-schedule", ready: "project-intelligence-schedule-ready", path: /\/engineering\/apps\/project-intelligence\/schedule/ },
      { nav: "project-intelligence-nav-cost-progress", ready: "project-intelligence-cost-progress-ready", path: /\/engineering\/apps\/project-intelligence\/cost-progress/ },
      { nav: "project-intelligence-nav-risk-change", ready: "project-intelligence-risk-change-ready", path: /\/engineering\/apps\/project-intelligence\/risk-change/ },
      { nav: "project-intelligence-nav-queries-decisions", ready: "project-intelligence-queries-decisions-ready", path: /\/engineering\/apps\/project-intelligence\/queries-decisions/ },
      { nav: "project-intelligence-nav-forecasting", ready: "project-intelligence-forecasting-ready", path: /\/engineering\/apps\/project-intelligence\/forecasting/ },
      { nav: "project-intelligence-nav-documents", ready: "project-intelligence-documents-ready", path: /\/engineering\/apps\/project-intelligence\/documents/ },
    ] as const;

    for (const route of routes) {
      await followPiNav(page, route.nav, route.path);
      await expect(page.getByTestId(route.ready)).toBeVisible({ timeout: 45_000 });
      await expect(page).toHaveURL(new RegExp(`projectId=${projectId}`));
      if (route.nav === "project-intelligence-nav-forecasting") {
        await expect(page.getByTestId("forecasting-unsupported")).toBeVisible({ timeout: 45_000 });
        const forecastText = (await page.getByTestId("project-intelligence-forecasting").innerText()).toLowerCase();
        expect(forecastText).toMatch(/qualitative|not produced|unpublished|advisory|unsupported|unknown/);
        expect(forecastText).not.toMatch(/completion probability/);
        expect(forecastText).not.toMatch(/monte carlo/);
        expect(page.getByRole("button", { name: /approve|save forecast|publish forecast/i })).toHaveCount(0);
      }
    }

    expect(failedPiApi, failedPiApi.join("\n")).toEqual([]);
  });

  test("workspace-A engineer does not receive the workspace-B project in Command Centre", async ({
    page,
    context,
  }) => {
    const fixtures = (await import("../src/fixtures/env.js")).requirePiFixturesManifest();
    const engineer = fixtures.baseline.users.engineer;
    if (!engineer?.email) throw new Error("Missing baseline.users.engineer fixture");
    await (await import("./auth.js")).signInAsFixtureUser(context, engineer.email);
    await openProjectIntelligence(page);
    await expect(page.getByTestId("project-intelligence-ready")).toBeVisible({ timeout: 45_000 });
    const labels = await page.getByTestId("command-centre-project-select").locator("option").allTextContents();
    expect(labels.join(" ")).not.toMatch(/PI-WORKSPACE-B/i);
  });
});
