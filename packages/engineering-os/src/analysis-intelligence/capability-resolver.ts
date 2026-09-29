import type { CanonicalDisciplineCode } from "../discipline-intelligence/catalog";
import { isCanonicalDisciplineCode, isDisciplineCapabilityKey } from "../discipline-intelligence/catalog";
import type { ExternalToolProfile } from "../external-tools/types";
import type {
  AnalysisCapabilitySnapshot,
  AnalysisPrecondition,
  AnalysisResolution,
  AnalysisResolutionState,
  AnalysisToolBinding,
} from "./types";
import { SYNTHETIC_CERTIFICATION_ADAPTER_ID, SYNTHETIC_CERTIFICATION_CAPABILITY } from "./types";

export type CapabilityResolveInput = {
  discipline: string;
  capability: string;
  workspaceId: string;
  projectId: string;
  tenantId: string;
  requestedExternalToolProfileId?: string | null;
  syntheticCertification?: boolean;
  disciplineEnabled: boolean;
  projectDisciplineEnabled: boolean;
  capabilities: AnalysisCapabilitySnapshot[];
  bindings: AnalysisToolBinding[];
  profiles: Array<
    Pick<
      ExternalToolProfile,
      | "id"
      | "enabled"
      | "status"
      | "readiness"
      | "installationStatus"
      | "executionHostId"
      | "executablePath"
      | "installedVersion"
      | "licenceStatus"
      | "licenceType"
      | "automationPermission"
      | "adapterCompatibilityStatus"
      | "capabilities"
      | "adapterId"
    >
  >;
  workspaceAssignments: Array<{ profileId: string; workspaceId: string; enabled: boolean }>;
  baselineId?: string | null;
  requirementIds?: string[];
  assumptionIds?: string[];
  standardCodes?: string[];
  standardsRequired?: boolean;
};

function capabilityMatches(key: string, synthetic: boolean): boolean {
  if (key === SYNTHETIC_CERTIFICATION_CAPABILITY) return synthetic;
  return isDisciplineCapabilityKey(key);
}

function pushReason(reasons: AnalysisResolutionState[], reason: AnalysisResolutionState) {
  if (!reasons.includes(reason)) reasons.push(reason);
}

/**
 * Deterministic capability + tool resolution. Orchestration keys off discipline,
 * capability, and External Tool Governance fields — never vendor product names.
 */
