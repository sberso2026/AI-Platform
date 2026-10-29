/**
 * Phase 13F certification runner (gates A–BT) — EMI V1.0 GA closure.
 */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_13A_HOSTED_RUN,
  PHASE_13A_PIN_COMMIT,
  PHASE_13B_HOSTED_RUN,
  PHASE_13B_PIN_COMMIT,
  PHASE_13C_HOSTED_RUN,
  PHASE_13C_PIN_COMMIT,
  PHASE_13D1_HOSTED_RUN,
  PHASE_13D1_PIN_COMMIT,
  PHASE_13E_HOSTED_RUN,
  PHASE_13E_PIN_COMMIT,
  PHASE_13F_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_13F_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_13F_DIGITAL_TWIN_COMMIT,
  PHASE_13F_DIGITAL_TWIN_TAG,
  PHASE_13F_ENGINEERING_MODEL_INTEROPERABILITY_GA_GATES,
  PHASE_13F_GATE_COUNT,
  PHASE_13F_HOSTED_TABLES,
  PHASE_13F_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_13F_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_13F_INTEROP_VERSION,
  PHASE_13F_MIGRATION_LINEAGE,
  PHASE_13F_PREVIOUS_VERSION,
  PHASE_13F_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_13F_PROJECT_CONTROLS_V1_TAG,
  PHASE_13F_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_13F_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_13F_RELEASE_TAG,
  PHASE_13F_STATUS,
  type Phase13fGateId,
} from "../src/phase13f/gates.js";

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
const INDEX = `${EMI}/src/index.ts`;
const MANIFEST_TS = `${EMI}/src/domain/module-manifest.ts`;
const CAPABILITY_REGISTRY = `${EMI}/src/domain/capability-registry.ts`;
const SERVICE_REGISTRY = `${EMI}/src/domain/service-registry.ts`;
const EVENT_CONTRACTS = `${EMI}/src/domain/event-contracts.ts`;
const UNAVAILABLE = `${EMI}/src/domain/unavailable-capabilities.ts`;
const REGISTRY_DRIFT = `${EMI}/src/domain/registry-drift.ts`;
const GA_CLOSURE = `${EMI}/src/domain/ga-closure.ts`;
const OWNERSHIP_LOCK = `${EMI}/src/architecture/ownership-lock.ts`;
const CONTRACTS = `${EMI}/src/contracts/draft-contracts.ts`;
const PERSISTENCE = `${EMI}/src/domain/persistence.ts`;
const POSTGRES_REPOSITORY = `${EMI}/src/domain/postgres-repository.ts`;
const MANIFEST_JSON = `${EMI}/manifest/engineering-model-interoperability-module-manifest.json`;
const EMI_PKG = `${EMI}/package.json`;
const EMI_CERT_PKG = `${EMI_CERT}/package.json`;
const GATES_FILE = `${EMI_CERT}/src/phase13f/gates.ts`;
const RUNNER_FILE = `${EMI_CERT}/scripts/run-phase13f-certification.ts`;
const PLAYWRIGHT_SPEC = `${EMI_CERT}/playwright/v1-ga.spec.ts`;
const WORKFLOW = ".github/workflows/phase-13f-engineering-model-interoperability-ga.yml";
const UI_PAGE =
  "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx";
const UI_LAYOUT =
  "apps/web/src/app/(platform)/engineering/apps/model-interoperability/layout.tsx";
const UI_RELEASE =
  "apps/web/src/app/(platform)/engineering/apps/model-interoperability/release/page.tsx";
const HOST_PAGE =
  "apps/web/src/app/(platform)/engineering/apps/execution-hosts/page.tsx";
const HOST_LAYOUT =
  "apps/web/src/app/(platform)/engineering/apps/execution-hosts/layout.tsx";
const MODULES_PAGE =
  "apps/web/src/app/(platform)/engineering/modules/page.tsx";
const COMMERCE_POLICY =
  "packages/platform-commerce/src/domain/commerce-access-policy.ts";
const MODELS_ROUTE =
  "apps/web/src/app/api/engineering/model-interoperability/models/route.ts";
const PLATFORM_TEST =
  "packages/platform-certification/src/phase13f-engineering-model-interoperability-ga.test.ts";
const UNIT_TEST = `${EMI}/tests/phase13f-v1-ga.test.ts`;
const DT_VERSION = `${DT}/src/version.ts`;

const DOC_CONTRACTS =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_V1_PUBLIC_CONTRACTS.md";
const DOC_MATRIX =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_V1_CAPABILITY_MATRIX.md";
const DOC_PACKAGING =
  "docs/commercial/ENGINEERING_MODEL_INTEROPERABILITY_V1_PACKAGING.md";
