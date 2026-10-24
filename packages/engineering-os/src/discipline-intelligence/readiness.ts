import type { ExternalToolReadiness } from "../external-tools/catalog";
import type { CanonicalDisciplineCode, DisciplineCapabilityStatus, DisciplineReadiness } from "./catalog";
import { FORBIDDEN_DISCIPLINE_TOOL_FIELDS, type DisciplineCapabilityRecord, type DisciplineToolBinding } from "./types";

export type ExternalToolReadinessView = {
  toolCode: string;
  profileId: string | null;
  readiness: ExternalToolReadiness | "NOT_CONFIGURED";
};

function toolReady(view: ExternalToolReadinessView | undefined): boolean {
  return Boolean(view && view.readiness === "READY");
}

/**
 * Effective capability status. CERTIFIED is never inferred from adapter presence
 * or AVAILABLE. Missing/not-READY required tools fail closed to BLOCKED.
 */
export function effectiveCapabilityStatus(input: {
  declared: DisciplineCapabilityStatus;
  toolIndependent: boolean;
  preferredToolCode: string | null;
  tools: ExternalToolReadinessView[];
}): DisciplineCapabilityStatus {
  const { declared, toolIndependent, preferredToolCode, tools } = input;
  if (declared === "NOT_AVAILABLE") return "NOT_AVAILABLE";
  if (declared === "BLOCKED") return "BLOCKED";
  if (toolIndependent) {
    if (declared === "CERTIFIED") return "CERTIFIED";
    return declared;
  }
  const required = preferredToolCode
    ? tools.find((row) => row.toolCode === preferredToolCode)
    : tools[0];
  if (!required || required.readiness === "NOT_CONFIGURED" || !toolReady(required)) {
    if (declared === "CERTIFIED") return "BLOCKED";
    if (declared === "TOOL_DEPENDENT" || declared === "NOT_CERTIFIED" || declared === "AVAILABLE") return "BLOCKED";
    return declared === "DEGRADED" ? "DEGRADED" : "BLOCKED";
  }
  if (declared === "CERTIFIED") return "CERTIFIED";
  return declared;
}

export function applyEffectiveCapabilities(
  capabilities: Omit<DisciplineCapabilityRecord, "effectiveStatus">[],
  tools: ExternalToolReadinessView[],
): DisciplineCapabilityRecord[] {
  return capabilities.map((cap) => ({
    ...cap,
    effectiveStatus: effectiveCapabilityStatus({
      declared: cap.declaredStatus,
      toolIndependent: cap.toolIndependent,
      preferredToolCode: cap.preferredToolCode,
      tools: cap.preferredToolCode ? tools.filter((t) => t.toolCode === cap.preferredToolCode) : tools,
    }),
  }));
}

export function deriveDisciplineReadiness(capabilities: DisciplineCapabilityRecord[]): DisciplineReadiness {
  if (capabilities.length === 0) return "NOT_CONFIGURED";
  const reviewKeys = new Set(["DOCUMENT_REVIEW", "INTERFACE_ANALYSIS", "REQUIREMENT_ANALYSIS", "ENGINEERING_REVIEW", "CONTEXT_INTERPRETATION"]);
  const analysisKeys = new Set(["LINEAR_STRUCTURAL_ANALYSIS", "CALCULATION", "SIMULATION", "PROCESS_SIMULATION", "STRESS_ANALYSIS", "POWER_SYSTEM_ANALYSIS", "FEA"]);
  const independent = capabilities.filter((c) => c.toolIndependent);
  const dependent = capabilities.filter((c) => !c.toolIndependent);
  const independentOk = independent.some((c) => c.effectiveStatus === "AVAILABLE" || c.effectiveStatus === "CERTIFIED");
  const reviewReady = capabilities.some(
    (c) => reviewKeys.has(c.key) && (c.effectiveStatus === "AVAILABLE" || c.effectiveStatus === "CERTIFIED"),
  );
  const analysisCertified = capabilities.some(
    (c) => analysisKeys.has(c.key) && c.effectiveStatus === "CERTIFIED",
  );
  const analysisBlocked = dependent.some((c) => analysisKeys.has(c.key) && c.effectiveStatus === "BLOCKED");
  if (analysisCertified && reviewReady) return "READY_FOR_ANALYSIS";
  if (reviewReady && analysisBlocked) return "PARTIALLY_AVAILABLE";
  if (reviewReady) return "READY_FOR_REVIEW";
  if (independentOk && analysisBlocked) return "PARTIALLY_AVAILABLE";
  if (capabilities.every((c) => c.effectiveStatus === "BLOCKED" || c.effectiveStatus === "NOT_AVAILABLE")) return "BLOCKED";
  if (independentOk) return "CONFIGURED";
  return "NOT_CONFIGURED";
}

export function rejectDisciplineToolInstallFields(payload: Record<string, unknown>): void {
  for (const key of FORBIDDEN_DISCIPLINE_TOOL_FIELDS) {
    if (key in payload && payload[key] != null) {
      throw new Error("discipline_must_not_store_external_tool_install_fields");
    }
  }
}

export function spaceGassStructuralAnalysisStatus(tools: ExternalToolReadinessView[]): DisciplineCapabilityStatus {
  return effectiveCapabilityStatus({
    declared: "TOOL_DEPENDENT",
    toolIndependent: false,
    preferredToolCode: "spacegass",
    tools,
  });
}

export function defaultSpaceGassToolView(): ExternalToolReadinessView {
  return { toolCode: "spacegass", profileId: null, readiness: "NOT_CONFIGURED" };
}

export function assertCapabilityCertificationAuthorized(input: {
  isEngineeringAdmin: boolean;
  from: DisciplineCapabilityStatus;
  to: DisciplineCapabilityStatus;
}): void {
  if (input.from === input.to) return;
  if (input.to === "CERTIFIED" && !input.isEngineeringAdmin) {
    throw new Error("capability_certification_requires_admin");
  }
}

export function structuralLinearAnalysisBlockedBySpaceGass(
  code: CanonicalDisciplineCode,
  bindings: DisciplineToolBinding[],
  tools: ExternalToolReadinessView[],
): boolean {
  if (code !== "STRUCTURAL") return false;
  const bound = bindings.some((b) => b.capabilityKey === "LINEAR_STRUCTURAL_ANALYSIS" && b.toolCode === "spacegass");
  const tool = tools.find((t) => t.toolCode === "spacegass") ?? defaultSpaceGassToolView();
  return bound && tool.readiness !== "READY";
}
