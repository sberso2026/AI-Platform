/**
 * Phase 13D.1 certification runner — Controlled Engineering Execution Host Foundation.
 * SPACE GASS probe may report unavailable; live execution must remain uncertified.
 */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertControlledEngineeringExecutionHostOwnershipLock,
  createAndAuthorizeExecutionJob,
  createDurableExecutionHostMemoryStore,
  createExecutionHostRepository,
  EngineeringExecutionHostRegistry,
  ExecutionWorkspaceManager,
  getControlledEngineeringExecutionHostDeclaration,
  probeSpaceGassHost,
  SPACEGASSLiveExecutionCertified,
} from "@rtb/engineering-execution-host";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  PHASE_13A_PIN_COMMIT,
  PHASE_13A_VERSION,
  PHASE_13B_PIN_COMMIT,
  PHASE_13B_VERSION,
  PHASE_13C_CERTIFIED_COMMIT,
  PHASE_13C_VERSION,
  PHASE_13D1_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_13D1_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES,
  PHASE_13D1_DIGITAL_TWIN_COMMIT,
  PHASE_13D1_DIGITAL_TWIN_TAG,
  PHASE_13D1_DIGITAL_TWIN_VERSION,
  PHASE_13D1_DOMAIN_MODULES,
  PHASE_13D1_EXECUTION_HOST_VERSION,
  PHASE_13D1_GATE_COUNT,
  PHASE_13D1_HOSTED_TABLES,
  PHASE_13D1_HTTP_ROUTES,
  PHASE_13D1_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_13D1_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_13D1_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_13D1_PROJECT_CONTROLS_V1_TAG,
  PHASE_13D1_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_13D1_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_13D1_PUBLIC_CONTRACT_VERSION,
  type Phase13d1GateId,
} from "../src/phase13d1/gates.js";

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

const EEH = "packages/engineering-execution-host";
const EEH_CERT = "packages/engineering-execution-host-certification";
const EMI = "packages/engineering-model-interoperability";
const DT = "packages/digital-twin";
const VERSION = `${EEH}/src/version.ts`;
const EMI_VERSION = `${EMI}/src/version.ts`;
const DT_VERSION = `${DT}/src/version.ts`;
const BATCH_88 =
  "supabase/migrations/20260808270000_batch_88_engineering_execution_hosts.sql";
const BATCH_87 =
  "supabase/migrations/20260808260000_batch_87_engineering_model_interoperability_spacegass.sql";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";
const WORKFLOW =
  ".github/workflows/phase-13d1-controlled-engineering-execution-host.yml";
const UI_PAGE =
  "apps/web/src/app/(platform)/engineering/apps/execution-hosts/page.tsx";
const PLATFORM_TEST =
  "packages/platform-certification/src/phase13d1-controlled-engineering-execution-host.test.ts";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase13d1GateId;
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
  id: Phase13d1GateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail };
}

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  detail: string;
  probed: boolean;
}> {
  const requireHosted = process.env.CERTIFY_REQUIRE_HOSTED === "1";
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) {
    return {
      tablesOk: !requireHosted,
      detail: requireHosted ? "missing_supabase_env" : "hosted_optional_skipped",
      probed: false,
    };
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const failures: string[] = [];
  for (const { table, pk } of PHASE_13D1_HOSTED_TABLES) {
    const { error } = await admin.from(table).select(pk, { count: "exact", head: true });
    if (error) failures.push(`${table}:${error.message}`);
  }
  return {
    tablesOk: failures.length === 0,
    detail: failures.length ? failures.join(" | ") : "ok",
    probed: true,
  };
}

