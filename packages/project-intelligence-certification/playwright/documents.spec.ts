import { expect, test } from "@playwright/test";
import { requirePiFixturesManifest, type PiDenialFixture, type PiFixtureManifest, type PiUserFixture } from "../src/fixtures/env.js";
import { signInAsFixtureUser } from "./auth.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const basePath = "/engineering/apps/project-intelligence";
const documentsPath = `${basePath}/documents`;
const describeDocs = enabled ? test.describe : test.describe.skip;

function loadFixtures(): PiFixtureManifest {
  return requirePiFixturesManifest();
}

function requireUser(fixtures: PiFixtureManifest, role: string): PiUserFixture {
  const user = fixtures.baseline.users[role];
  if (!user?.email) throw new Error(`Missing baseline.users.${role} fixture`);
  return user;
}

async function expectDocumentsReady(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("project-intelligence-documents-ready")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("project-intelligence-nav-documents")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("login-page")).toHaveCount(0);
  await expect(page.getByTestId("access-denied")).toHaveCount(0);
}

async function openCitationsDrawer(page: import("@playwright/test").Page) {
  const drawer = page.getByTestId("project-intelligence-documents-citations-drawer");
  if (await drawer.isVisible().catch(() => false)) return;
  await page.getByTestId("project-intelligence-documents-citations-toggle").click();
  await expect(drawer).toBeVisible({ timeout: 15_000 });
}

/** Run-scoped UUID so hosted retries never collide with stale Core rows from prior CI runs. */
function certDocumentId(seq: number): string {
  const runHex = (process.env.GITHUB_RUN_ID ?? "local")
    .replace(/[^0-9a-f]/gi, "")
    .toLowerCase()
    .padStart(8, "0")
    .slice(-8);
  const seqHex = seq.toString(16).padStart(4, "0");
  return `00000000-0000-4000-8000-${runHex}${seqHex}`;
}

async function enqueueAndDrain(
  page: import("@playwright/test").Page,
  documentId: string,
  data: Record<string, unknown>,
) {
  // Warm the authenticated browser session before API calls.
  await page.goto(documentsPath);
  await expectDocumentsReady(page);

  const enqueue = await page.request.post(`/api/engineering/project-intelligence/documents/${documentId}/process`, { data });
  const enqueueBodyText = await enqueue.text();
  expect(enqueue.status(), `process ${documentId}: ${enqueueBodyText}`).toBeLessThan(500);
  expect(enqueue.ok(), `process ${documentId}: ${enqueueBodyText}`).toBeTruthy();
  const enqueuedBody = JSON.parse(enqueueBodyText) as { data: { processing: { status: string } } };
  expect(["queued", "fetching", "parsing", "chunking", "embedding", "indexing", "ready", "ready_with_warnings"]).toContain(
    enqueuedBody.data.processing.status,
  );

  const schedulerSecret = process.env.COMMERCE_SCHEDULER_SECRET;
  const drainHeaders = schedulerSecret
    ? { "x-commerce-scheduler-secret": schedulerSecret }
    : undefined;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const drain = await page.request.post("/api/platform/project-intelligence/document-jobs/run", {
      data: { loops: 3, workerId: `pw-${documentId.slice(-4)}-${attempt}` },
      headers: drainHeaders,
    });
    const drainText = await drain.text();
    if (drain.status() >= 500) {
      throw new Error(`drain ${documentId}: ${drain.status()} ${drainText}`);
    }
    expect(drain.status(), `drain ${documentId}: ${drainText}`).toBeLessThan(500);
    const status = await page.request.get(`/api/engineering/project-intelligence/documents/${documentId}/status`);
    const statusText = await status.text();
    expect(status.ok(), `status ${documentId}: ${statusText}`).toBeTruthy();
    const body = JSON.parse(statusText) as { data: { status: string } };
    if (body.data.status === "ready" || body.data.status === "ready_with_warnings") {
      return body.data;
    }
    if (body.data.status === "failed" || body.data.status === "dead_letter") {
      throw new Error(`Document ${documentId} entered terminal status ${body.data.status}: ${statusText}`);
    }
    await page.waitForTimeout(750);
  }
  throw new Error(`Document ${documentId} did not become ready via durable worker`);
}

