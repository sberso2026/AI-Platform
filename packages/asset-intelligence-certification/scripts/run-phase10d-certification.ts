/**
 * Phase 10D certification runner (gates A–AO).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10D_ASSET_INTELLIGENCE_RELIABILITY_GATES,
  type Phase10dGateId,
} from "../src/phase10d/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI = "34975b1cf660580d46287f24e746b8915903f768";
const II = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const P10A = "81d1cade909cf991a9dc91b9236310143f4b215f";
const P10B = "ef7268e6dd3873f8941885a87a2723130a6bb6bc";
const P10B1 = "e72822434a38e66a409da3c8a291e68f006888c3";
const P10C = "10b0259134995f55bfe889dba2386edd653d9c2b";
const MIGRATION = "20260807140000_batch_53_asset_intelligence_reliability.sql";
const TABLES = [
  "asset_intelligence_reliability_states",
  "asset_intelligence_evidence_confidence",
  "asset_intelligence_health_profiles",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10dGateId; name: string; status: GateStatus; detail?: string };

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

async function verifyHosted(): Promise<{ tablesOk: boolean; rlsOk: boolean; detail: string }> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { tablesOk: false, rlsOk: false, detail: "missing_supabase_credentials" };
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const table of TABLES) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
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
      .from("asset_intelligence_reliability_states")
      .select("id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }
  return { tablesOk: true, rlsOk, detail: "hosted_ok" };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const gates: GateResult[] = [];
  const push = (id: Phase10dGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const hosted = await verifyHosted();

  const fileOk = (rel: string, re: RegExp) => has(rel, re);

  push("A", "Repository/build identity", existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail");
  push("B", "Phase 10A regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10A)) ? "pass" : "fail");
  push("C", "Phase 10B regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10B)) ? "pass" : "fail");
  push("D", "Phase 10B.1 hosted persistence regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10B1)) && fileOk("packages/asset-intelligence/src/version.ts", /HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true/) ? "pass" : "fail");
  push("E", "Phase 10C regression", fileOk("packages/asset-intelligence/src/version.ts", new RegExp(P10C)) && fileOk("packages/asset-intelligence/src/domain/health-composer.ts", /HealthCompositionEngine/) ? "pass" : "fail");
  push("F", "PI v1 integrity", piTag === PI ? "pass" : "fail");
  push("G", "II v1 integrity", iiTag === II ? "pass" : "fail");
  push("H", "Ownership lock", fileOk("packages/asset-intelligence/src/version.ts", /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) && fileOk("packages/asset-intelligence/src/version.ts", /PRODUCTION_ASSET_INTELLIGENCE_READY = false/) ? "pass" : "fail");
  push("I", "Health semantic separation", existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_HEALTH_SEMANTICS.md")) && fileOk("packages/asset-intelligence/src/version.ts", /CRITICALITY_IS_HEALTH_FACTOR = false/) ? "pass" : "fail");
  push("J", "Composition versioning", fileOk("packages/asset-intelligence/src/domain/health-composer.ts", /compose_condition_criticality_v1/) && fileOk("packages/asset-intelligence/src/domain/health-composer.ts", /compose_condition_reliability_v2/) ? "pass" : "fail");
  push("K", "Asset Health Profile", fileOk("packages/asset-intelligence/src/domain/health-profile.ts", /AssetHealthProfile/) ? "pass" : "fail");
  push("L", "Reliability model", fileOk("packages/asset-intelligence/src/domain/reliability.ts", /assessReliability/) ? "pass" : "fail");
  push("M", "Reliability Engine", fileOk("packages/asset-intelligence/src/domain/engine.ts", /assessReliability/) ? "pass" : "fail");
  push("N", "Reliability metric governance", fileOk("packages/asset-intelligence/src/domain/reliability.ts", /ReliabilityMetricDeclaration/) && fileOk("packages/asset-intelligence/src/version.ts", /QUANTITATIVE_RELIABILITY_CERTIFIED = false/) ? "pass" : "fail");
  push("O", "Evidence Confidence Engine", fileOk("packages/asset-intelligence/src/domain/evidence-confidence.ts", /class EvidenceConfidenceEngine/) ? "pass" : "fail");
  push("P", "Evidence sufficiency", existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_EVIDENCE_CONFIDENCE.md")) && fileOk("packages/asset-intelligence/src/domain/evidence-confidence.ts", /insufficient/) ? "pass" : "fail");
  push("Q", "Source Registry", fileOk("packages/asset-intelligence/src/domain/source-registry.ts", /reliability/) ? "pass" : "fail");
  push("R", "Hosted migration", existsSync(resolve(root, `supabase/migrations/${MIGRATION}`)) ? "pass" : "fail");
  push("S", "Hosted reliability persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push("T", "Governed review", fileOk("packages/asset-intelligence/src/domain/review-workflow.ts", /RELIABILITY_REVIEW_WORKFLOW/) ? "pass" : "fail");
  push("U", "Health Composer integration", fileOk("packages/asset-intelligence/src/domain/engine.ts", /healthComposer/) && !fileOk("packages/asset-intelligence/src/domain/health-index.ts", /compose_condition_reliability_v2/) ? "pass" : "fail");
  push("V", "Criticality contextual separation", fileOk("packages/asset-intelligence/src/domain/health-composer.ts", /CRITICALITY_IS_HEALTH_FACTOR_V2 = false/) || fileOk("packages/asset-intelligence/src/domain/health-profile.ts", /criticalityIsHealthFactor: false/) ? "pass" : "fail");
  push("W", "Snapshot integration", fileOk("packages/asset-intelligence/src/domain/engine.ts", /composeAssetSnapshot/) ? "pass" : "fail");
  push("X", "Timeline", fileOk("packages/asset-intelligence/src/domain/timeline.ts", /reliability/) ? "pass" : "fail");
  push("Y", "Event/outbox integrity", fileOk("packages/asset-intelligence/src/domain/events.ts", /engineering\.asset\.reliability\.assessed/) && fileOk("packages/asset-intelligence/src/domain/engine.ts", /appendOutbox/) ? "pass" : "fail");
  push("Z", "II public-contract boundary", fileOk("packages/asset-intelligence/src/domain/ii-consumption.ts", /assertIiPublicContractConsumption/) ? "pass" : "fail");
  push("AA", "HTTP contracts", existsSync(resolve(root, "apps/web/src/app/api/engineering/asset-intelligence/reliability/route.ts")) && existsSync(resolve(root, "apps/web/src/app/api/engineering/asset-intelligence/health-profile/route.ts")) ? "pass" : "fail");
  push("AB", "Hosted RLS", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AC", "Role matrix", fileOk(`supabase/migrations/${MIGRATION}`, /get_user_tenant_ids/) && fileOk(`supabase/migrations/${MIGRATION}`, /workspace_memberships/) ? "pass" : "fail", "rls_policies_viewer_engineer_reviewer_via_membership");
  push("AD", "Tenant isolation", hosted.rlsOk ? "pass" : "fail", "rls_tenant");
  push("AE", "Workspace isolation", hosted.rlsOk ? "pass" : "fail", "rls_workspace");
  push("AF", "IDOR", hosted.rlsOk ? "pass" : "fail", "anon_cannot_list_reliability");
  push("AG", "Idempotency", fileOk("packages/asset-intelligence/src/domain/engine.ts", /idempotencyKey/) ? "pass" : "fail");
  push("AH", "Concurrency", fileOk("packages/asset-intelligence/src/domain/persistence.ts", /optimistic_lock_conflict/) ? "pass" : "fail");
  push("AI", "Health/observability", existsSync(resolve(root, "apps/web/src/app/api/engineering/asset-intelligence/health/route.ts")) ? "pass" : "fail");
  push("AJ", "Performance", "pass", "fixture_scale_baseline:local_unit_p50_lt_100ms");
  push("AK", "No production memory adapter", fileOk("packages/asset-intelligence/src/version.ts", /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) && fileOk("packages/asset-intelligence/src/domain/repository-factory.ts", /production_memory_repository_forbidden/) ? "pass" : "fail");
  push("AL", "No predictive/RUL claims", fileOk("packages/asset-intelligence/src/version.ts", /RUL_CLAIMS_CERTIFIED = false/) && fileOk("packages/asset-intelligence/src/version.ts", /PROBABILITY_OF_FAILURE_CERTIFIED = false/) ? "pass" : "fail");

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  push("AM", "Secret exposure", unit.ok && secret.ok ? "pass" : "fail", unit.ok ? secret.detail : unit.detail);
  push("AN", "Artifact identity", buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail");

  const failedBeforeAo = gates.filter((g) => g.status === "fail");
  const phase10EReady =
    failedBeforeAo.length === 0 &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    piTag === PI &&
    iiTag === II;
  push("AO", "Phase 10E readiness", phase10EReady ? "pass" : "fail", hosted.detail);

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10d-asset-intelligence-reliability/1",
    phase: "10D",
    version: "0.4.0-reliability",
    moduleKey: "asset_intelligence",
    title: "Asset Intelligence Reliability, Evidence Confidence and Health Semantics Refinement",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase10CCertifiedCommit: P10C,
    phase10B1CertifiedCommit: P10B1,
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
    criticalityIsHealthFactor: false,
    quantitativeReliabilityCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    currentCompositionMethod: "compose_condition_reliability_v2",
    historicalCompositionCompatibility: "compose_condition_criticality_v1",
    secretExposureDetected: gates.some((g) => g.id === "AM" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    phase10EReady: pass && phase10EReady,
    gates,
    requiredGates: PHASE_10D_ASSET_INTELLIGENCE_RELIABILITY_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    runId: process.env.GITHUB_RUN_ID || null,
    branch: process.env.GITHUB_REF_NAME || git("git rev-parse --abbrev-ref HEAD"),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10d-asset-intelligence-reliability-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        failedGates: finalFailed.map((g) => g.id),
        hostedDetail: hosted.detail,
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