export function resolveAnalysisCapability(input: CapabilityResolveInput): AnalysisResolution {
  const reasons: AnalysisResolutionState[] = [];
  const explanation: string[] = [];
  const synthetic = input.syntheticCertification === true;
  const disciplineOk = isCanonicalDisciplineCode(input.discipline);
  const disciplineEnabled = input.disciplineEnabled && input.projectDisciplineEnabled && disciplineOk;
  if (!disciplineOk || !disciplineEnabled) {
    pushReason(reasons, "BLOCKED_DISCIPLINE_DISABLED");
    explanation.push("Discipline is disabled or not a canonical Engineering OS discipline.");
  }

  const capabilityOk = capabilityMatches(input.capability, synthetic);
  const cap = input.capabilities.find((c) => c.key === input.capability);
  const capabilityConfigured = Boolean(cap);
  const capabilityAvailable =
    capabilityConfigured &&
    cap!.effectiveStatus !== "NOT_AVAILABLE" &&
    cap!.effectiveStatus !== "BLOCKED";
  const capabilityCertified = cap?.effectiveStatus === "CERTIFIED" || (synthetic && cap?.effectiveStatus === "AVAILABLE");

  if (!capabilityOk || !capabilityConfigured) {
    pushReason(reasons, "BLOCKED_CAPABILITY_NOT_AVAILABLE");
    explanation.push("Capability is not configured on the discipline overlay.");
  } else if (!capabilityAvailable) {
    pushReason(reasons, "BLOCKED_CAPABILITY_NOT_AVAILABLE");
    explanation.push(`Capability ${input.capability} is not available (status ${cap!.effectiveStatus}).`);
  }

  const toolRequired =
    !synthetic &&
    (cap?.declaredStatus === "TOOL_DEPENDENT" ||
      cap?.effectiveStatus === "TOOL_DEPENDENT" ||
      cap?.effectiveStatus === "NOT_CERTIFIED" ||
      cap?.effectiveStatus === "CERTIFIED");

  const workspaceBindings = input.bindings
    .filter(
      (b) =>
        b.tenantId === input.tenantId &&
        b.disciplineCode === (input.discipline as CanonicalDisciplineCode) &&
        b.capabilityKey === input.capability &&
        (b.workspaceId == null || b.workspaceId === input.workspaceId),
    )
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

  let selectionPolicy: AnalysisResolution["selectionPolicy"] = "NONE";
  let selectedBinding: AnalysisToolBinding | null = null;
  if (input.requestedExternalToolProfileId) {
    selectedBinding =
      workspaceBindings.find((b) => b.externalToolProfileId === input.requestedExternalToolProfileId) ?? null;
    selectionPolicy = "REQUESTED_PROFILE";
    if (!selectedBinding) {
      pushReason(reasons, "BLOCKED_NO_TOOL_BINDING");
      explanation.push("Requested tool profile is not bound to this discipline capability. Tools are not silently substituted.");
    }
  } else if (workspaceBindings.length) {
    const workspaceSpecific = workspaceBindings.find((b) => b.workspaceId === input.workspaceId);
    if (workspaceSpecific) {
      selectedBinding = workspaceSpecific;
      selectionPolicy = "WORKSPACE_DEFAULT";
    } else {
      selectedBinding = workspaceBindings[0]!;
      selectionPolicy = "GOVERNED_PRIORITY";
    }
  } else if (toolRequired) {
    pushReason(reasons, "BLOCKED_NO_TOOL_BINDING");
    explanation.push("No approved tool binding exists for this discipline capability.");
  }

  const profile = selectedBinding?.externalToolProfileId
    ? input.profiles.find((p) => p.id === selectedBinding!.externalToolProfileId)
    : null;

  const assignmentOk =
    !selectedBinding?.externalToolProfileId ||
    input.workspaceAssignments.some(
      (a) => a.profileId === selectedBinding!.externalToolProfileId && a.workspaceId === input.workspaceId && a.enabled,
    ) ||
    synthetic;

  const workspaceAuthorized = assignmentOk;
  if (selectedBinding && !workspaceAuthorized) {
    pushReason(reasons, "BLOCKED_WORKSPACE_NOT_AUTHORIZED");
    explanation.push("Workspace is not authorized to use the selected external tool profile.");
  }

  let toolProfileAvailable = Boolean(profile && profile.enabled && profile.status !== "disabled");
  let toolCapabilityCertified = false;

  if (synthetic && input.capability === SYNTHETIC_CERTIFICATION_CAPABILITY) {
    toolProfileAvailable = true;
    toolCapabilityCertified = true;
    explanation.push("Synthetic TEST/DEV certification adapter. Not a real engineering tool.");
  } else if (toolRequired) {
    if (!profile) {
      if (selectedBinding) {
        pushReason(reasons, "BLOCKED_TOOL_NOT_CONFIGURED");
        explanation.push("Approved binding exists but the external tool profile is missing or disabled.");
      }
    } else {
      if (!profile.executionHostId || !profile.executablePath || profile.installationStatus !== "INSTALLED") {
        pushReason(reasons, "BLOCKED_TOOL_NOT_CONFIGURED");
        explanation.push("External tool profile is not fully configured for execution.");
      }
      if (profile.licenceStatus === "UNAVAILABLE" || profile.licenceStatus === "EXPIRED") {
        pushReason(reasons, "BLOCKED_TOOL_UNLICENSED");
        explanation.push("External tool licence is unavailable or expired.");
      }
      if (profile.automationPermission !== "PERMITTED") {
        pushReason(reasons, "BLOCKED_AUTOMATION_NOT_PERMITTED");
        explanation.push("Automation permission is not PERMITTED. Confirmation or organizational authorization is required.");
      }
      if (profile.adapterCompatibilityStatus === "INCOMPATIBLE") {
        pushReason(reasons, "BLOCKED_ADAPTER_INCOMPATIBLE");
        explanation.push("Adapter is incompatible with the installed tool version.");
      }
      const neededCap = input.capability;
      toolCapabilityCertified = profile.capabilities.some(
        (c) => (c.key === neededCap || c.key === "LINEAR_STATIC_ANALYSIS") && c.certification === "CERTIFIED",
      );
      if (!toolCapabilityCertified && cap?.effectiveStatus !== "CERTIFIED") {
        pushReason(reasons, "BLOCKED_CAPABILITY_NOT_CERTIFIED");
        explanation.push("Discipline capability and/or tool capability is not certified for production analysis.");
      }
      if (profile.readiness !== "READY") {
        pushReason(reasons, "BLOCKED_TOOL_NOT_READY");
        explanation.push(`External tool readiness is ${profile.readiness}, not READY.`);
      }
      if (profile.readiness === "UNAVAILABLE") {
        pushReason(reasons, "BLOCKED_TOOL_UNAVAILABLE");
      }
    }
  }

  if (!capabilityCertified && !synthetic && capabilityAvailable && cap?.effectiveStatus === "NOT_CERTIFIED") {
    pushReason(reasons, "BLOCKED_CAPABILITY_NOT_CERTIFIED");
  }

  if (!input.baselineId) {
    pushReason(reasons, "BLOCKED_BASELINE_REQUIRED");
    explanation.push("A frozen configuration baseline is required.");
  }
  if (!input.requirementIds?.length) {
    pushReason(reasons, "BLOCKED_REQUIREMENTS_INCOMPLETE");
    explanation.push("Required requirements are not identified.");
  }
  if (!input.assumptionIds?.length) {
    pushReason(reasons, "BLOCKED_ASSUMPTIONS_INCOMPLETE");
    explanation.push("Material assumptions are not declared.");
  }
  if (input.standardsRequired !== false && !input.standardCodes?.length) {
    pushReason(reasons, "BLOCKED_STANDARD_CONTEXT_REQUIRED");
    explanation.push("Applicable standard context is required.");
  }

  const executable = reasons.length === 0;
  const state: AnalysisResolutionState = executable ? "EXECUTABLE" : reasons[0]!;
  return {
    state,
    executable,
    reasons,
    disciplineEnabled,
    capabilityConfigured,
    capabilityAvailable,
    capabilityCertified: Boolean(capabilityCertified || (synthetic && capabilityAvailable)),
    toolRequired,
    approvedToolBinding: selectedBinding,
    selectedToolProfileId: selectedBinding?.externalToolProfileId ?? (synthetic ? SYNTHETIC_CERTIFICATION_ADAPTER_ID : null),
    toolProfileAvailable,
    workspaceAuthorized,
    toolCapabilityCertified,
    selectionPolicy,
    explanation,
  };
}

export function failClosedPreconditions(preconditions: AnalysisPrecondition[]): AnalysisPrecondition[] {
  return preconditions.map((p) => {
    if (p.safetyCritical && p.state === "UNKNOWN") {
      return { ...p, state: "NOT_SATISFIED" as const, detail: `${p.detail} Unknown safety-critical precondition fails closed.` };
    }
    return p;
  });
}
