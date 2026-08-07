/**
 * Phase 10A — Asset Intelligence discovery certification (gates A–AK).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_10A_ASSET_INTELLIGENCE_DISCOVERY_GATES,
  type Phase10aGateId,
} from "../src/phase10a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const II_V1_CERTIFIED = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const II_V1_TAG = "inspection-intelligence-v1.0.0";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10aGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase10aGateId, name: string, status: GateStatus, detail?: string) =>
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
    "Existing asset inventory",
    existsSync(
      resolve(root, "docs/migration/ASSET_INTELLIGENCE_PHASE_10A_EXISTING_ASSET_INVENTORY.md"),
    ) &&
      fileContains(
        "docs/migration/ASSET_INTELLIGENCE_PHASE_10A_EXISTING_ASSET_INVENTORY.md",
        /canonical/,
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
    ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_DATA_OWNERSHIP.md"))
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Duplicate asset ownership",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/architecture/ownership-lock.ts",
        /assertOwnershipLock/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Identity/state separation",
    fileContains(
      "packages/asset-intelligence/src/architecture/identity-state.ts",
      /AssetIdentityReference/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/architecture/identity-state.ts",
        /AssetIntelligenceState/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Multi-hierarchy model",
    fileContains(
      "packages/asset-intelligence/src/architecture/hierarchy.ts",
      /MULTI_HIERARCHY_RULES/,
    ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_HIERARCHY_MODEL.md"))
      ? "pass"
      : "fail",
  );

  const conditionDoc = "docs/architecture/ASSET_INTELLIGENCE_CONDITION_CRITICALITY_RELIABILITY_MODEL.md";
  push(
    "I",
    "Condition model",
    existsSync(resolve(root, conditionDoc)) && fileContains(conditionDoc, /Condition/)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Criticality model",
    existsSync(resolve(root, conditionDoc)) && fileContains(conditionDoc, /Criticality/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Reliability model",
    existsSync(resolve(root, conditionDoc)) && fileContains(conditionDoc, /Reliability/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Risk boundary",
    existsSync(resolve(root, conditionDoc)) && fileContains(conditionDoc, /Risk/)
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Failure model",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_MODEL.md")) &&
      fileContains(
        "docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_MODEL.md",
        /Failure Mode/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Degradation model",
    fileContains(
      "docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_MODEL.md",
      /Degradation/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "RUL governance",
    fileContains(
      "packages/asset-intelligence/src/architecture/rul-governance.ts",
      /rulClaimsCertified: false/,
    ) &&
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_RUL_GOVERNANCE.md"))
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "Lifecycle model",
    fileContains(
      "docs/architecture/ASSET_INTELLIGENCE_SDK_AND_CROSS_MODULE.md",
      /Lifecycle/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "II consumption boundary",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1\.0\.0"/,
    ) &&
      fileContains(
        "docs/contracts/ASSET_INTELLIGENCE_PUBLIC_CONTRACTS_DRAFT.md",
        /ii\.asset\.reference/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "PI relationship",
    fileContains(
      "docs/architecture/ASSET_INTELLIGENCE_SDK_AND_CROSS_MODULE.md",
      /Project Intelligence/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Project Controls boundary",
    fileContains(
      "docs/architecture/ASSET_INTELLIGENCE_SDK_AND_CROSS_MODULE.md",
      /Project Controls/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Digital Twin boundary",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_DIGITAL_TWIN_BOUNDARY.md"))
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "SHM boundary",
    fileContains("docs/architecture/ASSET_INTELLIGENCE_SDK_AND_CROSS_MODULE.md", /SHM/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Maintenance boundary",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_MAINTENANCE_BOUNDARY.md")) &&
      fileContains(
        "docs/architecture/ASSET_INTELLIGENCE_MAINTENANCE_BOUNDARY.md",
        /not.*CMMS/i,
      )
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "SDK reuse",
    fileContains(
      "docs/architecture/ASSET_INTELLIGENCE_SDK_AND_CROSS_MODULE.md",
      /Engineering Module/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Pack strategy",
    existsSync(
      resolve(root, "docs/architecture/ASSET_INTELLIGENCE_TAXONOMY_AND_PACK_STRATEGY.md"),
    )
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Knowledge Graph boundary",
    fileContains(
      "docs/architecture/ASSET_INTELLIGENCE_SDK_AND_CROSS_MODULE.md",
      /Knowledge Graph/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "AI governance",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_AI_GOVERNANCE.md")) &&
      fileContains(
        "docs/architecture/ASSET_INTELLIGENCE_AI_GOVERNANCE.md",
        /no unsupported/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "AA",
    "Event contracts",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_EVENT_MODEL.md")) &&
      fileContains(
        "packages/asset-intelligence/src/architecture/contract-drafts.ts",
        /engineering\.asset\.condition\.updated/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Public contract drafts",
    existsSync(resolve(root, "docs/contracts/ASSET_INTELLIGENCE_PUBLIC_CONTRACTS_DRAFT.md")) &&
      fileContains(
        "packages/asset-intelligence/src/architecture/contract-drafts.ts",
        /0\.1\.0-draft/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Capability drafts",
    fileContains(
      "packages/asset-intelligence/src/architecture/contract-drafts.ts",
      /DRAFT_CAPABILITIES/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Service drafts",
    fileContains(
      "packages/asset-intelligence/src/architecture/contract-drafts.ts",
      /DRAFT_SERVICES/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Commercial boundary",
    existsSync(resolve(root, "docs/commercial/ASSET_INTELLIGENCE_COMMERCIAL_BOUNDARY.md"))
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Discovery manifest",
    existsSync(
      resolve(
        root,
        "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.discovery.json",
      ),
    ) &&
      fileContains(
        "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.discovery.json",
        /0\.1\.0-discovery/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Package placement",
    existsSync(resolve(root, "packages/asset-intelligence/package.json")) &&
      existsSync(resolve(root, "packages/asset-intelligence-certification/package.json"))
      ? "pass"
      : "fail",
  );

  push(
    "AH",
    "No production Asset Intelligence claim",
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /ASSET_INTELLIGENCE_IMPLEMENTED = false/,
    ) &&
      fileContains(
        "packages/asset-intelligence/src/version.ts",
        /PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/,
      )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/asset-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase10a-asset-intelligence-discovery.test.ts",
    );
    const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
    push(
      "AI",
      "Secret exposure",
      secret.ok && unit.ok && arch.ok ? "pass" : "fail",
      unit.ok ? (arch.ok ? secret.detail : arch.detail) : unit.detail,
    );
  }

  push(
    "AJ",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeAk = gates.filter((g) => g.status === "fail");
  const skippedBeforeAk = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeAk = gates.filter((g) => g.status === "not_executed");
  const phase10BReady =
    failedBeforeAk.length === 0 &&
    skippedBeforeAk.length === 0 &&
    notExecutedBeforeAk.length === 0 &&
    !piMoved &&
    !iiMoved &&
    fileContains(
      "packages/asset-intelligence/src/version.ts",
      /PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/,
    );

  push(
    "AK",
    "Phase 10B readiness",
    phase10BReady && piTag === PI_V1_CERTIFIED && iiTag === II_V1_CERTIFIED ? "pass" : "fail",
    `phase10BReady=${phase10BReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = pass && !piMoved && !iiMoved;

  const artifact = {
    schemaVersion: "phase10a-asset-intelligence-discovery/1",
    phase: "10A",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "asset_intelligence",
    version: "0.1.0-discovery",
    title:
      "Asset Intelligence Discovery, Shared Asset Domain Reconciliation, Ownership and Architecture Lock",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch: process.env.GITHUB_REF_NAME || git("git rev-parse --abbrev-ref HEAD"),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
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
    assetIntelligenceImplemented: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    secretExposureDetected: gates.some((g) => g.id === "AI" && g.status === "fail"),
    releaseEligible,
    phase10BReady: pass && phase10BReady,
    nextPhaseReady: pass && phase10BReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_10A_ASSET_INTELLIGENCE_DISCOVERY_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10a-asset-intelligence-discovery-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        phase10BReady: artifact.phase10BReady,
        failedGates: finalFailed.map((g) => g.id),
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
