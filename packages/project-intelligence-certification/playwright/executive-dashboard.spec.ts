import { expect, test } from "@playwright/test";
import {
  requirePiFixturesManifest,
  type PiDenialFixture,
  type PiFixtureManifest,
  type PiUserFixture,
} from "../src/fixtures/env.js";
import { signInAsFixtureUser } from "./auth.js";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const basePath = "/engineering/apps/project-intelligence";
const reportsPath = `${basePath}/reports`;
const executivePath = `${basePath}/reports/executive`;
const describeReports = enabled ? test.describe : test.describe.skip;

const ownerStoragePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../artifacts/playwright-reports-owner.json",
);

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role} fixture`);
  return user;
}

async function writeOwnerStorage(browser: import("@playwright/test").Browser) {
  mkdirSync(dirname(ownerStoragePath), { recursive: true });
  const owner = requireUser(loadFixtures(), "owner");
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  await signInAsFixtureUser(context, owner.email);
  await context.storageState({ path: ownerStoragePath });
  await context.close();
}

describeReports("Executive Intelligence Dashboard browser certification", () => {
  test.describe("owner shell checks", () => {
    test.describe.configure({ retries: 0 });

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("A reports ready and executive dashboard entry", async ({ page }) => {
      await page.goto(reportsPath);
      await expect(page.getByTestId("reporting-intelligence-ready")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("project-intelligence-reports-ready")).toBeVisible();
      await expect(page.getByTestId("executive-dashboard-open-link")).toBeVisible();
    });

    test("B executive dashboard widgets and live aggregation", async ({ page }) => {
      await page.goto(executivePath);
      await expect(page.getByTestId("reporting-intelligence-ready")).toBeVisible({
        timeout: 45_000,
      });
      // Prefer ready; accept error panel so entitlement/API failures are visible in CI logs.
      const ready = page.getByTestId("executive-intelligence-dashboard-ready");
      const errored = page.getByTestId("executive-intelligence-dashboard-error");
      await expect(ready.or(errored)).toBeVisible({ timeout: 60_000 });
      if (await errored.isVisible().catch(() => false)) {
        const message = await errored.locator("[role=alert]").innerText();
        throw new Error(`Executive dashboard failed to load: ${message}`);
      }
      await expect(page.getByTestId("executive-dashboard-live-flag")).toContainText(
        "liveAggregation=true",
      );
      await expect(page.getByTestId("executive-dashboard-widgets")).toBeVisible();
      await expect(page.getByTestId("executive-widget-open_findings")).toBeVisible();
      await expect(page.getByTestId("executive-widget-drilldown-open_findings")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Project Intelligence features" })).toBeVisible();
    });

    test("C AI summary requires human publish path", async ({ page }) => {
      await page.goto(executivePath);
      await expect(page.getByTestId("executive-intelligence-dashboard-ready")).toBeVisible({
        timeout: 45_000,
      });
      await page.getByTestId("executive-summary-generate").click();
      await expect(page.getByTestId("executive-summary-draft")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("executive-summary-draft")).toContainText(
        "humanReviewRequired=true",
      );
      await page.getByTestId("executive-summary-publish").click();
      await expect(page.getByTestId("executive-summary-published")).toBeVisible({
        timeout: 30_000,
      });
    });

    test("D responsive executive dashboard", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(executivePath);
      await expect(page.getByTestId("project-intelligence-nav-reports")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("executive-intelligence-dashboard-ready")).toBeVisible({
        timeout: 45_000,
      });
    });
  });

  test("E unassigned workspace denied", async ({ browser }) => {
    const denial = loadFixtures().denial.workspaceNotAssigned as PiDenialFixture & {
      userWithoutWorkspace?: PiUserFixture;
    };
    const user = denial.userWithoutWorkspace;
    if (!user?.email) throw new Error("Missing workspaceNotAssigned.userWithoutWorkspace");

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await signInAsFixtureUser(context, user.email);
      await page.goto(executivePath);
      await expect(
        page.getByTestId(`access-denied-${denial.expectedReason ?? "workspace_not_assigned"}`),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("executive-intelligence-dashboard-ready")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