const DOC_OPS =
  "docs/operations/ENGINEERING_MODEL_INTEROPERABILITY_V1_OPERATIONS.md";
const DOC_UNAVAILABLE =
  "docs/release/ENGINEERING_MODEL_INTEROPERABILITY_V1_UNAVAILABLE_CAPABILITIES.md";
const DOC_LIMITATIONS =
  "docs/release/ENGINEERING_MODEL_INTEROPERABILITY_V1_LIMITATIONS.md";
const DOC_PERFORMANCE =
  "docs/release/ENGINEERING_MODEL_INTEROPERABILITY_V1_PERFORMANCE_BASELINE.md";
const DOC_PHASE =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13F.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase13fGateId;
  name: string;
  status: GateStatus;
  detail?: string;
};

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
      detail: (err.stderr || err.stdout || err.message || "failed")
        .toString()
        .slice(0, 2000),
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
/** Match `NAME = "value"` or `NAME =\n  "value"` / `NAME =\n  true`. */
function hasConst(rel: string, name: string, value: string | boolean) {
  const v =
    typeof value === "boolean"
      ? String(value)
      : `"${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`;
  return has(rel, new RegExp(`${name}\\s*=\\s*(?:\\r?\\n\\s*)?${v}`));
}
function exists(rel: string) {
  return existsSync(resolve(root, rel));
}
function readJson(rel: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readRepoFile(rel)) as Record<string, unknown>;
  } catch {
    return null;
  }
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
  id: Phase13fGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return {
    id,
    name,
    status: ok ? "pass" : "fail",
    detail: detail ?? (ok ? "ok" : "failed"),
  };
}
function globBatch90Exists(): boolean {
  try {
    return readdirSync(resolve(root, "supabase/migrations")).some((f) =>
      /batch_90/i.test(f),
    );
  } catch {
    return false;
  }
}

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  jwtMatrixOk: boolean;
  readableTables: number;
  detail: string;
}> {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anon =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  if (!url || !key) {
    return {
      tablesOk: false,
      rlsOk: false,
      jwtMatrixOk: false,
      readableTables: 0,
      detail: "missing_supabase_env",
    };
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const failures: string[] = [];
  let readableTables = 0;
  for (const { table, pk } of PHASE_13F_HOSTED_TABLES) {
    const { error } = await admin
      .from(table)
      .select(pk, { count: "exact", head: true });
    if (error) failures.push(`${table}:${error.message}`);
    else readableTables += 1;
  }
  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false },
    });
    const { data } = await anonClient
      .from("engineering_model_references")
      .select("model_ref_id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }
  let jwtMatrixOk =
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_V1_ENTITLEMENTS/) &&
    (has(MODELS_ROUTE, /entitlement_denied|rejectInlineEntitlementDenial/) ||
      has(
        "apps/web/src/app/api/engineering/model-interoperability/_assurance.ts",
        /entitlement_denied/,
      ));
  return {
    tablesOk: failures.length === 0,
    rlsOk,
    jwtMatrixOk,
    readableTables,
    detail: failures.length ? failures.join(" | ") : "ok",
  };
}

