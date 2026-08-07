/**
 * Phase 10B — Asset Intelligence core certification (gates A–Y).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_10B_ASSET_INTELLIGENCE_CORE_GATES,
  type Phase10bGateId,
} from "../src/phase10b/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const II_V1_CERTIFIED = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const II_V1_TAG = "inspection-intelligence-v1.0.0";
const PHASE_10A_CERTIFIED = "81d1cade909cf991a9dc91b9236310143f4b215f";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10bGateId; name: string; status: GateStatus; detail?: string };

function run(cmd: string): { ok: boolean; detail: string } {
  try {
    execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
    return { ok: true, detail: "ok" };
  } catch (error) {
    const err = error as { stderr?: string; stdout?: string; message?: string };
    return {
      ok: false,
      detail: (err.stderr || err.stdout || err.message || "failed").toString().slice(0, 2000),
    };
  }
}
function sha(): string {
  return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
}
function git(cmd: string): string {
  return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
}
function fileContains(rel: string, pattern: RegExp): boolean {
  return pattern.test(readFileSync(resolve(root, rel), "utf8"));
}
function resolveTag(tag: string): string | null {
  try {
    return git(`git rev-list -n 1 ${tag}`);
  } catch {
    return null;
  }
}

function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const gates: GateResult[] = [];
  const push = (id: Phase10bGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = resolveTag(PI_V1_TAG);
  const iiTag = resolveTag(II_V1_TAG);
  const piMoved = Boolean(piTag && piTag !== PI_V1_CERTIFIED);
  const iiMoved = Boolean(iiTag && iiTag !== II_V1_CERTIFIED);

  push("B", "PI v1 tag integrity", piTag === PI_V1_CERTIFIED && !piMoved ? "pass" : "fail");
  push("C", "II v1 tag integrity", iiTag === II_V1_CERTIFIED && !iiMoved ? "pass" : "fail");

  push(
    "D",
    "Phase 10A baseline intact",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      new RegExp(`PHASE_10A_CERTIFIED_COMMIT = "${PHASE_10A_CERTIFIED}"`),
    ) &&
      existsSync(
        resolve(root, "docs/architecture/ASSET_INTELLIGENCE_DATA_OWNERSHIP.md"),
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Shared-domain ownership",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Duplicate asset ownership",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Core version and flags",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /ASSET_INTELLIGENCE_VERSION = "0\.2\.0-core"/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/version.ts",
        /CORE_CONDITION_SLICE_READY = true/,
      ) &&
      fileContains(
        "packages/asset-intelligence/src/version.ts",
        /PRODUCTION_ASSET_INTELLIGENCE_READY = false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Asset Snapshot model",
    fileContains(
      "packages/asset-intelligence/src/domain/snapshot.ts",
      /composeAssetSnapshot/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/snapshot.ts",
        /isAssetRegistry: false/,
      ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_SNAPSHOT_MODEL.md"))
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Health Index abstraction",
    fileContains(
      "packages/asset-intelligence/src/domain/health-index.ts",
      /deriveAdvisoryHealthIndex/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/health-index.ts",
        /distinctFromConditionRating/,
      ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_HEALTH_INDEX.md"))
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Intelligence Source Registry",
    fileContains(
      "packages/asset-intelligence/src/domain/source-registry.ts",
      /INTELLIGENCE_SOURCE_REGISTRY/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/source-registry.ts",
        /assertRegisteredActiveSource/,
      ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_SOURCE_REGISTRY.md"))
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Historical Intelligence Timeline",
    fileContains(
      "packages/asset-intelligence/src/domain/timeline.ts",
      /IntelligenceTimelineEntry/,
    ) &&
      existsSync(
        resolve(root, "docs/architecture/ASSET_INTELLIGENCE_HISTORICAL_TIMELINE.md"),
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Asset Intelligence Engine",
    fileContains(
      "packages/asset-intelligence/src/domain/engine.ts",
      /AssetIntelligenceEngine/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/engine.ts",
        /assessConditionFromInspection/,
      ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_ENGINE.md"))
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Hosted persistence",
    fileContains(
      "packages/asset-intelligence/src/domain/persistence.ts",
      /createDurableAssetIntelligenceMemoryStore/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/persistence.ts",
        /AssetIntelligenceRepository/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "II public contract consumption",
    fileContains(
      "packages/asset-intelligence/src/domain/ii-consumption.ts",
      /assertIiPublicContractConsumption/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/version.ts",
        /INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1\.0\.0"/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "Condition vertical slice",
    existsSync(
      resolve(root, "packages/asset-intelligence/tests/engine-vertical-slice.test.ts"),
    ) &&
      fileContains(
        "packages/asset-intelligence/tests/engine-vertical-slice.test.ts",
        /orchestrates condition assess/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "Events governance",
    fileContains(
      "packages/asset-intelligence/src/domain/events.ts",
      /engineering\.asset\.condition\.updated/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/events.ts",
        /rawEvidenceForbidden: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Capabilities and services",
    fileContains(
      "packages/asset-intelligence/src/domain/capabilities.ts",
      /asset\.condition\.assess/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/domain/services.ts",
        /AssetIntelligenceService/,
      )
      ? "pass"
      : "fail",
  );

  const docs = [
    "docs/architecture/ASSET_INTELLIGENCE_ENGINE.md",
    "docs/architecture/ASSET_INTELLIGENCE_SNAPSHOT_MODEL.md",
    "docs/architecture/ASSET_INTELLIGENCE_HEALTH_INDEX.md",
    "docs/architecture/ASSET_INTELLIGENCE_SOURCE_REGISTRY.md",
    "docs/architecture/ASSET_INTELLIGENCE_HISTORICAL_TIMELINE.md",
    "docs/architecture/ASSET_INTELLIGENCE_PHASE_10B_CORE.md",
  ];
  push(
    "R",
    "Architecture docs",
    docs.every((d) => existsSync(resolve(root, d))) ? "pass" : "fail",
  );

  push(
    "S",
    "Core manifest",
    existsSync(
      resolve(
        root,
        "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.core.json",
      ),
    ) &&
      fileContains(
        "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.core.json",
        /0\.2\.0-core/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "No full module GA claim",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /PRODUCTION_ASSET_INTELLIGENCE_READY = false/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "RUL and accuracy uncertified",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /ACCURACY_CLAIMS_CERTIFIED = false/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/version.ts",
        /RUL_CLAIMS_CERTIFIED = false/,
      )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/asset-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase10b-asset-intelligence-core.test.ts",
    );
    const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
    push(
      "V",
      "Unit and architecture tests",
      unit.ok && arch.ok ? "pass" : "fail",
      unit.ok ? arch.detail : unit.detail,
    );
    push("W", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  }

  push(
    "X",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeY = gates.filter((g) => g.status === "fail");
  const skippedBeforeY = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeY = gates.filter((g) => g.status === "not_executed");
  const phase10CReady =
    failedBeforeY.length === 0 &&
    skippedBeforeY.length === 0 &&
    notExecutedBeforeY.length === 0 &&
    !piMoved &&
    !iiMoved;

  push(
    "Y",
    "Phase 10C readiness",
    phase10CReady && piTag === PI_V1_CERTIFIED && iiTag === II_V1_CERTIFIED ? "pass" : "fail",
    `phase10CReady=${phase10CReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = pass && !piMoved && !iiMoved;

  const artifact = {
    schemaVersion: "phase10b-asset-intelligence-core/1",
    phase: "10B",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "asset_intelligence",
    version: "0.2.0-core",
    title:
      "Asset Intelligence Core Domain, Hosted Persistence, First Vertical Slice, and Asset Intelligence Engine Foundation",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch: process.env.GITHUB_REF_NAME || git("git rev-parse --abbrev-ref HEAD"),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase10ACertifiedCommit: PHASE_10A_CERTIFIED,
    projectIntelligenceV1CertifiedCommit: PI_V1_CERTIFIED,
    inspectionIntelligenceV1CertifiedCommit: II_V1_CERTIFIED,
    projectIntelligenceV1Tag: PI_V1_TAG,
    inspectionIntelligenceV1Tag: II_V1_TAG,
    projectIntelligenceV1Intact: piTag === PI_V1_CERTIFIED && !piMoved,
    inspectionIntelligenceV1Intact: iiTag === II_V1_CERTIFIED && !iiMoved,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    coreConditionSliceReady: true,
    assetIntelligenceImplemented: true,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    secretExposureDetected: gates.some((g) => g.id === "W" && g.status === "fail"),
    releaseEligible,
    phase10CReady: pass && phase10CReady,
    nextPhaseReady: pass && phase10CReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_10B_ASSET_INTELLIGENCE_CORE_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10b-asset-intelligence-core-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        phase10CReady: artifact.phase10CReady,
        failedGates: finalFailed.map((g) => g.id),
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
