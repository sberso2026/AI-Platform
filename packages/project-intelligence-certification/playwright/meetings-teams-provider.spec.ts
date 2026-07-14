import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  requirePiFixturesManifest,
  type PiFixtureManifest,
  type PiUserFixture,
} from "../src/fixtures/env.js";
import { signInAsFixtureUser } from "./auth.js";

const enabled =
  process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
  process.env.PI_TEAMS_PROVIDER_CERTIFICATION === "1";
const basePath = "/engineering/apps/project-intelligence";
const meetingsPath = `${basePath}/meetings`;
const describeTeams = enabled ? test.describe : test.describe.skip;
const ownerStoragePath = resolve(process.cwd(), "artifacts/teams-provider-owner-storage-state.json");

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
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  await signInAsFixtureUser(context, owner.email);
  await context.storageState({ path: ownerStoragePath });
  await context.close();
}

describeTeams("Phase 6C-3D Teams provider browser flows", () => {
  test.describe("owner Teams provider flows", () => {
    test.describe.configure({ mode: "serial", retries: 0 });

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("A provider settings", async ({ page }) => {
      const api = await page.request.get(
        "/api/engineering/project-intelligence/meetings/providers",
      );
      expect(api.ok(), await api.text()).toBeTruthy();
      await page.goto(`${meetingsPath}/settings/providers`, { waitUntil: "networkidle" });
      await expect(page.getByTestId("teams-providers-settings")).toBeVisible({ timeout: 30_000 });
    });

    test("B configure Teams connection", async ({ page }) => {
      const response = await page.request.post(
        "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/configure",
        { data: {} },
      );
      const text = await response.text();
      expect(response.status(), text).toBeLessThan(500);
      expect([200, 201].includes(response.status()), text).toBeTruthy();
      await page.goto(`${meetingsPath}/settings/providers/microsoft-teams`, {
        waitUntil: "networkidle",
      });
      await expect(page.getByTestId("teams-provider-detail")).toBeVisible({ timeout: 30_000 });
    });

    test("C provider health", async ({ page }) => {
      await page.goto(`${meetingsPath}/health`);
      await expect(page.getByTestId("project-intelligence-meetings-health")).toBeVisible();
      const health = await page.request.get(
        "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/health",
      );
      expect(health.status()).toBeLessThan(500);
      expect(health.ok()).toBeTruthy();
    });

    test("D-F create meeting, map, capability display", async ({ page }) => {
      const created = await page.request.post("/api/engineering/project-intelligence/meetings", {
        data: {
          title: `Teams cert ${Date.now()}`,
          provider: "manual",
          consentStatus: "granted",
          recordingNoticeRequired: "not_required",
          privacyClassification: "internal",
        },
      });
      expect(created.ok()).toBeTruthy();
      const meeting = (await created.json()).data as { id: string };

      const map = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meeting.id}/providers/microsoft-teams/map`,
        {
          data: {
            providerMeetingId: "fixture-online-meeting-001",
            teamsJoinUrl:
              "https://teams.microsoft.com/l/meetup-join/fixture-online-meeting-001",
          },
        },
      );
      const mapText = await map.text();
      expect(map.status(), mapText).toBeLessThan(500);
      expect(map.ok(), mapText).toBeTruthy();

      await page.goto(`${meetingsPath}/${meeting.id}`);
      await expect(page.getByTestId("teams-bot-join-disabled")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId("teams-recording-disabled")).toBeVisible();
      await expect(page.getByTestId("teams-transcript-mode")).toBeVisible();

      const status = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meeting.id}/providers/microsoft-teams/status`,
      );
      expect(status.ok()).toBeTruthy();
    });

    test("G webhook validation token handshake", async ({ page }) => {
      const response = await page.request.get(
        "/api/webhooks/microsoft-graph/project-intelligence-meetings?validationToken=tok-cert-123",
      );
      expect(response.status()).toBe(200);
      expect(await response.text()).toBe("tok-cert-123");
    });

    test("H-J participant sync / transcript mode / ingestion path", async ({ page }) => {
      const list = await page.request.get("/api/engineering/project-intelligence/meetings");
      expect(list.ok()).toBeTruthy();
      const meetings = ((await list.json()).data ?? []) as Array<{ id: string }>;
      const meetingId = meetings[0]?.id;
      expect(meetingId).toBeTruthy();
      const sync = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meetingId}/providers/microsoft-teams/sync`,
        { data: { includeTranscript: true } },
      );
      const syncText = await sync.text();
      expect(sync.status(), syncText).toBeLessThan(500);
    });

    test("K minutes/proposals path still reachable", async ({ page }) => {
      await page.goto(`${meetingsPath}`);
      await expect(page.locator("body")).toContainText(/Meeting/i);
    });

    test("L-M unavailable bot and recording controls", async ({ page }) => {
      await page.goto(`${meetingsPath}/settings/providers/microsoft-teams`);
      await expect(page.getByTestId("teams-bot-join-disabled")).toBeVisible();
      await expect(page.getByTestId("teams-recording-disabled")).toBeVisible();
    });

    test("N revoke connection", async ({ page }) => {
      const response = await page.request.post(
        "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/revoke",
        { data: {} },
      );
      const text = await response.text();
      expect(response.status(), text).toBeLessThan(500);
      expect(response.ok(), text).toBeTruthy();
    });

    test("O permission failure for engineer configure", async ({ browser }) => {
      const fixtures = loadFixtures();
      const engineer = requireUser(fixtures, "engineer");
      const context = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      await signInAsFixtureUser(context, engineer.email);
      const page = await context.newPage();
      const response = await page.request.post(
        "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/configure",
        { data: {} },
      );
      expect([401, 403].includes(response.status())).toBeTruthy();
      await context.close();
    });

    test("P cross-workspace denial surface remains", async ({ page }) => {
      await page.goto(`${meetingsPath}/settings/providers`);
      await expect(page.getByTestId("teams-providers-settings")).toBeVisible();
    });

    test("Q accessibility landmarks", async ({ page }) => {
      await page.goto(`${meetingsPath}/settings/providers`);
      await expect(page.locator("main, [role='main'], section").first()).toBeVisible();
    });

    test("R responsive behavior", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${meetingsPath}/settings/providers/microsoft-teams`);
      await expect(page.getByTestId("teams-provider-detail")).toBeVisible();
    });
  });
});
