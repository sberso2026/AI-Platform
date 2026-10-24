import { effectiveLicenceStatus } from "./readiness";
import type { ExternalToolProfile, ExternalToolWorkspaceAssignment } from "./types";

export class ExternalToolGovernanceError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "ExternalToolGovernanceError";
  }
}

export const OPTIMIZATION_EXECUTION_CAPABILITY = "OPTIMIZATION_EXECUTION";

export function assertWorkspaceMaySelectProfile(input: {
  workspaceId: string;
  assignment: ExternalToolWorkspaceAssignment | null;
}): void {
  if (!input.assignment || input.assignment.workspaceId !== input.workspaceId || !input.assignment.allowed) {
    throw new ExternalToolGovernanceError(
      "Workspace is not authorized to use this external tool profile.",
      "workspace_tool_not_assigned",
    );
  }
}

export function assertCapabilityPermitted(
  assignment: ExternalToolWorkspaceAssignment,
  capability: string,
): void {
  if (!assignment.permittedCapabilities.includes(capability)) {
    throw new ExternalToolGovernanceError(
      `Workspace is not permitted to use capability ${capability}.`,
      "workspace_capability_not_permitted",
    );
  }
}

/**
 * Platform execution preconditions. Workspace assignment cannot override these.
 * Connected / available capabilities are not equivalent to certified.
 */
export function assertPlatformExecutionPreconditions(
  profile: ExternalToolProfile,
  requiredCapability = OPTIMIZATION_EXECUTION_CAPABILITY,
): void {
  if (!profile.enabled || profile.status === "disabled") {
    throw new ExternalToolGovernanceError("External tool profile is disabled.", "tool_profile_disabled");
  }
  if (profile.readiness === "NOT_CONFIGURED") {
    throw new ExternalToolGovernanceError(
      `External tool is not configured (readiness=${profile.readiness}).`,
      "tool_not_configured",
    );
  }
  if (profile.adapterCompatibilityStatus !== "CERTIFIED") {
    throw new ExternalToolGovernanceError(
      `Adapter/tool version compatibility is ${profile.adapterCompatibilityStatus}.`,
      profile.adapterCompatibilityStatus === "NOT_CONFIGURED" ? "adapter_not_configured" : "adapter_incompatible",
    );
  }
  const licence = effectiveLicenceStatus(profile);
  if (licence === "UNAVAILABLE" || licence === "EXPIRED") {
    throw new ExternalToolGovernanceError("Licence is not available.", "licence_not_available");
  }
  if (licence !== "AVAILABLE" && licence !== "NOT_REQUIRED") {
    throw new ExternalToolGovernanceError("Licence is not available.", "licence_not_available");
  }
  if (profile.licenceType === "TRIAL" || profile.productionUsePermitted !== true) {
    throw new ExternalToolGovernanceError(
      "Production use is not permitted for this external tool licence.",
      "production_use_not_permitted",
    );
  }
  if (profile.automationPermission === "REQUIRES_CONFIRMATION") {
    throw new ExternalToolGovernanceError("Automation requires confirmation.", "automation_requires_confirmation");
  }
  if (profile.automationPermission !== "PERMITTED") {
    throw new ExternalToolGovernanceError("Automation is not permitted.", "automation_not_permitted");
  }
  const cap = profile.capabilities.find((row) => row.key === requiredCapability);
  if (!cap || cap.certification !== "CERTIFIED") {
    throw new ExternalToolGovernanceError(
      `Capability ${requiredCapability} is not certified (availability=${cap?.availability ?? "missing"}). Available/connected is not certified.`,
      "capability_not_certified",
    );
  }
  if (profile.readiness !== "READY") {
    throw new ExternalToolGovernanceError(
      `External tool is not READY (readiness=${profile.readiness}).`,
      "tool_not_ready",
    );
  }
  if (!profile.executionHostId) {
    throw new ExternalToolGovernanceError("Execution host is not configured.", "execution_host_missing");
  }
}

/**
 * Development/evaluation execution still fail-closes on API, automation, trial expiry, and adapter compatibility.
 * This is not production READY and does not authorize commercial use.
 */
export function assertExternalToolReadyForDevelopmentEvaluation(profile: ExternalToolProfile): void {
  if (profile.developmentEvaluationReadiness !== "READY_FOR_DEVELOPMENT_EVALUATION") {
    throw new ExternalToolGovernanceError(
      `External tool is not READY_FOR_DEVELOPMENT_EVALUATION (state=${profile.developmentEvaluationReadiness}).`,
      "tool_not_ready_for_development_evaluation",
    );
  }
  if (profile.licenceType === "TRIAL" && profile.productionUsePermitted) {
    throw new ExternalToolGovernanceError(
      "Trial licences cannot set production_use_permitted.",
      "trial_production_forbidden",
    );
  }
}

/**
 * Real external solver execution must resolve through an approved READY profile.
 * Certification stub is out of scope for this gate.
 * Workspace assignment cannot override platform readiness, licence, automation, or certification.
 */
export function assertExternalToolReadyForOptimization(input: {
  profile: ExternalToolProfile;
  assignment: ExternalToolWorkspaceAssignment | null;
  workspaceId: string;
  requiredCapability?: string;
}): void {
  const capability = input.requiredCapability ?? OPTIMIZATION_EXECUTION_CAPABILITY;
  assertPlatformExecutionPreconditions(input.profile, capability);
  assertWorkspaceMaySelectProfile({ workspaceId: input.workspaceId, assignment: input.assignment });
  assertCapabilityPermitted(input.assignment!, capability);
}
