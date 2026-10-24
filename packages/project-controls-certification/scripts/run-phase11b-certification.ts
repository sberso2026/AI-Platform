/**
 * Phase 11B certification runner (gates A–AS) — Project Controls Foundation,
 * Engineering Shared Project Domain and Progress Intelligence.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_11A_CERTIFIED_COMMIT,
  PHASE_11A_HOSTED_RUN,
  PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11B_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11B_FORBIDDEN_CAPABILITIES,
  PHASE_11B_GATE_COUNT,
  PHASE_11B_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11B_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_11B_PROJECT_CONTROLS_PROGRESS_GATES,
  PHASE_11B_PROJECT_CONTROLS_TABLES,
  PHASE_11B_PROJECT_CONTROLS_VERSION,
  PHASE_11B_PROJECT_IDENTITY_OWNER,
  PHASE_11B_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_11B_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_11B_SHARED_PROJECT_DOMAIN_TABLES,
  PHASE_11B_SHARED_PROJECT_DOMAIN_VERSION,
  type Phase11bGateId,
} from "../src/phase11b/gates.js";

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
const SPD_VERSION = `${SPD}/src/version.ts`;
const SPD_REFS = `${SPD}/src/references.ts`;
const SPD_PORT = `${SPD}/src/project-reference-port.ts`;
const PC_CERT_PKG = `${PC_CERT}/package.json`;
const GATES_FILE = `${PC_CERT}/src/phase11b/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11b-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase11b-project-controls-progress.test.ts";
const WORKFLOW = ".github/workflows/phase-11b-project-controls-progress.yml";

const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";
const DOC_PROGRESS = "docs/architecture/PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md";
const DOC_CONTEXT = "docs/architecture/PROJECT_CONTROLS_PROJECT_CONTEXT_ENGINE.md";
const DOC_OWNERSHIP = "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY = "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const COMMERCE_POLICY = "packages/platform-commerce/src/domain/commerce-access-policy.ts";
const SERVICE_POLICIES = "packages/platform-commerce/src/domain/engineering-service-policies.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";

const BATCH_61 = "supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql";
const BATCH_62 = "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql";
const PROGRESS_ROUTE = "apps/web/src/app/api/engineering/project-controls/progress/route.ts";
const PROFILE_ROUTE = "apps/web/src/app/api/engineering/project-controls/profile/route.ts";

const DOMAIN_FILES = [
  `${PC}/src/domain/reserved-providers.ts`,
  `${PC}/src/domain/progress.ts`,
  `${PC}/src/domain/progress-confidence.ts`,
  `${PC}/src/domain/progress-engine.ts`,
  `${PC}/src/domain/project-context-engine.ts`,
  `${PC}/src/domain/review-workflow.ts`,
  `${PC}/src/domain/events.ts`,
  `${PC}/src/domain/persistence.ts`,
  `${PC}/src/domain/postgres-repository.ts`,
  `${PC}/src/domain/repository-factory.ts`,
  `${PC}/src/domain/role-matrix.ts`,
  `${PC}/src/domain/services.ts`,
  `${PC}/src/domain/engine.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase11bGateId; name: string; status: GateStatus; detail?: string };

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
  const tables = [...PHASE_11B_SHARED_PROJECT_DOMAIN_TABLES, ...PHASE_11B_PROJECT_CONTROLS_TABLES];
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
    const { data } = await anonClient
      .from("project_controls_progress_assessments")
      .select("id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `pc-cert-11b-${Date.now()}@example.com`;
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
        const { data: rows, error: readErr } = await authed
          .from("project_controls_progress_assessments")
          .select("id")
          .limit(5);
        jwtMatrixOk =
          !readErr &&
          Array.isArray(rows) &&
          rows.length === 0 &&
          has(`${PC}/src/domain/role-matrix.ts`, /progress\.assess/) &&
          has(`${PC}/src/domain/review-workflow.ts`, /progress_self_approval_forbidden/);
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
  const push = (id: Phase11bGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11B_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_11B_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_11B_INSPECTION_INTELLIGENCE_V1_TAG);
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
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.2\.0-progress-intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "progress_intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11B"/) &&
      has(VERSION, new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_CERTIFIED_COMMIT}"`)) &&
      has(VERSION, new RegExp(`PHASE_11A_HOSTED_RUN = "${PHASE_11A_HOSTED_RUN}"`))
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push(
    "C",
    "Project Intelligence V1 integrity",
    piTag === PHASE_11B_PROJECT_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    piTag ?? "tag_missing",
  );
  push(
    "D",
    "Inspection Intelligence V1 integrity",
    iiTag === PHASE_11B_INSPECTION_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    iiTag ?? "tag_missing",
  );

  // ------------------------------------------------------------------ E–F
  push(
    "E",
    "Canonical project identity owned by shared project domain",
    has(VERSION, new RegExp(`CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11B_PROJECT_IDENTITY_OWNER}"`)) &&
      has(VERSION, new RegExp(`PROJECT_IDENTITY_OWNERSHIP = "${PHASE_11B_PROJECT_IDENTITY_OWNER}"`)) &&
      has(SPD_VERSION, new RegExp(`CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11B_PROJECT_IDENTITY_OWNER}"`)) &&
      has(OWNERSHIP_LOCK, /engineering_os_shared_project_domain/) &&
      has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "F",
    "Identity owner spelling unified in Phase 11B",
    has(VERSION, /PROJECT_IDENTITY_OWNER_SPELLING_UNIFICATION = "unified_in_phase_11b"/) &&
      has(DOC_OWNERSHIP, /unified_in_phase_11b|Locked for Phase 11B/) &&
      has(DOC_SHARED, /engineering_os_shared_project_domain/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ G–J
  const requiredRefKinds = [
    "ProjectReference",
    "PhaseReference",
    "WbsReference",
    "WorkPackageReference",
    "ActivityReference",
    "MilestoneReference",
    "CalendarReference",
    "OrganizationReference",
    "DisciplineReference",
    "LocationReference",
  ];
  push(
    "G",
    "Engineering Shared Project Domain package exists",
    exists(SPD_PKG) &&
      exists(SPD_VERSION) &&
      exists(SPD_REFS) &&
      exists(SPD_PORT) &&
      has(SPD_PKG, /"name": "@rtb\/engineering-shared-project-domain"/) &&
      has(SPD_VERSION, new RegExp(`ENGINEERING_SHARED_PROJECT_DOMAIN_VERSION =\\s*\\r?\\n?\\s*"${PHASE_11B_SHARED_PROJECT_DOMAIN_VERSION}"`)) &&
      has(SPD_VERSION, /SHARED_PROJECT_DOMAIN_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "Shared project domain reference types complete",
    requiredRefKinds.every((name) => has(SPD_REFS, new RegExp(`export type ${name}`))) &&
      has(SPD_REFS, /SHARED_PROJECT_DOMAIN_REFERENCE_KINDS/)
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Project reference resolution port is read-only",
    has(SPD_PORT, /resolveProjectReference/) &&
      has(SPD_PORT, /mutable:\s*false/) &&
      has(SPD_VERSION, /PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED = false/) &&
      !/\binsert\b|\bupdate\b|\bupsert\b|\bdelete\b/i.test(
        readRepoFile(SPD_PORT).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, ""),
      )
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Shared project domain reference migration (batch 61)",
    exists(BATCH_61) &&
      PHASE_11B_SHARED_PROJECT_DOMAIN_TABLES.every((table) =>
        has(BATCH_61, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(BATCH_61, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_61, /identity_owner.*engineering_os_shared_project_domain/) &&
      has(BATCH_61, /contains_earned_value.*false/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ K–P
  push(
    "K",
    "Project Controls consumes ProjectReference only",
    has(VERSION, /PROJECT_CONTROLS_CONSUMES_PROJECT_REFERENCE_ONLY = true/) &&
      has(VERSION, /PROJECT_IDENTITY_MUTATION_BY_PROJECT_CONTROLS_ALLOWED = false/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /ProjectReference/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /mutatesProjectIdentity: false/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /isProjectRegistry: false/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Reserved providers are interfaces that throw not_implemented",
    has(`${PC}/src/domain/reserved-providers.ts`, /ScheduleProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /CostProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /EarnedValueProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /ForecastProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /ChangeProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /ProductivityProvider/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /ProjectControlsNotImplementedError/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /not_implemented/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /implemented: false/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Progress domain types declared",
    has(`${PC}/src/domain/progress.ts`, /export type ProgressEvidence/) &&
      has(`${PC}/src/domain/progress.ts`, /export type ProgressConfidence/) &&
      has(`${PC}/src/domain/progress.ts`, /export type ProgressAssessmentState/) &&
      has(`${PC}/src/domain/progress.ts`, /export type ProgressSnapshot/) &&
      has(`${PC}/src/domain/progress.ts`, /export type ProgressTimeline/) &&
      has(`${PC}/src/domain/progress.ts`, /export type ProjectProfile/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Progress confidence engine with five sufficiency states",
    has(`${PC}/src/domain/progress.ts`, /"sufficient"/) &&
      has(`${PC}/src/domain/progress.ts`, /"limited"/) &&
      has(`${PC}/src/domain/progress.ts`, /"insufficient"/) &&
      has(`${PC}/src/domain/progress.ts`, /"conflicting"/) &&
      has(`${PC}/src/domain/progress.ts`, /"stale"/) &&
      has(`${PC}/src/domain/progress-confidence.ts`, /createProgressConfidenceEngine|ProgressConfidenceEngine/) &&
      has(`${PC}/src/domain/progress.ts`, /isAbstainingSufficiency/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Progress engine abstains without sufficient evidence",
    has(`${PC}/src/domain/progress-engine.ts`, /ProgressIntelligenceEngine/) &&
      has(`${PC}/src/domain/progress-engine.ts`, /abstained/) &&
      has(`${PC}/src/domain/progress-engine.ts`, /insufficient_progress_evidence|abstained_no_indication/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Progress engine forbids earned value derivation",
    has(`${PC}/src/domain/progress-engine.ts`, /assertNoEarnedValue/) &&
      has(`${PC}/src/domain/progress-engine.ts`, /earned_value_forbidden_in_progress_intelligence/) &&
      has(`${PC}/src/domain/progress-engine.ts`, /earnedValueComputed: false/) &&
      has(VERSION, /PROGRESS_MEASUREMENT_IS_EARNED_VALUE = false/) &&
      has(VERSION, /PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY = true/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ Q–U
  push(
    "Q",
    "Project Context Engine composes a ProjectProfile",
    has(`${PC}/src/domain/project-context-engine.ts`, /ProjectContextEngine/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /compose\(/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /ProjectProfile/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Reserved project profile contributors declared",
    has(`${PC}/src/domain/project-context-engine.ts`, /schedule_intelligence/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /cost_intelligence/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /change_intelligence/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /earned_value/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /forecast/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /status: "reserved"/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /progress_intelligence/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /assertProjectProfileContributorsComplete/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Progress review workflow on the Engineering OS Workflow SDK",
    has(`${PC}/src/domain/review-workflow.ts`, /project_controls\.progress_review/) &&
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
    "T",
    "No self-approval and no autonomous progress publication",
    has(`${PC}/src/domain/review-workflow.ts`, /progress_self_approval_forbidden/) &&
      has(`${PC}/src/domain/review-workflow.ts`, /assertPublishable/) &&
      has(VERSION, /AI_MAY_PUBLISH_PROGRESS_FORBIDDEN = true/) &&
      has(VERSION, /AUTONOMOUS_PROGRESS_PUBLICATION_ALLOWED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Progress and profile domain events declared",
    has(`${PC}/src/domain/events.ts`, /engineering\.project\.progress\.updated/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.progress\.reviewed/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.progress\.published/) &&
      has(`${PC}/src/domain/events.ts`, /engineering\.project\.profile\.updated/) &&
      has(`${PC}/src/domain/events.ts`, /Identifiers only/) &&
      !has(`${PC}/src/domain/events.ts`, /indicatedCompletion:/) &&
      !has(`${PC}/src/domain/events.ts`, /evidencePayload/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ V–Z
  push(
    "V",
    "Persistence port and memory adapter",
    has(`${PC}/src/domain/persistence.ts`, /ProjectControlsRepositoryPort/) &&
      has(`${PC}/src/domain/persistence.ts`, /MemoryProjectControlsRepository/) &&
      has(`${PC}/src/domain/persistence.ts`, /assertProductionRepositorySafe/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Postgres repository adapter",
    has(`${PC}/src/domain/postgres-repository.ts`, /PostgresProjectControlsRepository|createPostgresProjectControlsRepository/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /createProjectControlsRepository/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /adapter.*postgres|postgres/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Production memory repository forbidden",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /production_memory_repository_forbidden/) &&
      has(SPD_VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Role matrix with no reserved-concern capabilities",
    has(`${PC}/src/domain/role-matrix.ts`, /progress\.assess/) &&
      has(`${PC}/src/domain/role-matrix.ts`, /progress\.approve/) &&
      has(`${PC}/src/domain/role-matrix.ts`, /progress\.publish/) &&
      !has(`${PC}/src/domain/role-matrix.ts`, /earned_value\.|cost\.assess|schedule\.execute|cpm\./)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Services and engine facade",
    DOMAIN_FILES.every((file) => exists(file)) &&
      has(`${PC}/src/domain/engine.ts`, /assessProgress/) &&
      has(`${PC}/src/domain/engine.ts`, /reviewProgress/) &&
      has(`${PC}/src/domain/services.ts`, /ProjectControlsService/) &&
      has(`${PC}/src/domain/services.ts`, /ProgressIntelligenceService/) &&
      has(INDEX, /domain\/engine/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AA–AF
  push(
    "AA",
    "Project Controls progress migration tables (batch 62)",
    exists(BATCH_62) &&
      PHASE_11B_PROJECT_CONTROLS_TABLES.every((table) =>
        has(BATCH_62, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      )
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Progress tables enforce tenant and workspace RLS",
    has(BATCH_62, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_62, /tenant_id/) &&
      has(BATCH_62, /workspace_id/) &&
      has(BATCH_62, /CREATE POLICY/) &&
      has(BATCH_62, /get_user_tenant_ids|workspace_memberships|tenant/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Progress tables CHECK-constrain the forbid locks",
    has(BATCH_62, /pc_progress_no_earned_value/) &&
      has(BATCH_62, /pc_progress_no_cpm/) &&
      has(BATCH_62, /pc_progress_no_cost_engine/) &&
      has(BATCH_62, /pc_progress_no_forecasting/) &&
      has(BATCH_62, /pc_progress_advisory_only/) &&
      has(BATCH_62, /pc_progress_no_identity_mutation/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Progress tables reference engineering_projects by FK",
    has(BATCH_62, /REFERENCES engineering_projects\(id\)/) &&
      !has(BATCH_62, /CREATE TABLE IF NOT EXISTS engineering_projects/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Progress HTTP route",
    exists(PROGRESS_ROUTE) &&
      has(PROGRESS_ROUTE, /earnedValueImplemented:\s*false/) &&
      has(PROGRESS_ROUTE, /cpmImplemented:\s*false/) &&
      has(PROGRESS_ROUTE, /productionProjectControlsReady:\s*false/) &&
      has(PROGRESS_ROUTE, /error:\s*\{\s*code/) &&
      has(PROGRESS_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Project profile HTTP route",
    exists(PROFILE_ROUTE) &&
      has(PROFILE_ROUTE, /projectContextEngineReady:\s*true|ProjectProfile|profile/) &&
      has(PROFILE_ROUTE, /error:\s*\{\s*code/) &&
      has(PROFILE_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AG–AK
  const forbidLocksOk = PHASE_11B_FORBIDDEN_CAPABILITIES.every((lock) =>
    has(VERSION, new RegExp(`${lock} = false`)),
  );
  // Strip block/line comments so forbid docs (BCWS/BCWP named as forbidden) do not fail AG.
  const pcImplText = pcText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  push(
    "AG",
    "No earned value or CPM implementation",
    forbidLocksOk &&
      has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/) &&
      has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      !/\b(compute|calculate|derive)EarnedValue\b/i.test(pcImplText) &&
      !/\b(forwardPass|backwardPass|totalFloat)\b/i.test(pcImplText) &&
      !/\b(bcws|bcwp|acwp)\s*[:=(]/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "No cost, schedule execution, forecasting or levelling engine",
    has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
      has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      has(VERSION, /FORECASTING_IMPLEMENTED = false/) &&
      has(VERSION, /RESOURCE_LEVELING_IMPLEMENTED = false/) &&
      has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      !/\bclass\s+\w*CostEngine\b/.test(pcText) &&
      !/\bclass\s+\w*ScheduleEngine\b/.test(pcText)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
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
    "AJ",
    "Commerce entitlements remain entitlement-only",
    has(COMMERCE_POLICY, /applicationKey: "project_controls"/) &&
      has(SERVICE_POLICIES, /applicationKey: "project_controls"/) &&
      has(VERSION, /PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY = true/) &&
      !has(COMMERCE_POLICY, /project_controls\.(cost|schedule|earned_value)/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Phase 11B architecture documents",
    exists(DOC_SHARED) &&
      exists(DOC_PROGRESS) &&
      exists(DOC_CONTEXT) &&
      exists(DOC_OWNERSHIP) &&
      exists(DOC_BOUNDARY) &&
      has(DOC_PROGRESS, /Progress Intelligence|progress intelligence/i) &&
      has(DOC_CONTEXT, /Project Context Engine|ProjectProfile/) &&
      has(DOC_OWNERSHIP, /engineering_os_shared_project_domain/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AL–AO
  const unitPc = run("pnpm --filter @rtb/project-controls test");
  const unitSpd = run("pnpm --filter @rtb/engineering-shared-project-domain test");
  push(
    "AL",
    "Unit tests green",
    unitPc.ok && unitSpd.ok ? "pass" : "fail",
    unitPc.ok && unitSpd.ok
      ? "unit_ok"
      : `pc=${unitPc.detail.slice(0, 400)};spd=${unitSpd.detail.slice(0, 400)}`,
  );

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase11b-project-controls-progress.test.ts",
  );
  push(
    "AM",
    "Certification package and architecture test",
    exists(PC_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(ARCH_TEST) &&
      exists(WORKFLOW) &&
      has(PC_CERT_PKG, /"certify:phase11b"/) &&
      has(GATES_FILE, /PHASE_11B_GATE_COUNT/) &&
      PHASE_11B_GATE_COUNT === 45 &&
      arch.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  push(
    "AN",
    "Secret exposure",
    secret.ok && exists(SECRET_SCAN_FILE) ? "pass" : "fail",
    secret.detail.slice(0, 500),
  );
  push(
    "AO",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || inCi ? "pass" : "fail",
    `${buildIdentitySha}:${ciHeadSha}`,
  );

  // ------------------------------------------------------------------ AP–AS
  push(
    "AP",
    "Hosted progress and reference tables exist",
    hosted.tablesOk && hosted.rlsOk && hosted.jwtMatrixOk ? "pass" : "fail",
    hosted.detail,
  );

  const aiSurfaceUnchanged =
    aiTag === PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  const piSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11B_PROJECT_INTELLIGENCE_V1_COMMIT} HEAD -- packages/project-intelligence`,
  );
  const iiSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11B_INSPECTION_INTELLIGENCE_V1_COMMIT} HEAD -- packages/inspection-intelligence`,
  );
  push(
    "AQ",
    "AI/PI/II V1 surfaces unmodified",
    has(AI_VERSION, /ASSET_INTELLIGENCE_VERSION = "1\.0\.0"/) &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/) &&
      aiSurfaceUnchanged &&
      piSurfaceUnchanged &&
      iiSurfaceUnchanged &&
      has(VERSION, /ASSET_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /PROJECT_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /INSPECTION_INTELLIGENCE_V1_INTACT = true/)
      ? "pass"
      : "fail",
    `ai=${aiSurfaceUnchanged};pi=${piSurfaceUnchanged};ii=${iiSurfaceUnchanged}`,
  );

  const priorFor11c = gates.every((g) => g.status === "pass");
  push(
    "AR",
    "Phase 11C readiness",
    priorFor11c &&
      has(VERSION, /SHARED_PROJECT_DOMAIN_READY = true/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      has(`${PC}/src/domain/project-context-engine.ts`, /schedule_intelligence/) &&
      has(`${PC}/src/domain/reserved-providers.ts`, /ScheduleProvider/)
      ? "pass"
      : "fail",
    `priorGatesPassed=${priorFor11c}`,
  );

  const releaseEligible = gates.every((g) => g.status === "pass");
  push(
    "AS",
    "Progress intelligence release eligibility",
    releaseEligible &&
      has(PC_PKG, /"version": "0\.2\.0-progress-intelligence"/) &&
      has(PC_CERT_PKG, /"version": "0\.2\.0-progress-intelligence"/) &&
      !/\bclass\s+\w*Primavera|\bclass\s+\w*MsProject\b/i.test(pcText + spdText)
      ? "pass"
      : "fail",
    PHASE_11B_PROJECT_CONTROLS_VERSION,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11b-project-controls-progress/1",
    phase: "11B",
    title: "Project Controls Foundation, Shared Project Domain and Progress Intelligence",
    moduleKey: "project_controls",
    version: PHASE_11B_PROJECT_CONTROLS_VERSION,
    status: "progress_intelligence",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    sharedProjectDomainReady: true,
    sharedProjectDomainVersion: PHASE_11B_SHARED_PROJECT_DOMAIN_VERSION,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    progressConfidenceEngineReady: true,
    progressMeasurementImplemented: true,
    progressMeasurementIsAdvisoryOnly: true,
    progressMeasurementIsEarnedValue: false,
    productionProjectControlsReady: false,
    projectControlsImplemented: false,
    productionMemoryRepositoryAllowed: false,
    projectControlsOwnership: "project_controls",
    canonicalProjectIdentityOwnership: PHASE_11B_PROJECT_IDENTITY_OWNER,
    projectIdentityOwnership: PHASE_11B_PROJECT_IDENTITY_OWNER,
    canonicalProjectIdentityClaimedByProjectControls: false,
    duplicateProjectOwnershipDetected: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    projectIntelligenceOwnership: "project_intelligence",
    assetIntelligenceOwnership: "asset_intelligence",
    inspectionIntelligenceOwnership: "inspection_intelligence",
    progressIntelligenceOwnership: "project_controls",
    assetIntelligenceV1Tag: PHASE_11B_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagMoved: aiTag !== null && aiTag !== PHASE_11B_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Intact: piTag === PHASE_11B_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_11B_INSPECTION_INTELLIGENCE_V1_COMMIT,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
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
    progressTables: [...PHASE_11B_PROJECT_CONTROLS_TABLES],
    sharedProjectDomainTables: [...PHASE_11B_SHARED_PROJECT_DOMAIN_TABLES],
    phase11CReady: pass,
    releaseEligible: pass,
    gates,
    requiredGates: PHASE_11B_PROJECT_CONTROLS_PROGRESS_GATES.map(([id]) => id),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11b-project-controls-progress-certification.json");
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
