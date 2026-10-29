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
const reasoningPath = "/engineering/apps/project-intelligence/reasoning";
const describeReasoning = enabled ? test.describe : test.describe.skip;

const ownerStoragePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../artifacts/playwright-reasoning-owner.json",
);

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role}`);
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

describeReasoning("Phase 8I Engineering Reasoning Assistant browser certification", () => {
  test.describe("owner shell checks", () => {
    test.describe.configure({ retries: 0 });
    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });
    test.use({ storageState: ownerStoragePath });

    test("A reasoning ready markers inside PI shell", async ({ page }) => {
      await page.goto(reasoningPath);
      await expect(page.getByTestId("engineering-reasoning-assistant-ready")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("project-intelligence-copilot-ready")).toBeVisible();
      await expect(page.getByTestId("project-intelligence-shell")).toBeVisible();
      await expect(page.getByTestId("project-intelligence-nav-reasoning")).toBeVisible();
    });

    test("B accessibility landmarks on reasoning", async ({ page }) => {
      await page.goto(reasoningPath);
      await expect(
        page.getByRole("navigation", { name: "Project Intelligence features" }),
      ).toBeVisible();
      await expect(page.getByRole("form", { name: "Reasoning assistant" })).toBeVisible();
    });

    test("C responsive reasoning shell", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(reasoningPath);
      await expect(page.getByTestId("engineering-reasoning-assistant-ready")).toBeVisible({
        timeout: 45_000,
      });
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
      await page.goto(reasoningPath);
      await expect(
        page.getByTestId(`access-denied-${denial.expectedReason ?? "workspace_not_assigned"}`),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("engineering-reasoning-assistant-ready")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