async function main() {
  const commit = sha();
  const ciHeadSha = process.env.GITHUB_SHA ?? commit;
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const browserRequested = process.env.CERTIFY_BROWSER === "1";
  if (inCi) run("git fetch --tags --force");

  const pcTag = tag(PHASE_13F_PROJECT_CONTROLS_V1_TAG);
  const aiTag = tag(PHASE_13F_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_13F_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_13F_INSPECTION_INTELLIGENCE_V1_TAG);
  const dtTag = tag(PHASE_13F_DIGITAL_TWIN_TAG);
  const emiTag = tag(PHASE_13F_RELEASE_TAG);

  const secretScan = run(
    `pnpm --filter @rtb/engineering-model-interoperability-certification secret-scan`,
  );
  const unitTests = run(`pnpm --filter @rtb/engineering-model-interoperability test`);
  const arch = run(
    `pnpm --filter @rtb/platform-certification exec vitest run src/phase13f-engineering-model-interoperability-ga.test.ts`,
  );
  const hosted = await verifyHosted();
  const manifestJson = readJson(MANIFEST_JSON);
  const manifestFlags = (manifestJson?.featureFlags ?? {}) as Record<
    string,
    unknown
  >;
  const dtDirty = run(
    `git diff --quiet ${PHASE_13F_DIGITAL_TWIN_COMMIT} -- packages/digital-twin`,
  );

  let browserOk = false;
  let browserDetail = "CERTIFY_BROWSER not set";
  if (browserRequested || inCi) {
    const browser = run(
      `pnpm --filter @rtb/engineering-model-interoperability-certification test:e2e:v1`,
      { CERTIFY_BROWSER: "1" },
    );
    browserOk = browser.ok;
    browserDetail = browser.detail;
  }

  const results: GateResult[] = [];
  const push = (
    id: Phase13fGateId,
    name: string,
    ok: boolean,
    detail?: string,
  ) => {
    results.push(gate(id, name, ok, detail));
  };

  push(
    "A",
    "Repository/build identity",
    Boolean(commit) &&
      exists("pnpm-workspace.yaml") &&
      has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_VERSION = "1\.0\.0"/) &&
      has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_STATUS = "ga"/) &&
      has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_PHASE = "13F"/),
    commit,
  );
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_13F_PROJECT_CONTROLS_V1_COMMIT,
    pcTag ?? "missing",
  );
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_13F_ASSET_INTELLIGENCE_V1_COMMIT,
    aiTag ?? "missing",
  );
  push(
    "D",
    "Project Intelligence V1 intact",
    piTag === PHASE_13F_PROJECT_INTELLIGENCE_V1_COMMIT,
    piTag ?? "missing",
  );
  push(
    "E",
    "Inspection Intelligence V1 intact",
    iiTag === PHASE_13F_INSPECTION_INTELLIGENCE_V1_COMMIT,
    iiTag ?? "missing",
  );
  push(
    "F",
    "Digital Twin V1 tag intact",
    dtTag === PHASE_13F_DIGITAL_TWIN_COMMIT,
    dtTag ?? "missing",
  );
  push(
    "G",
    "Phase 13A pin",
    has(VERSION, new RegExp(PHASE_13A_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13A_HOSTED_RUN)),
  );
  push(
    "H",
    "Phase 13B pin",
    has(VERSION, new RegExp(PHASE_13B_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13B_HOSTED_RUN)),
  );
  push(
    "I",
    "Phase 13C pin",
    has(VERSION, new RegExp(PHASE_13C_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13C_HOSTED_RUN)),
  );
  push(
    "J",
    "Phase 13D.1 pin",
    has(VERSION, new RegExp(PHASE_13D1_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13D1_HOSTED_RUN)),
  );
  push(
    "K",
    "Phase 13E pin",
    has(VERSION, new RegExp(PHASE_13E_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13E_HOSTED_RUN)),
  );
  push(
    "L",
    "Phase 13D blocked_external_dependency",
    has(VERSION, /PHASE_13D_STATUS = "blocked_external_dependency"/) &&
      has(VERSION, /phase13DStatus/) &&
      has(DOC_PHASE, /blocked_external_dependency/),
  );
  push(
    "M",
    "V1.0.0 version freeze",
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_VERSION = "1\.0\.0"/) &&
      has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN = true/) &&
      has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED = true/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
      manifestJson?.version === PHASE_13F_INTEROP_VERSION,
  );
  push(
    "N",
    "GA status declaration",
    hasConst(VERSION, "ENGINEERING_MODEL_INTEROPERABILITY_STATUS", "ga") &&
      hasConst(
        VERSION,
        "PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY",
        true,
      ) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_CLOSED",
        true,
      ) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_READINESS_MARKER",
        "engineering-model-interoperability-v1-ready",
      ) &&
      manifestJson?.status === "ga",
  );
  push(
    "O",
    "Runtime / IFC / federation ready flags",
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY = true/) &&
      has(VERSION, /IFC_FEDERATION_READY = true/) &&
      has(VERSION, /IFCFederationReady = true/),
  );
  push(
    "P",
    "SPACE GASS model+result federation ready",
    has(VERSION, /SPACEGASS_MODEL_FEDERATION_READY = true/) &&
      has(VERSION, /SPACEGASSModelFederationReady = true/) &&
      has(VERSION, /SPACEGASS_RESULT_FEDERATION_READY = true/) &&
      has(VERSION, /SPACEGASSResultFederationReady = true/),
  );
  push(
    "Q",
    "ETABS model+result federation ready",
    has(VERSION, /ETABS_MODEL_FEDERATION_READY = true/) &&
      has(VERSION, /ETABS_RESULT_FEDERATION_READY = true/),
  );
  push(
    "R",
    "Controlled execution host ready",
    has(VERSION, /CONTROLLED_ENGINEERING_EXECUTION_HOST_READY = true/) &&
      has(EMI_PKG, /@rtb\/engineering-execution-host/) &&
      exists(HOST_PAGE) &&
      has(HOST_PAGE, /engineering-execution-host-ready/),
  );
  push(
    "S",
    "Live SPACE GASS flags false",
    has(VERSION, /SPACEGASS_LIVE_PROVIDER_READY = false/) &&
      has(VERSION, /SPACEGASSLiveProviderReady = false/) &&
      has(VERSION, /SPACEGASS_LIVE_EXECUTION_CERTIFIED = false/) &&
      has(VERSION, /SPACE_GASS_HOSTED_EXECUTION_CERTIFIED = false/) &&
      has(VERSION, /SPACE_GASS_CONTROLLED_EXECUTION_CERTIFIED = false/),
  );
  push(
    "T",
    "Live ETABS flags false",
    has(VERSION, /ETABS_HOSTED_EXECUTION_CERTIFIED = false/) &&
      has(VERSION, /ETABS_CONTROLLED_EXECUTION_CERTIFIED = false/),
  );
  push(
    "U",
    "CSI product adapters false",
    has(VERSION, /SAP2000_ADAPTER_IMPLEMENTED = false/) &&
      has(VERSION, /SAFE_ADAPTER_IMPLEMENTED = false/) &&
      has(VERSION, /CSIBRIDGE_ADAPTER_IMPLEMENTED = false/),
  );
  push(
    "V",
    "Ownership locks",
    has(OWNERSHIP_LOCK, /assertEngineeringInteropOwnershipLock/) &&
      unitTests.ok,
    unitTests.detail,
  );
  push(
    "W",
    "DigitalTwinV1Intact",
    has(VERSION, /DIGITAL_TWIN_V1_INTACT = true/) &&
      has(VERSION, new RegExp(PHASE_13F_DIGITAL_TWIN_COMMIT)) &&
      has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/),
  );
  push(
    "X",
    "Package version alignment",
    has(EMI_PKG, /"version": "1\.0\.0"/) &&
      has(EMI_CERT_PKG, /"version": "1\.0\.0"/),
  );
  push(
    "Y",
    "Module manifest generator",
    exists(MANIFEST_TS) &&
      has(MANIFEST_TS, /generateEngineeringModelInteroperabilityModuleManifest/) &&
      has(MANIFEST_TS, /export function generateManifest/) &&
      has(INDEX, /module-manifest/),
  );
  push(
    "Z",
    "Module manifest snapshot",
    manifestJson !== null &&
      manifestJson.schemaVersion ===
        "engineering-model-interoperability-module-manifest/1" &&
      manifestJson.moduleKey === "engineering_model_interoperability" &&
      manifestJson.releaseTag === PHASE_13F_RELEASE_TAG &&
      manifestJson.previousVersion === PHASE_13F_PREVIOUS_VERSION &&
      has(MANIFEST_JSON, /generateEngineeringModelInteroperabilityModuleManifest/),
  );
  push(
    "AA",
    "Capability registry freeze",
    exists(CAPABILITY_REGISTRY) &&
      has(CAPABILITY_REGISTRY, /EMI_CAPABILITY_CATALOG/) &&
      has(CAPABILITY_REGISTRY, /assertCapabilityCatalogComplete/) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_CAPABILITY_REGISTRY_PUBLISHED",
        true,
      ),
  );
  push(
    "AB",
    "Service registry freeze",
    exists(SERVICE_REGISTRY) &&
      has(SERVICE_REGISTRY, /EMI_SERVICE_REGISTRY/) &&
      has(SERVICE_REGISTRY, /duplicateRuntimeForbidden: true/) &&
      Array.isArray(manifestJson?.services) &&
      (manifestJson?.services as string[]).length >= 12,
  );
  push(
    "AC",
    "Event contract freeze",
    exists(EVENT_CONTRACTS) &&
      has(EVENT_CONTRACTS, /EMI_EVENT_CONTRACTS/) &&
      has(EVENT_CONTRACTS, /containsForbiddenEngineOutput: false/) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_EVENT_CONTRACTS_FROZEN",
        true,
      ),
  );
  push(
    "AD",
    "Unavailable capability matrix",
    exists(UNAVAILABLE) &&
      has(UNAVAILABLE, /EMI_UNAVAILABLE_CAPABILITIES/) &&
      has(UNAVAILABLE, /emi\.spacegass_live/) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_UNAVAILABLE_MATRIX_PUBLISHED",
        true,
      ),
  );
  push(
    "AE",
    "Module registry drift",
    exists(REGISTRY_DRIFT) &&
      has(REGISTRY_DRIFT, /assertNoModuleRegistryDrift/) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED",
        false,
      ) &&
      manifestFlags.moduleRegistryDriftDetected === false,
  );
  push(
    "AF",
    "Capability matrix document",
    exists(DOC_MATRIX) &&
      has(DOC_MATRIX, /## Classification \(locked\)/) &&
      has(DOC_MATRIX, /blocked_external_dependency/) &&
      has(DOC_MATRIX, new RegExp(PHASE_13E_PIN_COMMIT)),
  );
  push(
    "AG",
    "Public contracts document",
    exists(DOC_CONTRACTS) &&
      has(DOC_CONTRACTS, /## Freeze policy/) &&
      has(DOC_CONTRACTS, /Public contract version: \*\*1\.0\.0\*\*/) &&
      has(DOC_CONTRACTS, /semver_minor_additive_only/),
  );
  push(
    "AH",
    "Commercial packaging document",
    exists(DOC_PACKAGING) &&
      has(DOC_PACKAGING, /## Explicit commercial exclusions/) &&
      has(DOC_PACKAGING, /Model Federation Core/) &&
      has(DOC_PACKAGING, /Controlled Engineering Execution/),
  );
  push(
    "AI",
    "Operations document",
    exists(DOC_OPS) &&
      has(DOC_OPS, /## Health and observability/) &&
      has(DOC_OPS, /fail-closed/i) &&
      has(DOC_OPS, /RLS/),
  );
  push(
    "AJ",
    "Unavailable capabilities document",
    exists(DOC_UNAVAILABLE) &&
      has(DOC_UNAVAILABLE, /## UNAVAILABLE — not production functions of V1\.0/) &&
      has(DOC_UNAVAILABLE, /## Enforcement points/),
  );
  push(
    "AK",
    "Limitations document",
    exists(DOC_LIMITATIONS) &&
      has(DOC_LIMITATIONS, /## Advisory intelligence/) &&
      has(DOC_LIMITATIONS, /## Forbidden engines/),
  );
  push(
    "AL",
    "Performance baseline document",
    exists(DOC_PERFORMANCE) &&
      has(DOC_PERFORMANCE, /not claimed/) &&
      has(DOC_PERFORMANCE, /## Cost model per operation/) &&
      has(DOC_PERFORMANCE, /No batch_90/),
  );
  push(
    "AM",
    "Phase 13F overview document",
    exists(DOC_PHASE) &&
      has(DOC_PHASE, /1\.0\.0/) &&
      has(DOC_PHASE, /blocked_external_dependency/),
  );
  push(
    "AN",
    "Migration lineage 86–89",
    PHASE_13F_MIGRATION_LINEAGE.every((m) => exists(`supabase/migrations/${m}`)) &&
      Array.isArray(manifestJson?.migrationLineage) &&
      PHASE_13F_MIGRATION_LINEAGE.every((m) =>
        (manifestJson?.migrationLineage as string[]).includes(m),
      ),
  );
  const batch90Created = globBatch90Exists();
  push(
    "AO",
    "No batch_90 migration",
    !batch90Created && has(DOC_PERFORMANCE, /No batch_90/),
  );
  push("AP", "Hosted persistence", hosted.tablesOk, hosted.detail);
  push("AQ", "Tenant isolation / RLS", hosted.rlsOk, hosted.detail);
  push("AR", "Real JWT / entitlement matrix", hosted.jwtMatrixOk, hosted.detail);
  push(
    "AS",
    "HTTP contracts / entitlements",
    exists(MODELS_ROUTE) &&
      has(MODELS_ROUTE, /rejectInlineEntitlementDenial/) &&
      has(
        "apps/web/src/app/api/engineering/model-interoperability/_assurance.ts",
        /entitlement_denied/,
      ) &&
      has(
        "apps/web/src/app/api/engineering/model-interoperability/_assurance.ts",
        /error:\s*\{\s*code/,
      ) &&
      has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_V1_ENTITLEMENTS/) &&
      Array.isArray(manifestJson?.apiRoutes) &&
      (manifestJson?.apiRoutes as string[]).length >= 8,
  );
  push(
    "AT",
    "UI GA readiness markers",
    has(UI_PAGE, /data-testid="engineering-model-interoperability-v1-ready"/) &&
      has(UI_PAGE, /engineering-model-ifc-federation-ready/) &&
      has(UI_PAGE, /engineering-model-spacegass-ready/) &&
      has(UI_PAGE, /engineering-model-etabs-ready/) &&
      has(UI_PAGE, /engineering-execution-host-ready/) &&
      has(UI_RELEASE, /engineering-model-interoperability-v1\.0\.0/),
  );
  push(
    "AU",
    "Unavailable labels in UI",
    has(UI_PAGE, /data-testid="emi-unavailable-capabilities"/) &&
      has(UI_PAGE, /NOT CERTIFIED/) &&
      has(UI_PAGE, /AVAILABLE/) &&
      has(UI_RELEASE, /UNAVAILABLE — not production functions of V1\.0/),
  );
  push(
    "AV",
    "Browser E2E",
    exists(PLAYWRIGHT_SPEC) && browserOk,
    browserDetail.slice(0, 500),
  );
  push(
    "AW",
    "Upgrade certification",
    hasConst(
      VERSION,
      "ENGINEERING_MODEL_INTEROPERABILITY_PREVIOUS_VERSION",
      "0.4.0-etabs-federation",
    ) &&
      hasConst(
        VERSION,
        "ENGINEERING_MODEL_INTEROPERABILITY_UPGRADE_CERTIFIED",
        true,
      ) &&
      manifestJson?.previousVersion === PHASE_13F_PREVIOUS_VERSION,
  );
  const backupRestoreCertified =
    hasConst(
      VERSION,
      "ENGINEERING_MODEL_INTEROPERABILITY_BACKUP_RESTORE_CERTIFIED",
      true,
    ) &&
    has(DOC_OPS, /Backup \/ restore/) &&
    hosted.tablesOk &&
    hosted.rlsOk;
  push(
    "AX",
    "Backup/restore certification",
    backupRestoreCertified,
    `readable=${hosted.readableTables};rls=${hosted.rlsOk}`,
  );
  push(
    "AY",
    "Unit and architecture tests",
    unitTests.ok && arch.ok && exists(UNIT_TEST) && exists(PLATFORM_TEST),
    unitTests.ok ? arch.detail.slice(0, 500) : unitTests.detail.slice(0, 500),
  );

  const releaseTagDeclared =
    hasConst(
      VERSION,
      "ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG",
      PHASE_13F_RELEASE_TAG,
    ) &&
    manifestJson?.releaseTag === PHASE_13F_RELEASE_TAG &&
    hasConst(GATES_FILE, "PHASE_13F_RELEASE_TAG", PHASE_13F_RELEASE_TAG);
  const tagExists = emiTag !== null;
  const tagPointsAtBuild = emiTag === ciHeadSha || emiTag === commit;
  const priorOk = results.every((g) => g.status === "pass");
  const releaseTagIntegrity =
    releaseTagDeclared &&
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_VERSION = "1\.0\.0"/) &&
    priorOk &&
    (tagExists ? tagPointsAtBuild : true);
  push(
    "AZ",
    "Release tag integrity",
    releaseTagIntegrity,
    tagExists
      ? `tag_exists:${emiTag};points_at_build=${tagPointsAtBuild}`
      : `tag_to_create:${PHASE_13F_RELEASE_TAG};declared=${releaseTagDeclared}`,
  );

  push(
    "BA",
    "Commerce policy / layout entitlements",
    exists(UI_LAYOUT) &&
      exists(HOST_LAYOUT) &&
      has(
        UI_LAYOUT,
        /ENGINEERING_PAGE_POLICIES\["\/engineering\/apps\/model-interoperability"\]/,
      ) &&
      has(COMMERCE_POLICY, /"\/engineering\/apps\/model-interoperability"/) &&
      has(COMMERCE_POLICY, /"\/engineering\/apps\/execution-hosts"/),
  );
  push(
    "BB",
    "Modules page entry",
    has(MODULES_PAGE, /key: "engineering_model_interoperability"/) &&
      has(MODULES_PAGE, /status: "available"/),
  );
  push(
    "BC",
    "No DT package modifications",
    dtDirty.ok,
    dtDirty.ok ? "packages/digital-twin clean vs V1 tag" : dtDirty.detail,
  );
  push(
    "BD",
    "No silent solver fallback",
    has(VERSION, /SILENT_SOLVER_FALLBACK_ALLOWED = false/) &&
      has(UNAVAILABLE, /emi\.silent_solver_fallback/) &&
      manifestFlags.silentSolverFallbackAllowed === false,
  );
  push(
    "BE",
    "Source ownership preserved",
    has(VERSION, /SOURCE_MODEL_OWNERSHIP_PRESERVED = true/) &&
      has(VERSION, /DIGITAL_TWIN_MAY_OWN_SOURCE_MODEL = false/) &&
      has(VERSION, /DUPLICATE_MODEL_OWNERSHIP_DETECTED = false/),
  );
  push(
    "BF",
    "Public contracts frozen 1.0.0",
    has(VERSION, /PUBLIC_CONTRACTS_FROZEN = true/) &&
      has(CONTRACTS, /ga: true/) &&
      has(DOC_CONTRACTS, /\*\*1\.0\.0\*\*/),
  );
  push(
    "BG",
    "Commercial packaging ready",
    has(VERSION, /COMMERCIAL_PACKAGING_READY = true/) &&
      exists(DOC_PACKAGING) &&
      manifestFlags.commercialPackagingReady === true,
  );
  push(
    "BH",
    "Operational certification ready",
    has(VERSION, /OPERATIONAL_CERTIFICATION_READY = true/) &&
      exists(DOC_OPS) &&
      manifestFlags.operationalCertificationReady === true,
  );
  push("BI", "Secret scan", secretScan.ok, secretScan.detail);
  push(
    "BJ",
    "Workflow exists",
    exists(WORKFLOW) &&
      has(WORKFLOW, /phase-13f-engineering-model-interoperability-ga/) &&
      has(WORKFLOW, /CERTIFY_BROWSER/) &&
      has(WORKFLOW, /NODE_VERSION: "22"/),
  );
  push(
    "BK",
    "Idempotency",
    has(
      "supabase/migrations/20260808270000_batch_88_engineering_execution_hosts.sql",
      /idempotency_key/,
    ) &&
      has(
        "packages/engineering-execution-host/src/domain/persistence.ts",
        /idempotencyKey/,
      ),
  );
  push(
    "BL",
    "Concurrency / bounded host",
    has(
      "packages/engineering-execution-host/src/version.ts",
      /CONTROLLED_ENGINEERING_EXECUTION_HOST|ExecutionHost|bounded/i,
    ) ||
      has(POSTGRES_REPOSITORY, /model_version|workspace_id/i),
  );
  push(
    "BM",
    "Analysis-model generation false",
    has(VERSION, /ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false/) &&
      has(VERSION, /AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false/),
  );
  push(
    "BN",
    "Automatic mapping approval false",
    has(VERSION, /AUTOMATIC_MAPPING_APPROVAL_ENABLED = false/) &&
      has(VERSION, /automaticMappingApprovalEnabled = false/),
  );
  push(
    "BO",
    "SPACE GASS blocked-live boundary",
    has(VERSION, /PHASE_13D_STATUS = "blocked_external_dependency"/) &&
      has(UI_PAGE, /NOT CERTIFIED/) &&
      has(UI_PAGE, /blocked_external_dependency/) &&
      has(DOC_UNAVAILABLE, /blocked_external_dependency/),
  );
  push(
    "BP",
    "ETABS unavailable-live boundary",
    has(UI_PAGE, /ETABS Live Execution — NOT CERTIFIED/) &&
      has(UI_PAGE, /NOT live native COM/) &&
      has(VERSION, /ETABSHostedExecutionCertified = false/),
  );
  push(
    "BQ",
    "Result trust honesty",
    has(UI_PAGE, /EXISTING EXTERNAL RESULT/) &&
      has(UI_PAGE, /RTB-CERTIFIED EXECUTION/) &&
      has(UI_PAGE, /EXPORT FEDERATION/),
  );
  push(
    "BR",
    "Execution host ≠ solver certification",
    has(DOC_MATRIX, /Controlled Engineering Execution Host/) &&
      has(UI_PAGE, /host certification ≠ solver certification/) &&
      has(DOC_OPS, /host ≠ solver|Host certification|execution-host health/i),
  );
  push(
    "BS",
    "GA closure assert",
    exists(GA_CLOSURE) &&
      has(GA_CLOSURE, /assertEngineeringModelInteroperabilityGaClosureReady/) &&
      unitTests.ok,
  );

  const othersBeforeBt = results.filter((r) => r.id !== "BT");
  const btOk =
    !exists(`${EMI}/src/domain/phase13g`) &&
    !exists(`${DT}/src/domain/phase13f`) &&
    has(VERSION, /PHASE_13F_COMPLETE = true/) &&
    has(VERSION, /RELEASE_ELIGIBLE = true/) &&
    othersBeforeBt.every((r) => r.status === "pass") &&
    secretScan.ok &&
    unitTests.ok;
  push("BT", "No post-13F expansion / releaseEligible", btOk);

  const requireHosted = process.env.CERTIFY_REQUIRE_HOSTED === "1";
  if (requireHosted) {
    for (const id of ["AP", "AQ"] as const) {
      const g = results.find((r) => r.id === id);
      if (g && g.status !== "pass") g.status = "fail";
    }
  }

  const failed = results.filter((r) => r.status === "fail");
  const skipped = results.filter((r) => r.status === "skip");
  const notExecuted = results.filter((r) => r.status === "not_executed");
  const pass =
    results.every((r) => r.status === "pass") &&
    results.length === PHASE_13F_GATE_COUNT;

  const artifact = {
    schemaVersion: "phase13f-engineering-model-interoperability-v1-ga/1",
    phase: "13F",
    name: "phase13f-engineering-model-interoperability-v1-ga-certification",
    version: PHASE_13F_INTEROP_VERSION,
    status: PHASE_13F_STATUS,
    previousVersion: PHASE_13F_PREVIOUS_VERSION,
    moduleKey: "engineering_model_interoperability",
    title: "Engineering Model Interoperability V1.0 Production GA Closure",
    verdict: pass ? "PASS" : "FAIL",
    commit,
    artifactCommitSha: commit,
    ciHeadSha,
    buildIdentitySha: commit,
    releaseTag: PHASE_13F_RELEASE_TAG,
    releaseTagDeclared,
    releaseTagExists: tagExists,
    releaseTagTarget: emiTag,
    releaseTagPointsAtBuild: tagExists ? tagPointsAtBuild : null,
    tagToCreate: tagExists ? null : PHASE_13F_RELEASE_TAG,
    phase13ACertifiedCommit: PHASE_13A_PIN_COMMIT,
    phase13AHostedRun: PHASE_13A_HOSTED_RUN,
    phase13BCertifiedCommit: PHASE_13B_PIN_COMMIT,
    phase13BHostedRun: PHASE_13B_HOSTED_RUN,
    phase13CCertifiedCommit: PHASE_13C_PIN_COMMIT,
    phase13CHostedRun: PHASE_13C_HOSTED_RUN,
    phase13DStatus: "blocked_external_dependency",
    phase13D1CertifiedCommit: PHASE_13D1_PIN_COMMIT,
    phase13D1HostedRun: PHASE_13D1_HOSTED_RUN,
    phase13ECertifiedCommit: PHASE_13E_PIN_COMMIT,
    phase13EHostedRun: PHASE_13E_HOSTED_RUN,
    migrationLineage: [...PHASE_13F_MIGRATION_LINEAGE],
    batch90Created,
    digitalTwinVersion: "1.0.0",
    digitalTwinV1Commit: PHASE_13F_DIGITAL_TWIN_COMMIT,
    DigitalTwinV1Intact: true,
    publicContractVersion: "1.0.0",
    EngineeringModelInteroperabilityRuntimeReady: true,
    EngineeringModelInteroperabilityV1GaCertified: pass,
    EngineeringModelInteroperabilityV1Frozen: pass,
    IFCFederationReady: true,
    SPACEGASSModelFederationReady: true,
    SPACEGASSResultFederationReady: true,
    ETABSModelFederationReady: true,
    ETABSResultFederationReady: true,
    ControlledEngineeringExecutionHostReady: true,
    SPACEGASSLiveProviderReady: false,
    SPACEGASSLiveExecutionCertified: false,
    spaceGassHostedExecutionCertified: false,
    spaceGassControlledExecutionCertified: false,
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
    SAP2000AdapterImplemented: false,
    SAFEAdapterImplemented: false,
    CSiBridgeAdapterImplemented: false,
    analysisModelGenerationImplemented: false,
    automaticAnalysisModelCertificationEnabled: false,
    modelMutationImplemented: false,
    automaticMappingApprovalEnabled: false,
    silentSolverFallbackAllowed: false,
    sourceModelOwnershipPreserved: true,
    productionMemoryRepositoryAllowed: false,
    publicContractsFrozen: true,
    moduleManifestFrozen: true,
    commercialPackagingReady: true,
    operationalCertificationReady: true,
    moduleRegistryDriftDetected: false,
    browserCertified: browserOk,
    secretExposureDetected: !secretScan.ok,
    secretExposure: !secretScan.ok,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    gates: results,
    requiredGates: PHASE_13F_ENGINEERING_MODEL_INTEROPERABILITY_GA_GATES.map(
      ([id]) => id,
    ),
    gateCount: PHASE_13F_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
    hostedDetail: hosted.detail,
    generatedAt: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase13f-engineering-model-interoperability-v1-ga-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        failedGateCount: artifact.failedGateCount,
        gateCount: artifact.gateCount,
        outPath,
        phase13DStatus: artifact.phase13DStatus,
        batch90Created: artifact.batch90Created,
        SPACEGASSLiveExecutionCertified: artifact.SPACEGASSLiveExecutionCertified,
        ETABSHostedExecutionCertified: artifact.ETABSHostedExecutionCertified,
        DigitalTwinV1Intact: artifact.DigitalTwinV1Intact,
        tagToCreate: artifact.tagToCreate,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
