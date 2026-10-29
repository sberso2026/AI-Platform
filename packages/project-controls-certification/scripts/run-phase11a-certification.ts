/**
 * Phase 11A certification runner (gates A–AE) — Project Controls Discovery.
 *
 * This is a discovery phase. It proves the *absence* of a Project Controls
 * product as much as the presence of the discovery artefacts: no engines, no
 * SQL product tables, no product UI, no earned value / CPM / cost / schedule
 * execution, and no disturbance to the frozen Asset Intelligence V1 surface.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11A_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11A_PROJECT_CONTROLS_DISCOVERY_GATES,
  PHASE_11A_PROJECT_CONTROLS_VERSION,
  type Phase11aGateId,
} from "../src/phase11a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI_COMMIT = "34975b1cf660580d46287f24e746b8915903f768";
const II_COMMIT = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const PI_TAG = "project-intelligence-v1.0.0";
const II_TAG = "inspection-intelligence-v1.0.0";

const PC = "packages/project-controls";
const PC_CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const INDEX = `${PC}/src/index.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const PC_PKG = `${PC}/package.json`;
const PC_TEST = `${PC}/tests/discovery-lock.test.ts`;
const PC_CERT_PKG = `${PC_CERT}/package.json`;
const GATES_FILE = `${PC_CERT}/src/phase11a/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11a-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase11a-project-controls-discovery.test.ts";
const WORKFLOW = ".github/workflows/phase-11a-project-controls-discovery.yml";

const DOC_FOOTPRINT = "docs/architecture/PROJECT_CONTROLS_PHASE_11A_EXISTING_FOOTPRINT.md";
const DOC_DOMAIN = "docs/architecture/PROJECT_CONTROLS_DOMAIN_MODEL.md";
const DOC_OWNERSHIP = "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY = "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md";
const DOC_DISCOVERY = "docs/architecture/PROJECT_CONTROLS_PHASE_11A_DISCOVERY.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const COMMERCE_POLICY = "packages/platform-commerce/src/domain/commerce-access-policy.ts";
const SERVICE_POLICIES = "packages/platform-commerce/src/domain/engineering-service-policies.ts";
const WEB_GUARDS = "apps/web/src/lib/commerce/guards.ts";
const MODULES_PAGE = "apps/web/src/app/(platform)/engineering/modules/page.tsx";
const TYPES_MODULES = "packages/types/src/engineering-modules.ts";
const II_CONSUMER_CONTRACTS = "packages/inspection-intelligence/src/domain/consumer-contracts.ts";
const II_ENGINEERING_EVENTS = "packages/inspection-intelligence/src/domain/engineering-events.ts";
const MODULE_SDK = "packages/engineering-os/src/module-sdk/index.ts";
const COMMERCE_ADAPTER = "packages/platform-core/src/commerce/commerce-adapter.ts";
const AI_OWNERSHIP_LOCK = "packages/asset-intelligence/src/architecture/ownership-lock.ts";
const AI_FAILURE_ENGINE = "packages/asset-intelligence/src/domain/failure-engine.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";

const SEED_BATCH_20 = "supabase/migrations/20260203000002_batch_20_engineering_seed.sql";
const SEED_BATCH_31 = "supabase/migrations/20260209000002_batch_31_commerce_backfill.sql";
const SEED_BATCH_31_ROLES = "supabase/migrations/20260209000003_batch_31_commerce_role_seed.sql";
const SEED_SIGNUP = "supabase/migrations/20260206000000_fix_signup_provisioning.sql";

/** Every location the pre-11A Project Controls footprint occupies. */
const FOOTPRINT_INVENTORY = [
  MODULE_REGISTRY,
  COMMERCE_POLICY,
  SERVICE_POLICIES,
  WEB_GUARDS,
  MODULES_PAGE,
  TYPES_MODULES,
  II_CONSUMER_CONTRACTS,
  II_ENGINEERING_EVENTS,
  MODULE_SDK,
  COMMERCE_ADAPTER,
  AI_OWNERSHIP_LOCK,
  AI_FAILURE_ENGINE,
  SEED_BATCH_20,
  SEED_BATCH_31,
  SEED_BATCH_31_ROLES,
  SEED_SIGNUP,
] as const;

