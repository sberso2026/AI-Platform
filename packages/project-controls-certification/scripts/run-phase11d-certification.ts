/**
 * Phase 11D certification runner (gates A–AW) — Project Controls Change
 * Intelligence while Progress (11B) and Schedule (11C) Intelligence stay intact.
 *
 * Forbidden by construction and asserted here: no Cost Intelligence, no Cost
 * Engine, no Budget Ledger, no Financial Posting, no Forecast, no Earned Value,
 * no CPM, no float computation, no schedule execution and no contractual change
 * approval engine.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_11A_CERTIFIED_COMMIT,
  PHASE_11A_HOSTED_RUN,
  PHASE_11B_CERTIFIED_COMMIT,
  PHASE_11B_HOSTED_RUN,
  PHASE_11C_CERTIFIED_COMMIT,
  PHASE_11C_HOSTED_RUN,
  PHASE_11C_VERSION,
  PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11D_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11D_CHANGE_EVENTS,
  PHASE_11D_CHANGE_INTELLIGENCE_OWNER,
  PHASE_11D_CONTRACTUAL_CHANGE_AUTHORITY_OWNER,
  PHASE_11D_FINANCIAL_LEDGER_OWNER,
  PHASE_11D_FORBIDDEN_CAPABILITIES,
  PHASE_11D_GATE_COUNT,
  PHASE_11D_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11D_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_11D_PROJECT_CONTROLS_CHANGE_GATES,
  PHASE_11D_PROJECT_CONTROLS_CHANGE_TABLES,
  PHASE_11D_PROJECT_CONTROLS_PROGRESS_TABLES,
  PHASE_11D_PROJECT_CONTROLS_SCHEDULE_TABLES,
  PHASE_11D_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
  PHASE_11D_PROJECT_CONTROLS_VERSION,
  PHASE_11D_PROJECT_IDENTITY_OWNER,
  PHASE_11D_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_11D_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_11D_REQUIRED_CAPABILITIES,
  type Phase11dGateId,
} from "../src/phase11d/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PC = "packages/project-controls";
const SPD = "packages/engineering-shared-project-domain";
const PC_CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const INDEX = `${PC}/src/index.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const PC_PKG = `${PC}/package.json`;
const SPD_PKG = `${SPD}/package.json`;
const PC_CERT_PKG = `${PC_CERT}/package.json`;
const GATES_FILE = `${PC_CERT}/src/phase11d/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11d-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase11d-project-controls-change.test.ts";
const WORKFLOW = ".github/workflows/phase-11d-project-controls-change.yml";
const PROGRESS_TEST = `${PC}/tests/phase11b-progress-intelligence.test.ts`;
const SCHEDULE_TEST = `${PC}/tests/phase11c-schedule-intelligence.test.ts`;
const CHANGE_TEST = `${PC}/tests/phase11d-change-intelligence.test.ts`;

const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";
const DOC_PROGRESS = "docs/architecture/PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md";
const DOC_SCHEDULE = "docs/architecture/PROJECT_CONTROLS_SCHEDULE_INTELLIGENCE.md";
const DOC_CHANGE = "docs/architecture/PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md";
const DOC_CHANGE_MODEL = "docs/architecture/PROJECT_CONTROLS_CHANGE_MODEL.md";
const DOC_CHANGE_AUTHORITY = "docs/architecture/PROJECT_CONTROLS_CHANGE_AUTHORITY_BOUNDARY.md";
const DOC_CONTEXT = "docs/architecture/PROJECT_CONTROLS_PROJECT_CONTEXT_ENGINE.md";
const DOC_OWNERSHIP = "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY = "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";

const BATCH_62 = "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql";
const BATCH_63 = "supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql";
const BATCH_64 =
  "supabase/migrations/20260808040000_batch_64_project_controls_change_intelligence.sql";
const PROGRESS_ROUTE = "apps/web/src/app/api/engineering/project-controls/progress/route.ts";
const SCHEDULE_ROUTE = "apps/web/src/app/api/engineering/project-controls/schedule/route.ts";
const CHANGE_ROUTE = "apps/web/src/app/api/engineering/project-controls/change/route.ts";
const SNAPSHOT_ROUTE = "apps/web/src/app/api/engineering/project-controls/snapshot/route.ts";
const PROFILE_ROUTE = "apps/web/src/app/api/engineering/project-controls/profile/route.ts";

const CHANGE_DOMAIN_FILES = [
  `${PC}/src/domain/change.ts`,
  `${PC}/src/domain/change-confidence.ts`,
  `${PC}/src/domain/change-engine.ts`,
  `${PC}/src/domain/baseline-provider.ts`,
] as const;

const SCHEDULE_DOMAIN_FILES = [
  `${PC}/src/domain/schedule.ts`,
  `${PC}/src/domain/schedule-confidence.ts`,
  `${PC}/src/domain/schedule-engine.ts`,
] as const;

const PROGRESS_DOMAIN_FILES = [
  `${PC}/src/domain/progress.ts`,
  `${PC}/src/domain/progress-confidence.ts`,
  `${PC}/src/domain/progress-engine.ts`,
] as const;

const DOMAIN_FILES = [
  ...PROGRESS_DOMAIN_FILES,
  ...SCHEDULE_DOMAIN_FILES,
  ...CHANGE_DOMAIN_FILES,
  `${PC}/src/domain/project-context-engine.ts`,
  `${PC}/src/domain/review-workflow.ts`,
  `${PC}/src/domain/events.ts`,
  `${PC}/src/domain/persistence.ts`,
  `${PC}/src/domain/postgres-repository.ts`,
  `${PC}/src/domain/repository-factory.ts`,
  `${PC}/src/domain/role-matrix.ts`,
  `${PC}/src/domain/services.ts`,
  `${PC}/src/domain/engine.ts`,
  `${PC}/src/domain/reserved-providers.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase11dGateId; name: string; status: GateStatus; detail?: string };

function run(cmd: string) {
  try {
    execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
    return { ok: true, detail: "ok" };
  } catch (e) {
    const err = e as { stderr?: string; stdout?: string; message?: string };
    return {
      ok: false,
      detail: (err.stderr || err.stdout || err.message || "failed").toString().slice(0, 2000),
    };
  }
}
function sha() {
  return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
}
function readRepoFile(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function has(rel: string, re: RegExp) {
  try {
    return re.test(readRepoFile(rel));
  } catch {
    return false;
  }
}
function exists(rel: string) {
  return existsSync(resolve(root, rel));
}
function tag(name: string) {
  try {
    return execSync(`git rev-list -n 1 ${name}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}
function gitQuiet(cmd: string) {
  try {
    execSync(cmd, { cwd: root, stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
}
function packageText(pkgRel: string): string {
  const dir = resolve(root, pkgRel);
  if (!existsSync(dir)) return "";
  const acc: string[] = [];
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "artifacts") continue;
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|json|md|sql)$/.test(entry.name)) acc.push(readFileSync(full, "utf8"));
    }
  };
  walk(dir);
  return acc.join("\n");
}
function moduleRegistryEntry(moduleId: string): string {
  const source = (() => {
    try {
      return readRepoFile(MODULE_REGISTRY);
    } catch {
      return "";
    }
  })();
  const start = source.indexOf(`id: "${moduleId}"`);
  if (start === -1) return "";
  const end = source.indexOf("\n  {", start);
  return source.slice(start, end === -1 ? source.length : end);
}

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  jwtMatrixOk: boolean;
  detail: string;
}> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      tablesOk: false,
      rlsOk: false,
      jwtMatrixOk: false,
      detail: "missing_supabase_credentials",
    };
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const tables = [
    ...PHASE_11D_PROJECT_CONTROLS_CHANGE_TABLES,
    ...PHASE_11D_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    ...PHASE_11D_PROJECT_CONTROLS_SCHEDULE_TABLES,
    ...PHASE_11D_PROJECT_CONTROLS_PROGRESS_TABLES,
  ];
  for (const table of tables) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
  }

  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const table of [
      "project_controls_change_states",
      "project_controls_change_candidates",
      "project_controls_project_snapshots",
      "project_controls_project_timeline",
      "project_controls_schedule_assessments",
      "project_controls_progress_assessments",
    ] as const) {
      const { data } = await anonClient.from(table).select("id").limit(5);
      if (Array.isArray(data) && data.length > 0) rlsOk = false;
    }
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `pc-cert-11d-${Date.now()}@example.com`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (!createErr && created.user) {
      const client = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: signed, error: signErr } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (!signErr && signed.session?.access_token) {
        const authed = createClient(url, anon, {
          global: { headers: { Authorization: `Bearer ${signed.session.access_token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: changeRows, error: changeErr } = await authed
          .from("project_controls_change_states")
          .select("id")
          .limit(5);
        const { data: snapshotRows, error: snapshotErr } = await authed
          .from("project_controls_project_snapshots")
          .select("id")
          .limit(5);
        const { data: timelineRows, error: timelineErr } = await authed
          .from("project_controls_project_timeline")
          .select("id")
          .limit(5);
        const { data: scheduleRows, error: scheduleErr } = await authed
          .from("project_controls_schedule_assessments")
          .select("id")
          .limit(5);
        const { data: progressRows, error: progressErr } = await authed
          .from("project_controls_progress_assessments")
          .select("id")
          .limit(5);
        const empty = (rows: unknown) => Array.isArray(rows) && rows.length === 0;
        jwtMatrixOk =
          !changeErr &&
          !snapshotErr &&
          !timelineErr &&
          !scheduleErr &&
          !progressErr &&
          empty(changeRows) &&
          empty(snapshotRows) &&
          empty(timelineRows) &&
          empty(scheduleRows) &&
          empty(progressRows) &&
          has(`${PC}/src/domain/role-matrix.ts`, /change\.assess/) &&
          has(`${PC}/src/domain/review-workflow.ts`, /change_self_approval_forbidden/);
      }
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }

  return {
    tablesOk: true,
    rlsOk,
    jwtMatrixOk,
    detail: `hosted_ok;ephemeral_jwt=${jwtMatrixOk}`,
  };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const gates: GateResult[] = [];
  const push = (id: Phase11dGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11D_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_11D_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_11D_INSPECTION_INTELLIGENCE_V1_TAG);
  const pcRegistryEntry = moduleRegistryEntry("project_controls");
  const pcText = packageText(PC);
  const spdText = packageText(SPD);
  const hosted = await verifyHosted();
  const CHANGE = `${PC}/src/domain/change.ts`;
  const CHANGE_ENGINE = `${PC}/src/domain/change-engine.ts`;
  const CHANGE_CONFIDENCE = `${PC}/src/domain/change-confidence.ts`;
  const BASELINE_PROVIDER = `${PC}/src/domain/baseline-provider.ts`;
  const REVIEW = `${PC}/src/domain/review-workflow.ts`;
  const EVENTS = `${PC}/src/domain/events.ts`;
  const CONTEXT = `${PC}/src/domain/project-context-engine.ts`;
  const PERSISTENCE = `${PC}/src/domain/persistence.ts`;
  const POSTGRES = `${PC}/src/domain/postgres-repository.ts`;
  const ROLES = `${PC}/src/domain/role-matrix.ts`;
  const PROVIDERS = `${PC}/src/domain/reserved-providers.ts`;

  // ------------------------------------------------------------------ A–D
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(PC_PKG) &&
      exists(SPD_PKG) &&
      exists(PC_CERT_PKG) &&
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.4\.0-change-intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "change_intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11D"/) &&
      has(
        VERSION,
        new RegExp(`PHASE_11C_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11C_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11C_HOSTED_RUN = "${PHASE_11C_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11C_VERSION = "${PHASE_11C_VERSION.replace(/\./g, "\\.")}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11B_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11B_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11B_HOSTED_RUN = "${PHASE_11B_HOSTED_RUN}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11A_HOSTED_RUN = "${PHASE_11A_HOSTED_RUN}"`))
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push(
    "C",
    "Project Intelligence V1 integrity",
    piTag === PHASE_11D_PROJECT_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    piTag ?? "tag_missing",
  );
  push(
    "D",
    "Inspection Intelligence V1 integrity",
    iiTag === PHASE_11D_INSPECTION_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    iiTag ?? "tag_missing",
  );

  // ------------------------------------------------------------------ E–G
  push(
    "E",
    "Phase 11B progress intelligence intact",
    has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      PROGRESS_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(PROGRESS_TEST) &&
      exists(BATCH_62) &&
      PHASE_11D_PROJECT_CONTROLS_PROGRESS_TABLES.every((table) =>
        has(BATCH_62, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(`${PC}/src/domain/progress-engine.ts`, /assertNoEarnedValue/) &&
      has(PROGRESS_ROUTE, /progressIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
  );
  push(
    "F",
    "Phase 11C schedule intelligence intact",
    has(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/) &&
      SCHEDULE_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(SCHEDULE_TEST) &&
      exists(BATCH_63) &&
      PHASE_11D_PROJECT_CONTROLS_SCHEDULE_TABLES.every((table) =>
        has(BATCH_63, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /assertNoCpm/) &&
      has(SCHEDULE_ROUTE, /scheduleIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
  );
  push(
    "G",
    "Canonical project identity owned by shared project domain",
    has(
      VERSION,
      new RegExp(
        `CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11D_PROJECT_IDENTITY_OWNER}"`,
      ),
    ) &&
      has(VERSION, new RegExp(`PROJECT_IDENTITY_OWNERSHIP = "${PHASE_11D_PROJECT_IDENTITY_OWNER}"`)) &&
      has(OWNERSHIP_LOCK, /engineering_os_shared_project_domain/) &&
      has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ H–M
  push(
    "H",
    "Change domain types declared",
    CHANGE_DOMAIN_FILES.every((file) => exists(file)) &&
      has(CHANGE, /export type ChangeEvidence/) &&
      has(CHANGE, /export type ChangeConfidence/) &&
      has(CHANGE, /export type ChangeIntelligenceState/) &&
      has(CHANGE, /export type ChangeProfileContribution/) &&
      has(CHANGE, /export type ProjectTimelineEvent/) &&
      has(CHANGE, /export type ProjectSnapshot/) &&
      has(CHANGE, /export type ChangeClassification/) &&
      has(CHANGE, /"asset_interface"/)
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Change signal, candidate and reference separated from approved change",
    has(CHANGE, /export type ChangeSignal/) &&
      has(CHANGE, /export type ChangeCandidate/) &&
      has(CHANGE, /export type ChangeReference/) &&
      has(CHANGE, /isApprovedChange: false/) &&
      has(CHANGE, /ownedByProjectControls: false/) &&
      has(CHANGE, /assertCandidateIsNotApprovedChange/) &&
      has(CHANGE_ENGINE, /status: "candidate"/)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Change evidence carries provenance and no payload duplication",
    has(CHANGE, /sourceType/) &&
      has(CHANGE, /sourceRef/) &&
      has(CHANGE, /provenance/) &&
      has(CHANGE, /reviewStatus/) &&
      has(CHANGE, /observedAt/) &&
      has(CHANGE, /sourceVersion/) &&
      has(CHANGE, /derivedFromEarnedValue: false/) &&
      has(CHANGE, /mutatesCoreRisk: false/) &&
      has(CHANGE, /mutatesBudget: false/) &&
      has(CHANGE, /contractualApprovalClaimed: false/) &&
      !has(CHANGE, /evidencePayload|payloadCopy/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Change confidence engine with six sufficiency states",
    has(CHANGE, /"sufficient"/) &&
      has(CHANGE, /"limited"/) &&
      has(CHANGE, /"insufficient"/) &&
      has(CHANGE, /"conflicting"/) &&
      has(CHANGE, /"stale"/) &&
      has(CHANGE, /"revoked"/) &&
      has(CHANGE_CONFIDENCE, /createChangeConfidenceEngine|ChangeConfidenceEngine/) &&
      has(CHANGE, /isAbstainingChangeSufficiency/) &&
      has(CHANGE, /contractualCertaintyClaimed: false/) &&
      has(VERSION, /CHANGE_CONFIDENCE_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Change engine abstains without sufficient evidence",
    has(CHANGE_ENGINE, /ChangeIntelligenceEngine/) &&
      has(CHANGE_ENGINE, /abstained/) &&
      has(CHANGE_ENGINE, /insufficient_change_evidence|abstained_no_change_assessment/) &&
      has(CHANGE_ENGINE, /change_intelligence_advisory_v1/) &&
      has(VERSION, /CHANGE_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  const changeImplText = (readRepoFile(CHANGE) + "\n" + readRepoFile(CHANGE_ENGINE))
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    // Lock constant name intentionally contains QUANTUM; do not treat it as a field.
    .replace(/CHANGE_CLASSIFICATION_COST_IS_SUBJECT_NOT_QUANTUM/g, "CHANGE_CLASSIFICATION_COST_IS_SUBJECT_LOCK");
  push(
    "M",
    "Change impact contexts are advisory enums, never quantum",
    has(CHANGE, /"suspected"/) &&
      has(CHANGE, /"supported"/) &&
      has(CHANGE, /"unknown"/) &&
      has(CHANGE, /"not_applicable"/) &&
      has(CHANGE, /CHANGE_CLASSIFICATION_COST_IS_SUBJECT_NOT_QUANTUM = true/) &&
      has(CHANGE, /emptyChangeImpactContexts/) &&
      !/\b(costImpactAmount|scheduleImpactDays|delayDays|quantum)\b/i.test(changeImplText)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ N–R
  push(
    "N",
    "assertNoCostEngine guard in change engine",
    has(CHANGE_ENGINE, /export function assertNoCostEngine/) &&
      has(CHANGE_ENGINE, /costEngineImplemented: false/) &&
      has(CHANGE_ENGINE, /budgetLedgerImplemented: false/) &&
      has(CHANGE_ENGINE, /financialPostingImplemented: false/) &&
      has(CHANGE_ENGINE, /earnedValueImplemented: false/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "assertNoContractualApproval guard in change engine",
    has(CHANGE_ENGINE, /export function assertNoContractualApproval/) &&
      has(CHANGE_ENGINE, /contractualAuthority: false/) &&
      has(CHANGE_ENGINE, /changeExecutionImplemented: false/) &&
      has(CHANGE_ENGINE, /advisoryOnly: true/) &&
      has(VERSION, /CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY = false/) &&
      has(VERSION, /CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Change review workflow on the Engineering OS Workflow SDK",
    has(REVIEW, /project_controls\.change_review/) &&
      has(REVIEW, /CHANGE_REVIEW_WORKFLOW/) &&
      has(REVIEW, /EngineeringWorkflowDefinition/) &&
      has(REVIEW, /"draft"/) &&
      has(REVIEW, /"pending_review"/) &&
      has(REVIEW, /"changes_requested"/) &&
      has(REVIEW, /"approved"/) &&
      has(REVIEW, /"rejected"/) &&
      has(REVIEW, /"published"/) &&
      has(REVIEW, /@rtb\/engineering-os/) &&
      has(VERSION, /CHANGE_REVIEW_WORKFLOW_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Assessment approval is not contractual approval",
    has(REVIEW, /change_assessment_approval_is_not_contractual_approval/) &&
      has(REVIEW, /assertChangePublishable/) &&
      has(REVIEW, /assessment approval|not contractual approval/i) &&
      has(VERSION, /CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "No self-approval and no autonomous change publication",
    has(REVIEW, /change_self_approval_forbidden/) &&
      has(REVIEW, /change_publish_requires_approved_review/) &&
      has(VERSION, /AI_MAY_PUBLISH_CHANGE_FORBIDDEN = true/) &&
      has(VERSION, /AUTONOMOUS_CHANGE_PUBLICATION_ALLOWED = false/) &&
      has(ROLES, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      has(ROLES, /"change\.approve"/) &&
      has(ROLES, /"change\.publish"/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ S–W
  const eventsOk = PHASE_11D_CHANGE_EVENTS.every((event) =>
    has(EVENTS, new RegExp(event.replace(/\./g, "\\."))),
  );
  push(
    "S",
    "Change, candidate and snapshot domain events declared",
    eventsOk &&
      has(EVENTS, /engineering\.project\.progress\.updated/) &&
      has(EVENTS, /engineering\.project\.schedule\.updated/) &&
      has(EVENTS, /engineering\.project\.profile\.updated/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Change event payloads carry identifiers only",
    has(EVENTS, /changeEventPayload/) &&
      has(EVENTS, /snapshotEventPayload/) &&
      has(EVENTS, /changeCandidateEventPayload/) &&
      has(EVENTS, /Identifiers only/) &&
      has(EVENTS, /floatComputed: false/) &&
      has(EVENTS, /financialPostingPerformed: false/) &&
      has(EVENTS, /contractualApprovalClaimed: false/) &&
      !has(EVENTS, /narrative:/) &&
      !has(EVENTS, /evidencePayload/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Persistence port extended for change tables",
    has(PERSISTENCE, /changeStates/) &&
      has(PERSISTENCE, /changeEvidence/) &&
      has(PERSISTENCE, /changeReviews/) &&
      has(PERSISTENCE, /changeConfidence/) &&
      has(PERSISTENCE, /changeCandidates/) &&
      has(PERSISTENCE, /projectSnapshots/) &&
      has(PERSISTENCE, /projectTimeline/) &&
      has(PERSISTENCE, /MemoryProjectControlsRepository/) &&
      has(PERSISTENCE, /assertProductionRepositorySafe/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Postgres repository adapter for change tables",
    [
      ...PHASE_11D_PROJECT_CONTROLS_CHANGE_TABLES,
      ...PHASE_11D_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    ].every((table) => has(POSTGRES, new RegExp(table))) &&
      has(`${PC}/src/domain/repository-factory.ts`, /createProjectControlsRepository/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Production memory repository forbidden",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /production_memory_repository_forbidden/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ X–AB
  push(
    "X",
    "Role matrix with change capabilities",
    has(ROLES, /"change\.read"/) &&
      has(ROLES, /"change\.assess"/) &&
      has(ROLES, /"change\.submit_review"/) &&
      has(ROLES, /"change\.review"/) &&
      has(ROLES, /"change\.approve"/) &&
      has(ROLES, /"change\.publish"/) &&
      has(ROLES, /"change\.reject"/) &&
      has(ROLES, /"snapshot\.read"/) &&
      has(ROLES, /"snapshot\.create"/) &&
      has(ROLES, /assertNoReservedCapabilities/) &&
      !has(ROLES, /"cost\.|"earned_value\.|"cpm\.|"float\.|"forecast\.|"contingency\.|"posting\./)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "ChangeIntelligenceService and engine facade",
    DOMAIN_FILES.every((file) => exists(file)) &&
      has(`${PC}/src/domain/engine.ts`, /assessChange/) &&
      has(`${PC}/src/domain/engine.ts`, /reviewChange/) &&
      has(`${PC}/src/domain/engine.ts`, /createChangeCandidate/) &&
      has(`${PC}/src/domain/engine.ts`, /createProjectSnapshot/) &&
      has(`${PC}/src/domain/engine.ts`, /appendProjectTimeline/) &&
      has(`${PC}/src/domain/services.ts`, /ChangeIntelligenceService/) &&
      has(`${PC}/src/domain/services.ts`, /ProjectSnapshotService/) &&
      has(INDEX, /domain\/change-engine/) &&
      has(INDEX, /domain\/change-confidence/) &&
      has(INDEX, /domain\/baseline-provider/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Project Context Engine composes with change contributor active",
    has(CONTEXT, /ProjectContextEngine/) &&
      has(CONTEXT, /compose\(/) &&
      has(CONTEXT, /change_intelligence/) &&
      has(CONTEXT, /status: "active"/) &&
      has(CONTEXT, /ChangeIntelligenceState/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Three active profile contributors progress, schedule and change",
    has(CONTEXT, /ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS/) &&
      has(CONTEXT, /progress_intelligence_must_stay_active/) &&
      has(CONTEXT, /schedule_intelligence_must_be_active/) &&
      has(CONTEXT, /change_intelligence_must_be_active/) &&
      has(CONTEXT, /length !== 3/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Cost intelligence contributor stays reserved for Phase 11E",
    has(CONTEXT, /cost_intelligence/) &&
      has(CONTEXT, /status: "reserved"/) &&
      has(CONTEXT, /11E/) &&
      has(CONTEXT, /contingency_intelligence/) &&
      has(CONTEXT, /productivity_intelligence/) &&
      has(CONTEXT, /earned_value/) &&
      has(CONTEXT, /forecast/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AC–AG
  push(
    "AC",
    "Ownership lock change_controls_intelligence owns",
    has(OWNERSHIP_LOCK, /change_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /relation: "owns"/) &&
      has(OWNERSHIP_LOCK, /CHANGE_INTELLIGENCE_READY/) &&
      has(OWNERSHIP_LOCK, /project_snapshot_and_timeline/) &&
      has(
        VERSION,
        new RegExp(`CHANGE_INTELLIGENCE_OWNERSHIP = "${PHASE_11D_CHANGE_INTELLIGENCE_OWNER}"`),
      )
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Contractual change authority reserved outside Project Controls",
    has(OWNERSHIP_LOCK, /contractual_change_authority/) &&
      has(OWNERSHIP_LOCK, /relation: "forbidden"/) &&
      has(
        VERSION,
        new RegExp(
          `CONTRACTUAL_CHANGE_AUTHORITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11D_CONTRACTUAL_CHANGE_AUTHORITY_OWNER}"`,
        ),
      ) &&
      has(VERSION, /CONTRACTUAL_CHANGE_AUTHORITY_CANDIDATE_OWNERS/) &&
      has(VERSION, /engineering_core/) &&
      exists(DOC_CHANGE_AUTHORITY)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Financial ledger ownership external_finance_or_future_finance_domain",
    has(
      VERSION,
      new RegExp(
        `FINANCIAL_LEDGER_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11D_FINANCIAL_LEDGER_OWNER}"`,
      ),
    ) &&
      has(OWNERSHIP_LOCK, new RegExp(PHASE_11D_FINANCIAL_LEDGER_OWNER)) &&
      has(VERSION, /FINANCIAL_POSTING_IMPLEMENTED = false/) &&
      has(DOC_OWNERSHIP, new RegExp(PHASE_11D_FINANCIAL_LEDGER_OWNER))
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Reserved ChangeProvider contractual methods not_implemented",
    has(PROVIDERS, /ChangeProvider/) &&
      has(PROVIDERS, /approveContractualChange/) &&
      has(PROVIDERS, /executeChange/) &&
      has(PROVIDERS, /priceChange/) &&
      has(PROVIDERS, /createReservedChangeProvider/) &&
      has(PROVIDERS, /ProjectControlsNotImplementedError/) &&
      has(PROVIDERS, /not_implemented/) &&
      has(PROVIDERS, /implemented: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Reserved BaselineProvider and ContingencyProvider not_implemented",
    exists(BASELINE_PROVIDER) &&
      has(BASELINE_PROVIDER, /BaselineProvider/) &&
      has(BASELINE_PROVIDER, /not_implemented/) &&
      has(PROVIDERS, /ContingencyProvider/) &&
      has(PROVIDERS, /drawContingency/) &&
      has(PROVIDERS, /"baseline"/) &&
      has(PROVIDERS, /"contingency"/) &&
      has(VERSION, /BASELINE_PROVIDER_IMPLEMENTED = false/) &&
      has(VERSION, /CONTINGENCY_MANAGEMENT_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AH–AN
  push(
    "AH",
    "Project Controls change migration tables (batch 64)",
    exists(BATCH_64) &&
      PHASE_11D_PROJECT_CONTROLS_CHANGE_TABLES.every((table) =>
        has(BATCH_64, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      exists(BATCH_63) &&
      exists(BATCH_62)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Change tables enforce tenant and workspace RLS",
    has(BATCH_64, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_64, /tenant_id/) &&
      has(BATCH_64, /workspace_id/) &&
      has(BATCH_64, /CREATE POLICY/) &&
      has(BATCH_64, /get_user_tenant_ids|workspace_memberships|tenant/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Change tables CHECK-constrain the forbid locks",
    has(BATCH_64, /pc_change_no_earned_value/) &&
      has(BATCH_64, /pc_change_no_cpm/) &&
      has(BATCH_64, /pc_change_no_float/) &&
      has(BATCH_64, /pc_change_no_cost_engine/) &&
      has(BATCH_64, /pc_change_no_budget_mutation/) &&
      has(BATCH_64, /pc_change_no_financial_posting/) &&
      has(BATCH_64, /pc_change_no_forecasting/) &&
      has(BATCH_64, /pc_change_no_contingency_drawdown/) &&
      has(BATCH_64, /pc_change_no_change_execution/) &&
      has(BATCH_64, /pc_change_no_contractual_approval/) &&
      has(BATCH_64, /pc_change_no_contractual_authority/) &&
      has(BATCH_64, /pc_change_no_core_risk_mutation/) &&
      has(BATCH_64, /pc_change_advisory_only/) &&
      has(BATCH_64, /pc_change_no_identity_mutation/) &&
      has(BATCH_64, /pc_change_candidate_is_not_approved/) &&
      has(BATCH_64, /pc_change_review_no_self_approval/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Change tables reference engineering_projects by FK",
    has(BATCH_64, /REFERENCES engineering_projects\(id\)/) &&
      !has(BATCH_64, /CREATE TABLE IF NOT EXISTS engineering_projects/)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Project snapshot and timeline tables introduced",
    PHASE_11D_PROJECT_CONTROLS_SHARED_PROJECT_TABLES.every((table) =>
      has(BATCH_64, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
    ) &&
      has(BATCH_64, /pc_project_snapshot_immutable/) &&
      has(BATCH_64, /pc_project_snapshot_no_evidence_payloads/) &&
      has(VERSION, /PROJECT_SNAPSHOT_READY = true/) &&
      has(VERSION, /PROJECT_TIMELINE_READY = true/) &&
      has(CHANGE, /containsEvidencePayloads: false/) &&
      has(CHANGE, /immutable: true/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Outbox event types include change and snapshot events",
    PHASE_11D_CHANGE_EVENTS.every((event) =>
      has(BATCH_64, new RegExp(event.replace(/\./g, "\\."))),
    )
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "Project profile change_summary column",
    has(BATCH_64, /change_summary/) && has(POSTGRES, /change_summary/) ? "pass" : "fail",
  );

  // ------------------------------------------------------------------ AO–AS
  push(
    "AO",
    "Change HTTP route",
    exists(CHANGE_ROUTE) &&
      has(CHANGE_ROUTE, /changeIntelligenceReady:\s*true/) &&
      has(CHANGE_ROUTE, /contractualAuthority:\s*false/) &&
      has(CHANGE_ROUTE, /costEngineImplemented:\s*false/) &&
      has(CHANGE_ROUTE, /financialPostingImplemented:\s*false/) &&
      has(CHANGE_ROUTE, /earnedValueImplemented:\s*false/) &&
      has(CHANGE_ROUTE, /productionProjectControlsReady:\s*false/) &&
      has(CHANGE_ROUTE, /assess_change/) &&
      has(CHANGE_ROUTE, /create_candidate/) &&
      has(CHANGE_ROUTE, /error:\s*\{\s*code/) &&
      has(CHANGE_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Snapshot HTTP route",
    exists(SNAPSHOT_ROUTE) &&
      has(SNAPSHOT_ROUTE, /projectSnapshotReady:\s*true/) &&
      has(SNAPSHOT_ROUTE, /projectTimelineReady:\s*true/) &&
      has(SNAPSHOT_ROUTE, /contractualAuthority:\s*false/) &&
      has(SNAPSHOT_ROUTE, /create_snapshot/) &&
      has(SNAPSHOT_ROUTE, /error:\s*\{\s*code/) &&
      has(SNAPSHOT_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "Project profile HTTP route mentions changeIntelligenceReady",
    exists(PROFILE_ROUTE) &&
      has(PROFILE_ROUTE, /changeIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /progress_intelligence/) &&
      has(PROFILE_ROUTE, /schedule_intelligence/) &&
      has(PROFILE_ROUTE, /change_intelligence/) &&
      has(PROFILE_ROUTE, new RegExp(PHASE_11D_FINANCIAL_LEDGER_OWNER)) &&
      has(PROFILE_ROUTE, /error:\s*\{\s*code/) &&
      has(PROFILE_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );

  const forbidLocksOk = PHASE_11D_FORBIDDEN_CAPABILITIES.every((lock) =>
    has(VERSION, new RegExp(`${lock} = false`)),
  );
  const requiredFlagsOk = PHASE_11D_REQUIRED_CAPABILITIES.every((flag) =>
    has(VERSION, new RegExp(`${flag} = true`)),
  );
  const pcImplText = pcText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  push(
    "AR",
    "No cost engine, budget ledger or financial posting",
    forbidLocksOk &&
      has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
      has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      has(VERSION, /FINANCIAL_POSTING_IMPLEMENTED = false/) &&
      has(VERSION, /CHANGE_EXECUTION_IMPLEMENTED = false/) &&
      !/\bclass\s+\w*CostEngine\b/.test(pcText) &&
      !/\bclass\s+\w*BudgetLedger\b/.test(pcText) &&
      !/\b(postToLedger|postFinancial|debitAccount|creditAccount)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
    `forbidLocks=${forbidLocksOk};requiredFlags=${requiredFlagsOk}`,
  );
  push(
    "AS",
    "No earned value, CPM, float, forecast or schedule execution",
    has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/) &&
      has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      has(VERSION, /FORECASTING_IMPLEMENTED = false/) &&
      has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      !/\b(compute|calculate|derive)EarnedValue\b/i.test(pcImplText) &&
      !/\b(bcws|bcwp|acwp)\s*[:=(]/i.test(pcImplText) &&
      !/\b(forwardPass|backwardPass|totalFloat|criticalPath)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AT–AW
  push(
    "AT",
    "Module registry still coming_soon and not GA",
    pcRegistryEntry.length > 0 &&
      /status: "coming_soon"/.test(pcRegistryEntry) &&
      /enabled: false/.test(pcRegistryEntry) &&
      has(VERSION, /PROJECT_CONTROLS_MODULE_REGISTRY_STATUS = "coming_soon"/) &&
      has(VERSION, /PROJECT_CONTROLS_MODULE_GA = false/) &&
      has(VERSION, /PRODUCTION_PROJECT_CONTROLS_READY = false/) &&
      has(VERSION, /PROJECT_CONTROLS_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Phase 11D architecture documents",
    exists(DOC_SHARED) &&
      exists(DOC_PROGRESS) &&
      exists(DOC_SCHEDULE) &&
      exists(DOC_CHANGE) &&
      exists(DOC_CHANGE_MODEL) &&
      exists(DOC_CHANGE_AUTHORITY) &&
      exists(DOC_CONTEXT) &&
      exists(DOC_OWNERSHIP) &&
      exists(DOC_BOUNDARY) &&
      has(DOC_CHANGE_MODEL, /Change Signal/) &&
      has(DOC_CHANGE_MODEL, /Change Candidate/) &&
      has(DOC_CHANGE_MODEL, /Change Reference/) &&
      has(DOC_CHANGE_MODEL, /Change Assessment/) &&
      has(DOC_CHANGE_MODEL, /Change Impact/) &&
      has(DOC_CHANGE_MODEL, /candidate is not an approved change/i) &&
      has(DOC_CHANGE_AUTHORITY, /not own \*authority\* over change|does not approve change/i) &&
      has(DOC_CHANGE_AUTHORITY, /engineering_core/) &&
      has(DOC_CHANGE, /Change Intelligence/) &&
      has(DOC_OWNERSHIP, /change_controls_intelligence|Project Controls — change/) &&
      has(DOC_BOUNDARY, /contractual_change_authority/)
      ? "pass"
      : "fail",
  );

  const unitPc = run("pnpm --filter @rtb/project-controls test");
  const unitSpd = run("pnpm --filter @rtb/engineering-shared-project-domain test");
  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase11d-project-controls-change.test.ts",
  );
  push(
    "AV",
    "Unit tests green and secret exposure clean",
    unitPc.ok &&
      unitSpd.ok &&
      secret.ok &&
      arch.ok &&
      exists(CHANGE_TEST) &&
      exists(SECRET_SCAN_FILE) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(ARCH_TEST) &&
      exists(WORKFLOW) &&
      has(PC_CERT_PKG, /"certify:phase11d"/) &&
      has(GATES_FILE, /PHASE_11D_GATE_COUNT/) &&
      PHASE_11D_GATE_COUNT === 49 &&
      (buildIdentitySha === ciHeadSha || inCi)
      ? "pass"
      : "fail",
    `pc=${unitPc.ok};spd=${unitSpd.ok};secret=${secret.ok};arch=${arch.ok};sha=${buildIdentitySha}:${ciHeadSha}`,
  );

  const aiSurfaceUnchanged =
    aiTag === PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  const piSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11D_PROJECT_INTELLIGENCE_V1_COMMIT} HEAD -- packages/project-intelligence`,
  );
  const iiSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11D_INSPECTION_INTELLIGENCE_V1_COMMIT} HEAD -- packages/inspection-intelligence`,
  );
  const batch6163Unchanged = gitQuiet(
    `git diff --quiet ${PHASE_11C_CERTIFIED_COMMIT} HEAD -- supabase/migrations/20260808010000_batch_61_engineering_shared_project_domain.sql ${BATCH_62} ${BATCH_63}`,
  );

  const hostedOk = hosted.tablesOk && hosted.rlsOk && hosted.jwtMatrixOk;
  const priorGatesPassed = gates.every((g) => g.status === "pass");
  const phase11EReady =
    priorGatesPassed &&
    hostedOk &&
    requiredFlagsOk &&
    has(CONTEXT, /cost_intelligence/) &&
    has(PROVIDERS, /CostProvider/) &&
    has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
    has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/);
  const releaseEligible =
    phase11EReady &&
    aiSurfaceUnchanged &&
    piSurfaceUnchanged &&
    iiSurfaceUnchanged &&
    batch6163Unchanged &&
    has(PC_PKG, /"version": "0\.4\.0-change-intelligence"/) &&
    has(PC_CERT_PKG, /"version": "0\.4\.0-change-intelligence"/) &&
    has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/) &&
    has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
    !/\bclass\s+\w*Primavera|\bclass\s+\w*MsProject\b/i.test(pcText + spdText);
  push(
    "AW",
    "Change intelligence release eligibility and Phase 11E readiness",
    releaseEligible ? "pass" : "fail",
    `hosted=${hostedOk};prior=${priorGatesPassed};11E=${phase11EReady};batch6163=${batch6163Unchanged};ai=${aiSurfaceUnchanged};pi=${piSurfaceUnchanged};ii=${iiSurfaceUnchanged};${hosted.detail}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11d-project-controls-change/1",
    phase: "11D",
    title: "Project Controls Change Intelligence",
    moduleKey: "project_controls",
    version: PHASE_11D_PROJECT_CONTROLS_VERSION,
    status: "change_intelligence",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    phase11bCertifiedCommit: PHASE_11B_CERTIFIED_COMMIT,
    phase11bHostedRun: PHASE_11B_HOSTED_RUN,
    phase11cCertifiedCommit: PHASE_11C_CERTIFIED_COMMIT,
    phase11cHostedRun: PHASE_11C_HOSTED_RUN,
    phase11cVersion: PHASE_11C_VERSION,
    sharedProjectDomainReady: true,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    progressIntelligence11bIntact: true,
    scheduleIntelligenceReady: true,
    changeIntelligenceReady: true,
    changeConfidenceEngineReady: true,
    changeReviewWorkflowReady: true,
    changePersistenceReady: true,
    changeIntelligenceIsAdvisoryOnly: true,
    changeIntelligenceIsContractualAuthority: false,
    projectTimelineReady: true,
    projectSnapshotReady: true,
    productionProjectControlsReady: false,
    projectControlsImplemented: false,
    productionMemoryRepositoryAllowed: false,
    projectControlsOwnership: "project_controls",
    changeIntelligenceOwnership: PHASE_11D_CHANGE_INTELLIGENCE_OWNER,
    contractualChangeAuthorityOwnership: PHASE_11D_CONTRACTUAL_CHANGE_AUTHORITY_OWNER,
    financialLedgerOwnership: PHASE_11D_FINANCIAL_LEDGER_OWNER,
    canonicalProjectIdentityOwnership: PHASE_11D_PROJECT_IDENTITY_OWNER,
    projectIdentityOwnership: PHASE_11D_PROJECT_IDENTITY_OWNER,
    canonicalProjectIdentityClaimedByProjectControls: false,
    duplicateProjectOwnershipDetected: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    progressIntelligenceOwnership: "project_controls",
    scheduleIntelligenceOwnership: "project_controls",
    assetIntelligenceV1Tag: PHASE_11D_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_11D_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Intact: piTag === PHASE_11D_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_11D_INSPECTION_INTELLIGENCE_V1_COMMIT,
    batch61To63Unchanged: batch6163Unchanged,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    floatComputationImplemented: false,
    costEngineImplemented: false,
    budgetLedgerImplemented: false,
    financialPostingImplemented: false,
    scheduleExecutionImplemented: false,
    changeExecutionImplemented: false,
    forecastingImplemented: false,
    resourceLevelingImplemented: false,
    contingencyManagementImplemented: false,
    baselineProviderImplemented: false,
    autonomousChangePublicationAllowed: false,
    contractualChangeApprovalByAiAllowed: false,
    aiMayPublishChangeForbidden: true,
    moduleRegistryStatus: "coming_soon",
    entitlementsAreEntitlementOnly: true,
    secretExposureDetected: !secret.ok,
    hostedTablesOk: hosted.tablesOk,
    hostedRlsOk: hosted.rlsOk,
    hostedJwtMatrixOk: hosted.jwtMatrixOk,
    hostedDetail: hosted.detail,
    changeTables: [...PHASE_11D_PROJECT_CONTROLS_CHANGE_TABLES],
    sharedProjectTables: [...PHASE_11D_PROJECT_CONTROLS_SHARED_PROJECT_TABLES],
    scheduleTables: [...PHASE_11D_PROJECT_CONTROLS_SCHEDULE_TABLES],
    progressTables: [...PHASE_11D_PROJECT_CONTROLS_PROGRESS_TABLES],
    changeEvents: [...PHASE_11D_CHANGE_EVENTS],
    phase11EReady: pass && phase11EReady,
    releaseEligible: pass && releaseEligible,
    gates,
    requiredGates: PHASE_11D_PROJECT_CONTROLS_CHANGE_GATES.map(([id]) => id),
    gateCount: PHASE_11D_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11d-project-controls-change-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify({ verdict: artifact.verdict, outPath, failed: artifact.failedGates }, null, 2),
  );
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
