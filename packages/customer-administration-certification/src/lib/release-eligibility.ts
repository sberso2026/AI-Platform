import type { CertificationArtifactV1 } from "./certification-artifact.js";
import type { EnvironmentSafetyReport } from "./env-safety.js";
import type { WorkingTreeStatus } from "./git-repo.js";

export interface ReleaseEligibilityContext {
  workingTree: WorkingTreeStatus;
  expectedCommitSha: string;
  buildIdentityCommitSha?: string | null;
  ciRunId?: string;
  ciWorkflow?: string;
  ciRunner?: string;
}

export interface ReleaseEligibilityResult {
  releaseEligible: boolean;
  releaseEligibilityReasons: string[];
  workingTreeClean: boolean;
  productionCertificationBlocked: boolean;
  requiredGateCount: number;
  passedGateCount: number;
  failedGateCount: number;
  skippedGateCount: number;
  unexpectedServerErrorCount: number;
  ciRunId?: string;
  ciWorkflow?: string;
  ciRunner?: string;
}

export function computeReleaseEligibility(
  artifact: CertificationArtifactV1,
  context: ReleaseEligibilityContext
): ReleaseEligibilityResult {
  const reasons: string[] = [];
  const workingTreeClean = context.workingTree.clean;
  const productionCertificationBlocked =
    artifact.environmentSafety.certificationTarget === "hosted_production" &&
    !artifact.environmentSafety.allowProductionCertification;

  if (!workingTreeClean) {
    reasons.push(
      context.workingTree.allowDirtyOverride
        ? "working tree dirty (diagnostic override — not releasable)"
        : "working tree is not clean"
    );
  }
  if (!artifact.commitSha?.trim()) reasons.push("commitSha missing");
  if (artifact.commitSha !== context.expectedCommitSha) {
    reasons.push(`artifact commitSha ${artifact.commitSha} != expected ${context.expectedCommitSha}`);
  }
  if (context.buildIdentityCommitSha && context.buildIdentityCommitSha !== artifact.commitSha) {
    reasons.push("build-identity commitSha differs from artifact commitSha");
  }
  if (artifact.certificationTarget !== "hosted_staging") {
    reasons.push(`certification target must be hosted_staging, got ${artifact.certificationTarget}`);
  }
  if (artifact.verdict !== "PASS") reasons.push(`verdict is ${artifact.verdict}`);
  if (artifact.gateSummary.failed > 0) reasons.push(`failed gates: ${artifact.gateSummary.failed}`);
  if (artifact.gateSummary.skipped > 0) reasons.push(`skipped gates: ${artifact.gateSummary.skipped}`);
  if (artifact.gateSummary.requiredMissing.length > 0) {
    reasons.push(`missing gates: ${artifact.gateSummary.requiredMissing.join(", ")}`);
  }
  if (artifact.skippedTests > 0) reasons.push(`skippedTests=${artifact.skippedTests}`);
  if (artifact.serverErrorCaptureCount > 0) {
    reasons.push(`unexpected 5xx count=${artifact.serverErrorCaptureCount}`);
  }
  if (!artifact.supabaseProjectRef?.trim()) reasons.push("supabaseProjectRef missing");
  if (!artifact.migrationChecksums || Object.keys(artifact.migrationChecksums).length === 0) {
    reasons.push("migration checksums not recorded");
  }
  if (productionCertificationBlocked) reasons.push("production destructive certification blocked");

  const releaseEligible = reasons.length === 0 && workingTreeClean;

  return {
    releaseEligible,
    releaseEligibilityReasons: reasons,
    workingTreeClean,
    productionCertificationBlocked,
    requiredGateCount: artifact.gateSummary.total,
    passedGateCount: artifact.gateSummary.passed,
    failedGateCount: artifact.gateSummary.failed,
    skippedGateCount: artifact.gateSummary.skipped,
    unexpectedServerErrorCount: artifact.serverErrorCaptureCount,
    ciRunId: context.ciRunId,
    ciWorkflow: context.ciWorkflow,
    ciRunner: context.ciRunner,
  };
}

export function assertReleaseEligible(result: ReleaseEligibilityResult): void {
  if (result.releaseEligible) return;
  throw new Error(
    `Artifact is not release eligible:\n- ${result.releaseEligibilityReasons.join("\n- ")}`
  );
}
