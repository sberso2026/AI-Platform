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
  process.env.PI_TEAMS_LIVE_PROVIDER_CERTIFICATION === "1" &&
  (process.env.PI_TEAMS_GRAPH_MODE ?? "").trim().toLowerCase() === "live" &&
  (process.env.PI_TEAMS_LIVE_CERT_ENABLED ?? "").trim().toLowerCase() === "true";

const basePath = "/engineering/apps/project-intelligence";
const meetingsPath = `${basePath}/meetings`;
const describeLive = enabled ? test.describe : test.describe.skip;
const ownerStoragePath = resolve(
  process.cwd(),
  "artifacts/teams-live-provider-owner-storage-state.json",
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
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  await signInAsFixtureUser(context, owner.email);
  await context.storageState({ path: ownerStoragePath });
  await context.close();
}

describeLive("Phase 6C-3E Live Teams provider browser flows", () => {
  test.describe("owner live Teams flows", () => {
    test.describe.configure({ mode: "serial", retries: 0 });

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test.beforeEach(async ({ context }) => {
      const owner = requireUser(loadFixtures(), "owner");
      await signInAsFixtureUser(context, owner.email);
    });

    test("live provider settings show live graph mode", async ({ page }) => {
      await page.goto(`${meetingsPath}/settings/providers/microsoft-teams`, {
        waitUntil: "networkidle",
      });
      await expect(page.getByTestId("teams-provider-detail")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("teams-bot-join-disabled")).toBeVisible();
      await expect(page.getByTestId("teams-recording-disabled")).toBeVisible();
      await expect(page.getByTestId("teams-live-explanation")).toContainText(/post-meeting/i);
    });

    test("configure live Teams connection", async ({ page }) => {
      const response = await page.request.post(
        "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/configure",
        { data: {} },
      );
      const text = await response.text();
      expect(response.status(), text).toBeLessThan(500);
      expect(response.ok(), text).toBeTruthy();
    });

    test("validate live Teams URL mapping", async ({ page }) => {
      const url = process.env.PI_TEAMS_TEST_MEETING_URL;
      expect(url, "PI_TEAMS_TEST_MEETING_URL required").toBeTruthy();
      const created = await page.request.post("/api/engineering/project-intelligence/meetings", {
        data: {
          title: `Live Teams cert ${Date.now()}`,
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
        { data: { teamsJoinUrl: url } },
      );
      const mapText = await map.text();
      expect(map.status(), mapText).toBeLessThan(500);
      expect(map.ok(), mapText).toBeTruthy();
    });

    test("webhook validationToken handshake", async ({ page }) => {
      const response = await page.request.get(
        "/api/webhooks/microsoft-graph/project-intelligence-meetings?validationToken=live-tok-123",
      );
      expect(response.status()).toBe(200);
      expect(await response.text()).toBe("live-tok-123");
    });

    test("unsupported Zoom and Google remain unavailable", async ({ page }) => {
      await page.goto(`${meetingsPath}/settings/providers`);
      await expect(page.getByTestId("provider-status-zoom")).toContainText(/unavailable/i);
      await expect(page.getByTestId("provider-status-google_meet")).toContainText(/unavailable/i);
    });
  });
});
