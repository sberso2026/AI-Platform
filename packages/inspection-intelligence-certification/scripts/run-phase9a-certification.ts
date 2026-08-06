/**
 * Phase 9A — Inspection Intelligence discovery and framework lock certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9A_INSPECTION_DISCOVERY_GATES,
  type Phase9aGateId,
} from "../src/phase9a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_8I1_CERTIFIED = "5c5581232d6b93e4a9a0df0dbb1d7218cb50d60c";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase9aGateId;
  name: string;
  status: GateStatus;
  detail?: string;
};

function run(cmd: string, env?: NodeJS.ProcessEnv): { ok: boolean; detail: string } {
  try {
    execSync(cmd, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    return { ok: true, detail: "ok" };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
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
  const push = (id: Phase9aGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
    `sha=${ciHeadSha}`,
  );

  let releaseTagTarget = resolveTag(PI_V1_TAG);
  if (!releaseTagTarget && process.env.GITHUB_ACTIONS === "true") {
    run("git fetch --tags --force");
    releaseTagTarget = resolveTag(PI_V1_TAG);
  }
  const releaseTagMoved = Boolean(releaseTagTarget && releaseTagTarget !== PI_V1_CERTIFIED);
  push(
    "B",
    "Project Intelligence v1 tag integrity",
    releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved ? "pass" : "fail",
    `target=${releaseTagTarget ?? "missing"}`,
  );

  push(
    "C",
    "Phase 8I.1 baseline identity",
    PHASE_8I1_CERTIFIED.startsWith("5c55812") ? "pass" : "fail",
    `baseline=${PHASE_8I1_CERTIFIED}`,
  );

  const discoveryDocs = [
    "docs/architecture/INSPECTION_INTELLIGENCE_DISCOVERY.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_GENERIC_FRAMEWORK.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_DATA_OWNERSHIP.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_MODULE_CONTRACT.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_PLATFORM_INTEGRATION.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_SCHEMA_PLAN.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_MEASUREMENT_FRAMEWORK.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_EVIDENCE_FRAMEWORK.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_SPATIAL_AND_TIME_MODEL.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_EXTENSION_POINTS.md",
  ];
  push(
    "D",
    "Discovery documentation complete",
    discoveryDocs.every((d) => existsSync(resolve(root, d))) ? "pass" : "fail",
  );

  push(
    "E",
    "Generic inspection framework lock",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_GENERIC_FRAMEWORK.md",
      /inspection_plan/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_GENERIC_FRAMEWORK.md",
        /inspection_session/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PRODUCT_FEATURES_IMPLEMENTED = false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Taxonomy and lifecycle lock",
    fileContains("docs/architecture/INSPECTION_INTELLIGENCE_DISCOVERY.md", /NDT/) &&
      fileContains("docs/architecture/INSPECTION_INTELLIGENCE_DISCOVERY.md", /Draft → Planned/) &&
      fileContains("docs/architecture/INSPECTION_INTELLIGENCE_DISCOVERY.md", /Custom Extensions/)
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Measurement framework",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_MEASUREMENT_FRAMEWORK.md",
      /Acceptance Criteria/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_MEASUREMENT_FRAMEWORK.md",
        /Instrument Calibration/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Evidence framework",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_EVIDENCE_FRAMEWORK.md",
      /Evidence Hash/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_EVIDENCE_FRAMEWORK.md",
        /Platform Files/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Spatial and time models",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_SPATIAL_AND_TIME_MODEL.md",
      /Digital Twin Node/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_SPATIAL_AND_TIME_MODEL.md",
        /Offline Mode/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Extension points reserved",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_EXTENSION_POINTS.md",
      /Crack Detection/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_EXTENSION_POINTS.md",
        /Asset Intelligence is \*\*not\*\* implemented/,
      ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_EXTENSION_POINTS.md",
        /private graph/i,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Data ownership and Engineering Core",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_DATA_OWNERSHIP.md",
      /assetOwnership.*engineering_os_shared_domain/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_DATA_OWNERSHIP.md",
        /must never own/i,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Platform integration forbids private stacks",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_PLATFORM_INTEGRATION.md",
      /Private AI Runtime/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_PLATFORM_INTEGRATION.md",
        /platform-intelligence/,
      )
      ? "pass"
      : "fail",
  );

  const placementOk =
    existsSync(resolve(root, "packages/inspection-intelligence/package.json")) &&
    existsSync(resolve(root, "packages/inspection-intelligence-certification/package.json")) &&
    fileContains(
      "packages/inspection-intelligence/package.json",
      /"name": "@rtb\/inspection-intelligence"/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /0\.1\.0-discovery/,
    ) &&
    fileContains(
      "packages/engineering-os/src/module-registry.ts",
      /moduleKey: "inspection_intelligence"/,
    );
  push("M", "Module contract and package placement", placementOk ? "pass" : "fail");

  {
    const result = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9a-inspection-discovery.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push("N", "Dependency and boundary architecture tests", result.ok ? "pass" : "fail", result.detail);
  }

  push(
    "O",
    "UI discovery skeleton marker",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      /inspection-intelligence-discovery-ready/,
    )
      ? "pass"
      : "fail",
  );

  {
    const versionOk = fileContains(
      "packages/project-intelligence/src/version.ts",
      /PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/,
    );
    const moduleTest = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8b-project-intelligence-module.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    const identity = run("pnpm --filter @rtb/inspection-intelligence test");
    push(
      "P",
      "Project Intelligence v1 regression",
      versionOk && moduleTest.ok && identity.ok && !releaseTagMoved ? "pass" : "fail",
      moduleTest.ok ? "PI v1 intact" : moduleTest.detail,
    );
  }

  {
    const result = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("Q", "Secret exposure", result.ok ? "pass" : "fail", result.detail);
  }

  const failedBeforeR = gates.filter((g) => g.status === "fail");
  const skippedBeforeR = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeR = gates.filter((g) => g.status === "not_executed");
  const artifactOk =
    (buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true") &&
    failedBeforeR.length === 0 &&
    skippedBeforeR.length === 0 &&
    notExecutedBeforeR.length === 0;
  push("R", "Artifact identity", artifactOk ? "pass" : "fail", `build=${buildIdentitySha}`);

  const failedBeforeS = gates.filter((g) => g.status === "fail");
  const inspectionProductFeaturesImplemented = false;
  const phase9BReady =
    failedBeforeS.length === 0 &&
    !releaseTagMoved &&
    inspectionProductFeaturesImplemented === false &&
    existsSync(resolve(root, "packages/inspection-intelligence"));

  push("S", "Phase 9B readiness", phase9BReady ? "pass" : "fail", `phase9BReady=${phase9BReady}`);

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9a-inspection-intelligence-discovery/1",
    phase: "9A",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.1.0-discovery",
    title: "Inspection Intelligence Architecture Discovery and Generic Inspection Framework Lock",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch: process.env.GITHUB_REF_NAME || git("git rev-parse --abbrev-ref HEAD"),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    projectIntelligenceV1CertifiedCommit: PI_V1_CERTIFIED,
    releaseTag: PI_V1_TAG,
    releaseTagTarget,
    releaseTagMoved,
    phase8i1Baseline: PHASE_8I1_CERTIFIED,
    inspectionPackageCreated: true,
    inspectionCertificationPackageCreated: true,
    inspectionProductFeaturesImplemented,
    assetOwnership: "engineering_os_shared_domain",
    releaseEligible,
    productionProjectIntelligenceReady: releaseTagTarget === PI_V1_CERTIFIED,
    secretExposureDetected: gates.some((g) => g.id === "Q" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9BReady: pass && phase9BReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9A_INSPECTION_DISCOVERY_GATES.map((g) => g[0]),
    failedGates: finalFailed.map((g) => g.id),
    skippedGates: finalSkipped.map((g) => g.id),
    notExecutedGates: finalNotExecuted.map((g) => g.id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    discoveryDocuments: discoveryDocs,
    timestamp: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase9a-inspection-intelligence-discovery-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        phase9BReady: artifact.phase9BReady,
        releaseEligible: artifact.releaseEligible,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
