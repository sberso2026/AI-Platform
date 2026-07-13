import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  requirePiFixturesManifest,
  type PiDenialFixture,
  type PiFixtureManifest,
  type PiUserFixture,
} from "../src/fixtures/env.js";
import { signInAsFixtureUser } from "./auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const basePath = "/engineering/apps/project-intelligence";
const meetingsPath = `${basePath}/meetings`;
const describeMeetings = enabled ? test.describe : test.describe.skip;
const ownerStoragePath = resolve(
  process.cwd(),
  "artifacts/meetings-owner-storage-state.json",
);

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role} fixture`);
  return user;
}

async function expectMeetingsReady(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("project-intelligence-meetings-ready")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("project-intelligence-nav-meetings")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("login-page")).toHaveCount(0);
  await expect(page.getByTestId("access-denied")).toHaveCount(0);
}

async function transitionViaApi(
  page: import("@playwright/test").Page,
  meetingId: string,
  toStatus: string,
  expectedStateVersion: number,
) {
  const response = await page.request.post(
    `/api/engineering/project-intelligence/meetings/${meetingId}/transition`,
    { data: { toStatus, expectedStateVersion } },
  );
  const text = await response.text();
  expect(response.status(), `transition ${toStatus}: ${text}`).toBeLessThan(500);
  expect(response.ok(), `transition ${toStatus}: ${text}`).toBeTruthy();
  return (JSON.parse(text) as { data: { state_version: number; status: string } }).data;
}

async function getMeeting(page: import("@playwright/test").Page, meetingId: string) {
  const response = await page.request.get(
    `/api/engineering/project-intelligence/meetings/${meetingId}`,
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { data: { id: string; status: string; state_version: number } };
}

async function advanceTo(
  page: import("@playwright/test").Page,
  meetingId: string,
  statuses: readonly string[],
) {
  let meeting = (await getMeeting(page, meetingId)).data;
  for (const status of statuses) {
    if (meeting.status === status) continue;
    meeting = await transitionViaApi(page, meetingId, status, meeting.state_version);
  }
  return meeting;
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

describeMeetings("Phase 6C-3B Meeting Intelligence foundation browser certification", () => {
  test.describe("owner lifecycle flows", () => {
    // One failure must not restart the whole serial chain (retries replay beforeAll
    // and can exhaust auth / cascade into A–R).
    test.describe.configure({ mode: "serial", retries: 0 });

    let meetingId = "";
    let participantId = "";
    let segmentId = "";

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("A open Meetings feature", async ({ page }) => {
      await page.goto(meetingsPath);
      await expectMeetingsReady(page);
    });

    test("B create manual draft", async ({ page }) => {
      await page.goto(meetingsPath);
      await expectMeetingsReady(page);
      await page.getByTestId("project-intelligence-meetings-new-link").click();
      await expect(page.getByTestId("project-intelligence-meetings-new")).toBeVisible({ timeout: 30_000 });
      await page.getByTestId("meeting-title-input").fill(`Cert UI draft ${Date.now()}`);
      await page.getByTestId("meeting-create-submit").click();
      await expect(page.getByTestId("project-intelligence-meeting-detail")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("meeting-detail-status-draft")).toBeVisible();
      meetingId = page.url().split("/").pop() ?? "";
      expect(meetingId).toMatch(/^[0-9a-f-]{36}$/i);
    });

    test("C schedule meeting", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}`);
      await expect(page.getByTestId("project-intelligence-meeting-detail")).toBeVisible({ timeout: 30_000 });
      await page.getByTestId("meeting-transition-scheduled").click();
      await expect(page.getByTestId("meeting-detail-status-scheduled")).toBeVisible({ timeout: 15_000 });
      expect((await getMeeting(page, meetingId)).data.status).toBe("scheduled");
    });

    test("D start manual meeting", async ({ page }) => {
      const meeting = await advanceTo(page, meetingId, ["connecting"]);
      expect(meeting.status).toBe("connecting");
    });

    test("E mark connected", async ({ page }) => {
      const meeting = await advanceTo(page, meetingId, ["connected"]);
      expect(meeting.status).toBe("connected");
    });

    test("F start recording", async ({ page }) => {
      const meeting = await advanceTo(page, meetingId, ["recording"]);
      expect(meeting.status).toBe("recording");
    });

    test("G mark live", async ({ page }) => {
      await advanceTo(page, meetingId, ["live"]);
      await page.goto(`${meetingsPath}/${meetingId}/live`);
      await expect(page.getByTestId("project-intelligence-meeting-live")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("meeting-live-status-live")).toBeVisible();
    });

    test("H add participant", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}`);
      await expect(page.getByTestId("project-intelligence-meeting-detail")).toBeVisible({ timeout: 30_000 });
      page.once("dialog", (dialog) => dialog.accept("Cert Attendee"));
      await page.getByTestId("meeting-add-participant").click();
      await expect(page.getByTestId("meeting-participants-list")).toContainText("Cert Attendee", {
        timeout: 15_000,
      });
      const participants = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/participants`,
      );
      expect(participants.ok()).toBeTruthy();
      const rows = (await participants.json()).data as Array<{ id: string }>;
      expect(rows.length).toBeGreaterThan(0);
      participantId = rows[0]!.id;
    });

    test("I record consent", async ({ page }) => {
      if (!participantId) {
        const add = await page.request.post(
          `/api/engineering/project-intelligence/meetings/${meetingId}/participants`,
          {
            data: {
              displayName: "Consent Subject",
              externalParticipantId: `manual-consent-${Date.now()}`,
              speakerId: `spk-consent-${Date.now()}`,
            },
          },
        );
        expect(add.ok()).toBeTruthy();
        participantId = (await add.json()).data.id as string;
      }
      await page.goto(`${meetingsPath}/${meetingId}/live`);
      await expect(page.getByTestId("project-intelligence-meeting-live")).toBeVisible({ timeout: 30_000 });
      page.once("dialog", (dialog) => dialog.accept("granted"));
      await page.getByTestId(`participant-consent-${participantId}`).click();
      await expect(page.getByTestId("live-participants")).toContainText("granted", { timeout: 15_000 });
    });

    test("J append transcript", async ({ page }) => {
      const append = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
        {
          data: {
            providerEventId: `ui-evt-${Date.now()}`,
            text: "Design pressure is 16 bar.",
            startTimeMs: 0,
            endTimeMs: 1000,
            speakerLabel: "spk-1",
          },
        },
      );
      expect(append.ok(), await append.text()).toBeTruthy();
      segmentId = (await append.json()).data.id as string;
      await page.goto(`${meetingsPath}/${meetingId}/live`);
      await expect(page.getByTestId("live-transcript-stream")).toContainText("Design pressure is 16 bar.", {
        timeout: 30_000,
      });
    });

    test("K revise transcript", async ({ page }) => {
      expect(segmentId).toBeTruthy();
      await page.goto(`${meetingsPath}/${meetingId}/transcript`);
      await expect(page.getByTestId("project-intelligence-meeting-transcript")).toBeVisible({
        timeout: 30_000,
      });
      page.once("dialog", (dialog) => dialog.accept("Revised segment text"));
      await page.getByTestId(`transcript-revise-${segmentId}`).click();
      await expect(page.getByTestId("transcript-ordered-segments")).toContainText("Revised segment text", {
        timeout: 15_000,
      });
    });

    test("L pause and resume", async ({ page }) => {
      const meeting = await advanceTo(page, meetingId, ["paused", "live"]);
      expect(meeting.status).toBe("live");
    });

    test("M end meeting", async ({ page }) => {
      const meeting = await advanceTo(page, meetingId, ["ended"]);
      expect(meeting.status).toBe("ended");
      await page.goto(`${meetingsPath}/${meetingId}`);
      await expect(page.getByTestId("meeting-detail-status-ended")).toBeVisible({ timeout: 15_000 });
    });

    test("N invalid transition rejected", async ({ page }) => {
      const create = await page.request.post("/api/engineering/project-intelligence/meetings", {
        data: {
          title: `Cert invalid ${Date.now()}`,
          provider: "manual",
          recordingNoticeRequired: "not_required",
          consentStatus: "not_applicable",
        },
      });
      expect(create.status()).toBe(201);
      const draftId = String((await create.json()).data?.id ?? "");
      const meeting = (await getMeeting(page, draftId)).data;
      const response = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${draftId}/transition`,
        { data: { toStatus: "processing", expectedStateVersion: meeting.state_version } },
      );
      expect(response.status()).toBe(409);
      expect((await response.json()).error.code).toMatch(/meeting_transition_invalid|transition/);
    });

    test("P external providers unavailable", async ({ page }) => {
      await page.goto(meetingsPath);
      await expectMeetingsReady(page);
      await expect(page.getByTestId("project-intelligence-meetings-providers-disabled")).toBeVisible();
      await page.goto(`${meetingsPath}/${meetingId}/live`);
      await expect(page.getByTestId("external-providers-unavailable")).toBeVisible({ timeout: 30_000 });
      const createExternal = await page.request.post("/api/engineering/project-intelligence/meetings", {
        data: { title: "External attempt", provider: "zoom" },
      });
      expect(createExternal.status()).toBe(422);
      await page.goto(`${meetingsPath}/health`);
      await expect(page.getByTestId("project-intelligence-meetings-health")).toBeVisible({ timeout: 30_000 });
    });
  });

  test.describe("owner shell checks", () => {
    test.describe.configure({ retries: 0 });

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("Q accessibility landmarks on meetings pages", async ({ page }) => {
      await page.goto(meetingsPath);
      await expectMeetingsReady(page);
      await expect(page.getByRole("navigation", { name: "Project Intelligence" })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Meetings/i })).toBeVisible();
    });

    test("R responsive meetings shell", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(meetingsPath);
      // Responsive gate: shell nav must remain reachable at mobile width.
      // Prefer nav over list-ready so a slow meetings list fetch cannot flake Gate N.
      await expect(page.getByTestId("project-intelligence-nav-meetings")).toBeVisible({ timeout: 45_000 });
      await expect(page.getByTestId("login-page")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: /Meetings|Project Intelligence/i }).first()).toBeVisible();
    });
  });

  test("O unassigned workspace denied", async ({ browser }) => {
    const denial = loadFixtures().denial.workspaceNotAssigned as PiDenialFixture & {
      userWithoutWorkspace?: PiUserFixture;
    };
    const user = denial.userWithoutWorkspace;
    if (!user?.email) throw new Error("Missing workspaceNotAssigned.userWithoutWorkspace");

    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await signInAsFixtureUser(context, user.email);

      const response = await page.request.get("/api/engineering/project-intelligence/meetings");
      expect(response.status()).toBe(403);
      const payload = await response.json();
      expect(payload.error?.code ?? "").toMatch(/workspace|entitlement|permission|access/i);

      await page.goto(meetingsPath);
      await expect(
        page.getByTestId(`access-denied-${denial.expectedReason ?? "workspace_not_assigned"}`),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId("project-intelligence-meetings-ready")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
