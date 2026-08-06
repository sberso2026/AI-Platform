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
const findingsPath = `${basePath}/findings`;
const describeFindings = enabled ? test.describe : test.describe.skip;

const ownerStoragePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../artifacts/playwright-findings-owner.json",
);

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role} fixture`);
  return user;
}

async function expectFindingsReady(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("findings-intelligence-ready")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("project-intelligence-findings-ready")).toBeVisible({
    timeout: 45_000,
  });
  await expect(page.getByTestId("project-intelligence-nav-findings")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByTestId("login-page")).toHaveCount(0);
  await expect(page.getByTestId("access-denied")).toHaveCount(0);
}

async function writeOwnerStorage(browser: import("@playwright/test").Browser) {
  mkdirSync(dirname(ownerStoragePath), { recursive: true });
  const owner = requireUser(loadFixtures(), "owner");
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  await signInAsFixtureUser(context, owner.email);
  await context.storageState({ path: ownerStoragePath });
  await context.close();
}

describeFindings("Phase 8E Findings Intelligence browser certification", () => {
  test.describe("owner shell checks", () => {
    test.describe.configure({ retries: 0 });

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("A findings ready marker inside Project Intelligence shell", async ({ page }) => {
      await page.goto(findingsPath);
      await expectFindingsReady(page);
      await expect(page.getByTestId("project-intelligence-shell")).toBeVisible();
      await expect(page.getByRole("heading", { name: /Findings/i })).toBeVisible();
    });

    test("B accessibility landmarks on findings pages", async ({ page }) => {
      await page.goto(findingsPath);
      await expectFindingsReady(page);
      await expect(
        page.getByRole("navigation", { name: "Project Intelligence features" }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Findings Intelligence surfaces" }),
      ).toBeVisible();
    });

    test("C responsive findings shell", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(findingsPath);
      await expect(page.getByTestId("project-intelligence-nav-findings")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("login-page")).toHaveCount(0);
      await expect(
        page.getByRole("heading", { name: /Findings|Project Intelligence/i }).first(),
      ).toBeVisible();
    });
  });

  test("D unassigned workspace denied", async ({ browser }) => {
    const denial = loadFixtures().denial.workspaceNotAssigned as PiDenialFixture & {
      userWithoutWorkspace?: PiUserFixture;
    };
    const user = denial.userWithoutWorkspace;
    if (!user?.email) throw new Error("Missing workspaceNotAssigned.userWithoutWorkspace");

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await signInAsFixtureUser(context, user.email);
      await page.goto(findingsPath);
      await expect(
        page.getByTestId(`access-denied-${denial.expectedReason ?? "workspace_not_assigned"}`),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("findings-intelligence-ready")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
