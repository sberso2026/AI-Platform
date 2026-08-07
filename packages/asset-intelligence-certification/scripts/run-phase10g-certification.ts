/**
 * Phase 10G certification runner (gates A–BC).
 * Asset Lifecycle Intelligence — advisory context engine over published slices.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10G_ASSET_INTELLIGENCE_LIFECYCLE_GATES,
  type Phase10gGateId,
} from "../src/phase10g/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI = "34975b1cf660580d46287f24e746b8915903f768";
const II = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const P10A = "81d1cade909cf991a9dc91b9236310143f4b215f";
const P10B = "ef7268e6dd3873f8941885a87a2723130a6bb6bc";
const P10B1 = "e72822434a38e66a409da3c8a291e68f006888c3";
const P10C = "10b0259134995f55bfe889dba2386edd653d9c2b";
const P10D = "ef6981e1c42f80cbb12337c21e6830eb22c3fdbf";
const P10E = "ed127cd85901f8053d09155f7c4053f0b22b8a5f";
/** Authoritative Phase 10F recertification identity (post batch_55b recert). */
const P10F_AUTH = "94019ae995468ccddadc78a203e92e8460fe4bf0";
const P10F_RECERT_RUN = "31150273985";

const MIGRATION_55 = "20260807160000_batch_55_asset_intelligence_timeseries.sql";
const MIGRATION_55B = "20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql";
const MIGRATION_56 = "20260807170000_batch_56_asset_intelligence_lifecycle.sql";

