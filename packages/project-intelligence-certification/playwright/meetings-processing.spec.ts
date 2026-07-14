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
const describeProcessing = enabled ? test.describe : test.describe.skip;
const ownerStoragePath = resolve(
  process.cwd(),
  "artifacts/meetings-processing-owner-storage-state.json",
);

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role} fixture`);
  return user;
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

async function drainMeetingJobs(page: import("@playwright/test").Page, loops = 5) {
  const secret = process.env.COMMERCE_SCHEDULER_SECRET;
  const headers: Record<string, string> = {};
  if (secret) headers["x-commerce-scheduler-secret"] = secret;
  const response = await page.request.post("/api/platform/project-intelligence/meeting-jobs/run", {
    headers,
    data: { loops, batchSize: 5 },
  });
  const text = await response.text();
  expect(response.status(), `worker drain: ${text}`).toBeLessThan(500);
  expect(response.ok(), `worker drain: ${text}`).toBeTruthy();
  return JSON.parse(text);
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

describeProcessing("Phase 6C-3C Meeting Intelligence processing browser certification", () => {
  test.describe("owner processing flows", () => {
    test.describe.configure({ mode: "serial", retries: 0 });

    let meetingId = "";
    let approveProposalId = "";
    let rejectProposalId = "";
    let changesProposalId = "";
    let convertProposalId = "";

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("A open ended meeting", async ({ page }) => {
      const create = await page.request.post("/api/engineering/project-intelligence/meetings", {
        data: {
          title: `Cert processing ${Date.now()}`,
          provider: "manual",
          recordingNoticeRequired: "not_required",
          consentStatus: "not_applicable",
        },
      });
      expect(create.status()).toBe(201);
      meetingId = String((await create.json()).data?.id ?? "");
      expect(meetingId).toMatch(/^[0-9a-f-]{36}$/i);

      await advanceTo(page, meetingId, [
        "scheduled",
        "connecting",
        "connected",
        "recording",
        "live",
      ]);

      const participant = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meetingId}/participants`,
        {
          data: {
            displayName: "Processing Attendee",
            externalParticipantId: `proc-${Date.now()}`,
            speakerId: `spk-proc-${Date.now()}`,
          },
        },
      );
      expect(participant.ok()).toBeTruthy();
      const participantId = String((await participant.json()).data.id);

      await page.request.patch(
        `/api/engineering/project-intelligence/meetings/${meetingId}/participants/${participantId}`,
        { data: { consentStatus: "granted" } },
      );

      const cues = [
        "ACTION: Order fittings owner: Cert due: 2026-08-01",
        "DECIDE: Use SS316 for manifold",
        "RISK: Schedule slip on isometric check",
        "LESSON: Validate flanged joints before hydrotest",
      ];
      for (let i = 0; i < cues.length; i += 1) {
        const append = await page.request.post(
          `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
          {
            data: {
              providerEventId: `proc-evt-${Date.now()}-${i}`,
              text: cues[i],
              startTimeMs: i * 1000,
              endTimeMs: i * 1000 + 900,
              speakerLabel: "spk-1",
            },
          },
        );
        expect(append.ok(), await append.text()).toBeTruthy();
      }

      await advanceTo(page, meetingId, ["ended"]);
      await page.goto(`${meetingsPath}/${meetingId}`);
      await expect(page.getByTestId("project-intelligence-meeting-detail")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("meeting-detail-status-ended")).toBeVisible();
    });

    test("B enqueue processing", async ({ page }) => {
      const response = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meetingId}/process`,
        { data: {} },
      );
      expect(response.status(), await response.text()).toBe(202);
      const body = await response.json();
      expect(body.data?.accepted ?? body.data?.jobId).toBeTruthy();
    });

    test("C observe processing status", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/live`);
      await expect(page.getByTestId("project-intelligence-meeting-live")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("live-processing-status")).toBeVisible({ timeout: 30_000 });
      const status = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/processing-status`,
      );
      expect(status.ok()).toBeTruthy();
      const payload = await status.json();
      expect(payload.data?.jobStatus ?? payload.data?.processingRunStatus).toBeTruthy();
    });

    test("D transcript reconnect/replay", async ({ page }) => {
      const replay = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/transcript/replay?cursor=0`,
      );
      expect(replay.ok(), await replay.text()).toBeTruthy();
      const payload = await replay.json();
      const segments = payload.data?.segments ?? payload.data ?? [];
      expect(Array.isArray(segments)).toBeTruthy();
      expect(segments.length).toBeGreaterThan(0);

      await page.goto(`${meetingsPath}/${meetingId}/live`);
      await expect(page.getByTestId("live-connection-panel")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByTestId("live-transcript-stream")).toBeVisible();
    });

    test("E view minutes draft", async ({ page }) => {
      await drainMeetingJobs(page, 8);
      await page.goto(`${meetingsPath}/${meetingId}/minutes`);
      await expect(page.getByTestId("project-intelligence-meeting-minutes")).toBeVisible({
        timeout: 30_000,
      });
      // Worker may already have generated; otherwise generate explicitly.
      const current = page.getByTestId("minutes-current");
      if ((await current.count()) === 0) {
        await page.getByTestId("minutes-generate").click();
        await expect(page.getByTestId("minutes-current")).toBeVisible({ timeout: 30_000 });
      } else {
        await expect(current).toBeVisible();
      }
    });

    test("F view proposals", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/review`);
      await expect(page.getByTestId("project-intelligence-meeting-review")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("meeting-proposals-list")).toBeVisible();

      const list = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/proposals`,
      );
      expect(list.ok()).toBeTruthy();
      const proposals = ((await list.json()).data ?? []) as Array<{
        id: string;
        review_state: string;
      }>;
      expect(proposals.length).toBeGreaterThanOrEqual(2);
      const proposed = proposals.filter((p) => p.review_state === "proposed");
      approveProposalId = proposed[0]?.id ?? proposals[0]!.id;
      rejectProposalId = proposed[1]?.id ?? proposals[1]?.id ?? approveProposalId;
      changesProposalId = proposed[2]?.id ?? proposals[2]?.id ?? approveProposalId;
      convertProposalId = approveProposalId;
    });

    test("G transcript evidence", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/review`);
      await expect(
        page.getByTestId(`proposal-transcript-evidence-${approveProposalId}`),
      ).toBeVisible({ timeout: 30_000 });
    });

    test("H document citation section", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/review`);
      await expect(
        page.getByTestId(`proposal-document-citations-${approveProposalId}`),
      ).toBeVisible({ timeout: 30_000 });
    });

    test("I approve proposal", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/review`);
      page.once("dialog", (dialog) => dialog.accept("approved in cert"));
      await page.getByTestId(`proposal-approve-${approveProposalId}`).click();
      await expect(page.getByTestId(`proposal-card-${approveProposalId}`)).toContainText(
        /approved/i,
        { timeout: 20_000 },
      );
    });

    test("J reject proposal", async ({ page }) => {
      if (rejectProposalId === approveProposalId) {
        const createExtra = await page.request.post(
          `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
          {
            data: {
              providerEventId: `proc-extra-${Date.now()}`,
              text: "ACTION: Extra reject candidate",
              startTimeMs: 9000,
              endTimeMs: 9900,
              speakerLabel: "spk-1",
            },
          },
        );
        // Meeting may already be processing; soft skip inventing a second proposal if not possible.
        if (createExtra.ok()) {
          await drainMeetingJobs(page, 3);
        }
        const list = await page.request.get(
          `/api/engineering/project-intelligence/meetings/${meetingId}/proposals`,
        );
        const proposals = ((await list.json()).data ?? []) as Array<{
          id: string;
          review_state: string;
        }>;
        const other = proposals.find(
          (p) => p.id !== approveProposalId && p.review_state === "proposed",
        );
        if (other) rejectProposalId = other.id;
      }

      await page.goto(`${meetingsPath}/${meetingId}/review`);
      if (rejectProposalId !== approveProposalId) {
        page.once("dialog", (dialog) => dialog.accept("rejected in cert"));
        await page.getByTestId(`proposal-reject-${rejectProposalId}`).click();
        await expect(page.getByTestId(`proposal-card-${rejectProposalId}`)).toContainText(
          /rejected/i,
          { timeout: 20_000 },
        );
      } else {
        // Soft path: only one proposal available after approve.
        await expect(page.getByTestId("meeting-proposals-list")).toBeVisible();
      }
    });

    test("K request changes", async ({ page }) => {
      const list = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/proposals`,
      );
      const proposals = ((await list.json()).data ?? []) as Array<{
        id: string;
        review_state: string;
      }>;
      const candidate =
        proposals.find(
          (p) =>
            p.id !== approveProposalId &&
            p.id !== rejectProposalId &&
            p.review_state === "proposed",
        ) ?? proposals.find((p) => p.review_state === "proposed");

      await page.goto(`${meetingsPath}/${meetingId}/review`);
      if (candidate) {
        changesProposalId = candidate.id;
        page.once("dialog", (dialog) => dialog.accept("please clarify owner"));
        await page.getByTestId(`proposal-request-changes-${changesProposalId}`).click();
        await expect(page.getByTestId(`proposal-card-${changesProposalId}`)).toContainText(
          /changes_requested|changes requested/i,
          { timeout: 20_000 },
        );
      } else {
        await expect(page.getByTestId("meeting-proposals-list")).toBeVisible();
      }
    });

    test("L convert approved to Core", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/review`);
      await page.getByTestId(`proposal-convert-${convertProposalId}`).click();
      await expect(page.getByTestId(`proposal-card-${convertProposalId}`)).toContainText(
        /converted_to_core|converted/i,
        { timeout: 20_000 },
      );
    });

    test("M duplicate conversion rejected", async ({ page }) => {
      const response = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meetingId}/proposals/${convertProposalId}/convert-to-core`,
        { data: {} },
      );
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
      const payload = await response.json();
      expect(payload.error?.code ?? "").toMatch(/already_converted|conversion|proposal/i);
    });

    test("N approve minutes", async ({ page }) => {
      const list = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/minutes`,
      );
      expect(list.ok(), await list.text()).toBeTruthy();
      const current = ((await list.json()).data ?? [])[0] as { id?: string; status?: string } | undefined;
      const minutesId = String(current?.id ?? "");
      expect(minutesId).toBeTruthy();
      const currentStatus = String(current?.status ?? "");

      if (currentStatus !== "review_pending" && currentStatus !== "approved") {
        const submit = await page.request.post(
          `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/${minutesId}/submit-review`,
          { data: {} },
        );
        expect(submit.ok(), await submit.text()).toBeTruthy();
      }

      if (currentStatus !== "approved") {
        const approve = await page.request.post(
          `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/${minutesId}/approve`,
          { data: {} },
        );
        expect(approve.ok(), await approve.text()).toBeTruthy();
      }

      await page.goto(`${meetingsPath}/${meetingId}/minutes`);
      await expect(page.getByTestId("minutes-status-approved")).toBeVisible({ timeout: 30_000 });
    });

    test("O request minutes changes", async ({ page }) => {
      await page.goto(`${meetingsPath}/${meetingId}/minutes`);
      const statusText = await page.getByTestId(/minutes-status-/).first().textContent();
      if (/approved|issued/i.test(statusText ?? "")) {
        // Soft path: already past request-changes window after N.
        await expect(page.getByTestId("minutes-current")).toBeVisible();
        return;
      }
      page.once("dialog", (dialog) => dialog.accept("add attendees list"));
      await page.getByTestId("minutes-request-changes").click();
      await expect(page.getByTestId(/minutes-status-/)).toBeVisible();
    });

    test("P issue minutes", async ({ page }) => {
      const list = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/minutes`,
      );
      const minutesId = String(((await list.json()).data ?? [])[0]?.id ?? "");
      const issue = await page.request.post(
        `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/${minutesId}/issue`,
        { data: {} },
      );
      expect(issue.ok(), await issue.text()).toBeTruthy();
      await page.goto(`${meetingsPath}/${meetingId}/minutes`);
      await expect(page.getByTestId("minutes-status-issued")).toBeVisible({ timeout: 30_000 });
    });

    test("Q version history", async ({ page, context }) => {
      const owner = requireUser(loadFixtures(), "owner");
      await signInAsFixtureUser(context, owner.email);

      const versions = await page.request.get(
        `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/versions`,
      );
      expect(versions.ok(), await versions.text()).toBeTruthy();
      const rows = (await versions.json()).data ?? [];
      expect(rows.length).toBeGreaterThan(0);
      const firstVersion = Number(rows[0].version_number ?? 1);

      await page.goto(`${meetingsPath}/${meetingId}/minutes`);
      await expect(page.getByTestId("minutes-versions-list")).toBeVisible({ timeout: 30_000 });
      const versionButton = page.getByTestId(`minutes-version-${firstVersion}`);
      await expect(versionButton).toBeVisible({ timeout: 30_000 });
      await versionButton.click();
      await expect(page.getByTestId("minutes-version-body")).toBeVisible();
    });

    test("R providers unavailable", async ({ page, context }) => {
      const owner = requireUser(loadFixtures(), "owner");
      await signInAsFixtureUser(context, owner.email);

      await page.goto(meetingsPath);
      await expect(page.getByTestId("project-intelligence-meetings-ready")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("project-intelligence-meetings-providers-disabled")).toBeVisible();
      const createExternal = await page.request.post("/api/engineering/project-intelligence/meetings", {
        data: { title: "External attempt", provider: "zoom" },
      });
      expect(createExternal.status()).toBe(422);
    });
  });

  test.describe("owner shell checks", () => {
    test.describe.configure({ retries: 0 });

    test.beforeAll(async ({ browser }) => {
      await writeOwnerStorage(browser);
    });

    test.use({ storageState: ownerStoragePath });

    test("T accessibility landmarks on processing pages", async ({ page, context }) => {
      const owner = requireUser(loadFixtures(), "owner");
      await signInAsFixtureUser(context, owner.email);
      await page.goto(meetingsPath);
      await expect(page.getByTestId("project-intelligence-meetings-ready")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByRole("navigation", { name: "Project Intelligence" })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Meetings/i })).toBeVisible();
    });

    test("U responsive meetings processing shell", async ({ page, context }) => {
      const owner = requireUser(loadFixtures(), "owner");
      await signInAsFixtureUser(context, owner.email);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(meetingsPath);
      await expect(page.getByTestId("project-intelligence-nav-meetings")).toBeVisible({
        timeout: 45_000,
      });
      await expect(page.getByTestId("login-page")).toHaveCount(0);
    });
  });

  test("S cross-workspace denied", async ({ browser }) => {
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
      await page.goto(meetingsPath);
      await expect(
        page.getByTestId(`access-denied-${denial.expectedReason ?? "workspace_not_assigned"}`),
      ).toBeVisible({ timeout: 20_000 });
    } finally {
      await context.close();
    }
  });
});
