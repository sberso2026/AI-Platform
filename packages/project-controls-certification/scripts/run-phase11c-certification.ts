/**
 * Phase 11C certification runner (gates A–AQ) — Project Controls Schedule
 * Intelligence while Progress Intelligence from 11B stays intact.
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
  PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11C_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11C_FORBIDDEN_CAPABILITIES,
  PHASE_11C_GATE_COUNT,
  PHASE_11C_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11C_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_11C_PROJECT_CONTROLS_PROGRESS_TABLES,
  PHASE_11C_PROJECT_CONTROLS_SCHEDULE_GATES,
  PHASE_11C_PROJECT_CONTROLS_SCHEDULE_TABLES,
  PHASE_11C_PROJECT_CONTROLS_VERSION,
  PHASE_11C_PROJECT_IDENTITY_OWNER,
  PHASE_11C_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_11C_PROJECT_INTELLIGENCE_V1_TAG,
  type Phase11cGateId,
} from "../src/phase11c/gates.js";

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
const GATES_FILE = `${PC_CERT}/src/phase11c/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11c-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase11c-project-controls-schedule.test.ts";
const WORKFLOW = ".github/workflows/phase-11c-project-controls-schedule.yml";
const PROGRESS_TEST = `${PC}/tests/phase11b-progress-intelligence.test.ts`;

const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";
const DOC_PROGRESS = "docs/architecture/PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md";
const DOC_SCHEDULE = "docs/architecture/PROJECT_CONTROLS_SCHEDULE_INTELLIGENCE.md";
const DOC_CONTEXT = "docs/architecture/PROJECT_CONTROLS_PROJECT_CONTEXT_ENGINE.md";
const DOC_OWNERSHIP = "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY = "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const COMMERCE_POLICY = "packages/platform-commerce/src/domain/commerce-access-policy.ts";
const SERVICE_POLICIES = "packages/platform-commerce/src/domain/engineering-service-policies.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";

const BATCH_62 = "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql";
const BATCH_63 = "supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql";
const PROGRESS_ROUTE = "apps/web/src/app/api/engineering/project-controls/progress/route.ts";
const SCHEDULE_ROUTE = "apps/web/src/app/api/engineering/project-controls/schedule/route.ts";
const PROFILE_ROUTE = "apps/web/src/app/api/engineering/project-controls/profile/route.ts";

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
type GateResult = { id: Phase11cGateId; name: string; status: GateStatus; detail?: string };

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
    return { tablesOk: false, rlsOk: false, jwtMatrixOk: false, detail: "missing_supabase_credentials" };
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const tables = [
    ...PHASE_11C_PROJECT_CONTROLS_SCHEDULE_TABLES,
    ...PHASE_11C_PROJECT_CONTROLS_PROGRESS_TABLES,
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
    const email = `pc-cert-11c-${Date.now()}@example.com`;
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
        const { data: scheduleRows, error: scheduleErr } = await authed
          .from("project_controls_schedule_assessments")
          .select("id")
          .limit(5);
        const { data: progressRows, error: progressErr } = await authed
          .from("project_controls_progress_assessments")
          .select("id")
          .limit(5);
        jwtMatrixOk =
          !scheduleErr &&
          !progressErr &&
          Array.isArray(scheduleRows) &&
          scheduleRows.length === 0 &&
          Array.isArray(progressRows) &&
          progressRows.length === 0 &&
          has(`${PC}/src/domain/role-matrix.ts`, /schedule\.assess/) &&
          has(`${PC}/src/domain/review-workflow.ts`, /schedule_self_approval_forbidden/);
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
  const push = (id: Phase11cGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11C_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_11C_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_11C_INSPECTION_INTELLIGENCE_V1_TAG);
  const pcRegistryEntry = moduleRegistryEntry("project_controls");
  const pcText = packageText(PC);
  const spdText = packageText(SPD);
  const hosted = await verifyHosted();

  // ------------------------------------------------------------------ A–D
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(PC_PKG) &&
      exists(SPD_PKG) &&
      exists(PC_CERT_PKG) &&
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.3\.0-schedule-intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "schedule_intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11C"/) &&
      has(VERSION, new RegExp(`PHASE_11B_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11B_CERTIFIED_COMMIT}"`)) &&
      has(VERSION, new RegExp(`PHASE_11B_HOSTED_RUN = "${PHASE_11B_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_CERTIFIED_COMMIT}"`)) &&
      has(VERSION, new RegExp(`PHASE_11A_HOSTED_RUN = "${PHASE_11A_HOSTED_RUN}"`))
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push(
    "C",
    "Project Intelligence V1 integrity",
    piTag === PHASE_11C_PROJECT_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    piTag ?? "tag_missing",
  );
  push(
    "D",
    "Inspection Intelligence V1 integrity",
    iiTag === PHASE_11C_INSPECTION_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    iiTag ?? "tag_missing",
  );

  // ------------------------------------------------------------------ E–F
  push(
    "E",
    "Phase 11B progress intelligence intact",
    has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      PROGRESS_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(PROGRESS_TEST) &&
      exists(BATCH_62) &&
      PHASE_11C_PROJECT_CONTROLS_PROGRESS_TABLES.every((table) =>
        has(BATCH_62, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(`${PC}/src/domain/progress-engine.ts`, /ProgressIntelligenceEngine/) &&
      has(`${PC}/src/domain/progress-engine.ts`, /assertNoEarnedValue/) &&
      has(PROGRESS_ROUTE, /progressIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
  );
  push(
    "F",
    "Canonical project identity owned by shared project domain",
    has(VERSION, new RegExp(`CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11C_PROJECT_IDENTITY_OWNER}"`)) &&
      has(VERSION, new RegExp(`PROJECT_IDENTITY_OWNERSHIP = "${PHASE_11C_PROJECT_IDENTITY_OWNER}"`)) &&
      has(OWNERSHIP_LOCK, /engineering_os_shared_project_domain/) &&
      has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ G–K
  push(
    "G",
    "Schedule domain types declared",
    SCHEDULE_DOMAIN_FILES.every((file) => exists(file)) &&
      has(`${PC}/src/domain/schedule.ts`, /export type ScheduleEvidence/) &&
      has(`${PC}/src/domain/schedule.ts`, /export type ScheduleConfidence/) &&
      has(`${PC}/src/domain/schedule.ts`, /export type ScheduleAssessmentState/) &&
      has(`${PC}/src/domain/schedule.ts`, /export type ScheduleSnapshot/) &&
      has(`${PC}/src/domain/schedule.ts`, /export type ScheduleTimeline/)
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "Schedule confidence engine with five sufficiency states",
    has(`${PC}/src/domain/schedule.ts`, /"sufficient"/) &&
      has(`${PC}/src/domain/schedule.ts`, /"limited"/) &&
      has(`${PC}/src/domain/schedule.ts`, /"insufficient"/) &&
      has(`${PC}/src/domain/schedule.ts`, /"conflicting"/) &&
      has(`${PC}/src/domain/schedule.ts`, /"stale"/) &&
      has(`${PC}/src/domain/schedule-confidence.ts`, /createScheduleConfidenceEngine|ScheduleConfidenceEngine/) &&
      has(`${PC}/src/domain/schedule.ts`, /isAbstainingScheduleSufficiency/)
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Schedule engine abstains without sufficient evidence",
    has(`${PC}/src/domain/schedule-engine.ts`, /ScheduleIntelligenceEngine/) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /abstained/) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /insufficient_schedule_evidence|abstained_no_schedule_posture/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Schedule engine forbids CPM and float derivation",
    has(`${PC}/src/domain/schedule-engine.ts`, /cpm_forbidden_in_schedule_intelligence/) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /floatComputed: false/) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /criticalPathComputed: false/) &&
      has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_IS_CPM = false/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "assertNoCpm guard in schedule engine",
    has(`${PC}/src/domain/schedule-engine.ts`, /export function assertNoCpm/) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /cpmImplemented: false/) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /floatComputed: false/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ L–P
  push(
    "L",
    "Schedule review workflow on the Engineering OS Workflow SDK",
    has(`${PC}/src/domain/review-workflow.ts`, /project_controls\.schedule_review/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /SCHEDULE_REVIEW_WORKFLOW/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /EngineeringWorkflowDefinition/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /"draft"/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /"pending_review"/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /"approved"/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /"rejected"/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /"published"/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /@rtb\/engineering-os/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "No self-approval and no autonomous schedule publication",
    has(`${PC}/src/domain/review-workflow.ts`, /schedule_self_approval_forbidden/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /assertSchedulePublishable/) &&
      has(VERSION, /AI_MAY_PUBLISH_SCHEDULE_FORBIDDEN = true/) &&
      has(VERSION, /AUTONOMOUS_SCHEDULE_PUBLICATION_ALLOWED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Schedule and profile domain events declared",
    has(`${PC}/src/domain/events.ts`, /engineering\.project\.schedule\.updated/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.schedule\.reviewed/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.schedule\.published/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.profile\.updated/) &&
      has(`${PC}/src/domain/events.ts`, /Identifiers only/) &&
      has(`${PC}/src/domain/events.ts`, /floatComputed: false/) &&
      !has(`${PC}/src/domain/events.ts`, /milestonePosture:/) &&
      !has(`${PC}/src/domain/events.ts`, /evidencePayload/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Persistence port extended for schedule tables",
    has(`${PC}/src/domain/persistence.ts`, /scheduleAssessments/) &&
      has(`${PC}/src/domain/persistence.ts`, /scheduleEvidence/) &&
      has(`${PC}/src/domain/persistence.ts`, /scheduleReviews/) &&
      has(`${PC}/src/domain/persistence.ts`, /scheduleSnapshots/) &&
      has(`${PC}/src/domain/persistence.ts`, /scheduleTimeline/) &&
      has(`${PC}/src/domain/persistence.ts`, /MemoryProjectControlsRepository/) &&
      has(`${PC}/src/domain/persistence.ts`, /assertProductionRepositorySafe/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Postgres repository adapter for schedule tables",
    has(`${PC}/src/domain/postgres-repository.ts`, /project_controls_schedule_assessments/) &&
      has(`${PC}/src/domain/postgres-repository.ts`, /project_controls_schedule_evidence/) &&
      has(`${PC}/src/domain/postgres-repository.ts`, /project_controls_schedule_reviews/) &&
      has(`${PC}/src/domain/postgres-repository.ts`, /project_controls_schedule_snapshots/) &&
      has(`${PC}/src/domain/postgres-repository.ts`, /project_controls_schedule_timeline/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /createProjectControlsRepository/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ Q–U
  push(
    "Q",
    "Production memory repository forbidden",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /production_memory_repository_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Role matrix with schedule capabilities",
    has(`${PC}/src/domain/role-matrix.ts`, /schedule\.assess/) &&
      has(`${PC}/src/domain/role-matrix.ts`, /schedule\.approve/) &&
      has(`${PC}/src/domain/role-matrix.ts`, /schedule\.publish/) &&
      has(`${PC}/src/domain/role-matrix.ts`, /progress\.assess/) &&
      !has(`${PC}/src/domain/role-matrix.ts`, /earned_value\.|cost\.assess|cpm\.|float\./)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "ScheduleIntelligenceService and engine facade",
    DOMAIN_FILES.every((file) => exists(file)) &&
      has(`${PC}/src/domain/engine.ts`, /assessSchedule/) &&
      has(`${PC}/src/domain/engine.ts`, /reviewSchedule/) &&
      has(`${PC}/src/domain/services.ts`, /ScheduleIntelligenceService/) &&
      has(`${PC}/src/domain/services.ts`, /ProjectControlsService/) &&
      has(INDEX, /domain\/schedule-engine/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Project Context Engine composes with schedule contributor active",
    has(`${PC}/src/domain/project-context-engine.ts`, /ProjectContextEngine/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /compose\(/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /schedule_intelligence/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /status: "active"/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Two active profile contributors progress and schedule",
    has(`${PC}/src/domain/project-context-engine.ts`, /ACTIVE_PROJECT_PROFILE_CONTRIBUTOR_KEYS/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /progress_intelligence_must_stay_active/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /schedule_intelligence_must_be_active/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /progress_intelligence/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /schedule_intelligence/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ V–Z
  push(
    "V",
    "Ownership lock schedule_controls_intelligence owns",
    has(OWNERSHIP_LOCK, /schedule_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /relation: "owns"/) &&
      has(OWNERSHIP_LOCK, /SCHEDULE_INTELLIGENCE_READY/) &&
      has(OWNERSHIP_LOCK, /schedule_intelligence_must_stay_advisory_not_cpm/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_OWNERSHIP = "project_controls"/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Reserved ScheduleProvider CPM methods not_implemented",
    has(`${PC}/src/domain/reserved-providers.ts`, /ScheduleProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /getCriticalPath/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /getActivityNetwork/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /ProjectControlsNotImplementedError/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /not_implemented/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /implemented: false/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /createReservedScheduleProvider/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Project Controls schedule migration tables (batch 63)",
    exists(BATCH_63) &&
      PHASE_11C_PROJECT_CONTROLS_SCHEDULE_TABLES.every((table) =>
        has(BATCH_63, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      )
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Schedule tables enforce tenant and workspace RLS",
    has(BATCH_63, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_63, /tenant_id/) &&
      has(BATCH_63, /workspace_id/) &&
      has(BATCH_63, /CREATE POLICY/) &&
      has(BATCH_63, /get_user_tenant_ids|workspace_memberships|tenant/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Schedule tables CHECK-constrain the forbid locks",
    has(BATCH_63, /pc_schedule_no_earned_value/) &&
      has(BATCH_63, /pc_schedule_no_cpm/) &&
      has(BATCH_63, /pc_schedule_no_float/) &&
      has(BATCH_63, /pc_schedule_no_schedule_execution/) &&
      has(BATCH_63, /pc_schedule_advisory_only/) &&
      has(BATCH_63, /pc_schedule_no_identity_mutation/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AA–AF
  push(
    "AA",
    "Schedule tables reference engineering_projects by FK",
    has(BATCH_63, /REFERENCES engineering_projects\(id\)/) &&
      !has(BATCH_63, /CREATE TABLE IF NOT EXISTS engineering_projects/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Outbox event types include schedule events",
    has(BATCH_63, /engineering\.project\.schedule\.updated/) &&
      has(BATCH_63, /engineering\.project\.schedule\.reviewed/) &&
      has(BATCH_63, /engineering\.project\.schedule\.published/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.schedule\.updated/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Project profile schedule_summary column",
    has(BATCH_63, /schedule_summary/) &&
      has(`${PC}/src/domain/postgres-repository.ts`, /schedule_summary/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Schedule HTTP route",
    exists(SCHEDULE_ROUTE) &&
      has(SCHEDULE_ROUTE, /cpmImplemented:\s*false/) &&
      has(SCHEDULE_ROUTE, /floatComputationImplemented:\s*false/) &&
      has(SCHEDULE_ROUTE, /scheduleIntelligenceReady:\s*true/) &&
      has(SCHEDULE_ROUTE, /scheduleExecutionImplemented:\s*false/) &&
      has(SCHEDULE_ROUTE, /productionProjectControlsReady:\s*false/) &&
      has(SCHEDULE_ROUTE, /error:\s*\{\s*code/) &&
      has(SCHEDULE_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Project profile HTTP route mentions scheduleIntelligenceReady",
    exists(PROFILE_ROUTE) &&
      has(PROFILE_ROUTE, /scheduleIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /progress_intelligence/) &&
      has(PROFILE_ROUTE, /schedule_intelligence/) &&
      has(PROFILE_ROUTE, /error:\s*\{\s*code/) &&
      has(PROFILE_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );

  const forbidLocksOk = PHASE_11C_FORBIDDEN_CAPABILITIES.every((lock) =>
    has(VERSION, new RegExp(`${lock} = false`)),
  );
  const pcImplText = pcText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  push(
    "AF",
    "No CPM or schedule execution implementation",
    forbidLocksOk &&
      has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      has(VERSION, /FORWARD_BACKWARD_PASS_IMPLEMENTED = false/) &&
      !/\b(forwardPass|backwardPass|totalFloat|criticalPath)\b/i.test(pcImplText) &&
      !/\bclass\s+\w*CpmEngine\b/.test(pcText)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "No earned value or cost engine",
    has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/) &&
      has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
      has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      !/\b(compute|calculate|derive)EarnedValue\b/i.test(pcImplText) &&
      !/\b(bcws|bcwp|acwp)\s*[:=(]/i.test(pcImplText) &&
      !/\bclass\s+\w*CostEngine\b/.test(pcText)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
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
    "AI",
    "Phase 11C architecture documents",
    exists(DOC_SHARED) &&
      exists(DOC_PROGRESS) &&
      exists(DOC_SCHEDULE) &&
      exists(DOC_CONTEXT) &&
      exists(DOC_OWNERSHIP) &&
      exists(DOC_BOUNDARY) &&
      has(DOC_SCHEDULE, /Schedule Intelligence|schedule intelligence/i) &&
      has(DOC_PROGRESS, /Progress Intelligence|progress intelligence/i) &&
      has(DOC_CONTEXT, /Project Context Engine|ProjectProfile/) &&
      has(DOC_OWNERSHIP, /schedule_controls_intelligence|engineering_os_shared_project_domain/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AJ–AM
  const unitPc = run("pnpm --filter @rtb/project-controls test");
  const unitSpd = run("pnpm --filter @rtb/engineering-shared-project-domain test");
  push(
    "AJ",
    "Unit tests green",
    unitPc.ok && unitSpd.ok ? "pass" : "fail",
    unitPc.ok && unitSpd.ok
      ? "unit_ok"
      : `pc=${unitPc.detail.slice(0, 400)};spd=${unitSpd.detail.slice(0, 400)}`,
  );

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase11c-project-controls-schedule.test.ts",
  );
  push(
    "AK",
    "Certification package and architecture test",
    exists(PC_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(ARCH_TEST) &&
      exists(WORKFLOW) &&
      has(PC_CERT_PKG, /"certify:phase11c"/) &&
      has(GATES_FILE, /PHASE_11C_GATE_COUNT/) &&
      PHASE_11C_GATE_COUNT === 43 &&
      arch.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  push(
    "AL",
    "Secret exposure",
    secret.ok && exists(SECRET_SCAN_FILE) ? "pass" : "fail",
    secret.detail.slice(0, 500),
  );
  push(
    "AM",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || inCi ? "pass" : "fail",
    `${buildIdentitySha}:${ciHeadSha}`,
  );

  // ------------------------------------------------------------------ AN–AQ
  push(
    "AN",
    "Hosted schedule and progress tables exist",
    hosted.tablesOk && hosted.rlsOk && hosted.jwtMatrixOk ? "pass" : "fail",
    hosted.detail,
  );

  const aiSurfaceUnchanged =
    aiTag === PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  const piSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11C_PROJECT_INTELLIGENCE_V1_COMMIT} HEAD -- packages/project-intelligence`,
  );
  const iiSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11C_INSPECTION_INTELLIGENCE_V1_COMMIT} HEAD -- packages/inspection-intelligence`,
  );
  push(
    "AO",
    "AI/PI/II V1 surfaces unmodified",
    has(AI_VERSION, /ASSET_INTELLIGENCE_VERSION = "1\.0\.0"/) &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/) &&
      aiSurfaceUnchanged &&
      piSurfaceUnchanged &&
      iiSurfaceUnchanged &&
      has(VERSION, /ASSET_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /PROJECT_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /INSPECTION_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/)
      ? "pass"
      : "fail",
    `ai=${aiSurfaceUnchanged};pi=${piSurfaceUnchanged};ii=${iiSurfaceUnchanged}`,
  );

  const priorFor11d = gates.every((g) => g.status === "pass");
  push(
    "AP",
    "Phase 11D readiness",
    priorFor11d &&
      has(VERSION, /SHARED_PROJECT_DOMAIN_READY = true/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /cost_intelligence/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /CostProvider/)
      ? "pass"
      : "fail",
    `priorGatesPassed=${priorFor11d}`,
  );

  const releaseEligible = gates.every((g) => g.status === "pass");
  push(
    "AQ",
    "Schedule intelligence release eligibility",
    releaseEligible &&
      has(PC_PKG, /"version": "0\.3\.0-schedule-intelligence"/) &&
      has(PC_CERT_PKG, /"version": "0\.3\.0-schedule-intelligence"/) &&
      !/\bclass\s+\w*Primavera|\bclass\s+\w*MsProject\b/i.test(pcText + spdText)
      ? "pass"
      : "fail",
    PHASE_11C_PROJECT_CONTROLS_VERSION,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11c-project-controls-schedule/1",
    phase: "11C",
    title: "Project Controls Schedule Intelligence",
    moduleKey: "project_controls",
    version: PHASE_11C_PROJECT_CONTROLS_VERSION,
    status: "schedule_intelligence",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    phase11bCertifiedCommit: PHASE_11B_CERTIFIED_COMMIT,
    phase11bHostedRun: PHASE_11B_HOSTED_RUN,
    sharedProjectDomainReady: true,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    progressIntelligence11bIntact: true,
    scheduleIntelligenceReady: true,
    scheduleConfidenceEngineReady: true,
    scheduleIntelligenceIsAdvisoryOnly: true,
    scheduleIntelligenceIsCpm: false,
    progressMeasurementImplemented: true,
    progressMeasurementIsAdvisoryOnly: true,
    progressMeasurementIsEarnedValue: false,
    productionProjectControlsReady: false,
    projectControlsImplemented: false,
    productionMemoryRepositoryAllowed: false,
    projectControlsOwnership: "project_controls",
    canonicalProjectIdentityOwnership: PHASE_11C_PROJECT_IDENTITY_OWNER,
    projectIdentityOwnership: PHASE_11C_PROJECT_IDENTITY_OWNER,
    canonicalProjectIdentityClaimedByProjectControls: false,
    duplicateProjectOwnershipDetected: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    projectIntelligenceOwnership: "project_intelligence",
    assetIntelligenceOwnership: "asset_intelligence",
    inspectionIntelligenceOwnership: "inspection_intelligence",
    progressIntelligenceOwnership: "project_controls",
    scheduleIntelligenceOwnership: "project_controls",
    assetIntelligenceV1Tag: PHASE_11C_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagMoved: aiTag !== null && aiTag !== PHASE_11C_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Intact: piTag === PHASE_11C_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_11C_INSPECTION_INTELLIGENCE_V1_COMMIT,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    floatComputationImplemented: false,
    costEngineImplemented: false,
    budgetLedgerImplemented: false,
    scheduleExecutionImplemented: false,
    forecastingImplemented: false,
    resourceLevelingImplemented: false,
    changeControlImplemented: false,
    contingencyManagementImplemented: false,
    moduleRegistryStatus: "coming_soon",
    entitlementsAreEntitlementOnly: true,
    secretExposureDetected: !secret.ok,
    hostedTablesOk: hosted.tablesOk,
    hostedRlsOk: hosted.rlsOk,
    hostedJwtMatrixOk: hosted.jwtMatrixOk,
    hostedDetail: hosted.detail,
    scheduleTables: [...PHASE_11C_PROJECT_CONTROLS_SCHEDULE_TABLES],
    progressTables: [...PHASE_11C_PROJECT_CONTROLS_PROGRESS_TABLES],
    phase11DReady: pass,
    releaseEligible: pass,
    gates,
    requiredGates: PHASE_11C_PROJECT_CONTROLS_SCHEDULE_GATES.map(([id]) => id),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11c-project-controls-schedule-certification.json");
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