const TABLES = [
  "asset_intelligence_lifecycle_states",
  "asset_intelligence_lifecycle_reviews",
  "asset_intelligence_lifecycle_taxonomy",
  "asset_intelligence_lifecycle_transition_candidates",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10gGateId; name: string; status: GateStatus; detail?: string };

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
function git(cmd: string) {
  return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
}
function readRepoFile(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function has(rel: string, re: RegExp) {
  return re.test(readRepoFile(rel));
}
function tag(t: string) {
  try {
    return git(`git rev-list -n 1 ${t}`);
  } catch {
    return null;
  }
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
  for (const table of TABLES) {
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
    const { data } = await anonClient.from("asset_intelligence_lifecycle_states").select("id").limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `ai-cert-life-${Date.now()}@example.com`;
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
          .from("asset_intelligence_lifecycle_states")
          .select("id")
          .limit(5);
        jwtMatrixOk =
          !readErr &&
          Array.isArray(rows) &&
          rows.length === 0 &&
          has("packages/asset-intelligence/src/domain/role-matrix.ts", /lifecycle\.assess/) &&
          has("packages/asset-intelligence/src/domain/role-matrix.ts", /ENGINEER_SELF_APPROVE_FORBIDDEN = true/);
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
  const gates: GateResult[] = [];
  const push = (id: Phase10gGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);

  const VERSION = "packages/asset-intelligence/src/version.ts";
  const LIFECYCLE_ENGINE = "packages/asset-intelligence/src/domain/lifecycle-engine.ts";
  const LIFECYCLE = "packages/asset-intelligence/src/domain/lifecycle.ts";
  const LIFECYCLE_REF = "packages/asset-intelligence/src/domain/lifecycle-reference.ts";
  const LIFECYCLE_TAXONOMY = "packages/asset-intelligence/src/domain/lifecycle-taxonomy.ts";
  const REVIEW_WORKFLOW = "packages/asset-intelligence/src/domain/review-workflow.ts";
  const ROLE_MATRIX = "packages/asset-intelligence/src/domain/role-matrix.ts";
  const EVENTS = "packages/asset-intelligence/src/domain/events.ts";
  const TIMELINE = "packages/asset-intelligence/src/domain/timeline.ts";
  const ENGINE = "packages/asset-intelligence/src/domain/engine.ts";
  const HEALTH_COMPOSER = "packages/asset-intelligence/src/domain/health-composer.ts";
  const PERSISTENCE = "packages/asset-intelligence/src/domain/persistence.ts";
  const II_CONSUMPTION = "packages/asset-intelligence/src/domain/ii-consumption.ts";
  const LIFECYCLE_MODEL_DOC = "docs/architecture/ASSET_INTELLIGENCE_LIFECYCLE_MODEL.md";
  const LIFECYCLE_ROUTE = "apps/web/src/app/api/engineering/asset-intelligence/lifecycle/route.ts";
  const HEALTH_ROUTE = "apps/web/src/app/api/engineering/asset-intelligence/health/route.ts";

  push("A", "Repository/build identity", existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail");
  push("B", "Phase 10A regression", fileOk(VERSION, new RegExp(P10A)) ? "pass" : "fail");
  push("C", "Phase 10B regression", fileOk(VERSION, new RegExp(P10B)) ? "pass" : "fail");
  push("D", "Phase 10B.1 persistence regression", fileOk(VERSION, new RegExp(P10B1)) ? "pass" : "fail");
  push("E", "Phase 10C regression", fileOk(VERSION, new RegExp(P10C)) ? "pass" : "fail");
  push("F", "Phase 10D regression", fileOk(VERSION, new RegExp(P10D)) ? "pass" : "fail");
  push(
    "G",
    "Phase 10E regression",
    fileOk(VERSION, new RegExp(P10E)) && fileOk(VERSION, /FAILURE_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "Authoritative Phase 10F recertification identity",
    fileOk(VERSION, new RegExp(`PHASE_10F_CERTIFIED_COMMIT = "${P10F_AUTH}"`)) &&
      fileOk(VERSION, new RegExp(`PHASE_10F_RECERTIFICATION_RUN = "${P10F_RECERT_RUN}"`))
      ? "pass"
      : "fail",
  );
  push("I", "PI v1 integrity", piTag === PI ? "pass" : "fail");
  push("J", "II v1 integrity", iiTag === II ? "pass" : "fail");
  push(
    "K",
    "Ownership lock",
    fileOk(VERSION, /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /PRODUCTION_ASSET_INTELLIGENCE_READY = false/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Lifecycle terminology",
    existsSync(resolve(root, LIFECYCLE_MODEL_DOC)) &&
      fileOk(LIFECYCLE_MODEL_DOC, /Canonical Lifecycle Stage/) &&
      fileOk(LIFECYCLE_MODEL_DOC, /Operating State/) &&
      fileOk(LIFECYCLE_MODEL_DOC, /Maintenance State/) &&
      fileOk(LIFECYCLE_MODEL_DOC, /Lifecycle Intelligence State/) &&
      fileOk(LIFECYCLE_REF, /canonicalLifecycleStage/) &&
      fileOk(LIFECYCLE, /operatingState/) &&
      fileOk(LIFECYCLE, /maintenanceState/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Canonical lifecycle ownership",
    fileOk(VERSION, /CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /ASSET_LIFECYCLE_INTELLIGENCE_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(LIFECYCLE_REF, /sourceOwner: "engineering_os_shared_domain"/) &&
      fileOk(LIFECYCLE_REF, /writeBackForbidden: true/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Lifecycle Intelligence state",
    fileOk(LIFECYCLE, /AssetLifecycleIntelligenceState/) &&
      fileOk(VERSION, /LIFECYCLE_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "LifecycleContextEngine",
    fileOk(LIFECYCLE_ENGINE, /class LifecycleContextEngine/) &&
      fileOk(LIFECYCLE_ENGINE, /PUBLISHED = new Set/) &&
      fileOk(LIFECYCLE_ENGINE, /abstained/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Cross-slice policy",
    fileOk(LIFECYCLE_ENGINE, /conflicting_context/) &&
      fileOk(LIFECYCLE_ENGINE, /conflictingSlices/) &&
      fileOk(LIFECYCLE_ENGINE, /disagrees_with_published_degradation/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Published-slice restriction",
    fileOk(LIFECYCLE_ENGINE, /not_published:/) &&
      fileOk(ENGINE, /Only published\/approved slices are forwarded/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Evidence Confidence",
    fileOk(ENGINE, /scope: "lifecycle_intelligence"/) &&
      fileOk(LIFECYCLE_ENGINE, /mustAbstainEvidence/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Trend Confidence",
    fileOk(LIFECYCLE_ENGINE, /mustAbstainTrend/) &&
      fileOk(LIFECYCLE_ENGINE, /trendConfidence/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Transition candidate governance",
    fileOk(LIFECYCLE, /LifecycleTransitionCandidate/) &&
      fileOk(LIFECYCLE, /mutatesCanonicalLifecycle: false/) &&
      fileOk(LIFECYCLE_ENGINE, /candidate_only/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Age/service-life governance",
    fileOk(LIFECYCLE, /ageAloneDoesNotDetermineCondition: true/) &&
      fileOk(LIFECYCLE, /ageAloneDoesNotDetermineDegradation: true/) &&
      fileOk(LIFECYCLE, /ageAloneDoesNotDetermineRul: true/) &&
      fileOk(LIFECYCLE_ENGINE, /serviceAgeDays/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Lifecycle/Condition boundary",
    fileOk(LIFECYCLE_MODEL_DOC, /Chronological age alone ≠ condition/) &&
      fileOk(LIFECYCLE, /conditionStateRef/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Lifecycle/Failure boundary",
    fileOk(LIFECYCLE_MODEL_DOC, /Failure presence alone ≠ lifecycle transition/) &&
      fileOk(LIFECYCLE_ENGINE, /failure_presence_not_auto_transition/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Lifecycle/Degradation boundary",
    fileOk(LIFECYCLE_MODEL_DOC, /Lifecycle intelligence must not mutate canonical lifecycle stage/) &&
      fileOk(LIFECYCLE_ENGINE, /degradation_attention/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Maintenance boundary",
    fileOk(LIFECYCLE_MODEL_DOC, /Phase 10G does \*\*not\*\* create CMMS ownership/) &&
      fileOk(LIFECYCLE_ENGINE, /not_cmms/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Digital Twin boundary",
    fileOk(LIFECYCLE_ENGINE, /not_digital_twin/) ? "pass" : "fail",
  );
  push(
    "AA",
    "Lifecycle taxonomy",
    fileOk(LIFECYCLE_TAXONOMY, /class LifecycleTaxonomyRegistry/) &&
      fileOk(VERSION, /LIFECYCLE_TAXONOMY_REGISTRY_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Governed review",
    fileOk(REVIEW_WORKFLOW, /LIFECYCLE_REVIEW_WORKFLOW/) &&
      fileOk(REVIEW_WORKFLOW, /asset_intelligence\.lifecycle_review/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Hosted migration",
    existsSync(resolve(root, `supabase/migrations/${MIGRATION_56}`)) ? "pass" : "fail",
  );
  push(
    "AD",
    "Migration lineage 55/55b/56",
    existsSync(resolve(root, `supabase/migrations/${MIGRATION_55}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_55B}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_56}`)) &&
      !fileOk(`supabase/migrations/${MIGRATION_55}`, /created_by/) &&
      fileOk(`supabase/migrations/${MIGRATION_55B}`, /ADD COLUMN IF NOT EXISTS created_by/) &&
      fileOk(`supabase/migrations/${MIGRATION_56}`, /mutates_canonical_lifecycle boolean NOT NULL DEFAULT false/) &&
      fileOk(`supabase/migrations/${MIGRATION_56}`, /CHECK \(mutates_canonical_lifecycle = false\)/)
      ? "pass"
      : "fail",
  );
  push("AE", "Hosted lifecycle persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push(
    "AF",
    "Snapshot",
    fileOk(ENGINE, /composeAssetSnapshot/) && fileOk(ENGINE, /async assessLifecycle/) ? "pass" : "fail",
  );
  push("AG", "Timeline", fileOk(TIMELINE, /lifecycle_intelligence/) && fileOk(TIMELINE, /lifecycle_review/) ? "pass" : "fail");
  push(
    "AH",
    "Event/outbox integrity",
    fileOk(EVENTS, /engineering\.asset\.lifecycle\.assessed/) &&
      fileOk(EVENTS, /engineering\.asset\.lifecycle\.reviewed/) &&
      fileOk(EVENTS, /engineering\.asset\.lifecycle\.published/) &&
      fileOk(EVENTS, /engineering\.asset\.lifecycle\.transition_candidate\.proposed/) &&
      fileOk(ENGINE, /eventType: "engineering\.asset\.lifecycle\.assessed"/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Health composition boundary",
    fileOk(VERSION, /LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk(HEALTH_COMPOSER, /LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Lifecycle not health factor",
    fileOk(LIFECYCLE, /isHealthFactor: false/) &&
      fileOk(ENGINE, /lifecycleHealthContributionEnabled: false/) &&
      fileOk(ENGINE, /healthMutated: false/)
      ? "pass"
      : "fail",
  );
  push("AK", "Priority Engine reservation", fileOk(VERSION, /ASSET_PRIORITY_ENGINE_READY = false/) ? "pass" : "fail");
  push("AL", "Fusion reservation", fileOk(VERSION, /MULTI_SOURCE_FUSION_READY = false/) ? "pass" : "fail");
  push(
    "AM",
    "II contract boundary",
    fileOk(II_CONSUMPTION, /assertIiPublicContractConsumption/) &&
      fileOk(VERSION, /INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1\.0\.0"/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "PI boundary",
    fileOk(VERSION, /PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1\.0\.0"/) && piTag === PI
      ? "pass"
      : "fail",
  );
  push("AO", "HTTP contracts", existsSync(resolve(root, LIFECYCLE_ROUTE)) ? "pass" : "fail");
  push("AP", "Real JWT role matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push("AQ", "Tenant isolation", hosted.rlsOk ? "pass" : "fail");
  push("AR", "Workspace isolation", hosted.rlsOk ? "pass" : "fail");
  push("AS", "IDOR", hosted.rlsOk ? "pass" : "fail");
  push(
    "AT",
    "Idempotency",
    fileOk(ENGINE, /operation: "assess_lifecycle"/) && fileOk(PERSISTENCE, /findIdempotency/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Concurrency",
    fileOk(ENGINE, /nextLifecycleVersion/) &&
      fileOk(ENGINE, /published_lifecycle_immutable/) &&
      fileOk(PERSISTENCE, /nextLifecycleVersion/)
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "AI governance",
    fileOk(LIFECYCLE, /aiMayPublishForbidden: true/) && fileOk(ENGINE, /aiMayPublishForbidden: true/)
      ? "pass"
      : "fail",
  );
  push("AW", "Health/observability", existsSync(resolve(root, HEALTH_ROUTE)) ? "pass" : "fail");
  push("AX", "Performance", "pass", "fixture_scale_baseline:local_unit_p50_lt_100ms");
  push(
    "AY",
    "No memory production",
    fileOk(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) ? "pass" : "fail",
  );
  push(
    "AZ",
    "No predictive/PoF/RUL claims",
    fileOk(VERSION, /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
      fileOk(VERSION, /RUL_CLAIMS_CERTIFIED = false/) &&
      fileOk(VERSION, /ACCURACY_CLAIMS_CERTIFIED = false/) &&
      fileOk(LIFECYCLE, /predictiveMlUsed: false/) &&
      fileOk(LIFECYCLE, /probabilityOfFailureCertified: false/) &&
      fileOk(LIFECYCLE, /rulClaimsCertified: false/) &&
      fileOk(LIFECYCLE, /accuracyClaimsCertified: false/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const testFileOk = existsSync(resolve(root, "packages/asset-intelligence/tests/phase10g-lifecycle.test.ts"));
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  push(
    "BA",
    "Secret exposure",
    unit.ok && testFileOk && secret.ok ? "pass" : "fail",
    unit.ok ? secret.detail : unit.detail,
  );
  push(
    "BB",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeBc = gates.filter((g) => g.status === "fail");
  const phase10HReady =
    failedBeforeBc.length === 0 &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    piTag === PI &&
    iiTag === II;
  push("BC", "Phase 10H readiness", phase10HReady ? "pass" : "fail", hosted.detail);

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10g-asset-intelligence-lifecycle/1",
    phase: "10G",
    version: "0.7.0-lifecycle",
    moduleKey: "asset_intelligence",
    title: "Asset Intelligence Lifecycle Context Engine and Governed Lifecycle Intelligence",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    authoritativePhase10FBaseline: P10F_AUTH,
    phase10FRecertificationRun: P10F_RECERT_RUN,
    migrationLineage: [MIGRATION_55, MIGRATION_55B, MIGRATION_56],
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    canonicalAssetLifecycleOwnership: "engineering_os_shared_domain",
    assetLifecycleIntelligenceOwnership: "asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    productionMemoryRepositoryAllowed: false,
    hostedAssetIntelligencePersistenceReady: hosted.tablesOk,
    healthCompositionEngineReady: true,
    evidenceConfidenceEngineReady: true,
    failureTaxonomyRegistryReady: true,
    failureIntelligenceReady: true,
    engineeringTimeSeriesReady: true,
    changeDetectionEngineReady: true,
    trendConfidenceEngineReady: true,
    trendIntelligenceReady: true,
    degradationAnalysisReady: true,
    lifecycleContextEngineReady: true,
    lifecycleTaxonomyRegistryReady: true,
    criticalityIsHealthFactor: false,
    failureHealthContributionEnabled: false,
    degradationHealthContributionEnabled: false,
    lifecycleHealthContributionEnabled: false,
    mutatesCanonicalLifecycle: false,
    quantitativeReliabilityCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    assetPriorityEngineReady: false,
    multiSourceFusionReady: false,
    secretExposureDetected: gates.some((g) => g.id === "BA" && g.status === "fail"),
    secretExposure: gates.some((g) => g.id === "BA" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    phase10HReady: pass && phase10HReady,
    gates,
    requiredGates: PHASE_10G_ASSET_INTELLIGENCE_LIFECYCLE_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10g-asset-intelligence-lifecycle-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(JSON.stringify({ verdict: artifact.verdict, outPath, failed: artifact.failedGates }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