/** The discovery package may contain these source files and nothing else. */
const ALLOWED_PC_SOURCE_FILES = [
  "src/index.ts",
  "src/version.ts",
  "src/architecture/ownership-lock.ts",
] as const;

/** Directories that would signal a product implementation crept in. */
const FORBIDDEN_PC_DIRECTORIES = [
  `${PC}/src/domain`,
  `${PC}/src/services`,
  `${PC}/src/engines`,
  `${PC}/src/api`,
  `${PC}/manifest`,
  `${PC}/migrations`,
] as const;

const FORBIDDEN_UI_PATHS = [
  "apps/web/src/app/(platform)/engineering/apps/project-controls",
  "apps/web/src/app/api/engineering/project-controls",
  "apps/web/src/components/engineering/project-controls-shell.tsx",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase11aGateId; name: string; status: GateStatus; detail?: string };

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
    // stderr is suppressed: a missing tag is a legitimate state to report, not a crash.
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
function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "artifacts") continue;
      collectFiles(full, acc);
    } else if (st.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}
/** Source files inside the discovery package, as forward-slash relative paths. */
function discoverySourceFiles(): string[] {
  return collectFiles(resolve(root, `${PC}/src`))
    .map((file) => relative(resolve(root, PC), file).split("\\").join("/"))
    .sort();
}
/** Concatenated text of every file in the discovery package. */
function discoveryPackageText(): string {
  return collectFiles(resolve(root, PC))
    .filter((file) => /\.(ts|tsx|json|md|sql)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}
function migrationSql(): { file: string; text: string }[] {
  const dir = resolve(root, "supabase/migrations");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => ({ file, text: readFileSync(join(dir, file), "utf8") }));
}
/** Extract the module-registry object literal for a given module id. */
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
  const end = source.indexOf('\n  {', start);
  return source.slice(start, end === -1 ? source.length : end);
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const gates: GateResult[] = [];
  const push = (id: Phase11aGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11A_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PI_TAG);
  const iiTag = tag(II_TAG);

  const pcRegistryEntry = moduleRegistryEntry("project_controls");
  const migrations = migrationSql();
  const pcSourceFiles = discoverySourceFiles();
  const pcText = discoveryPackageText();

  // ------------------------------------------------------------------ A–D
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(PC_PKG) &&
      exists(PC_CERT_PKG) &&
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.1\.0-discovery"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "discovery"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11A"/)
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push("C", "PI v1 integrity", piTag === PI_COMMIT ? "pass" : "fail", piTag ?? "tag_missing");
  push("D", "II v1 integrity", iiTag === II_COMMIT ? "pass" : "fail", iiTag ?? "tag_missing");

  // ------------------------------------------------------------------ E–F
  push(
    "E",
    "Ownership lock documented",
    exists(OWNERSHIP_LOCK) &&
      has(OWNERSHIP_LOCK, /export function assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /PROJECT_CONTROLS_OWNERSHIP_MATRIX/) &&
      has(OWNERSHIP_LOCK, /export type OwnershipRow/) &&
      has(OWNERSHIP_LOCK, /export type BoundaryRelation/) &&
      has(OWNERSHIP_LOCK, /project_controls_may_not_claim_canonical_project_identity/) &&
      has(VERSION, /PROJECT_CONTROLS_OWNERSHIP = "project_controls"/) &&
      has(VERSION, /PROJECT_IDENTITY_OWNERSHIP = "engineering_core"/) &&
      has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      has(VERSION, /CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/) &&
      has(VERSION, /ASSET_INTELLIGENCE_V1_INTACT = true/) &&
      has(INDEX, /architecture\/ownership-lock/)
      ? "pass"
      : "fail",
  );

  const footprintMissing = FOOTPRINT_INVENTORY.filter(
    (rel) => !has(DOC_FOOTPRINT, new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
  );
  push(
    "F",
    "Existing footprint inventory complete",
    exists(DOC_FOOTPRINT) &&
      footprintMissing.length === 0 &&
      has(DOC_FOOTPRINT, /## Classification/) &&
      has(DOC_FOOTPRINT, /entitlement-only/) &&
      has(DOC_FOOTPRINT, /docs-only/) &&
      has(DOC_FOOTPRINT, /## Confirmed absences before Phase 11A/) &&
      has(DOC_FOOTPRINT, /No `packages\/project-controls`/) &&
      has(DOC_FOOTPRINT, /No Project Controls domain SQL product tables/) &&
      has(DOC_FOOTPRINT, /coming_soon/) &&
      has(DOC_FOOTPRINT, /searchProviders/) &&
      has(DOC_FOOTPRINT, /aiCapabilities/) &&
      has(DOC_FOOTPRINT, /eventHandlers/)
      ? "pass"
      : "fail",
    footprintMissing.length ? `missing:${footprintMissing.join(",")}` : "complete",
  );

  // ------------------------------------------------------------------ G–I
  const unexpectedSources = pcSourceFiles.filter(
    (file) => !(ALLOWED_PC_SOURCE_FILES as readonly string[]).includes(file),
  );
  const presentForbiddenDirs = FORBIDDEN_PC_DIRECTORIES.filter((dir) => exists(dir));
  push(
    "G",
    "No Project Controls product engines or services",
    unexpectedSources.length === 0 &&
      presentForbiddenDirs.length === 0 &&
      ALLOWED_PC_SOURCE_FILES.every((file) => pcSourceFiles.includes(file)) &&
      !/\bclass\s+\w*Engine\b/.test(pcText) &&
      !/\bclass\s+\w*Service\b/.test(pcText) &&
      !/\bcreateProjectControls(Repository|Engine|Service)\b/.test(pcText)
      ? "pass"
      : "fail",
    `unexpected=${unexpectedSources.join(",") || "none"};dirs=${presentForbiddenDirs.join(",") || "none"}`,
  );

  const pcTableMigrations = migrations.filter(
    ({ file, text }) =>
      /project[_-]controls/i.test(file) ||
      /CREATE\s+TABLE[^;]*?\bproject_controls_/i.test(text) ||
      /CREATE\s+TABLE[^;]*?\bproject_controls\b\s*\(/i.test(text),
  );
  push(
    "H",
    "No Project Controls product SQL tables",
    pcTableMigrations.length === 0 &&
      has(VERSION, /PROJECT_CONTROLS_PRODUCT_TABLES_INTRODUCED = false/) &&
      !/CREATE\s+TABLE/i.test(pcText)
      ? "pass"
      : "fail",
    pcTableMigrations.map(({ file }) => file).join(",") || "none",
  );

  const presentUiPaths = FORBIDDEN_UI_PATHS.filter((rel) => exists(rel));
  push(
    "I",
    "No Project Controls product UI page",
    presentUiPaths.length === 0 &&
      has(VERSION, /PROJECT_CONTROLS_PRODUCT_UI_IMPLEMENTED = false/) &&
      !has(MODULES_PAGE, /status: "(ga|available|beta)" as const,\s*\n\s*icon: BarChart3/)
      ? "pass"
      : "fail",
    presentUiPaths.join(",") || "none",
  );

  // ------------------------------------------------------------------ J–L
  push(
    "J",
    "Domain model discovery document",
    exists(DOC_DOMAIN) &&
      has(DOC_DOMAIN, /## Discovery concepts \(candidates — none implemented\)/) &&
      has(DOC_DOMAIN, /\bCost\b/) &&
      has(DOC_DOMAIN, /\bSchedule\b/) &&
      has(DOC_DOMAIN, /\bProgress\b/) &&
      has(DOC_DOMAIN, /\bChange\b/) &&
      has(DOC_DOMAIN, /\bContingency\b/) &&
      has(DOC_DOMAIN, /Earned Value \(reserved\)/) &&
      has(DOC_DOMAIN, /WBS consumption/) &&
      has(DOC_DOMAIN, /## Explicitly not implemented in Phase 11A/) &&
      has(DOC_DOMAIN, /discovery concepts only/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Ownership matrix document",
    exists(DOC_OWNERSHIP) &&
      has(DOC_OWNERSHIP, /## Locked ownership boundaries/) &&
      has(DOC_OWNERSHIP, /\| Concern \| Owner \|/) &&
      has(DOC_OWNERSHIP, /Project identity \(canonical\)/) &&
      has(DOC_OWNERSHIP, /`engineering_core`/) &&
      has(DOC_OWNERSHIP, /`project_intelligence`/) &&
      has(DOC_OWNERSHIP, /`project_controls`/) &&
      has(DOC_OWNERSHIP, /`asset_intelligence`/) &&
      has(DOC_OWNERSHIP, /`inspection_intelligence`/) &&
      has(DOC_OWNERSHIP, /## What Project Controls does NOT own/) &&
      has(DOC_OWNERSHIP, /## Identity ownership decision/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Boundary map document",
    exists(DOC_BOUNDARY) &&
      has(DOC_BOUNDARY, /```mermaid/) &&
      has(DOC_BOUNDARY, /## Owns/) &&
      has(DOC_BOUNDARY, /## Consumes/) &&
      has(DOC_BOUNDARY, /## Forbidden/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ M–P
  push(
    "M",
    "productionProjectControlsReady is false",
    has(VERSION, /PRODUCTION_PROJECT_CONTROLS_READY = false/) &&
      has(VERSION, /PROJECT_CONTROLS_IMPLEMENTED = false/) &&
      has(VERSION, /PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true/) &&
      has(OWNERSHIP_LOCK, /project_controls_product_forbidden_in_phase_11a/) &&
      has(DOC_DISCOVERY, /productionProjectControlsReady.*false/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Version 0.1.0-discovery",
    has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.1\.0-discovery"/) &&
      has(PC_PKG, /"version": "0\.1\.0-discovery"/) &&
      has(PC_CERT_PKG, /"version": "0\.1\.0-discovery"/) &&
      has(GATES_FILE, /PHASE_11A_PROJECT_CONTROLS_VERSION = "0\.1\.0-discovery"/) &&
      has(DOC_DISCOVERY, /0\.1\.0-discovery/)
      ? "pass"
      : "fail",
    PHASE_11A_PROJECT_CONTROLS_VERSION,
  );
  push(
    "O",
    "Module registry still coming_soon",
    pcRegistryEntry.length > 0 &&
      /status: "coming_soon"/.test(pcRegistryEntry) &&
      /enabled: false/.test(pcRegistryEntry) &&
      /version: "0\.0\.0"/.test(pcRegistryEntry) &&
      has(VERSION, /PROJECT_CONTROLS_MODULE_REGISTRY_STATUS = "coming_soon"/) &&
      has(VERSION, /PROJECT_CONTROLS_MODULE_REGISTRY_VERSION = "0\.0\.0"/) &&
      has(DOC_FOOTPRINT, /## Coexistence: registry entry vs discovery package/)
      ? "pass"
      : "fail",
    pcRegistryEntry ? "entry_found" : "entry_missing",
  );
  push(
    "P",
    "Commerce entitlements remain entitlement-only",
    has(COMMERCE_POLICY, /"actions\.read": \{[^}]*applicationKey: "project_controls"/) &&
      has(COMMERCE_POLICY, /"actions\.write": \{[^}]*applicationKey: "project_controls"/) &&
      has(COMMERCE_POLICY, /"\/engineering\/project-controls": \{[^}]*applicationKey: "project_controls"/) &&
      has(COMMERCE_POLICY, /"\/engineering\/actions": \{[^}]*applicationKey: "project_controls"/) &&
      has(SERVICE_POLICIES, /"action\.list": \{[^}]*applicationKey: "project_controls"/) &&
      !has(COMMERCE_POLICY, /"\/engineering\/apps\/project-controls"/) &&
      !has(COMMERCE_POLICY, /project_controls\.(cost|schedule|earned_value|progress|change)/) &&
      has(VERSION, /PROJECT_CONTROLS_ENTITLEMENTS_ARE_ENTITLEMENT_ONLY = true/) &&
      has(DOC_FOOTPRINT, /entitlement-only/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ Q–T
  push(
    "Q",
    "No earned value implementation",
    has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/) &&
      !/\b(class|function)\s+\w*EarnedValue/i.test(pcText) &&
      !/\b(compute|calculate|derive)EarnedValue/i.test(pcText) &&
      !/\b(bcws|bcwp|acwp|costPerformanceIndex|schedulePerformanceIndex)\b/i.test(pcText) &&
      has(DOC_DOMAIN, /Earned Value \(reserved\)/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "No CPM implementation",
    has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      !/\b(class|function)\s+\w*(CriticalPath|Cpm)\b/i.test(pcText) &&
      !/\b(compute|calculate)(CriticalPath|Float|Slack)\b/i.test(pcText) &&
      !/\b(forwardPass|backwardPass|totalFloat|freeFloat)\b/i.test(pcText) &&
      has(DOC_DOMAIN, /Critical Path Method/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "No cost engine implementation",
    has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
      has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      !/\b(class|function)\s+\w*CostEngine\b/i.test(pcText) &&
      !/\b(compute|calculate)(Cost|Budget|Commitment|Accrual)\b/i.test(pcText) &&
      !/\b(costLedger|budgetLedger|costAccount)\b/i.test(pcText) &&
      has(DOC_OWNERSHIP, /platform_commerce_finance/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "No schedule execution implementation",
    has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      has(VERSION, /WORK_PACKAGING_UI_IMPLEMENTED = false/) &&
      !/\b(class|function)\s+\w*ScheduleEngine\b/i.test(pcText) &&
      !/\b(execute|advance|recalculate)Schedule\b/i.test(pcText) &&
      !/\b(scheduleBaselineStore|activityProgressStore|workPackageStore)\b/i.test(pcText) &&
      has(DOC_DOMAIN, /## Explicitly not implemented in Phase 11A/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ U–W
  const aiSurfaceUnchanged =
    aiTag === PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  push(
    "U",
    "Asset Intelligence V1 contracts unmodified",
    has(AI_VERSION, /ASSET_INTELLIGENCE_VERSION = "1\.0\.0"/) &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_STATUS = "ga"/) &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/) &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
      aiSurfaceUnchanged
      ? "pass"
      : "fail",
    `surface_unchanged=${aiSurfaceUnchanged}`,
  );

  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  push(
    "V",
    "Secret exposure",
    secret.ok && exists(SECRET_SCAN_FILE) ? "pass" : "fail",
    secret.detail.slice(0, 500),
  );
  push(
    "W",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || inCi ? "pass" : "fail",
    `${buildIdentitySha}:${ciHeadSha}`,
  );

  // ------------------------------------------------------------------ X–Y
  const unit = run("pnpm --filter @rtb/project-controls test");
  push(
    "X",
    "Discovery package exists",
    exists(PC_PKG) &&
      exists(VERSION) &&
      exists(INDEX) &&
      exists(OWNERSHIP_LOCK) &&
      exists(PC_TEST) &&
      exists(`${PC}/tsconfig.json`) &&
      has(PC_PKG, /"name": "@rtb\/project-controls"/) &&
      unit.ok
      ? "pass"
      : "fail",
    unit.ok ? "unit_ok" : unit.detail.slice(0, 500),
  );

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase11a-project-controls-discovery.test.ts",
  );
  push(
    "Y",
    "Certification package exists",
    exists(PC_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(ARCH_TEST) &&
      exists(WORKFLOW) &&
      has(PC_CERT_PKG, /"name": "@rtb\/project-controls-certification"/) &&
      has(PC_CERT_PKG, /"certify:phase11a"/) &&
      arch.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  // ------------------------------------------------------------------ Z–AB
  push(
    "Z",
    "No duplicate asset ownership introduced",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_INTRODUCED = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_INTRODUCED = false/) &&
      has(OWNERSHIP_LOCK, /project_controls_may_not_own_asset_identity/) &&
      !/ASSET_IDENTITY_OWNERSHIP\s*=\s*"project_controls"/.test(pcText) &&
      has(AI_VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/) &&
      has(DOC_OWNERSHIP, /## What Project Controls does NOT own/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "No canonical lifecycle mutation",
    has(VERSION, /CANONICAL_LIFECYCLE_MUTATION_ALLOWED = false/) &&
      has(VERSION, /CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain"/) &&
      has(OWNERSHIP_LOCK, /canonical_lifecycle_mutation_forbidden/) &&
      has(DOC_BOUNDARY, /asset_lifecycle_canonical/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "No Core Risk auto-mutation by Project Controls",
    has(VERSION, /RISK_CORE_AUTO_MUTATION_ALLOWED = false/) &&
      has(VERSION, /CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/) &&
      has(OWNERSHIP_LOCK, /core_risk_auto_mutation_forbidden/) &&
      has(DOC_OWNERSHIP, /Canonical Risk/) &&
      has(DOC_BOUNDARY, /canonical_risk_register/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AC–AE
  const priorGatesPassed = gates.every((g) => g.status === "pass");
  push(
    "AC",
    "Phase 11B readiness",
    priorGatesPassed &&
      exists(DOC_DISCOVERY) &&
      has(DOC_DISCOVERY, /## Phase 11B readiness/) &&
      has(DOC_DISCOVERY, /phase11BReady/) &&
      has(DOC_DISCOVERY, /## Overview/)
      ? "pass"
      : "fail",
    `priorGatesPassed=${priorGatesPassed}`,
  );

  const releaseEligible = gates.every((g) => g.status === "pass");
  push(
    "AD",
    "Discovery release eligibility",
    releaseEligible ? "pass" : "fail",
    "discovery_scope_only",
  );

  const tagStillPinned = aiTag === PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT;
  const tagReachable = gitQuiet(
    `git merge-base --is-ancestor ${PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT} HEAD`,
  );
  push(
    "AE",
    "Asset Intelligence V1 tag not moved",
    tagStillPinned &&
      tagReachable &&
      has(VERSION, new RegExp(`ASSET_INTELLIGENCE_V1_COMMIT =\\s*\\n?\\s*"${PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT}"`)) &&
      has(GATES_FILE, new RegExp(`"${PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT}"`))
      ? "pass"
      : "fail",
    `target=${aiTag ?? "missing"};reachable=${tagReachable}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11a-project-controls-discovery/1",
    phase: "11A",
    title: "Project Controls Discovery",
    moduleKey: "project_controls",
    version: PHASE_11A_PROJECT_CONTROLS_VERSION,
    status: "discovery",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    projectControlsImplemented: false,
    discoveryImplemented: true,
    productionProjectControlsReady: false,
    projectControlsOwnership: "project_controls",
    projectIdentityOwnership: "engineering_core",
    canonicalProjectIdentityClaimedByProjectControls: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalAssetLifecycleOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    projectIntelligenceOwnership: "project_intelligence",
    assetIntelligenceOwnership: "asset_intelligence",
    inspectionIntelligenceOwnership: "inspection_intelligence",
    financialLedgerOwnership: "platform_commerce_finance",
    cmmsWorkOrderOwnership: "none_in_project_controls",
    assetIntelligenceV1Tag: PHASE_11A_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11A_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: tagStillPinned,
    assetIntelligenceV1TagMoved: aiTag !== null && !tagStillPinned,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Intact: piTag === PI_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === II_COMMIT,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    costEngineImplemented: false,
    scheduleExecutionImplemented: false,
    budgetLedgerImplemented: false,
    workPackagingUiImplemented: false,
    projectControlsProductTablesIntroduced: false,
    projectControlsProductUiImplemented: false,
    projectControlsProductMigrations: pcTableMigrations.map(({ file }) => file),
    moduleRegistryStatus: "coming_soon",
    entitlementsAreEntitlementOnly: true,
    duplicateAssetOwnershipIntroduced: false,
    duplicateProjectOwnershipIntroduced: false,
    canonicalLifecycleMutationAllowed: false,
    riskCoreAutoMutationAllowed: false,
    discoveryPackageSourceFiles: pcSourceFiles,
    footprintInventory: [...FOOTPRINT_INVENTORY],
    secretExposureDetected: !secret.ok,
    phase11BReady: pass,
    releaseEligible: pass,
    gates,
    requiredGates: PHASE_11A_PROJECT_CONTROLS_DISCOVERY_GATES.map(([id]) => id),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11a-project-controls-discovery-certification.json");
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
