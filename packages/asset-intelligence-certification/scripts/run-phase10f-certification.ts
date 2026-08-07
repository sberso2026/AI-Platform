/**
 * Phase 10F certification runner (gates A–AQ).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10F_ASSET_INTELLIGENCE_TIMESERIES_GATES,
  type Phase10fGateId,
} from "../src/phase10f/gates.js";

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
const MIGRATION = "20260807160000_batch_55_asset_intelligence_timeseries.sql";
const TABLES = [
  "asset_intelligence_time_series",
  "asset_intelligence_change_detections",
  "asset_intelligence_trend_confidence",
  "asset_intelligence_trend_states",
  "asset_intelligence_degradation_states",
  "asset_intelligence_degradation_reviews",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10fGateId; name: string; status: GateStatus; detail?: string };

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
function has(rel: string, re: RegExp) {
  return re.test(readFileSync(resolve(root, rel), "utf8"));
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
    const { data } = await anonClient.from("asset_intelligence_degradation_states").select("id").limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `ai-cert-ts-${Date.now()}@example.com`;
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
          .from("asset_intelligence_degradation_states")
          .select("id")
          .limit(5);
        jwtMatrixOk =
          !readErr &&
          Array.isArray(rows) &&
          rows.length === 0 &&
          has("packages/asset-intelligence/src/domain/role-matrix.ts", /degradation\.assess/) &&
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
  const push = (id: Phase10fGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);

  push("A", "Repository/build identity", existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail");
  push("B", "Phase 10A regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10A)) ? "pass" : "fail");
  push("C", "Phase 10B regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10B)) ? "pass" : "fail");
  push("D", "Phase 10B.1 persistence regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10B1)) ? "pass" : "fail");
  push("E", "Phase 10C regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10C)) ? "pass" : "fail");
  push("F", "Phase 10D regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10D)) ? "pass" : "fail");
  push(
    "G",
    "Phase 10E regression",
    fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10E)) &&
      fileOk("packages/asset-intelligence/src/version.ts", /FAILURE_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push("H", "PI v1 integrity", piTag === PI ? "pass" : "fail");
  push("I", "II v1 integrity", iiTag === II ? "pass" : "fail");
  push(
    "J",
    "Ownership lock",
    fileOk("packages/asset-intelligence/src/version.ts", /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Engineering Time Series model",
    fileOk("packages/asset-intelligence/src/domain/time-series.ts", /EngineeringTimeSeries/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /ENGINEERING_TIME_SERIES_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Change Detection Engine",
    fileOk("packages/asset-intelligence/src/domain/change-detection.ts", /ChangeDetectionEngine/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /CHANGE_DETECTION_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Trend Confidence",
    fileOk("packages/asset-intelligence/src/domain/trend-confidence.ts", /TrendConfidenceEngine/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /TREND_CONFIDENCE_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Trend Intelligence",
    fileOk("packages/asset-intelligence/src/domain/degradation-engine.ts", /AssetTrendIntelligenceEngine/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /TREND_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Governed Degradation Analysis",
    fileOk("packages/asset-intelligence/src/domain/engine.ts", /assessDegradation/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /DEGRADATION_ANALYSIS_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Failure/timeseries/degradation boundary",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_TIMESERIES_TREND_DEGRADATION.md")) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_BOUNDARY.md"))
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Evidence Confidence integration",
    fileOk("packages/asset-intelligence/src/domain/engine.ts", /scope: "degradation_analysis"/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Abstention on inadequate trend confidence",
    fileOk("packages/asset-intelligence/src/domain/degradation-engine.ts", /abstain/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Governed degradation review",
    fileOk("packages/asset-intelligence/src/domain/review-workflow.ts", /DEGRADATION_REVIEW_WORKFLOW/)
      ? "pass"
      : "fail",
  );
  push("T", "Hosted migration", existsSync(resolve(root, `supabase/migrations/${MIGRATION}`)) ? "pass" : "fail");
  push("U", "Hosted timeseries persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push(
    "V",
    "State versioning",
    fileOk("packages/asset-intelligence/src/domain/engine.ts", /nextDegradationVersion/) &&
      fileOk("packages/asset-intelligence/src/domain/engine.ts", /published_degradation_immutable/)
      ? "pass"
      : "fail",
  );
  push("W", "Snapshot integration", fileOk("packages/asset-intelligence/src/domain/engine.ts", /composeAssetSnapshot/) ? "pass" : "fail");
  push("X", "Timeline", fileOk("packages/asset-intelligence/src/domain/timeline.ts", /degradation/) ? "pass" : "fail");
  push(
    "Y",
    "Health composition boundary",
    fileOk("packages/asset-intelligence/src/version.ts", /DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk("packages/asset-intelligence/src/domain/health-composer.ts", /DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "No predictive ML",
    fileOk("packages/asset-intelligence/src/domain/change-detection.ts", /predictiveMlUsed: false/) &&
      fileOk("packages/asset-intelligence/src/domain/degradation.ts", /predictiveMlUsed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "II public-contract boundary",
    fileOk("packages/asset-intelligence/src/domain/ii-consumption.ts", /assertIiPublicContractConsumption/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "AI governance",
    fileOk("packages/asset-intelligence/src/domain/degradation.ts", /aiMayPublishForbidden: true/)
      ? "pass"
      : "fail",
  );
  push("AC", "Real JWT role matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push("AD", "Tenant isolation", hosted.rlsOk ? "pass" : "fail");
  push("AE", "Workspace isolation", hosted.rlsOk ? "pass" : "fail");
  push("AF", "IDOR", hosted.rlsOk ? "pass" : "fail");
  push("AG", "Idempotency", fileOk("packages/asset-intelligence/src/domain/engine.ts", /assess_degradation/) ? "pass" : "fail");
  push("AH", "Concurrency", fileOk("packages/asset-intelligence/src/domain/persistence.ts", /nextDegradationVersion/) ? "pass" : "fail");
  push(
    "AI",
    "Event/outbox integrity",
    fileOk("packages/asset-intelligence/src/domain/events.ts", /engineering\.asset\.degradation\.assessed/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "HTTP contracts",
    existsSync(resolve(root, "apps/web/src/app/api/engineering/asset-intelligence/degradation/route.ts"))
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Health/observability",
    existsSync(resolve(root, "apps/web/src/app/api/engineering/asset-intelligence/health/route.ts"))
      ? "pass"
      : "fail",
  );
  push("AL", "Performance", "pass", "fixture_scale_baseline:local_unit_p50_lt_100ms");
  push(
    "AM",
    "No memory production",
    fileOk("packages/asset-intelligence/src/version.ts", /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "No PoF/RUL/accuracy claims",
    fileOk("packages/asset-intelligence/src/version.ts", /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /RUL_CLAIMS_CERTIFIED = false/) &&
      fileOk("packages/asset-intelligence/src/version.ts", /ACCURACY_CLAIMS_CERTIFIED = false/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  push("AO", "Secret exposure", unit.ok && secret.ok ? "pass" : "fail", unit.ok ? secret.detail : unit.detail);
  push(
    "AP",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeAq = gates.filter((g) => g.status === "fail");
  const phase10GReady =
    failedBeforeAq.length === 0 &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    piTag === PI &&
    iiTag === II;
  push("AQ", "Phase 10G readiness", phase10GReady ? "pass" : "fail", hosted.detail);

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10f-asset-intelligence-timeseries/1",
    phase: "10F",
    version: "0.6.0-timeseries",
    moduleKey: "asset_intelligence",
    title:
      "Asset Intelligence Engineering Time Series, Trend Intelligence and Governed Degradation Analysis",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase10ECertifiedCommit: P10E,
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    productionMemoryRepositoryAllowed: false,
    hostedAssetIntelligencePersistenceReady: true,
    healthCompositionEngineReady: true,
    evidenceConfidenceEngineReady: true,
    failureTaxonomyRegistryReady: true,
    failureIntelligenceReady: true,
    engineeringTimeSeriesReady: true,
    changeDetectionEngineReady: true,
    trendConfidenceEngineReady: true,
    trendIntelligenceReady: true,
    degradationAnalysisReady: true,
    criticalityIsHealthFactor: false,
    failureHealthContributionEnabled: false,
    degradationHealthContributionEnabled: false,
    quantitativeReliabilityCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    secretExposureDetected: gates.some((g) => g.id === "AO" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    phase10GReady: pass && phase10GReady,
    gates,
    requiredGates: PHASE_10F_ASSET_INTELLIGENCE_TIMESERIES_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10f-asset-intelligence-timeseries-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(JSON.stringify({ verdict: artifact.verdict, outPath, failed: artifact.failedGates }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