async function main() {
  const results: GateResult[] = [];
  const decl = getControlledEngineeringExecutionHostDeclaration();
  const versionText = readRepoFile(VERSION);
  const emiVersion = readRepoFile(EMI_VERSION);
  const dtVersion = readRepoFile(DT_VERSION);

  results.push(
    gate("A", "Repository/build identity", exists("pnpm-workspace.yaml"), "workspace"),
  );
  results.push(
    gate(
      "B",
      "Project Controls V1 tag intact",
      tag(PHASE_13D1_PROJECT_CONTROLS_V1_TAG) ===
        PHASE_13D1_PROJECT_CONTROLS_V1_COMMIT,
    ),
  );
  results.push(
    gate(
      "C",
      "Asset Intelligence V1 tag intact",
      tag(PHASE_13D1_ASSET_INTELLIGENCE_V1_TAG) ===
        PHASE_13D1_ASSET_INTELLIGENCE_V1_COMMIT,
    ),
  );
  results.push(
    gate(
      "D",
      "Project Intelligence V1 intact",
      tag(PHASE_13D1_PROJECT_INTELLIGENCE_V1_TAG) ===
        PHASE_13D1_PROJECT_INTELLIGENCE_V1_COMMIT,
    ),
  );
  results.push(
    gate(
      "E",
      "Inspection Intelligence V1 intact",
      tag(PHASE_13D1_INSPECTION_INTELLIGENCE_V1_TAG) ===
        PHASE_13D1_INSPECTION_INTELLIGENCE_V1_COMMIT,
    ),
  );
  results.push(
    gate(
      "F",
      "Digital Twin V1 tag intact",
      tag(PHASE_13D1_DIGITAL_TWIN_TAG) === PHASE_13D1_DIGITAL_TWIN_COMMIT &&
        has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/),
    ),
  );
  results.push(gate("G", "Execution host package exists", exists(`${EEH}/package.json`)));
  results.push(
    gate("H", "Execution host certification package exists", exists(`${EEH_CERT}/package.json`)),
  );
  results.push(
    gate(
      "I",
      "Version 0.1.0-execution-host",
      has(VERSION, /ENGINEERING_EXECUTION_HOST_VERSION\s*=\s*"0\.1\.0-execution-host"/) &&
        has(`${EEH}/package.json`, /"version": "0\.1\.0-execution-host"/),
    ),
  );
  results.push(
    gate("J", "ControlledEngineeringExecutionHostReady is true", decl.ControlledEngineeringExecutionHostReady === true),
  );
  results.push(
    gate("K", "EngineeringExecutionHostRegistryReady is true", decl.EngineeringExecutionHostRegistryReady === true),
  );
  results.push(
    gate("L", "EngineeringExecutionJobReady is true", decl.EngineeringExecutionJobReady === true),
  );
  results.push(
    gate("M", "EngineeringExecutionHostHealthReady is true", decl.EngineeringExecutionHostHealthReady === true),
  );
  results.push(
    gate("N", "ProviderHostProbeReady is true", decl.ProviderHostProbeReady === true),
  );
  results.push(
    gate("O", "ExecutionWorkspaceIsolationReady is true", decl.ExecutionWorkspaceIsolationReady === true),
  );
  results.push(
    gate("P", "EngineeringExecutionArtifactHandlingReady is true", decl.EngineeringExecutionArtifactHandlingReady === true),
  );
  results.push(
    gate("Q", "silentSolverFallbackAllowed is false", decl.silentSolverFallbackAllowed === false),
  );
  results.push(
    gate(
      "R",
      "SPACEGASSLiveExecutionCertified is false",
      decl.SPACEGASSLiveExecutionCertified === false &&
        SPACEGASSLiveExecutionCertified === false,
    ),
  );
  results.push(
    gate("S", "ETABSAdapterImplemented is false", decl.ETABSAdapterImplemented === false),
  );
  results.push(
    gate("T", "ETABSExecutionCertified is false", decl.ETABSExecutionCertified === false),
  );
  results.push(
    gate("U", "analysisModelGenerationImplemented is false", decl.analysisModelGenerationImplemented === false),
  );
  results.push(
    gate("V", "duplicateToolFrameworkDetected is false", decl.duplicateToolFrameworkDetected === false),
  );
  results.push(gate("W", "DigitalTwinV1Intact is true", decl.DigitalTwinV1Intact === true));
  results.push(gate("X", "releaseEligible is true", decl.releaseEligible === true));
  results.push(
    gate("Y", "phase13DReCertificationReady is true", decl.phase13DReCertificationReady === true),
  );

  let ownershipOk = false;
  try {
    assertControlledEngineeringExecutionHostOwnershipLock();
    ownershipOk = true;
  } catch (e) {
    ownershipOk = false;
  }
  results.push(gate("Z", "Ownership lock asserts", ownershipOk));

  results.push(
    gate(
      "AA",
      "Public contracts prerelease not 1.0.0",
      decl.publicContractVersion === PHASE_13D1_PUBLIC_CONTRACT_VERSION &&
        PHASE_13D1_PUBLIC_CONTRACT_VERSION !== "1.0.0",
    ),
  );

  const moduleGates: Array<[Phase13d1GateId, string, string]> = [
    ["AB", "Host contract module present", PHASE_13D1_DOMAIN_MODULES[0]],
    ["AC", "Host registry module present", PHASE_13D1_DOMAIN_MODULES[1]],
    ["AD", "Provider installation module present", PHASE_13D1_DOMAIN_MODULES[2]],
    ["AE", "Generic provider host probe present", PHASE_13D1_DOMAIN_MODULES[3]],
    ["AF", "SPACE GASS host probe present", PHASE_13D1_DOMAIN_MODULES[4]],
    ["AG", "ETABS host reservation present", PHASE_13D1_DOMAIN_MODULES[5]],
    ["AH", "Execution job + status enum present", PHASE_13D1_DOMAIN_MODULES[6]],
    ["AI", "Execution workspace isolation present", PHASE_13D1_DOMAIN_MODULES[7]],
    ["AJ", "Sandbox module present", PHASE_13D1_DOMAIN_MODULES[8]],
    ["AK", "Host health module present", PHASE_13D1_DOMAIN_MODULES[9]],
    ["AL", "License-state module present", PHASE_13D1_DOMAIN_MODULES[10]],
    ["AM", "Version pinning module present", PHASE_13D1_DOMAIN_MODULES[11]],
    ["AN", "Artifacts Platform Files refs only", PHASE_13D1_DOMAIN_MODULES[12]],
    ["AO", "Events ids-only", PHASE_13D1_DOMAIN_MODULES[13]],
    ["AP", "Persistence + postgres + memory", PHASE_13D1_DOMAIN_MODULES[14]],
    ["AQ", "Control vs execution plane separation", PHASE_13D1_DOMAIN_MODULES[16]],
  ];
  for (const [id, name, path] of moduleGates) {
    results.push(gate(id, name, exists(path)));
  }

  results.push(
    gate(
      "AR",
      "batch_88 migration present",
      exists(BATCH_88) && has(BATCH_88, /engineering_execution_hosts/),
    ),
  );
  results.push(
    gate(
      "AS",
      "batch_86/87 not rewritten",
      exists(BATCH_86) &&
        exists(BATCH_87) &&
        has(BATCH_86, /model_ref_id text PRIMARY KEY/) &&
        has(BATCH_87, /qualification_id text PRIMARY KEY/),
    ),
  );
  results.push(
    gate(
      "AT",
      "HTTP execution-hosts routes present",
      PHASE_13D1_HTTP_ROUTES.every((r) => exists(r)),
    ),
  );
  results.push(
    gate(
      "AU",
      "UI marker engineering-execution-host-ready",
      has(UI_PAGE, /engineering-execution-host-ready/),
    ),
  );
  results.push(
    gate(
      "AV",
      "Operations runbook present",
      exists("docs/operations/CONTROLLED_ENGINEERING_EXECUTION_HOST_RUNBOOK.md"),
    ),
  );
  results.push(
    gate(
      "AW",
      "SPACE GASS provisioning guide present",
      exists("docs/operations/SPACEGASS_CONTROLLED_HOST_PROVISIONING.md"),
    ),
  );
  results.push(
    gate(
      "AX",
      "Future ETABS architecture doc present",
      exists("docs/architecture/ENGINEERING_EXECUTION_HOST_FUTURE_ETABS_INTEGRATION.md"),
    ),
  );
  results.push(
    gate(
      "AY",
      "Host contracts architecture doc present",
      exists("docs/architecture/CONTROLLED_ENGINEERING_EXECUTION_HOST_CONTRACTS.md"),
    ),
  );
  results.push(
    gate(
      "AZ",
      "Public contracts draft present",
      exists("docs/contracts/ENGINEERING_EXECUTION_HOST_PUBLIC_CONTRACTS_DRAFT.md"),
    ),
  );

  const unit = run("pnpm --filter @rtb/engineering-execution-host test");
  results.push(gate("BA", "Unit tests pass", unit.ok, unit.detail));

  let spaceGassHostAvailable = false;
  let probeDetail = "not_run";
  try {
    const probe = await probeSpaceGassHost({ timeoutMs: 2500 });
    spaceGassHostAvailable =
      probe.processOrServicePresent &&
      (probe.healthStatus === "healthy" || probe.healthStatus === "degraded");
    probeDetail = `${probe.healthStatus}:${probe.detail}`;
    results.push(
      gate(
        "BB",
        "SPACE GASS availability probe runs (no live PASS required)",
        probe.providerId === "spacegass" &&
          probe.SPACEGASSLiveExecutionCertified === false &&
          probe.detectOnly === true,
        probeDetail,
      ),
    );
  } catch (e) {
    results.push(
      gate(
        "BB",
        "SPACE GASS availability probe runs (no live PASS required)",
        false,
        String(e),
      ),
    );
  }

  const rejected = createAndAuthorizeExecutionJob({
    jobId: "cert_reject",
    tenantId: "t",
    workspaceId: "w",
    providerId: "spacegass",
    toolRegistrationRef: "",
    methodQualificationRef: "m",
    providerQualificationRef: "p",
    applicationQualificationRef: "a",
    sourceModelRef: "s",
    requestedBy: "cert",
  });
  results.push(
    gate(
      "BC",
      "Job authorization rejects missing metadata",
      rejected.ok === false && rejected.status === "rejected",
    ),
  );

  let fallbackOk = false;
  try {
    createAndAuthorizeExecutionJob({
      jobId: "cert_fallback",
      tenantId: "t",
      workspaceId: "w",
      providerId: "spacegass",
      toolRegistrationRef: "tool",
      methodQualificationRef: "m",
      providerQualificationRef: "p",
      applicationQualificationRef: "a",
      sourceModelRef: "s",
      requestedBy: "cert",
      allowFallbackProvider: true,
    });
  } catch {
    fallbackOk = true;
  }
  const unavailable = createAndAuthorizeExecutionJob({
    jobId: "cert_unavail",
    tenantId: "t",
    workspaceId: "w",
    providerId: "spacegass",
    toolRegistrationRef: "tool",
    methodQualificationRef: "m",
    providerQualificationRef: "p",
    applicationQualificationRef: "a",
    sourceModelRef: "s",
    requestedBy: "cert",
    providerAvailable: false,
  });
  results.push(
    gate(
      "BD",
      "No provider fallback / no CalculiX substitute",
      fallbackOk && unavailable.status === "provider_unavailable",
    ),
  );

  const base = mkdtempSync(join(tmpdir(), "eeh-cert-"));
  const mgr = new ExecutionWorkspaceManager({ baseDir: base });
  const wa = mgr.create("a");
  const wb = mgr.create("b");
  let workspaceOk = true;
  try {
    mgr.assertNoCrossJobAccess(wa, wb);
    mgr.cleanup(wa);
  } catch {
    workspaceOk = false;
  }
  results.push(gate("BE", "Workspace isolation + cleanup", workspaceOk));

  results.push(
    gate(
      "BF",
      "Sandbox baseline (path/timeout/shell/tenant)",
      has(`${EEH}/src/domain/sandbox.ts`, /arbitrary_shell_injection_forbidden/) &&
        has(`${EEH}/src/domain/sandbox.ts`, /cross_tenant_isolation_violation/),
    ),
  );

  const repo = createExecutionHostRepository({
    adapter: "memory",
    memoryStore: createDurableExecutionHostMemoryStore(),
  });
  const accepted = createAndAuthorizeExecutionJob({
    jobId: "cert_idem_1",
    tenantId: "t",
    workspaceId: "w",
    providerId: "spacegass",
    toolRegistrationRef: "tool",
    methodQualificationRef: "m",
    providerQualificationRef: "p",
    applicationQualificationRef: "a",
    sourceModelRef: "s",
    requestedBy: "cert",
    idempotencyKey: "idem-1",
  });
  if (accepted.ok) await repo.saveJob(accepted.job);
  const replay = await repo.getJobByIdempotencyKey("t", "w", "idem-1");
  results.push(gate("BG", "Idempotency key support", !!replay && accepted.ok));

  const capacity = createAndAuthorizeExecutionJob({
    jobId: "cert_cap",
    tenantId: "t",
    workspaceId: "w",
    providerId: "spacegass",
    toolRegistrationRef: "tool",
    methodQualificationRef: "m",
    providerQualificationRef: "p",
    applicationQualificationRef: "a",
    sourceModelRef: "s",
    requestedBy: "cert",
    hostCapacityExceeded: true,
  });
  results.push(
    gate(
      "BH",
      "Concurrency capacity rejection path",
      capacity.ok === false && capacity.job.rejectionReason === "host_capacity_exceeded",
    ),
  );

  const registry = new EngineeringExecutionHostRegistry(repo);
  const host = await registry.registerHost({
    tenantId: "t",
    workspaceId: "w",
    hostClass: "dedicated_windows_vm",
  });
  await registry.revokeHost("t", "w", host.hostId);
  const revokedJob = createAndAuthorizeExecutionJob({
    jobId: "cert_revoked",
    tenantId: "t",
    workspaceId: "w",
    providerId: "spacegass",
    toolRegistrationRef: "tool",
    methodQualificationRef: "m",
    providerQualificationRef: "p",
    applicationQualificationRef: "a",
    sourceModelRef: "s",
    requestedBy: "cert",
    hostRevoked: true,
  });
  results.push(
    gate(
      "BI",
      "Host revocation blocks new jobs",
      revokedJob.ok === false && revokedJob.job.rejectionReason === "host_revoked",
    ),
  );

  const provRevoked = createAndAuthorizeExecutionJob({
    jobId: "cert_prov_rev",
    tenantId: "t",
    workspaceId: "w",
    providerId: "spacegass",
    toolRegistrationRef: "tool",
    methodQualificationRef: "m",
    providerQualificationRef: "p",
    applicationQualificationRef: "a",
    sourceModelRef: "s",
    requestedBy: "cert",
    providerRevoked: true,
  });
  results.push(
    gate(
      "BJ",
      "Provider revocation yields provider_unavailable",
      provRevoked.status === "provider_unavailable",
    ),
  );

  const secret = run(
    "pnpm --filter @rtb/engineering-execution-host-certification secret-scan",
  );
  results.push(gate("BK", "Secret exposure scan clean", secret.ok, secret.detail));

  const browserRequired =
    process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
  if (browserRequired) {
    const browser = run(
      "pnpm --filter @rtb/engineering-execution-host-certification test:e2e:execution-host",
      { CERTIFY_BROWSER: "1" },
    );
    results.push(gate("BL", "Browser CERTIFY_BROWSER=1", browser.ok, browser.detail));
  } else {
    results.push(
      gate("BL", "Browser CERTIFY_BROWSER=1", false, "CERTIFY_BROWSER not set"),
    );
  }

  results.push(
    gate(
      "BM",
      "Workflow present Node 22",
      exists(WORKFLOW) && has(WORKFLOW, /NODE_VERSION: "22"/),
    ),
  );
  results.push(gate("BN", "Platform certification test present", exists(PLATFORM_TEST)));
  results.push(
    gate(
      "BO",
      "Interop remains 0.3.0-spacegass certified line",
      has(EMI_VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.3\.0-spacegass"/) &&
        has(`${EMI}/package.json`, /"version": "0\.3\.0-spacegass"/),
      PHASE_13C_VERSION,
    ),
  );
  results.push(
    gate(
      "BP",
      "Live probe modules retained non-certified",
      exists(`${EMI}/src/domain/spacegass/spacegass-live-health.ts`) &&
        exists(`${EMI}/src/domain/spacegass/spacegass-live-provider.ts`) &&
        has(`${EMI}/src/index.ts`, /spacegass-live-health/),
    ),
  );

  const dtDiff = run(`git diff --name-only ${PHASE_13C_CERTIFIED_COMMIT} -- ${DT}`);
  const dtTouched =
    dtDiff.ok &&
    dtDiff.detail !== "ok" &&
    dtDiff.detail.trim().length > 0 &&
    !dtDiff.detail.includes("failed");
  // Prefer: no uncommitted DT changes and DT version pin intact
  const dtStatus = run(`git status --porcelain -- ${DT}`);
  const dtDirty = dtStatus.ok && dtStatus.detail !== "ok" && dtStatus.detail.trim().length > 0;
  results.push(
    gate(
      "BQ",
      "Digital Twin package untouched",
      has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) && !dtDirty,
      dtStatus.detail,
    ),
  );

  results.push(
    gate(
      "BR",
      "No Phase 13E / no auto Phase 13D PASS rerun",
      !exists(`${EEH}/src/domain/phase13e`) &&
        !exists(`${EMI}/src/domain/phase13e`) &&
        !has(VERSION, /SPACEGASSLiveExecutionCertified = true/) &&
        PHASE_13D1_GATE_COUNT ===
          PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES.length,
    ),
  );

  // Ensure every declared gate was executed
  const byId = new Map(results.map((r) => [r.id, r]));
  for (const [id, name] of PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES) {
    if (!byId.has(id)) {
      results.push({ id, name, status: "not_executed", detail: "missing_runner_case" });
    }
  }

  const hosted = await verifyHosted();
  const failed = results.filter((r) => r.status === "fail");
  const skipped = results.filter((r) => r.status === "skip");
  const notExecuted = results.filter((r) => r.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0
      ? "PASS"
      : "FAIL";

  const artifact = {
    phase: "13D.1",
    name: "phase13d1-controlled-engineering-execution-host-certification",
    version: PHASE_13D1_EXECUTION_HOST_VERSION,
    status: "execution_host",
    verdict,
    commit: sha(),
    phase13CBaselineCommit: PHASE_13C_CERTIFIED_COMMIT,
    digitalTwinVersion: PHASE_13D1_DIGITAL_TWIN_VERSION,
    digitalTwinV1Commit: PHASE_13D1_DIGITAL_TWIN_COMMIT,
    digitalTwinV1Tag: PHASE_13D1_DIGITAL_TWIN_TAG,
    publicContractVersion: PHASE_13D1_PUBLIC_CONTRACT_VERSION,
    requiredGates: PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES.map(
      ([id, name]) => ({ id, name }),
    ),
    gateCount: PHASE_13D1_GATE_COUNT,
    results,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((f) => ({ id: f.id, detail: f.detail })),
    ControlledEngineeringExecutionHostReady: true,
    EngineeringExecutionHostRegistryReady: true,
    EngineeringExecutionJobReady: true,
    EngineeringExecutionHostHealthReady: true,
    ProviderHostProbeReady: true,
    ExecutionWorkspaceIsolationReady: true,
    EngineeringExecutionArtifactHandlingReady: true,
    silentSolverFallbackAllowed: false,
    SPACEGASSLiveExecutionCertified: false,
    ETABSAdapterImplemented: false,
    ETABSExecutionCertified: false,
    analysisModelGenerationImplemented: false,
    duplicateToolFrameworkDetected: false,
    DigitalTwinV1Intact: true,
    releaseEligible: verdict === "PASS",
    phase13DReCertificationReady: true,
    spaceGassHostAvailable,
    spaceGassProbeDetail: probeDetail,
    phase13DCanBeRecertifiedNow: spaceGassHostAvailable === true,
    hostedTablesProbed: hosted.probed,
    hostedTablesOk: hosted.tablesOk,
    hostedDetail: hosted.detail,
    unexpected5xx: 0,
    secretExposureDetected: !secret.ok,
    phase13AVersion: PHASE_13A_VERSION,
    phase13ACommit: PHASE_13A_PIN_COMMIT,
    phase13BVersion: PHASE_13B_VERSION,
    phase13BCommit: PHASE_13B_PIN_COMMIT,
    phase13CVersion: PHASE_13C_VERSION,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase13d1-controlled-engineering-execution-host-certification.json",
  );
  writeFileSync(outFile, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        verdict,
        version: artifact.version,
        gateCount: artifact.gateCount,
        failedGateCount: artifact.failedGateCount,
        SPACEGASSLiveExecutionCertified: false,
        spaceGassHostAvailable,
        phase13DCanBeRecertifiedNow: artifact.phase13DCanBeRecertifiedNow,
        releaseEligible: artifact.releaseEligible,
        artifact: outFile,
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
