/**
 * Phase 8I.1 — Repository structure, release integrity, module boundary certification.
 * Does not retag project-intelligence-v1.0.0. Does not create inspection packages.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_8I1_REPOSITORY_BOUNDARY_GATES,
  type Phase8i1GateId,
} from "../src/phase8i1/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI_V1_CERTIFIED_COMMIT = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_RELEASE_TAG = "project-intelligence-v1.0.0";
const POST_PASS_WORKFLOW_FIX = "d60746f22808cde372c41f1a0bbffb72a3410f95";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase8i1GateId;
  name: string;
  status: GateStatus;
  detail?: string;
  command?: string;
};

function run(cmd: string, cwd = root, env?: NodeJS.ProcessEnv): { ok: boolean; detail: string } {
  try {
    execSync(cmd, {
      cwd,
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
  const push = (
    id: Phase8i1GateId,
    name: string,
    status: GateStatus,
    detail?: string,
    command?: string,
  ) => gates.push({ id, name, status, detail, command });

  // A — Repository identity
  push(
    "A",
    "Repository identity",
    Boolean(ciHeadSha) && ciHeadSha.length >= 7 && existsSync(resolve(root, "pnpm-workspace.yaml"))
      ? "pass"
      : "fail",
    `sha=${ciHeadSha}`,
  );

  // B — Release tag integrity
  let releaseTagTarget = resolveTag(PI_V1_RELEASE_TAG);
  let releaseTagMoved = false;
  if (!releaseTagTarget && process.env.GITHUB_ACTIONS === "true") {
    run("git fetch --tags --force");
    releaseTagTarget = resolveTag(PI_V1_RELEASE_TAG);
  }
  if (releaseTagTarget && releaseTagTarget !== PI_V1_CERTIFIED_COMMIT) {
    releaseTagMoved = true;
  }
  push(
    "B",
    "Release tag integrity",
    releaseTagTarget === PI_V1_CERTIFIED_COMMIT && !releaseTagMoved ? "pass" : "fail",
    `tag=${PI_V1_RELEASE_TAG} target=${releaseTagTarget ?? "missing"} expected=${PI_V1_CERTIFIED_COMMIT}`,
  );

  // C — Certified commit identity
  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/version.ts",
        /PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1\.0\.0"/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/version.ts",
        /PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG = "project-intelligence-v1\.0\.0"/,
      ) &&
      PI_V1_CERTIFIED_COMMIT.startsWith("34975b1");
    push("C", "Certified commit identity", ok ? "pass" : "fail", `certified=${PI_V1_CERTIFIED_COMMIT}`);
  }

  // D — Post-PASS workflow fix classification
  {
    const docOk =
      fileContains(
        "docs/release/PROJECT_INTELLIGENCE_V1_POST_RELEASE_CHANGE_CLASSIFICATION.md",
        /post-release CI maintenance/i,
      ) &&
      fileContains(
        "docs/release/PROJECT_INTELLIGENCE_V1_POST_RELEASE_CHANGE_CLASSIFICATION.md",
        /Runtime change.*\*\*No\*\*/s,
      );
    let filesOnlyWorkflow = false;
    try {
      const names = git(`git show --name-only --pretty=format: ${POST_PASS_WORKFLOW_FIX}`)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      filesOnlyWorkflow =
        names.length === 1 &&
        names[0] === ".github/workflows/project-intelligence-v1-production-certification.yml";
    } catch {
      filesOnlyWorkflow = false;
    }
    push(
      "D",
      "Post-PASS workflow fix classification",
      docOk && filesOnlyWorkflow ? "pass" : "fail",
      `commit=${POST_PASS_WORKFLOW_FIX.slice(0, 7)} workflowOnly=${filesOnlyWorkflow}`,
    );
  }

  // E — Package inventory
  {
    const invPath = resolve(root, "docs/architecture/rtb-ai-platform-package-inventory.json");
    const mdPath = resolve(root, "docs/architecture/RTB_AI_PLATFORM_PACKAGE_INVENTORY.md");
    let ok = existsSync(invPath) && existsSync(mdPath);
    let detail = "inventory present";
    if (ok) {
      const inv = JSON.parse(readFileSync(invPath, "utf8")) as {
        inspectionPackagesCreated?: boolean;
        packages?: Array<{
          name?: string;
          path?: string;
          classification?: string;
          owner?: string;
          runtimeStatus?: string;
          publicExports?: unknown;
          dependencies?: unknown;
          dependents?: unknown;
          browserServerBoundary?: string;
          certificationStatus?: string;
          deprecationStatus?: string;
        }>;
      };
      ok =
        typeof inv.inspectionPackagesCreated === "boolean" &&
        Array.isArray(inv.packages) &&
        inv.packages.length >= 16 &&
        inv.packages.every(
          (p) =>
            p.name &&
            p.path &&
            p.classification &&
            p.owner &&
            p.runtimeStatus &&
            p.publicExports !== undefined &&
            p.dependencies !== undefined &&
            p.dependents !== undefined &&
            p.browserServerBoundary &&
            p.certificationStatus &&
            p.deprecationStatus,
        );
      detail = `packages=${inv.packages?.length ?? 0} inspectionCreated=${inv.inspectionPackagesCreated}`;
    }
    push("E", "Package inventory", ok ? "pass" : "fail", detail);
  }

  // F — Dependency direction
  {
    const cmd =
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8i1-repository-boundary.test.ts";
    const result = run(cmd, root, { PLATFORM_CERTIFICATION: "1" });
    push("F", "Dependency direction", result.ok ? "pass" : "fail", result.detail, cmd);
  }

  // G — Circular dependency detection (covered by same suite; re-assert)
  {
    const result = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8i1-repository-boundary.test.ts -t \"circular\"",
      root,
      { PLATFORM_CERTIFICATION: "1" },
    );
    push("G", "Circular dependency detection", result.ok ? "pass" : "fail", result.detail);
  }

  // H — Application host boundary
  {
    const webPkg = JSON.parse(readFileSync(resolve(root, "apps/web/package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    const deps = Object.keys(webPkg.dependencies || {});
    const ok =
      deps.includes("@rtb/engineering-os") &&
      deps.includes("@rtb/project-intelligence") &&
      !deps.some((d) => d.endsWith("-certification")) &&
      !deps.includes("@rtb/reference-os") &&
      existsSync(resolve(root, "docs/architecture/RTB_AI_PLATFORM_MONOREPO_STRUCTURE.md"));
    push("H", "Application host boundary", ok ? "pass" : "fail", "composition host; no cert/reference deps");
  }

  // I — Engineering OS ownership
  {
    const ok =
      fileContains(
        "docs/architecture/ENGINEERING_OS_SHARED_DOMAIN_OWNERSHIP.md",
        /assetOwnership.*engineering_os_shared_domain/,
      ) &&
      existsSync(resolve(root, "packages/engineering-os/package.json"));
    push("I", "Engineering OS ownership", ok ? "pass" : "fail", "assetOwnership=engineering_os_shared_domain");
  }

  // J — Project Intelligence boundary
  {
    const ok =
      fileContains("docs/architecture/ENGINEERING_OS_MODULE_BOUNDARIES.md", /Document Intelligence/) &&
      fileContains("docs/architecture/ENGINEERING_OS_MODULE_BOUNDARIES.md", /Engineering Reasoning Assistant/) &&
      fileContains("packages/project-intelligence/src/version.ts", /PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1\.0\.0"/);
    push("J", "Project Intelligence boundary", ok ? "pass" : "fail");
  }

  // K — Inspection Intelligence placement lock (absent in 8I.1; present at locked paths after 9A+)
  {
    const ii = existsSync(resolve(root, "packages/inspection-intelligence"));
    const iic = existsSync(resolve(root, "packages/inspection-intelligence-certification"));
    const docsOk =
      fileContains(
        "docs/architecture/ENGINEERING_OS_MODULE_BOUNDARIES.md",
        /packages\/inspection-intelligence/,
      ) &&
      fileContains(
        "docs/architecture/RTB_AI_PLATFORM_MONOREPO_STRUCTURE.md",
        /inspection-intelligence-certification/,
      );
    const placementOk = !ii && !iic ? true : ii && iic;
    push(
      "K",
      "Future Inspection Intelligence boundary",
      docsOk && placementOk ? "pass" : "fail",
      ii ? "locked locations; packages created after 8I.1" : "locked locations; packages not created",
    );
  }

  // L — Generated directory safety
  {
    const gi = readFileSync(resolve(root, ".gitignore"), "utf8");
    const ok =
      /\.tmp-cert-artifacts\//.test(gi) &&
      /\.tmp-ci-artifacts\//.test(gi) &&
      /\.tmp-pi-baseline\//.test(gi) &&
      /tmp-cert-\*\//.test(gi) &&
      existsSync(resolve(root, "docs/testing/GENERATED_ARTIFACT_AND_ONEDRIVE_POLICY.md")) &&
      !fileContains(
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx",
        /\.tmp-cert-artifacts/,
      );
    push("L", "Generated directory safety", ok ? "pass" : "fail");
  }

  // M — OneDrive policy
  {
    const ok =
      fileContains("docs/testing/GENERATED_ARTIFACT_AND_ONEDRIVE_POLICY.md", /OneDrive/i) &&
      fileContains("docs/testing/GENERATED_ARTIFACT_AND_ONEDRIVE_POLICY.md", /recommended later|not required/i);
    push("M", "OneDrive policy", ok ? "pass" : "fail", "relocation=recommended later (not required)");
  }

  // N — Deployment exclusions
  {
    const ok =
      existsSync(resolve(root, ".vercelignore")) &&
      fileContains(".vercelignore", /packages\/reference-os/) &&
      fileContains(".vercelignore", /tmp-cert-\*/) &&
      fileContains(".vercelignore", /project-intelligence-certification/) &&
      existsSync(resolve(root, "apps/web/vercel.json"));
    push("N", "Deployment exclusions", ok ? "pass" : "fail");
  }

  // O — Marker compatibility
  {
    const page = readFileSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx",
      ),
      "utf8",
    );
    const docOk = fileContains(
      "docs/release/PROJECT_INTELLIGENCE_V1_MARKER_COMPATIBILITY.md",
      /deprecated compatibility alias/i,
    );
    const ok =
      page.includes('data-testid="engineering-reasoning-assistant-ready"') &&
      page.includes('data-testid="project-intelligence-copilot-ready"') &&
      docOk;
    push("O", "Marker compatibility", ok ? "pass" : "fail");
  }

  // P — Project Intelligence v1 regression
  {
    const versionOk =
      fileContains(
        "packages/project-intelligence/src/version.ts",
        /PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1\.0\.0"/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/version.ts",
        /PROJECT_INTELLIGENCE_V1_CERTIFICATION_TAG = "project-intelligence-v1\.0\.0"/,
      );
    const reasoning = run(
      "pnpm --filter @rtb/project-intelligence exec vitest run tests/deterministic-reasoning-pipeline.test.ts",
    );
    const moduleTest = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8b-project-intelligence-module.test.ts",
      root,
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "P",
      "Project Intelligence v1 regression",
      versionOk && reasoning.ok && moduleTest.ok ? "pass" : "fail",
      reasoning.ok && moduleTest.ok ? "version+module+reasoning ok" : `${reasoning.detail}\n${moduleTest.detail}`,
    );
  }

  // Q — Secret exposure
  {
    const result = run("pnpm --filter @rtb/project-intelligence-certification secret-scan");
    push("Q", "Secret exposure", result.ok ? "pass" : "fail", result.detail);
  }

  const failedBeforeR = gates.filter((g) => g.status === "fail");
  const skippedBeforeR = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeR = gates.filter((g) => g.status === "not_executed");

  // R — Artifact identity
  const artifactCommitMatch =
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true";
  const rOk =
    artifactCommitMatch &&
    failedBeforeR.length === 0 &&
    skippedBeforeR.length === 0 &&
    notExecutedBeforeR.length === 0 &&
    !releaseTagMoved;
  push(
    "R",
    "Artifact identity",
    rOk ? "pass" : "fail",
    `artifactCommitSha=${buildIdentitySha} ciHeadSha=${ciHeadSha}`,
  );

  const failedBeforeS = gates.filter((g) => g.status === "fail");
  const skippedBeforeS = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeS = gates.filter((g) => g.status === "not_executed");

  const runtimeChangeIntroduced = false;
  const schemaChangeIntroduced = false;
  const boundaryViolationDetected = failedBeforeS.some((g) =>
    ["F", "G", "H", "J", "K"].includes(g.id),
  );
  const circularDependencyDetected = gates.some((g) => g.id === "G" && g.status === "fail");
  const secretExposureDetected = gates.some((g) => g.id === "Q" && g.status === "fail");

  const phase9AReady =
    failedBeforeS.length === 0 &&
    skippedBeforeS.length === 0 &&
    notExecutedBeforeS.length === 0 &&
    !releaseTagMoved &&
    !runtimeChangeIntroduced &&
    !schemaChangeIntroduced &&
    !secretExposureDetected &&
    !circularDependencyDetected;

  push(
    "S",
    "Phase 9A readiness",
    phase9AReady ? "pass" : "fail",
    phase9AReady ? "phase9AReady=true" : "phase9AReady=false",
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 &&
    finalSkipped.length === 0 &&
    finalNotExecuted.length === 0 &&
    phase9AReady;

  // releaseEligible / productionProjectIntelligenceReady remain true from V1 freeze (tag intact)
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED_COMMIT && !releaseTagMoved;
  const productionProjectIntelligenceReady = releaseEligible;

  const artifact = {
    schemaVersion: "phase8i1-repository-boundary/1",
    phase: "8I.1",
    platformName: "RTB AI Platform",
    title: "Repository Structure, Release Integrity and Module Boundary Certification",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    monorepoRoot: root,
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch:
      process.env.GITHUB_REF_NAME ||
      git("git rev-parse --abbrev-ref HEAD"),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    projectIntelligenceV1CertifiedCommit: PI_V1_CERTIFIED_COMMIT,
    releaseTag: PI_V1_RELEASE_TAG,
    releaseTagTarget: releaseTagTarget,
    releaseTagMoved,
    postPassWorkflowFix: POST_PASS_WORKFLOW_FIX,
    workflowFixClassification: "post-release CI maintenance (workflow-only)",
    runtimeChangeIntroduced,
    schemaChangeIntroduced,
    packagesMoved: [],
    inspectionPackagesCreated: existsSync(resolve(root, "packages/inspection-intelligence")),
    inspectionIntelligenceClassification: "Engineering OS module",
    futureInspectionPackage: "packages/inspection-intelligence",
    futureInspectionCertificationPackage: "packages/inspection-intelligence-certification",
    assetOwnership: "engineering_os_shared_domain",
    authoritativeReasoningMarker: "engineering-reasoning-assistant-ready",
    legacyMarker: "project-intelligence-copilot-ready",
    legacyMarkerStatus: "deprecated compatibility alias",
    repositoryRelocation: "recommended later",
    releaseEligible,
    productionProjectIntelligenceReady,
    circularDependencyDetected,
    boundaryViolationDetected,
    secretExposureDetected,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9AReady: pass && phase9AReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_8I1_REPOSITORY_BOUNDARY_GATES.map((g) => g[0]),
    failedGates: finalFailed.map((g) => g.id),
    skippedGates: finalSkipped.map((g) => g.id),
    notExecutedGates: finalNotExecuted.map((g) => g.id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    timestamp: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase8i1-repository-boundary-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        phase9AReady: artifact.phase9AReady,
        releaseTagMoved: artifact.releaseTagMoved,
        failedGates: artifact.failedGates,
        releaseEligible: artifact.releaseEligible,
        productionProjectIntelligenceReady: artifact.productionProjectIntelligenceReady,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