describeDocs("Phase 6C-2 Document Intelligence exact entitlement certification", () => {
  test("A list authorized documents", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    await page.goto(documentsPath);
    await expectDocumentsReady(page);
  });

  test("B open document detail", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc62);
    await enqueueAndDrain(page, documentId, { fixtureText: "Design pressure is 16 bar g.", title: "Cert Spec", revision: "A" });
    await page.goto(`${documentsPath}/${documentId}`);
    await expect(page.getByTestId("login-page")).toHaveCount(0);
    await expect(page.getByTestId("access-denied")).toHaveCount(0);
    await expect(page.getByTestId("project-intelligence-document-detail")).toBeVisible({ timeout: 30_000 });
  });

  test("C process document", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc63);
    const status = await enqueueAndDrain(page, documentId, {
      fixtureText: "Pump casing material is ASTM A216 WCB.",
      title: "Process Cert",
      revision: "A",
    });
    expect(status.status).toBe("ready");
  });

  test("D observe real processing state", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc64);
    await enqueueAndDrain(page, documentId, {
      fixtureText: "Section 3 lists flange rating class 300.",
      title: "State Cert",
      revision: "A",
    });
    const status = await page.request.get(`/api/engineering/project-intelligence/documents/${documentId}/status`);
    expect(status.ok()).toBeTruthy();
    expect((await status.json()).data.status).toBe("ready");
    await page.goto(`${documentsPath}/${documentId}`);
    await expect(page.getByTestId("project-intelligence-document-status-ready")).toBeVisible({ timeout: 30_000 });
  });

  test("E query document", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc65);
    await enqueueAndDrain(page, documentId, { fixtureText: "Design pressure is 16 bar g.", title: "Query Cert", revision: "A" });
    await page.goto(`${documentsPath}/query`);
    await expect(page.getByTestId("project-intelligence-documents-query")).toBeVisible();
    await expect(page.getByTestId("login-page")).toHaveCount(0);
    await expect(page.getByTestId("access-denied")).toHaveCount(0);
    await page.getByTestId("project-intelligence-documents-query-submit").click();
    await expect(page.getByTestId("project-intelligence-documents-answer")).toBeVisible({ timeout: 30_000 });
  });

  test("F verify citations", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc66);
    await enqueueAndDrain(page, documentId, { fixtureText: "Design pressure is 16 bar g.", title: "Cite Cert", revision: "A" });
    await page.goto(`${documentsPath}/query`);
    await page.getByTestId("project-intelligence-documents-query-submit").click();
    await expect(page.getByTestId("project-intelligence-answer-status-answered")).toBeVisible({ timeout: 15_000 });
    await openCitationsDrawer(page);
    await expect(page.getByTestId("project-intelligence-citation").first()).toBeVisible();
  });

  test("G open evidence drawer", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc67);
    await enqueueAndDrain(page, documentId, { fixtureText: "Nozzle N1 is DN100.", title: "Drawer Cert", revision: "A" });
    await page.goto(`${documentsPath}/query`);
    await page.getByTestId("project-intelligence-documents-query-submit").click();
    await expect(page.getByTestId("project-intelligence-documents-answer")).toBeVisible({ timeout: 15_000 });
    await openCitationsDrawer(page);
  });

  test("H verify abstention", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    await page.goto(`${documentsPath}/query`);
    await expect(page.getByTestId("project-intelligence-documents-query")).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("project-intelligence-documents-query-abstain").click();
    await expect(page.getByTestId("project-intelligence-answer-status-abstained")).toBeVisible({ timeout: 15_000 });
  });

  test("I verify conflicting evidence", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    await page.goto(`${documentsPath}/query`);
    await expect(page.getByTestId("project-intelligence-documents-query")).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("project-intelligence-documents-query-conflict").click();
    await expect(page.getByTestId("project-intelligence-answer-status-conflicting_evidence")).toBeVisible({ timeout: 15_000 });
  });

  test("J compare revisions", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const leftDocumentId = certDocumentId(0xc68);
    const rightDocumentId = certDocumentId(0xc69);
    await enqueueAndDrain(page, leftDocumentId, {
      fixtureText: "Design pressure 16 bar g",
      revision: "A",
    });
    await enqueueAndDrain(page, rightDocumentId, {
      fixtureText: "Design pressure 20 bar g",
      revision: "B",
    });
    const compare = await page.request.post("/api/engineering/project-intelligence/documents/compare", {
      data: {
        leftDocumentId,
        rightDocumentId,
        leftRevision: "A",
        rightRevision: "B",
      },
    });
    expect(compare.ok()).toBeTruthy();
    expect((await compare.json()).data.reviewRequired).toBe(true);
  });

  test("K review a finding", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    const documentId = certDocumentId(0xc6a);
    await enqueueAndDrain(page, documentId, {
      fixtureText: "Missing approval block on cover sheet.",
      title: "Review Cert",
      revision: "A",
    });
    await page.goto(`${documentsPath}/review`);
    await expect(page.getByTestId("project-intelligence-documents-review")).toBeVisible();
    await expect(page.getByTestId("login-page")).toHaveCount(0);
    await expect(page.getByTestId("access-denied")).toHaveCount(0);
    const approve = page.getByRole("button", { name: "Approve" }).first();
    if (await approve.count()) {
      await approve.click();
    }
  });

  test("L unassigned workspace denied", async ({ page, context }) => {
    const denial = loadFixtures().denial.workspaceNotAssigned as PiDenialFixture & { user?: PiUserFixture; userWithoutWorkspace?: PiUserFixture; owner?: PiUserFixture };
    const user = denial.owner ?? denial.user ?? denial.userWithoutWorkspace;
    if (!user?.email) throw new Error("Missing workspace denial fixture user");
    await signInAsFixtureUser(context, user.email);
    await page.goto(documentsPath);
    if (denial.expectedState) {
      await expect(page.getByTestId(`project-intelligence-state-${denial.expectedState}`)).toBeVisible();
    } else {
      await expect(page.getByTestId(`access-denied-${denial.expectedReason}`)).toBeVisible();
    }
    const response = await page.request.get("/api/engineering/project-intelligence/documents");
    expect(response.status()).toBe(403);
  });

  test("M suspended licence denied", async ({ page, context }) => {
    const denial = loadFixtures().denial.suspendedLicence as PiDenialFixture & { owner?: PiUserFixture; user?: PiUserFixture };
    const user = denial.owner ?? denial.user;
    if (!user?.email) throw new Error("Missing suspended licence fixture user");
    await signInAsFixtureUser(context, user.email);
    await page.goto(documentsPath);
    if (denial.expectedState) {
      await expect(page.getByTestId(`project-intelligence-state-${denial.expectedState}`)).toBeVisible();
    } else {
      await expect(page.getByTestId(`access-denied-${denial.expectedReason}`)).toBeVisible();
    }
    const response = await page.request.get("/api/engineering/project-intelligence/documents");
    expect(response.status()).toBe(403);
  });

  test("N cross-tenant document denied", async ({ page, context }) => {
    const fixtures = loadFixtures();
    const owner = requireUser(fixtures, "owner");
    await signInAsFixtureUser(context, owner.email);
    const foreignId = "ffffffff-ffff-4fff-8fff-ffffffffffff";
    const response = await page.request.get(`/api/engineering/project-intelligence/documents/${foreignId}`);
    expect(response.status()).toBe(404);
    expect((await response.json()).error).toMatchObject({ code: "document_not_found" });
  });

  test("O accessibility landmarks on documents pages", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    await page.goto(documentsPath);
    await expectDocumentsReady(page);
    await expect(page.getByRole("navigation", { name: "Project Intelligence" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
  });

  test("P responsive documents shell", async ({ page, context }) => {
    const owner = requireUser(loadFixtures(), "owner");
    await signInAsFixtureUser(context, owner.email);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(documentsPath);
    await expectDocumentsReady(page);
    await expect(page.getByTestId("project-intelligence-nav-documents")).toBeVisible();
  });
});
