import { expect, test } from "@playwright/test";
import { requirePiFixturesManifest, type PiDenialFixture, type PiFixtureManifest, type PiUserFixture } from "../src/fixtures/env.js";
import { signInAsFixtureUser } from "./auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const basePath = "/engineering/apps/project-intelligence";
const describePi = enabled ? test.describe : test.describe.skip;

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role} fixture`);
  return user;
}

async function expectPositiveOverview(page: import("@playwright/test").Page) {
  await expect(page).toHaveURL(new RegExp(`${basePath}$`));
  await expect(page.getByTestId("project-intelligence-ready")).toBeVisible();
  await expect(page.getByTestId("project-intelligence-nav-overview")).toBeVisible();
  await expect(page.getByTestId("login-page")).toHaveCount(0);
  await expect(page.getByTestId("access-denied")).toHaveCount(0);
}

describePi("Phase 6C-1 Project Intelligence exact entitlement certification", () => {
  test("A entitled owner opens Project Intelligence", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    await page.goto(basePath);
    await expectPositiveOverview(page);
  });

  test("B entitled engineer reads migration but cannot approve", async ({ page, context }) => {
    const engineer = requireUser(loadFixtures(), "engineer");
    await signInAsFixtureUser(context, engineer.email);
    await page.goto(`${basePath}/migration`);
    await expect(page.getByTestId("login-page")).toHaveCount(0);
    await expect(page.getByTestId("access-denied")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Migration review" })).toBeVisible();

    const approve = page.getByRole("button", { name: "Approve" }).first();
    if (await approve.count()) {
      const response = page.waitForResponse((candidate) =>
        candidate.url().includes("/api/engineering/project-intelligence/mappings/") &&
        candidate.request().method() === "PATCH",
      );
      await approve.click();
      const api = await response;
      expect(api.status()).toBe(403);
      expect((await api.json()).error).toMatchObject({ code: "project_intelligence_migration_access_denied" });
    }
  });

  test("C unauthenticated browser and API receive exact markers", async ({ page }) => {
    await page.goto(basePath);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    const response = await page.request.get("/api/engineering/project-intelligence/mappings");
    expect(response.status()).toBe(401);
    expect((await response.json()).error).toMatchObject({ code: "unauthenticated" });
  });

  const denialScenarios: ReadonlyArray<{
    label: string;
    fixture: (manifest: PiFixtureManifest) => PiDenialFixture & { owner?: PiUserFixture; user?: PiUserFixture; userWithoutWorkspace?: PiUserFixture };
  }> = [
    { label: "notInstalled", fixture: (manifest) => manifest.denial.piNotInstalledTenant },
    { label: "licenceSuspended", fixture: (manifest) => manifest.denial.suspendedLicence },
    { label: "seatUnassigned", fixture: (manifest) => manifest.denial.seatNotAssigned },
    { label: "workspaceUnassigned", fixture: (manifest) => manifest.denial.workspaceNotAssigned },
  ];
  for (const scenario of denialScenarios) {
    test(`D–G ${scenario.label} is denied with exact browser and API codes`, async ({ page, context }) => {
      const denial = scenario.fixture(loadFixtures());
      const user = denial.owner ?? denial.user ?? denial.userWithoutWorkspace;
      if (!user?.email) throw new Error(`Missing user for ${scenario.label} denial fixture`);
      await signInAsFixtureUser(context, user.email);
      await page.goto(basePath);

      if (denial.expectedState) {
        await expect(page.getByTestId(`project-intelligence-state-${denial.expectedState}`)).toBeVisible();
      } else {
        await expect(page.getByTestId(`access-denied-${denial.expectedReason}`)).toBeVisible();
      }
      const response = await page.request.get("/api/engineering/project-intelligence/mappings");
      expect(response.status()).toBe(403);
      expect((await response.json()).error).toMatchObject({
        code: denial.expectedCode,
        details: { reasonCode: expect.any(String) },
      });
    });
  }

  test("H–I foreign mapping IDs are anti-enumerated", async ({ page, context }) => {
    const fixtures = loadFixtures();
    const owner = requireUser(fixtures, "owner");
    const foreignMappingId = fixtures.baseline.foreignMappingId;
    if (!foreignMappingId) throw new Error("Missing baseline.foreignMappingId fixture");
    await signInAsFixtureUser(context, owner.email);
    const response = await page.request.get(`/api/engineering/project-intelligence/mappings/${foreignMappingId}`);
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toMatchObject({ code: "mapping_not_found" });
    expect(JSON.stringify(body)).not.toContain(foreignMappingId);
  });
});
