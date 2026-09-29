import type { AnalysisPrecondition, AnalysisPreconditionKey } from "./types";
import { failClosedPreconditions } from "./capability-resolver";

export type PreconditionInput = {
  baselineFrozen: boolean | null;
  requirementIds: string[];
  assumptionIds: string[];
  standardCodes: string[];
  standardsRequired: boolean;
  interfaceInformationStatus: "SATISFIED" | "NOT_SATISFIED" | "NOT_APPLICABLE" | "UNKNOWN";
  upstreamDependencies: Array<{
    semantic: string;
    upstreamStatus: string;
    acceptanceState: string | null;
    stale: boolean;
    requiredAcceptance: "REVIEWED" | "ACCEPTED";
  }>;
  externalToolReady: boolean | null;
  workspaceAllowed: boolean | null;
  executionHostAvailable: boolean | null;
  syntheticCertification?: boolean;
};

const BLOCKING_UPSTREAM = new Set(["FAILED", "STALE", "SUPERSEDED", "REJECTED"]);

export function resolveAnalysisPreconditions(input: PreconditionInput): AnalysisPrecondition[] {
  const items: AnalysisPrecondition[] = [
    {
      key: "CONFIGURATION_BASELINE_FROZEN",
      state: input.baselineFrozen == null ? "UNKNOWN" : input.baselineFrozen ? "SATISFIED" : "NOT_SATISFIED",
      detail: input.baselineFrozen ? "Configuration baseline is frozen." : "Configuration baseline is missing or not frozen.",
      safetyCritical: true,
    },
    {
      key: "REQUIRED_REQUIREMENTS_IDENTIFIED",
      state: input.requirementIds.length > 0 ? "SATISFIED" : "NOT_SATISFIED",
      detail: input.requirementIds.length ? `${input.requirementIds.length} requirement(s) cited.` : "No requirements identified.",
      safetyCritical: true,
    },
    {
      key: "MATERIAL_ASSUMPTIONS_DECLARED",
      state: input.assumptionIds.length > 0 ? "SATISFIED" : "NOT_SATISFIED",
      detail: input.assumptionIds.length ? `${input.assumptionIds.length} assumption(s) declared.` : "Material assumptions are undeclared.",
      safetyCritical: true,
    },
    {
      key: "APPLICABLE_STANDARD_IDENTIFIED",
      state: !input.standardsRequired
        ? "NOT_APPLICABLE"
        : input.standardCodes.length
          ? "SATISFIED"
          : "NOT_SATISFIED",
      detail: input.standardsRequired ? "Applicable standard context must be identified." : "Standard context not required for this capability.",
      safetyCritical: input.standardsRequired,
    },
    {
      key: "REQUIRED_INTERFACE_INFORMATION",
      state: input.interfaceInformationStatus,
      detail: "Required interface information for this analysis.",
      safetyCritical: input.interfaceInformationStatus !== "NOT_APPLICABLE",
    },
    {
      key: "UPSTREAM_ANALYSIS_RESULT_ACCEPTED",
      state: resolveUpstream(input.upstreamDependencies),
      detail: describeUpstream(input.upstreamDependencies),
      safetyCritical: input.upstreamDependencies.some((d) => d.semantic === "REQUIRES_RESULT_FROM"),
    },
    {
      key: "EXTERNAL_TOOL_READY",
      state: input.syntheticCertification
        ? "SATISFIED"
        : input.externalToolReady == null
          ? "UNKNOWN"
          : input.externalToolReady
            ? "SATISFIED"
            : "NOT_SATISFIED",
      detail: input.syntheticCertification
        ? "Synthetic TEST adapter; not a real engineering tool."
        : "External tool must be READY before execution.",
      safetyCritical: !input.syntheticCertification,
    },
    {
      key: "WORKSPACE_ALLOWED",
      state: input.workspaceAllowed == null ? "UNKNOWN" : input.workspaceAllowed ? "SATISFIED" : "NOT_SATISFIED",
      detail: "Workspace must be authorized for the selected tool profile.",
      safetyCritical: true,
    },
    {
      key: "EXECUTION_HOST_AVAILABLE",
      state: input.syntheticCertification
        ? "NOT_APPLICABLE"
        : input.executionHostAvailable == null
          ? "UNKNOWN"
          : input.executionHostAvailable
            ? "SATISFIED"
            : "NOT_SATISFIED",
      detail: "Execution host must be available for real solver jobs.",
      safetyCritical: !input.syntheticCertification,
    },
  ];
  return failClosedPreconditions(items);
}

function resolveUpstream(deps: PreconditionInput["upstreamDependencies"]): AnalysisPrecondition["state"] {
  const required = deps.filter((d) => d.semantic === "REQUIRES_RESULT_FROM");
  if (!required.length) return "NOT_APPLICABLE";
  for (const dep of required) {
    if (BLOCKING_UPSTREAM.has(dep.upstreamStatus) || dep.stale) return "NOT_SATISFIED";
    if (dep.requiredAcceptance === "ACCEPTED" && dep.acceptanceState !== "ACCEPTED") return "NOT_SATISFIED";
    if (dep.requiredAcceptance === "REVIEWED" && !["UNDER_REVIEW", "ACCEPTED"].includes(dep.acceptanceState ?? "")) {
      return "NOT_SATISFIED";
    }
  }
  return "SATISFIED";
}

function describeUpstream(deps: PreconditionInput["upstreamDependencies"]): string {
  const required = deps.filter((d) => d.semantic === "REQUIRES_RESULT_FROM");
  if (!required.length) return "No required upstream analysis results.";
  return required
    .map((d) => `${d.semantic}: status=${d.upstreamStatus} acceptance=${d.acceptanceState ?? "none"} stale=${d.stale}`)
    .join("; ");
}

export function preconditionsSatisfied(items: AnalysisPrecondition[]): boolean {
  return items.every((p) => p.state === "SATISFIED" || p.state === "NOT_APPLICABLE");
}

export function blockingPreconditionKeys(items: AnalysisPrecondition[]): AnalysisPreconditionKey[] {
  return items.filter((p) => p.state === "NOT_SATISFIED" || p.state === "UNKNOWN").map((p) => p.key);
}
