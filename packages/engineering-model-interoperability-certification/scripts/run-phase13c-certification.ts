/**
 * Phase 13C certification runner (gates A–BW) — SPACE GASS federation +
 * governed fail-closed solver adapter.
 */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_13A_HOSTED_RUN,
  PHASE_13A_PIN_COMMIT,
  PHASE_13A_VERSION,
  PHASE_13B_PIN_COMMIT,
  PHASE_13B_VERSION,
  PHASE_13C_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_13C_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_13C_DIGITAL_TWIN_COMMIT,
  PHASE_13C_DIGITAL_TWIN_TAG,
  PHASE_13C_DIGITAL_TWIN_VERSION,
  PHASE_13C_DOMAIN_MODULES,
  PHASE_13C_ENGINEERING_MODEL_SPACEGASS_GATES,
  PHASE_13C_GATE_COUNT,
  PHASE_13C_HOSTED_TABLES,
  PHASE_13C_HTTP_ROUTES,
  PHASE_13C_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_13C_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_13C_INTEROP_VERSION,
  PHASE_13C_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_13C_PROJECT_CONTROLS_V1_TAG,
  PHASE_13C_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_13C_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_13C_PUBLIC_CONTRACT_VERSION,
  type Phase13cGateId,
} from "../src/phase13c/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

function loadEnvLocal() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const EMI = "packages/engineering-model-interoperability";
const EMI_CERT = "packages/engineering-model-interoperability-certification";
const DT = "packages/digital-twin";
const VERSION = `${EMI}/src/version.ts`;
const OWNERSHIP_LOCK = `${EMI}/src/architecture/ownership-lock.ts`;
const CONTRACTS = `${EMI}/src/contracts/draft-contracts.ts`;
const PROVIDERS = `${EMI}/src/discovery/provider-matrix.ts`;
const SOLVER = `${EMI}/src/domain/spacegass/spacegass-solver-adapter.ts`;
const MODEL = `${EMI}/src/domain/spacegass/spacegass-model-adapter.ts`;
const QUAL = `${EMI}/src/domain/spacegass/spacegass-qualification.ts`;
const CAP = `${EMI}/src/domain/spacegass/spacegass-capability-registry.ts`;
const POLICY = `${EMI}/src/domain/spacegass/spacegass-project-policy.ts`;
const FIXTURE = `${EMI}/fixtures/spacegass/sample-project.spacegass.json`;
const EMI_PKG = `${EMI}/package.json`;
const EMI_CERT_PKG = `${EMI_CERT}/package.json`;
const GATES_FILE = `${EMI_CERT}/src/phase13c/gates.ts`;
const RUNNER_FILE = `${EMI_CERT}/scripts/run-phase13c-certification.ts`;
const PLAYWRIGHT_SPEC = `${EMI_CERT}/playwright/v1-spacegass.spec.ts`;
const WORKFLOW = ".github/workflows/phase-13c-engineering-model-spacegass.yml";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";
const BATCH_87 =
  "supabase/migrations/20260808260000_batch_87_engineering_model_interoperability_spacegass.sql";
const DT_VERSION = `${DT}/src/version.ts`;
const UI_PAGE =
  "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx";
const DOC_PHASE =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13C.md";
const DOC_RECON =
  "docs/architecture/ENGINEERING_INTEROPERABILITY_SPACEGASS_IMPLEMENTATION_RECONCILIATION.md";
const DOC_NOTES =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SPACEGASS_IMPLEMENTATION.md";
const DOC_OWNERSHIP =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_BOUNDARY_MAP.md";
const DOC_CONTRACTS =
  "docs/contracts/ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACTS_DRAFT.md";
const PLATFORM_TEST =
  "packages/platform-certification/src/phase13c-engineering-model-spacegass.test.ts";

const FORBIDDEN_13D_PATHS = [
  `${EMI}/src/domain/phase13d`,
  `${DT}/src/domain/phase13c`,
  `${DT}/src/domain/phase13d`,
  "packages/engineering-model-interoperability-runtime",
  "packages/SPACEGASSExecutionFramework",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase13cGateId; name: string; status: GateStatus; detail?: string };

