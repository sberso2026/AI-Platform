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
 * Real external solver execution must resolve through an approved READY profile.
 * Certification stub is out of scope for this gate.
 */
export function assertExternalToolReadyForOptimization(input: {
  profile: ExternalToolProfile;
  assignment: ExternalToolWorkspaceAssignment | null;
  workspaceId: string;
  requiredCapability?: string;
}): void {
  const capability = input.requiredCapability ?? OPTIMIZATION_EXECUTION_CAPABILITY;
  if (!input.profile.enabled || input.profile.status === "disabled") {
    throw new ExternalToolGovernanceError("External tool profile is disabled.", "tool_profile_disabled");
  }
  assertWorkspaceMaySelectProfile({ workspaceId: input.workspaceId, assignment: input.assignment });
  assertCapabilityPermitted(input.assignment!, capability);
  const cap = input.profile.capabilities.find((row) => row.key === capability);
  if (!cap || cap.certification !== "CERTIFIED") {
    throw new ExternalToolGovernanceError(
      `Capability ${capability} is not certified on this tool profile.`,
      "capability_not_certified",
    );
  }
  if (input.profile.readiness !== "READY") {
    throw new ExternalToolGovernanceError(
      `External tool is not READY (readiness=${input.profile.readiness}).`,
      "tool_not_ready",
    );
  }
  if (!input.profile.executionHostId) {
    throw new ExternalToolGovernanceError("Execution host is not configured.", "execution_host_missing");
  }
  if (input.profile.adapterCompatibilityStatus !== "CERTIFIED") {
    throw new ExternalToolGovernanceError("Adapter/tool version compatibility is not certified.", "adapter_incompatible");
  }
  if (input.profile.licenceStatus !== "AVAILABLE" && input.profile.licenceStatus !== "NOT_REQUIRED") {
    throw new ExternalToolGovernanceError("Licence is not available.", "licence_not_available");
  }
  if (input.profile.automationPermission !== "PERMITTED") {
    throw new ExternalToolGovernanceError("Automation is not permitted.", "automation_not_permitted");
  }
}
