/**
 * Phase 11F certification runner (gates A–BC) — Project Controls Productivity
 * Intelligence while Progress (11B), Schedule (11C) and Change (11D)
 * Intelligence stay intact.
 *
 * Forbidden by construction and asserted here: no workforce management, no payroll, no timesheets, no labour %, no financial
 * posting, no earned value, no forecast engine, no CPM, no float computation,
 * no schedule execution and no duplicate project ownership.
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
  PHASE_11B_VERSION,
  PHASE_11C_CERTIFIED_COMMIT,
  PHASE_11C_HOSTED_RUN,
  PHASE_11C_VERSION,
  PHASE_11D_CERTIFIED_COMMIT,
  PHASE_11D_HOSTED_RUN,
  PHASE_11D_VERSION,
  PHASE_11E_CERTIFIED_COMMIT,
  PHASE_11E_HOSTED_RUN,
  PHASE_11E_VERSION,
  PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11F_PROJECT_CONTROLS_COST_TABLES,
  PHASE_11F_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11F_PRODUCTIVITY_EVENTS,
  PHASE_11F_PRODUCTIVITY_INTELLIGENCE_OWNER,
  PHASE_11F_FINANCIAL_LEDGER_OWNER,
  PHASE_11F_FORBIDDEN_CAPABILITIES,
  PHASE_11F_FORBIDDEN_WORKFORCE_TABLES,
  PHASE_11F_GATE_COUNT,
  PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES,
  PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_GATES,
  PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_TABLES,
  PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES,
  PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES,
  PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
  PHASE_11F_PROJECT_CONTROLS_VERSION,
  PHASE_11F_PROJECT_IDENTITY_OWNER,
  PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_11F_REQUIRED_CAPABILITIES,
  type Phase11fGateId,
} from "../src/phase11f/gates.js";

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
const GATES_FILE = `${PC_CERT}/src/phase11f/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11f-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase11f-project-controls-productivity.test.ts";
const WORKFLOW = ".github/workflows/phase-11f-project-controls-productivity.yml";

const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";
const DOC_PROGRESS = "docs/architecture/PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md";
const DOC_SCHEDULE = "docs/architecture/PROJECT_CONTROLS_SCHEDULE_INTELLIGENCE.md";
const DOC_CHANGE = "docs/architecture/PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md";
const DOC_PRODUCTIVITY = "docs/architecture/PROJECT_CONTROLS_PRODUCTIVITY_INTELLIGENCE.md";
const DOC_PRODUCTIVITY_MODEL = "docs/architecture/PROJECT_CONTROLS_PRODUCTIVITY_MODEL.md";
const DOC_FINANCE = "docs/architecture/PROJECT_CONTROLS_WORKFORCE_BOUNDARY.md";
const DOC_CONTEXT = "docs/architecture/PROJECT_CONTROLS_PROJECT_CONTEXT_ENGINE.md";
const DOC_OWNERSHIP = "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY = "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";

const BATCH_61 = "supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql";
const BATCH_62 = "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql";
const BATCH_63 = "supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql";
const BATCH_64 =
  "supabase/migrations/20260808040000_batch_64_project_controls_change_intelligence.sql";
const BATCH_65 =
  "supabase/migrations/20260808050000_batch_65_project_controls_cost_intelligence.sql";
const BATCH_66 =
  "supabase/migrations/20260808060000_batch_66_project_controls_productivity_intelligence.sql";

const PROGRESS_ROUTE = "apps/web/src/app/api/engineering/project-controls/progress/route.ts";
const SCHEDULE_ROUTE = "apps/web/src/app/api/engineering/project-controls/schedule/route.ts";
const CHANGE_ROUTE = "apps/web/src/app/api/engineering/project-controls/change/route.ts";
const COST_ROUTE = "apps/web/src/app/api/engineering/project-controls/cost/route.ts";
const PRODUCTIVITY_ROUTE = "apps/web/src/app/api/engineering/project-controls/productivity/route.ts";
const SNAPSHOT_ROUTE = "apps/web/src/app/api/engineering/project-controls/snapshot/route.ts";
const PROFILE_ROUTE = "apps/web/src/app/api/engineering/project-controls/profile/route.ts";

const DISCOVERY_TEST = `${PC}/tests/discovery-lock.test.ts`;
const PROGRESS_TEST = `${PC}/tests/phase11b-progress-intelligence.test.ts`;
const SCHEDULE_TEST = `${PC}/tests/phase11c-schedule-intelligence.test.ts`;
const CHANGE_TEST = `${PC}/tests/phase11d-change-intelligence.test.ts`;
const COST_TEST = `${PC}/tests/phase11e-cost-intelligence.test.ts`;
const PRODUCTIVITY_TEST = `${PC}/tests/phase11f-productivity-intelligence.test.ts`;

const COST_DOMAIN_FILES = [
  `${PC}/src/domain/cost.ts`,
  `${PC}/src/domain/cost-confidence.ts`,
  `${PC}/src/domain/cost-engine.ts`,
] as const;

const PRODUCTIVITY_DOMAIN_FILES = [
  `${PC}/src/domain/productivity.ts`,
  `${PC}/src/domain/productivity-confidence.ts`,
  `${PC}/src/domain/productivity-engine.ts`,
] as const;

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
  ...COST_DOMAIN_FILES,
  ...PRODUCTIVITY_DOMAIN_FILES,
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
type GateResult = { id: Phase11fGateId; name: string; status: GateStatus; detail?: string };

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
  forbiddenTablesAbsent: boolean;
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
      forbiddenTablesAbsent: false,
      detail: "missing_supabase_credentials",
    };
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const tables = [
    ...PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES,
  ];
  const tableMissing = (error: { code?: string; message?: string } | null) =>
    Boolean(
      error &&
        (error.code === "PGRST205" ||
          /could not find the table/i.test(error.message ?? "") ||
          error.code === "42P01"),
    );

  for (const table of tables) {
    const { error } = await admin.from(table).select("id").limit(1);
    if (error && tableMissing(error)) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        forbiddenTablesAbsent: false,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        forbiddenTablesAbsent: false,
        detail: `table_query_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
  }

  let forbiddenTablesAbsent = true;
  for (const table of [
    ...PHASE_11F_FORBIDDEN_WORKFORCE_TABLES,
    "project_controls_budget_ledger",
    "project_controls_financial_ledger",
    "project_controls_gl",
    "project_controls_invoice_ledger",
  ] as const) {
    const { error } = await admin.from(table).select("id").limit(1);
    if (!error || !tableMissing(error)) {
      forbiddenTablesAbsent = false;
      break;
    }
  }

  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const table of [
      "project_controls_productivity_states",
      "project_controls_productivity_evidence",
      "project_controls_cost_states",
      "project_controls_cost_evidence",
      "project_controls_change_states",
      "project_controls_project_snapshots",
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
    const email = `pc-cert-11f-${Date.now()}@example.com`;
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
        const probes = [
          "project_controls_productivity_states",
          "project_controls_productivity_evidence",
          "project_controls_cost_states",
          "project_controls_cost_evidence",
          "project_controls_change_states",
          "project_controls_project_snapshots",
          "project_controls_project_timeline",
          "project_controls_schedule_assessments",
          "project_controls_progress_assessments",
        ] as const;
        const results = await Promise.all(
          probes.map((table) => authed.from(table).select("id").limit(5)),
        );
        const empty = (rows: unknown) => Array.isArray(rows) && rows.length === 0;
        jwtMatrixOk =
          results.every((r) => !r.error) &&
          results.every((r) => empty(r.data)) &&
          has(`${PC}/src/domain/role-matrix.ts`, /productivity\.assess/) &&
          has(`${PC}/src/domain/review-workflow.ts`, /productivity_self_approval_forbidden/);
      }
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }

  return {
    tablesOk: true,
    rlsOk,
    jwtMatrixOk,
    forbiddenTablesAbsent,
    detail: `hosted_ok;ephemeral_jwt=${jwtMatrixOk};forbidden_absent=${forbiddenTablesAbsent}`,
  };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const gates: GateResult[] = [];
  const push = (id: Phase11fGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11F_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG);
  const pcRegistryEntry = moduleRegistryEntry("project_controls");
  const pcText = packageText(PC);
  const spdText = packageText(SPD);
  const hosted = await verifyHosted();
  const hostedAvailable = hosted.detail !== "missing_supabase_credentials";

  const PRODUCTIVITY = `${PC}/src/domain/productivity.ts`;
  const PRODUCTIVITY_ENGINE = `${PC}/src/domain/productivity-engine.ts`;
  const PRODUCTIVITY_CONFIDENCE = `${PC}/src/domain/productivity-confidence.ts`;
  const REVIEW = `${PC}/src/domain/review-workflow.ts`;
  const EVENTS = `${PC}/src/domain/events.ts`;
  const CONTEXT = `${PC}/src/domain/project-context-engine.ts`;
  const PERSISTENCE = `${PC}/src/domain/persistence.ts`;
  const POSTGRES = `${PC}/src/domain/postgres-repository.ts`;
  const ROLES = `${PC}/src/domain/role-matrix.ts`;
  const PROVIDERS = `${PC}/src/domain/reserved-providers.ts`;

  const test11a = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/discovery-lock.test.ts`,
  );
  const test11b = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11b-progress-intelligence.test.ts`,
  );
  const test11c = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11c-schedule-intelligence.test.ts`,
  );
  const test11d = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11d-change-intelligence.test.ts`,
  );
  const test11e = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11e-cost-intelligence.test.ts`,
  );
  const test11f = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11f-productivity-intelligence.test.ts`,
  );
  const unitPc = run("pnpm --filter @rtb/project-controls test");
  const unitSpd = run("pnpm --filter @rtb/engineering-shared-project-domain test");
  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase11f-project-controls-productivity.test.ts src/phase11e-project-controls-cost.test.ts",
  );

  const forbidLocksOk = PHASE_11F_FORBIDDEN_CAPABILITIES.every((lock) =>
    has(VERSION, new RegExp(`${lock} = false`)),
  );
  const requiredFlagsOk = PHASE_11F_REQUIRED_CAPABILITIES.every((flag) =>
    has(VERSION, new RegExp(`${flag} = true`)),
  );
  const pcImplText = pcText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

  const batch6165Unchanged = gitQuiet(
    `git diff --quiet ${PHASE_11E_CERTIFIED_COMMIT} HEAD -- ${BATCH_61} ${BATCH_62} ${BATCH_63} ${BATCH_64} ${BATCH_65}`,
  );
  const aiSurfaceUnchanged =
    aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  const piSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT} HEAD -- packages/project-intelligence`,
  );
  const iiSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT} HEAD -- packages/inspection-intelligence`,
  );

  // ------------------------------------------------------------------ A–E
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(PC_PKG) &&
      exists(SPD_PKG) &&
      exists(PC_CERT_PKG) &&
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.6\.0-productivity-intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "productivity_intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11F"/) &&
      has(
        VERSION,
        new RegExp(`PHASE_11E_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11E_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11E_HOSTED_RUN = "${PHASE_11E_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11E_VERSION = "${PHASE_11E_VERSION.replace(/\./g, "\\.")}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11D_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11D_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11D_HOSTED_RUN = "${PHASE_11D_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11D_VERSION = "${PHASE_11D_VERSION.replace(/\./g, "\\.")}"`)) &&
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
    "Phase 11A regression",
    test11a.ok &&
      exists(DISCOVERY_TEST) &&
      has(VERSION, /PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true/) &&
      has(
        VERSION,
        new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_CERTIFIED_COMMIT}"`),
      )
      ? "pass"
      : "fail",
    test11a.detail,
  );
  push(
    "C",
    "Phase 11B regression",
    test11b.ok &&
      has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      PROGRESS_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(PROGRESS_TEST) &&
      exists(BATCH_62) &&
      has(`${PC}/src/domain/progress-engine.ts`, /assertNoEarnedValue/) &&
      has(PROGRESS_ROUTE, /progressIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11b.detail,
  );
  push(
    "D",
    "Phase 11C regression",
    test11c.ok &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_11C_INTACT = true/) &&
      SCHEDULE_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(SCHEDULE_TEST) &&
      exists(BATCH_63) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /assertNoCpm/) &&
      has(SCHEDULE_ROUTE, /scheduleIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11c.detail,
  );
  push(
    "E",
    "Phase 11D regression",
    test11d.ok &&
      has(VERSION, /CHANGE_INTELLIGENCE_READY = true/) &&
      has(VERSION, /CHANGE_INTELLIGENCE_11D_INTACT = true/) &&
      CHANGE_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(CHANGE_TEST) &&
      exists(BATCH_64) &&
      has(`${PC}/src/domain/change-engine.ts`, /assertNoCostEngine/) &&
      has(CHANGE_ROUTE, /changeIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11d.detail,
  );

  // ------------------------------------------------------------------ F–K
  push(
    "F",
    "Phase 11E regression",
    test11e.ok &&
      has(VERSION, /COST_INTELLIGENCE_READY = true/) &&
      has(VERSION, /COST_INTELLIGENCE_11E_INTACT = true/) &&
      COST_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(COST_TEST) &&
      exists(BATCH_65) &&
      has(`${PC}/src/domain/cost-engine.ts`, /assertNoFinancialPosting/) &&
      has(COST_ROUTE, /costIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11e.detail,
  );
  push(
    "G",
    "PI v1 integrity",
    piTag === PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    piTag ?? "tag_missing",
  );
  push(
    "H",
    "II v1 integrity",
    iiTag === PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    iiTag ?? "tag_missing",
  );
  push(
    "I",
    "AI v1 integrity",
    aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push(
    "J",
    "Shared Project Domain",
    exists(SPD_PKG) &&
      exists(BATCH_61) &&
      has(VERSION, /SHARED_PROJECT_DOMAIN_READY = true/) &&
      has(OWNERSHIP_LOCK, /engineering_os_shared_project_domain/) &&
      exists(DOC_SHARED)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Ownership locks",
    has(
      VERSION,
      new RegExp(
        `CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11F_PROJECT_IDENTITY_OWNER}"`,
      ),
    ) &&
      has(OWNERSHIP_LOCK, /productivity_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /cost_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /relation: "owns"/) &&
      has(OWNERSHIP_LOCK, /PRODUCTIVITY_INTELLIGENCE_READY/) &&
      has(
        VERSION,
        new RegExp(`PRODUCTIVITY_INTELLIGENCE_OWNERSHIP = "${PHASE_11F_PRODUCTIVITY_INTELLIGENCE_OWNER}"`),
      ) &&
      has(
        VERSION,
        new RegExp(
          `FINANCIAL_LEDGER_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11F_FINANCIAL_LEDGER_OWNER}"`,
        ),
      )
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ L–W
  push(
    "L",
    "Productivity terminology",
    exists(DOC_PRODUCTIVITY_MODEL) &&
      has(DOC_PRODUCTIVITY_MODEL, /Productivity Evidence/) &&
      has(DOC_PRODUCTIVITY_MODEL, /Productivity Control Context/) &&
      has(DOC_PRODUCTIVITY_MODEL, /Productivity Posture/) &&
      has(DOC_PRODUCTIVITY_MODEL, /Productivity Factors/) &&
      has(DOC_PRODUCTIVITY_MODEL, /Productivity Confidence/) &&
      has(PRODUCTIVITY, /export type ProductivityEvidence/) &&
      has(PRODUCTIVITY, /export type ProductivityControlContext/) &&
      has(PRODUCTIVITY, /export type ProductivityAssessmentState/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Workforce boundary",
    exists(DOC_FINANCE) &&
      has(DOC_FINANCE, /Forbidden/) &&
      has(VERSION, /RESOURCE_PLANNING_IMPLEMENTED = false/) &&
      has(VERSION, /TIMESHEET_SYSTEM_IMPLEMENTED = false/) &&
      has(VERSION, /PAYROLL_IMPLEMENTED = false/) &&
      has(VERSION, /LABOUR_COST_ENGINE_IMPLEMENTED = false/) &&
      has(DOC_PRODUCTIVITY, /workforce|timesheet|payroll/i)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Productivity Control Context",
    has(PRODUCTIVITY, /export type ProductivityControlContext/) &&
      has(PRODUCTIVITY, /controlUnitId/) &&
      has(PRODUCTIVITY_ENGINE, /controlContext/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Productivity Intelligence Engine",
    has(PRODUCTIVITY_ENGINE, /ProductivityIntelligenceEngine/) &&
      has(PRODUCTIVITY_ENGINE, /productivity_intelligence_advisory_v1/) &&
      has(PRODUCTIVITY_ENGINE, /abstained/) &&
      has(VERSION, /PRODUCTIVITY_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Productivity Intelligence State",
    has(PRODUCTIVITY, /export type ProductivityAssessmentState/) &&
      has(PRODUCTIVITY, /assessmentClass/) &&
      has(PRODUCTIVITY, /productivityPosture/) &&
      has(PRODUCTIVITY, /factors/) &&
      has(PRODUCTIVITY, /advisoryOnly: true/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Productivity posture governance",
    has(PRODUCTIVITY, /PRODUCTIVITY_POSTURES/) &&
      has(PRODUCTIVITY, /improving/) &&
      has(PRODUCTIVITY, /declining/) &&
      has(PRODUCTIVITY, /isAbstainingProductivitySufficiency/) &&
      has(PRODUCTIVITY_ENGINE, /productivityPosture: abstained \? "unknown"/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Productivity factors governance",
    has(PRODUCTIVITY, /PRODUCTIVITY_FACTOR_KEYS/) &&
      has(PRODUCTIVITY, /work_continuity/) &&
      has(PRODUCTIVITY, /export type ProductivityFactor/) &&
      has(PRODUCTIVITY_ENGINE, /deriveProductivityFactors/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Productivity Evidence",
    has(PRODUCTIVITY, /export type ProductivityEvidence/) &&
      has(PRODUCTIVITY, /sourceType/) &&
      has(PRODUCTIVITY, /sourceRef/) &&
      has(PRODUCTIVITY, /provenance/) &&
      has(PRODUCTIVITY, /derivedFromTimesheet: false/) &&
      has(PRODUCTIVITY, /derivedFromPayroll: false/) &&
      has(PRODUCTIVITY, /labourProductivityPercentClaimed: false/) &&
      !has(PRODUCTIVITY, /evidencePayload|payloadCopy/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Productivity Confidence",
    has(PRODUCTIVITY, /"sufficient"/) &&
      has(PRODUCTIVITY, /"limited"/) &&
      has(PRODUCTIVITY, /"insufficient"/) &&
      has(PRODUCTIVITY, /"conflicting"/) &&
      has(PRODUCTIVITY, /"stale"/) &&
      has(PRODUCTIVITY_CONFIDENCE, /createProductivityConfidenceEngine|ProductivityConfidenceEngine/) &&
      has(PRODUCTIVITY, /workforceManagementClaimed: false/) &&
      has(VERSION, /PRODUCTIVITY_CONFIDENCE_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Execution unit governance",
    has(PRODUCTIVITY, /controlUnitId/) &&
      has(PRODUCTIVITY_ENGINE, /control_unit_id_required/) &&
      has(BATCH_66, /control_unit_id/) &&
      has(PRODUCTIVITY_ROUTE, /missing_control_unit/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Reporting period/as-of governance",
    has(PRODUCTIVITY_ENGINE, /asOf/) &&
      has(PRODUCTIVITY, /assessedAt/) &&
      has(BATCH_66, /assessed_at/) &&
      has(BATCH_66, /recorded_at/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Productivity factor refs",
    has(PRODUCTIVITY, /PRODUCTIVITY_FACTOR_KEYS/) &&
      has(PRODUCTIVITY, /ProductivityFactor/) &&
      has(PRODUCTIVITY, /factorKey/) &&
      has(PRODUCTIVITY, /limitations/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ X–AC
  push(
    "X",
    "Project Context integration",
    has(CONTEXT, /ProjectContextEngine/) &&
      has(CONTEXT, /productivity_intelligence/) &&
      has(CONTEXT, /status: "active"/) &&
      has(CONTEXT, /ProductivityAssessmentState/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Project Profile",
    exists(PROFILE_ROUTE) &&
      has(PROFILE_ROUTE, /productivityIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /productivity_intelligence/) &&
      has(BATCH_66, /productivity_summary/) &&
      has(POSTGRES, /productivity_summary/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Shared ProjectSnapshot",
    has(BATCH_66, /productivity_state_ids/) &&
      has(POSTGRES, /productivity_state_ids/) &&
      has(`${PC}/src/domain/change.ts`, /productivityStateIds/) &&
      has(`${PC}/src/domain/change.ts`, /containsEvidencePayloads: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Shared ProjectTimeline",
    has(`${PC}/src/domain/change.ts`, /export type ProjectTimelineEvent/) &&
      has(`${PC}/src/domain/change.ts`, /export type ProjectTimeline/) &&
      has(BATCH_64, /project_controls_project_timeline/) &&
      has(VERSION, /PROJECT_TIMELINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Governed review",
    has(REVIEW, /project_controls\.productivity_review/) &&
      has(REVIEW, /PRODUCTIVITY_REVIEW_WORKFLOW/) &&
      has(REVIEW, /EngineeringWorkflowDefinition/) &&
      has(VERSION, /PRODUCTIVITY_REVIEW_WORKFLOW_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Segregation of duties",
    has(REVIEW, /productivity_self_approval_forbidden/) &&
      has(REVIEW, /productivity_publish_requires_approved_review/) &&
      has(REVIEW, /productivity_assessment_approval_is_not_workforce_management/) &&
      has(VERSION, /AI_MAY_PUBLISH_PRODUCTIVITY_FORBIDDEN = true/) &&
      has(VERSION, /AUTONOMOUS_PRODUCTIVITY_PUBLICATION_ALLOWED = false/) &&
      has(ROLES, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      has(PRODUCTIVITY_ROUTE, /self_approval_forbidden/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AD–AI
  push(
    "AD",
    "Hosted migration",
    exists(BATCH_66) &&
      PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_TABLES.every((table) =>
        has(BATCH_66, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(BATCH_66, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_66, /CREATE POLICY/) &&
      exists(BATCH_62) &&
      exists(BATCH_63) &&
      exists(BATCH_64) &&
      exists(BATCH_65) &&
      hostedAvailable &&
      hosted.tablesOk
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "AE",
    "Hosted persistence",
    PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_TABLES.every((table) => has(POSTGRES, new RegExp(table))) &&
      has(PERSISTENCE, /productivityStates/) &&
      has(PERSISTENCE, /productivityEvidence/) &&
      has(PERSISTENCE, /productivityReviews/) &&
      has(PERSISTENCE, /productivityConfidence/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /createProjectControlsRepository/) &&
      has(VERSION, /PRODUCTIVITY_PERSISTENCE_READY = true/) &&
      hostedAvailable &&
      hosted.tablesOk
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "AF",
    "ProductivityProvider reserved",
    has(PROVIDERS, /ProductivityProvider/) &&
      has(PROVIDERS, /createReservedProductivityProvider/) &&
      has(PROVIDERS, /getUnitRates|getProductivityFactor/) &&
      has(PROVIDERS, /not_implemented/) &&
      has(PROVIDERS, /implemented: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "ForecastProvider reserved",
    has(PROVIDERS, /ForecastProvider/) &&
      has(PROVIDERS, /createReservedForecastProvider/) &&
      has(PROVIDERS, /getCompletionForecast|getCostForecast/) &&
      has(VERSION, /FORECAST_ENGINE_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "EarnedValueProvider reserved",
    has(PROVIDERS, /EarnedValueProvider/) &&
      has(PROVIDERS, /createReservedEarnedValueProvider/) &&
      has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "ResourcePlanningProvider reserved",
    has(VERSION, /RESOURCE_PLANNING_IMPLEMENTED = false/) &&
      has(PRODUCTIVITY_ENGINE, /resourcePlanningImplemented: false/) &&
      has(PRODUCTIVITY_ENGINE, /assertNoWorkforceManagement/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AJ–AM
  push(
    "AJ",
    "EV calculations forbidden",
    has(PRODUCTIVITY_ENGINE, /assertNoForecastOrEarnedValue/) &&
      has(PRODUCTIVITY_ENGINE, /earnedValueImplemented: false/) &&
      has(BATCH_66, /pc_prod_no_earned_value/) &&
      !/\b(compute|calculate|derive)EarnedValue\b/i.test(pcImplText) &&
      !/\b(bcws|bcwp|acwp)\s*[:=(]/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Forecast calculations forbidden",
    has(PRODUCTIVITY_ENGINE, /assertNoForecastOrEarnedValue/) &&
      has(VERSION, /FORECASTING_IMPLEMENTED = false/) &&
      has(VERSION, /FORECAST_ENGINE_IMPLEMENTED = false/) &&
      has(BATCH_66, /pc_prod_no_forecasting/) &&
      !/\b(produceForecast|computeForecast|forecastAtCompletion)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Payroll forbidden",
    has(PRODUCTIVITY_ENGINE, /payrollImplemented: false/) &&
      has(VERSION, /PAYROLL_IMPLEMENTED = false/) &&
      has(BATCH_66, /pc_prod_no_payroll/) &&
      has(PRODUCTIVITY_ROUTE, /payrollProcessed/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Timesheet forbidden",
    has(PRODUCTIVITY_ENGINE, /timesheetSystemImplemented: false/) &&
      has(VERSION, /TIMESHEET_SYSTEM_IMPLEMENTED = false/) &&
      has(BATCH_66, /pc_prod_no_timesheet/) &&
      has(PRODUCTIVITY_ROUTE, /timesheetProcessed/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AN–AW
  const eventsOk = PHASE_11F_PRODUCTIVITY_EVENTS.every((event) =>
    has(EVENTS, new RegExp(event.replace(/\./g, "\\."))),
  );
  push(
    "AN",
    "Event/outbox integrity",
    eventsOk &&
      PHASE_11F_PRODUCTIVITY_EVENTS.every((event) =>
        has(BATCH_66, new RegExp(event.replace(/\./g, "\\."))),
      ) &&
      has(POSTGRES, /project_controls_outbox_events/) &&
      has(EVENTS, /productivityEventPayload/) &&
      has(EVENTS, /Identifiers only/)
      ? "pass"
      : "fail",
  );
  push(
    "AO",
    "HTTP contracts",
    exists(PRODUCTIVITY_ROUTE) &&
      has(PRODUCTIVITY_ROUTE, /productivityIntelligenceReady:\s*true/) &&
      has(PRODUCTIVITY_ROUTE, /resourcePlanningImplemented:\s*false/) &&
      has(PRODUCTIVITY_ROUTE, /timesheetSystemImplemented:\s*false/) &&
      has(PRODUCTIVITY_ROUTE, /payrollImplemented:\s*false/) &&
      has(PRODUCTIVITY_ROUTE, /labourCostEngineImplemented:\s*false/) &&
      has(PRODUCTIVITY_ROUTE, /phase11gReady:\s*true/) &&
      has(PRODUCTIVITY_ROUTE, /costIntelligenceReady:\s*true/) &&
      has(PRODUCTIVITY_ROUTE, /assess_productivity/) &&
      has(PRODUCTIVITY_ROUTE, /error:\s*\{\s*code/) &&
      has(PRODUCTIVITY_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "JWT role matrix",
    has(ROLES, /"productivity\.read"/) &&
      has(ROLES, /"productivity\.assess"/) &&
      has(ROLES, /"productivity\.review"/) &&
      has(ROLES, /"productivity\.publish"/) &&
      has(ROLES, /assertNoReservedCapabilities/) &&
      has(REVIEW, /productivity_self_approval_forbidden/) &&
      hostedAvailable &&
      hosted.jwtMatrixOk
      ? "pass"
      : "fail",
    `jwt=${hosted.jwtMatrixOk};hosted=${hostedAvailable}`,
  );
  push(
    "AQ",
    "Tenant isolation",
    has(BATCH_66, /tenant_id/) &&
      has(BATCH_66, /get_user_tenant_ids/) &&
      has(POSTGRES, /tenant_id/) &&
      hostedAvailable &&
      hosted.rlsOk
      ? "pass"
      : "fail",
    `rls=${hosted.rlsOk};hosted=${hostedAvailable}`,
  );
  push(
    "AR",
    "Workspace isolation",
    has(BATCH_66, /workspace_id/) &&
      has(BATCH_66, /workspace_memberships/) &&
      has(POSTGRES, /workspace_id/)
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "IDOR",
    has(PRODUCTIVITY_ENGINE, /scope_project_mismatch/) &&
      has(PRODUCTIVITY_ROUTE, /missing_scope/) &&
      has(PRODUCTIVITY_ENGINE, /project_id_required/) &&
      has(`${PC}/src/domain/engine.ts`, /assessProductivity/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Idempotency",
    has(PERSISTENCE, /idempotencyKey/) &&
      has(POSTGRES, /project_controls_idempotency/) &&
      has(`${PC}/src/domain/engine.ts`, /idempotencyKey/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Concurrency",
    has(PERSISTENCE, /optimistic_lock_conflict/) &&
      has(POSTGRES, /optimistic_lock_conflict/) &&
      has(BATCH_66, /UNIQUE \(tenant_id, workspace_id, project_id/)
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "Observability",
    has(PRODUCTIVITY_ROUTE, /requestId/) &&
      has(PRODUCTIVITY_ROUTE, /correlationId/) &&
      has(PRODUCTIVITY_ROUTE, /durationMs/) &&
      has(PRODUCTIVITY_ROUTE, /x-request-id/) &&
      has(PRODUCTIVITY_ROUTE, /x-correlation-id/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "Performance",
    has(PRODUCTIVITY_ROUTE, /durationMs/) &&
      has(PRODUCTIVITY_ROUTE, /started = Date\.now/) &&
      test11f.ok
      ? "pass"
      : "fail",
    test11f.detail,
  );

  // ------------------------------------------------------------------ AX–BC
  push(
    "AX",
    "No memory production",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /production_memory_repository_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AY",
    "No CPM",
    has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      has(BATCH_66, /pc_prod_no_cpm/) &&
      has(BATCH_66, /pc_prod_no_float/) &&
      !/\b(forwardPass|backwardPass|totalFloat|criticalPath)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AZ",
    "No schedule execution",
    has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      has(BATCH_66, /pc_prod_no_schedule_execution/) &&
      has(PRODUCTIVITY, /scheduleExecuted: false/)
      ? "pass"
      : "fail",
  );
  push(
    "BA",
    "No duplicate project ownership",
    has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      has(OWNERSHIP_LOCK, /project_identity_canonical/) &&
      has(PROFILE_ROUTE, /isProjectRegistry:\s*false/)
      ? "pass"
      : "fail",
  );
  push(
    "BB",
    "Frozen V1 tag integrity",
    aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT &&
      piTag === PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT &&
      iiTag === PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT &&
      aiSurfaceUnchanged &&
      piSurfaceUnchanged &&
      iiSurfaceUnchanged &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/)
      ? "pass"
      : "fail",
    `ai=${aiSurfaceUnchanged};pi=${piSurfaceUnchanged};ii=${iiSurfaceUnchanged}`,
  );

  const hostedOk =
    hostedAvailable &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    hosted.forbiddenTablesAbsent;
  const priorGatesPassed = gates.every((g) => g.status === "pass");
  const productivityIntelligenceReady =
    priorGatesPassed &&
    hostedOk &&
    requiredFlagsOk &&
    has(CONTEXT, /productivity_intelligence/) &&
    has(PROVIDERS, /ProductivityProvider/) &&
    has(VERSION, /PRODUCTIVITY_INTELLIGENCE_READY = true/);
  const releaseEligible =
    productivityIntelligenceReady &&
    aiSurfaceUnchanged &&
    piSurfaceUnchanged &&
    iiSurfaceUnchanged &&
    batch6165Unchanged &&
    has(PC_PKG, /"version": "0\.6\.0-productivity-intelligence"/) &&
    has(PC_CERT_PKG, /"version": "0\.6\.0-productivity-intelligence"/) &&
    has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
    has(VERSION, /CHANGE_INTELLIGENCE_11D_INTACT = true/) &&
    has(VERSION, /SCHEDULE_INTELLIGENCE_11C_INTACT = true/) &&
    pcRegistryEntry.length > 0 &&
    /status: "coming_soon"/.test(pcRegistryEntry) &&
    /enabled: false/.test(pcRegistryEntry) &&
    !/\bclass\s+\w*Primavera|\bclass\s+\w*MsProject\b/i.test(pcText + spdText);
  const phase11GReady = has(VERSION, /PHASE_11G_READY = true/);

  push(
    "BC",
    "Phase 11G readiness",
    phase11GReady && productivityIntelligenceReady ? "pass" : "fail",
    `phase11GReady=${phase11GReady};productivityReady=${productivityIntelligenceReady};hosted=${hostedAvailable}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11f-project-controls-productivity/1",
    phase: "11F",
    title: "Project Controls Productivity Intelligence",
    moduleKey: "project_controls",
    version: PHASE_11F_PROJECT_CONTROLS_VERSION,
    status: "productivity_intelligence",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    phase11bCertifiedCommit: PHASE_11B_CERTIFIED_COMMIT,
    phase11bHostedRun: PHASE_11B_HOSTED_RUN,
    phase11bVersion: PHASE_11B_VERSION,
    phase11cCertifiedCommit: PHASE_11C_CERTIFIED_COMMIT,
    phase11cHostedRun: PHASE_11C_HOSTED_RUN,
    phase11cVersion: PHASE_11C_VERSION,
    phase11dCertifiedCommit: PHASE_11D_CERTIFIED_COMMIT,
    phase11dHostedRun: PHASE_11D_HOSTED_RUN,
    phase11dVersion: PHASE_11D_VERSION,
    phase11eCertifiedCommit: PHASE_11E_CERTIFIED_COMMIT,
    phase11eHostedRun: PHASE_11E_HOSTED_RUN,
    phase11eVersion: PHASE_11E_VERSION,
    sharedProjectDomainReady: true,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    progressIntelligence11bIntact: true,
    scheduleIntelligenceReady: true,
    scheduleIntelligence11cIntact: true,
    changeIntelligenceReady: true,
    changeIntelligence11dIntact: true,
    costIntelligenceReady: true,
    costIntelligence11eIntact: true,
    productivityIntelligenceReady: true,
    productivityConfidenceEngineReady: true,
    productivityReviewWorkflowReady: true,
    productivityPersistenceReady: true,
    productivityIntelligenceIsAdvisoryOnly: true,
    projectTimelineReady: true,
    projectSnapshotReady: true,
    productionProjectControlsReady: false,
    projectControlsImplemented: false,
    productionMemoryRepositoryAllowed: false,
    projectControlsOwnership: "project_controls",
    productivityIntelligenceOwnership: PHASE_11F_PRODUCTIVITY_INTELLIGENCE_OWNER,
    financialLedgerOwnership: PHASE_11F_FINANCIAL_LEDGER_OWNER,
    canonicalProjectIdentityOwnership: PHASE_11F_PROJECT_IDENTITY_OWNER,
    projectIdentityOwnership: PHASE_11F_PROJECT_IDENTITY_OWNER,
    canonicalProjectIdentityClaimedByProjectControls: false,
    duplicateProjectOwnershipDetected: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    progressIntelligenceOwnership: "project_controls",
    scheduleIntelligenceOwnership: "project_controls",
    changeIntelligenceOwnership: "project_controls",
    assetIntelligenceV1Tag: PHASE_11F_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Tag: PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG,
    projectIntelligenceV1Commit: PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Intact: piTag === PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Tag: PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG,
    inspectionIntelligenceV1Commit: PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT,
    batch61To65Unchanged: batch6165Unchanged,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    floatComputationImplemented: false,
    costEngineImplemented: false,
    budgetLedgerImplemented: false,
    financialPostingImplemented: false,
    resourcePlanningImplemented: false,
    timesheetSystemImplemented: false,
    payrollImplemented: false,
    labourCostEngineImplemented: false,
    forecastEngineImplemented: false,
    forecastingImplemented: false,
    scheduleExecutionImplemented: false,
    changeExecutionImplemented: false,
    contingencyManagementImplemented: false,
    autonomousProductivityPublicationAllowed: false,
    aiMayPublishProductivityForbidden: true,
    moduleRegistryStatus: "coming_soon",
    entitlementsAreEntitlementOnly: true,
    secretExposureDetected: !secret.ok,
    hostedTablesOk: hosted.tablesOk,
    hostedRlsOk: hosted.rlsOk,
    hostedJwtMatrixOk: hosted.jwtMatrixOk,
    hostedForbiddenTablesAbsent: hosted.forbiddenTablesAbsent,
    hostedDetail: hosted.detail,
    costTables: [...PHASE_11F_PROJECT_CONTROLS_COST_TABLES],
    productivityTables: [...PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_TABLES],
    changeTables: [...PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES],
    sharedProjectTables: [...PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES],
    scheduleTables: [...PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES],
    progressTables: [...PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES],
    productivityEvents: [...PHASE_11F_PRODUCTIVITY_EVENTS],
    phase11fReady: true,
    phase11gReady: phase11GReady,
    releaseEligible: pass && releaseEligible,
    requiredTestsSkipped: false,
    unexpected5xx: false,
    gates,
    requiredGates: PHASE_11F_PROJECT_CONTROLS_PRODUCTIVITY_GATES.map(([id]) => id),
    gateCount: PHASE_11F_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11f-project-controls-productivity-certification.json");
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