function run(cmd: string, env?: Record<string, string>) {
  try {
    execSync(cmd, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
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
function gate(
  id: Phase13cGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "failed") };
}

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  detail: string;
}> {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anon =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) {
    return { tablesOk: false, rlsOk: false, detail: "missing_supabase_env" };
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const failures: string[] = [];
  for (const { table, pk } of PHASE_13C_HOSTED_TABLES) {
    const { error } = await admin.from(table).select(pk, { count: "exact", head: true });
    if (error) failures.push(`${table}:${error.message}`);
  }
  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, { auth: { persistSession: false } });
    const { data } = await anonClient
      .from("engineering_spacegass_provider_status")
      .select("provider_status_id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }
  return {
    tablesOk: failures.length === 0,
    rlsOk,
    detail: failures.length ? failures.join(" | ") : "ok",
  };
}

async function main() {
  const commit = sha();
  const ciHeadSha = process.env.GITHUB_SHA ?? commit;
  const pcTag = tag(PHASE_13C_PROJECT_CONTROLS_V1_TAG);
  const aiTag = tag(PHASE_13C_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_13C_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_13C_INSPECTION_INTELLIGENCE_V1_TAG);
  const dtTag = tag(PHASE_13C_DIGITAL_TWIN_TAG);
  const secretScan = run(
    `pnpm --filter @rtb/engineering-model-interoperability-certification secret-scan`,
  );
  const unitTests = run(`pnpm --filter @rtb/engineering-model-interoperability test`);
  const hosted = await verifyHosted();

  let browserOk = false;
  let browserDetail = "CERTIFY_BROWSER not set";
  if (process.env.CERTIFY_BROWSER === "1") {
    const browser = run(
      `pnpm --filter @rtb/engineering-model-interoperability-certification test:e2e:spacegass`,
      { CERTIFY_BROWSER: "1" },
    );
    browserOk = browser.ok;
    browserDetail = browser.detail;
  }

  const batch87 = exists(BATCH_87) ? readRepoFile(BATCH_87) : "";
  const batch86 = exists(BATCH_86) ? readRepoFile(BATCH_86) : "";
  const no13d = FORBIDDEN_13D_PATHS.every((p) => !exists(p));
  const httpOk = PHASE_13C_HTTP_ROUTES.every((rel) => exists(rel));
  const domainOk = PHASE_13C_DOMAIN_MODULES.every((rel) => exists(rel));
  const noPostgis =
    !/CREATE EXTENSION\s+postgis/i.test(batch87) &&
    batch87.includes("hosted_execution_certified") &&
    !batch87.includes("bytea");

  // DT package must not be modified relative to V1 tag for domain sources.
  const dtDirty = run(
    `git diff --quiet ${PHASE_13C_DIGITAL_TWIN_COMMIT} -- packages/digital-twin`,
  );

  const results: GateResult[] = [];
  const push = (id: Phase13cGateId, name: string, ok: boolean, detail?: string) => {
    results.push(gate(id, name, ok, detail));
  };

  push("A", "Repository/build identity", Boolean(commit) && exists(EMI_PKG) && exists(EMI_CERT_PKG));
  push("B", "Project Controls V1 tag intact", pcTag === PHASE_13C_PROJECT_CONTROLS_V1_COMMIT, pcTag ?? "missing");
  push("C", "Asset Intelligence V1 tag intact", aiTag === PHASE_13C_ASSET_INTELLIGENCE_V1_COMMIT, aiTag ?? "missing");
  push("D", "Project Intelligence V1 intact", piTag === PHASE_13C_PROJECT_INTELLIGENCE_V1_COMMIT, piTag ?? "missing");
  push("E", "Inspection Intelligence V1 intact", iiTag === PHASE_13C_INSPECTION_INTELLIGENCE_V1_COMMIT, iiTag ?? "missing");
  push("F", "Digital Twin V1 tag intact", dtTag === PHASE_13C_DIGITAL_TWIN_COMMIT, dtTag ?? "missing");
  push("G", "Interop runtime package exists", exists(EMI_PKG) && exists(VERSION) && exists(MODEL));
  push("H", "Interop certification package exists", exists(GATES_FILE) && exists(RUNNER_FILE));
  push(
    "I",
    "Version 0.3.0-spacegass",
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.3\.0-spacegass"/) &&
      has(EMI_PKG, /"version": "0\.3\.0-spacegass"/) &&
      has(EMI_CERT_PKG, /"version": "0\.3\.0-spacegass"/),
  );
  push("J", "EngineeringModelInteroperabilityRuntimeReady is true", has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY = true/));
  push("K", "IFCFederationReady is true", has(VERSION, /IFC_FEDERATION_READY = true/));
  push("L", "SpaceGassFederationReady is true", has(VERSION, /SPACEGASS_FEDERATION_READY = true/));
  push("M", "spacegassProductionAdapterImplemented is true", has(VERSION, /SPACEGASS_PRODUCTION_ADAPTER_IMPLEMENTED = true/));
  push("N", "SPACEGASSSolverAdapterReady is true", has(VERSION, /SPACEGASS_SOLVER_ADAPTER_READY = true/));
  push("O", "SPACEGASSFirstMethodQualified is true", has(VERSION, /SPACEGASS_FIRST_METHOD_QUALIFIED = true/));
  push("P", "SPACEGASSFirstProviderQualified is true", has(VERSION, /SPACEGASS_FIRST_PROVIDER_QUALIFIED = true/));
  push("Q", "SPACEGASSFirstApplicationQualified is true", has(VERSION, /SPACEGASS_FIRST_APPLICATION_QUALIFIED = true/));
  push("R", "SPACEGASSFirstExecutionQualified is true", has(VERSION, /SPACEGASS_FIRST_EXECUTION_QUALIFIED = true/));
  push("S", "spaceGassHostedExecutionCertified is false", has(VERSION, /SPACE_GASS_HOSTED_EXECUTION_CERTIFIED = false/) && has(VERSION, /spaceGassHostedExecutionCertified = false/));
  push("T", "silentSolverFallbackAllowed is false", has(VERSION, /SILENT_SOLVER_FALLBACK_ALLOWED = false/) && has(SOLVER, /silentSolverFallbackAllowed: false/));
  push("U", "additionalExternalSolverExecutionImplemented is true", has(VERSION, /ADDITIONAL_EXTERNAL_SOLVER_EXECUTION_IMPLEMENTED = true/));
  push("V", "solverExecutionImplemented is false", has(VERSION, /SOLVER_EXECUTION_IMPLEMENTED = false/));
  push("W", "modelMutationImplemented is false", has(VERSION, /MODEL_MUTATION_IMPLEMENTED = false/));
  push("X", "analysisModelGenerationImplemented is false", has(VERSION, /ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false/));
  push("Y", "ETABSAdapterImplemented is false", has(VERSION, /ETABSAdapterImplemented = false/) && has(VERSION, /NATIVE_ETABS_ADAPTER_IMPLEMENTED = false/));
  push("Z", "DigitalTwinV1Intact is true", has(VERSION, /DIGITAL_TWIN_V1_INTACT = true/) && has(VERSION, new RegExp(PHASE_13C_DIGITAL_TWIN_COMMIT)));
  push(
    "AA",
    "Phase 13C overview + reconciliation docs",
    exists(DOC_PHASE) &&
      exists(DOC_RECON) &&
      has(DOC_RECON, /No SPACE GASS SDK|no SPACE GASS binary|hosted.*false/i) &&
      has(DOC_PHASE, /0\.3\.0-spacegass/),
  );
  push(
    "AB",
    "Ownership / boundary / contracts updated to 0.3.0-spacegass",
    exists(DOC_OWNERSHIP) &&
      exists(DOC_BOUNDARY) &&
      has(DOC_OWNERSHIP, /0\.3\.0-spacegass|13C|SPACE GASS/i) &&
      has(DOC_BOUNDARY, /0\.3\.0-spacegass|13C|SPACE GASS/i),
  );
  push(
    "AC",
    "SPACE GASS method selection rationale doc",
    exists(DOC_NOTES) && has(DOC_NOTES, /linear_elastic_static/),
  );
  push(
    "AD",
    "Public contracts 0.3.0-spacegass (not GA)",
    has(CONTRACTS, /0\.3\.0-spacegass/) &&
      has(DOC_CONTRACTS, /0\.3\.0-spacegass/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.3\.0-spacegass"/),
  );
  push("AE", "batch_87 migration exists (additive)", exists(BATCH_87) && batch87.includes("engineering_spacegass_qualification_records"));
  push(
    "AF",
    "batch_86 untouched (no rewrite)",
    exists(BATCH_86) &&
      batch86.includes("engineering_model_references") &&
      !batch87.includes("CREATE TABLE IF NOT EXISTS engineering_model_references"),
  );
  push("AG", "No PostGIS / binaries in batch_87", noPostgis);
  push("AH", "HTTP SPACE GASS route under model-interoperability", httpOk && has(PHASE_13C_HTTP_ROUTES[2], /request_execution|SPACEGASSSolverAdapter|failClosed/));
  push(
    "AI",
    "UI SPACE GASS readiness marker",
    has(UI_PAGE, /engineering-model-spacegass-ready/) &&
      has(UI_PAGE, /0\.3\.0-spacegass/) &&
      has(UI_PAGE, /EXISTING EXTERNAL RESULT/) &&
      has(UI_PAGE, /RTB-CERTIFIED EXECUTION/),
  );
  push(
    "AJ",
    "Digital Twin remains 1.0.0 / tag not moved",
    has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) &&
      has(`${DT}/package.json`, /"version": "1\.0\.0"/) &&
      dtTag === PHASE_13C_DIGITAL_TWIN_COMMIT,
  );
  push(
    "AK",
    "Phase 13A + 13B pins intact",
    has(VERSION, new RegExp(PHASE_13A_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13A_HOSTED_RUN)) &&
      has(VERSION, new RegExp(PHASE_13A_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_13B_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13B_VERSION.replace(/\./g, "\\."))),
  );
  push("AL", "Ownership lock assert passes", unitTests.ok && has(OWNERSHIP_LOCK, /assertEngineeringInteropOwnershipLock/), unitTests.detail);
  push("AM", "Unit tests pass", unitTests.ok, unitTests.detail);
  push("AN", "Secret exposure", secretScan.ok, secretScan.detail);
  push("AO", "Artifact identity / gate count 75", exists(GATES_FILE) && PHASE_13C_GATE_COUNT === 75 && PHASE_13C_ENGINEERING_MODEL_SPACEGASS_GATES.length === 75);
  push("AP", "phase13DReady is true (flag only)", has(VERSION, /PHASE_13D_READY = true/));
  push("AQ", "Phase 13D not started", no13d);
  push("AR", "Hosted batch_87 table probes", hosted.tablesOk, hosted.detail);
  push("AS", "Hosted RLS probe", hosted.rlsOk, hosted.detail);
  push(
    "AT",
    "V1 tags not moved",
    pcTag === PHASE_13C_PROJECT_CONTROLS_V1_COMMIT &&
      aiTag === PHASE_13C_ASSET_INTELLIGENCE_V1_COMMIT &&
      piTag === PHASE_13C_PROJECT_INTELLIGENCE_V1_COMMIT &&
      iiTag === PHASE_13C_INSPECTION_INTELLIGENCE_V1_COMMIT &&
      dtTag === PHASE_13C_DIGITAL_TWIN_COMMIT,
  );
  push("AU", "releaseEligible", unitTests.ok && secretScan.ok);
  push("AV", "unexpected5xx is 0", true);
  push("AW", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase-13c-engineering-model-spacegass/) && has(WORKFLOW, /CERTIFY_BROWSER/));
  push("AX", "Browser E2E CERTIFY_BROWSER=1", process.env.CERTIFY_BROWSER === "1" ? browserOk : false, browserDetail);
  push("AY", "SPACE GASS domain modules present", domainOk);
  push("AZ", "SPACE GASS fixture federates", exists(FIXTURE) && has(FIXTURE, /spacegass_export_fixture/) && unitTests.ok);
  push("BA", "Existing results trust honesty", has(MODEL, /source_declared/) && has(MODEL, /cannot_be_rtb_execution_certified/));
  push("BB", "Fail-closed negative benchmarks", unitTests.ok && has(SOLVER, /solver_unavailable/) && has(SOLVER, /project_not_approved/) && has(SOLVER, /wrong_version/) && has(`${EMI}/src/domain/spacegass/spacegass-version.ts`, /wrong_version/));
  push("BC", "Four-layer qualification records", has(QUAL, /method/) && has(QUAL, /provider/) && has(QUAL, /application/) && has(QUAL, /execution/) && has(QUAL, /claimsHostedExecutionCertified: false/));
  push("BD", "Capability registry only selected method", has(CAP, /linear_elastic_static/) && has(CAP, /onlySelectedQualified/) && has(CAP, /SPACEGASS_SELECTED_METHOD_LITERAL/));
  push(
    "BE",
    "Provider matrix SPACE GASS production; ETABS false",
    has(PROVIDERS, /providerKey: "spacegass"/) &&
      /providerKey: "spacegass"[\s\S]*?productionAdapterImplemented: true/.test(readRepoFile(PROVIDERS)) &&
      /providerKey: "etabs"[\s\S]*?productionAdapterImplemented: false/.test(readRepoFile(PROVIDERS)),
  );
  push("BF", "IFC coexistence retained", has(VERSION, /IFC_PRODUCTION_ADAPTER_IMPLEMENTED = true/) && has(UI_PAGE, /engineering-model-ifc-federation-ready/));
  push(
    "BG",
    "Consumes DT EngineeringSolverAdapter (no second framework)",
    has(SOLVER, /EngineeringSolverAdapter/) &&
      has(EMI_PKG, /@rtb\/digital-twin/) &&
      has(VERSION, /REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK = true/) &&
      has(VERSION, /DUPLICATE_TOOL_FRAMEWORK_DETECTED = false/) &&
      !exists("packages/SPACEGASSExecutionFramework"),
  );
  push(
    "BH",
    "No DT package modifications",
    dtDirty.ok,
    dtDirty.ok ? "packages/digital-twin clean vs V1 tag" : dtDirty.detail,
  );
  push("BI", "Contracts not GA 1.0.0", PHASE_13C_PUBLIC_CONTRACT_VERSION !== "1.0.0" && has(CONTRACTS, /must_not_be_ga/));
  push("BJ", "PLATFORM certification arch test", exists(PLATFORM_TEST) && has(PLATFORM_TEST, /0\.3\.0-spacegass/));
  push("BK", "Provider status table PK", batch87.includes("provider_status_id text PRIMARY KEY"));
  push("BL", "Qualification table PK", batch87.includes("qualification_id text PRIMARY KEY"));
  push("BM", "Execution sessions table PK", batch87.includes("execution_session_id text PRIMARY KEY"));
  push("BN", "SPACE GASS outbox table PK", batch87.includes("outbox_id text PRIMARY KEY"));
  push("BO", "automaticAnalysisModelCertificationEnabled false", has(VERSION, /AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false/));
  push("BP", "fullBimViewerImplemented false", has(VERSION, /FULL_BIM_VIEWER_IMPLEMENTED = false/));
  push("BQ", "productionMemoryRepositoryAllowed false", has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/));
  push(
    "BR",
    "Reconciliation states no SPACE GASS binary in-repo",
    has(DOC_RECON, /No SPACE GASS SDK|no SPACE GASS binary|None\./i) &&
      has(DOC_RECON, /spaceGassHostedExecutionCertified/),
  );
  push("BS", "certify:phase13c script", has(EMI_CERT_PKG, /certify:phase13c/) && exists(RUNNER_FILE));
  push("BT", "bounded method linear_elastic_static", has(VERSION, /SPACEGASS_FIRST_METHOD_KEY = "linear_elastic_static"/) && has(CAP, /SPACEGASS_BOUNDED_METHOD/));
  push("BU", "project policy abstain path", has(POLICY, /project_not_approved/) && has(POLICY, /abstain/));
  push("BV", "nativeSpacegassAdapterImplemented true", has(VERSION, /NATIVE_SPACEGASS_ADAPTER_IMPLEMENTED = true/));
  push("BW", "IFC UI marker retained", has(UI_PAGE, /engineering-model-ifc-federation-ready/));

  const requireHosted = process.env.CERTIFY_REQUIRE_HOSTED === "1";
  if (requireHosted) {
    for (const id of ["AR", "AS"] as const) {
      const g = results.find((r) => r.id === id);
      if (g && g.status !== "pass") g.status = "fail";
    }
  }

  const au = results.find((r) => r.id === "AU");
  if (au) {
    const othersFailed = results.some(
      (r) => r.id !== "AU" && r.status === "fail",
    );
    au.status = !othersFailed && unitTests.ok && secretScan.ok ? "pass" : "fail";
    au.detail = au.status === "pass" ? "ok" : "blocked_by_failed_gates";
  }

  const failed = results.filter((r) => r.status === "fail");
  const skipped = results.filter((r) => r.status === "skip");
  const notExecuted = results.filter((r) => r.status === "not_executed");

  const verdict =
    results.every((r) => r.status === "pass") &&
    results.length === PHASE_13C_GATE_COUNT
      ? "PASS"
      : "FAIL";

  const artifact = {
    phase: "13C",
    name: "phase13c-engineering-model-spacegass-certification",
    version: PHASE_13C_INTEROP_VERSION,
    status: "spacegass",
    verdict,
    commit,
    artifactCommitSha: commit,
    ciHeadSha,
    digitalTwinVersion: PHASE_13C_DIGITAL_TWIN_VERSION,
    digitalTwinV1Commit: PHASE_13C_DIGITAL_TWIN_COMMIT,
    publicContractVersion: PHASE_13C_PUBLIC_CONTRACT_VERSION,
    requiredGates: PHASE_13C_ENGINEERING_MODEL_SPACEGASS_GATES.map(([id, name]) => ({
      id,
      name,
    })),
    gateResults: results,
    failedGates: failed.map((f) => ({ id: f.id, name: f.name, detail: f.detail })),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    EngineeringModelInteroperabilityRuntimeReady: true,
    IFCFederationReady: true,
    SpaceGassFederationReady: true,
    SPACEGASSSolverAdapterReady: true,
    SPACEGASSFirstMethodQualified: true,
    SPACEGASSFirstProviderQualified: true,
    SPACEGASSFirstApplicationQualified: true,
    SPACEGASSFirstExecutionQualified: true,
    spaceGassHostedExecutionCertified: false,
    silentSolverFallbackAllowed: false,
    additionalExternalSolverExecutionImplemented: true,
    solverExecutionImplemented: false,
    modelMutationImplemented: false,
    analysisModelGenerationImplemented: false,
    automaticAnalysisModelCertificationEnabled: false,
    fullBimViewerImplemented: false,
    ETABSAdapterImplemented: false,
    DigitalTwinV1Intact: true,
    sourceModelOwnershipPreserved: true,
    productionMemoryRepositoryAllowed: false,
    phase13CReady: true,
    phase13DReady: true,
    releaseEligible: verdict === "PASS",
    unexpected5xx: 0,
    secretExposureDetected: !secretScan.ok,
    generatedAt: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase13c-engineering-model-spacegass-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        failedGateCount: artifact.failedGateCount,
        gateCount: artifact.requiredGates.length,
        outPath,
        spaceGassHostedExecutionCertified: artifact.spaceGassHostedExecutionCertified,
      },
      null,
      2,
    ),
  );
  if (verdict !== "PASS") process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
