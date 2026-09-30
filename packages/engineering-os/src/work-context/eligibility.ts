import {
  DEFAULT_CAPTURE_POLICY,
  type CaptureDecision,
  type ManagedEngineeringRepository,
  type ProhibitedCaptureClass,
  type SourceWorkflowSignal,
} from "./types";

const PERSONAL_PATH_MARKERS = [
  "\\documents\\personal\\",
  "/documents/personal/",
  "\\personal\\",
  "/personal/",
];

function normalizePath(path: string): string {
  return path.trim().replace(/\//g, "\\").toLowerCase();
}

export function isPersonalOrOutOfScopePath(path: string | null | undefined): boolean {
  if (!path) return false;
  const normalized = normalizePath(path);
  if (PERSONAL_PATH_MARKERS.some((marker) => normalized.includes(marker))) return true;
  if (normalized.includes("\\onedrive\\personal\\") || normalized.includes("\\personal onedrive\\")) return true;
  return false;
}

export function isUnmanagedScratchPath(path: string | null | undefined): boolean {
  if (!path) return false;
  const normalized = normalizePath(path);
  return normalized.startsWith("c:\\temp\\") || normalized.startsWith("\\temp\\") || normalized.includes("\\scratch_");
}

export function driveLetterAloneIsNotTrust(path: string | null | undefined): boolean {
  if (!path) return true;
  return /^[a-z]:\\?$/i.test(path.trim());
}

export function matchManagedRepository(
  repositories: ManagedEngineeringRepository[],
  signal: SourceWorkflowSignal,
): ManagedEngineeringRepository | null {
  if (signal.managedRepositoryId) {
    const byId = repositories.find((row) => row.id === signal.managedRepositoryId && row.enabled && row.capturePolicy === "MANAGED");
    return byId ?? null;
  }
  if (!signal.path) return null;
  const normalized = normalizePath(signal.path);
  return (
    repositories.find((row) => {
      if (!row.enabled || row.capturePolicy !== "MANAGED" || !row.approvedRoot) return false;
      const root = normalizePath(row.approvedRoot);
      if (!root) return false;
      return normalized === root || normalized.startsWith(root.endsWith("\\") ? root : `${root}\\`);
    }) ?? null
  );
}

export function evaluateCaptureEligibility(input: {
  signal: SourceWorkflowSignal;
  repositories: ManagedEngineeringRepository[];
}): {
  decision: CaptureDecision;
  reason: string;
  repository: ManagedEngineeringRepository | null;
  prohibitedClass: ProhibitedCaptureClass | null;
} {
  const { signal, repositories } = input;
  if (signal.prohibitedClass) {
    return {
      decision: "PROHIBITED",
      reason: `Capture class ${signal.prohibitedClass} is prohibited. EOS tracks engineering work, not employee computer activity.`,
      repository: null,
      prohibitedClass: signal.prohibitedClass,
    };
  }
  if (isPersonalOrOutOfScopePath(signal.path)) {
    return {
      decision: "OUTSIDE_EOS_SCOPE",
      reason: "Personal or unmanaged personal-path content is outside EOS scope. No filename, content, event, AI processing, or telemetry is stored.",
      repository: null,
      prohibitedClass: "PERSONAL_FILE",
    };
  }
  if (driveLetterAloneIsNotTrust(signal.path)) {
    return {
      decision: "DENIED_DEFAULT",
      reason: "Drive letter is not a trust boundary. DEFAULT_CAPTURE_POLICY=DENY.",
      repository: null,
      prohibitedClass: null,
    };
  }
  if (isUnmanagedScratchPath(signal.path) && !signal.publishedToEos) {
    return {
      decision: "OUTSIDE_EOS_SCOPE",
      reason: "Unmanaged local scratch files are ignored until explicitly published into a managed engineering repository.",
      repository: null,
      prohibitedClass: null,
    };
  }
  const repository = matchManagedRepository(repositories, signal);
  if (!repository) {
    return {
      decision: "DENIED_DEFAULT",
      reason: `DEFAULT_CAPTURE_POLICY=${DEFAULT_CAPTURE_POLICY}. ALLOWLISTED_REPOSITORIES_ONLY. No enabled managed repository matched.`,
      repository: null,
      prohibitedClass: null,
    };
  }
  if (repository.projectId && signal.projectId && repository.projectId !== signal.projectId) {
    return {
      decision: "DENIED_DEFAULT",
      reason: "Managed repository project scope does not match the authorized project. Users cannot broaden repository scope.",
      repository: null,
      prohibitedClass: null,
    };
  }
  return {
    decision: "CAPTURED",
    reason: `Captured because repository=${repository.displayName} policy=Managed Engineering project=${signal.projectId}.`,
    repository,
    prohibitedClass: null,
  };
}
