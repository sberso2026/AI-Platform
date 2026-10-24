import { ANALYSIS_DEPENDENCY_GOVERNED_MAP, type AnalysisDependencySemantic } from "./types";
import { assertA7BGovernedRelationWrite } from "../decision-intelligence/relations";

export type AnalysisDependency = {
  fromRequestId: string;
  toRequestId: string;
  toResultId?: string | null;
  semantic: AnalysisDependencySemantic;
  requiredAcceptance: "REVIEWED" | "ACCEPTED";
};

export function toGovernedAnalysisLink(dep: AnalysisDependency): {
  relationship: string;
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
} {
  const relationship = ANALYSIS_DEPENDENCY_GOVERNED_MAP[dep.semantic];
  const link = {
    relationship,
    fromType: "analysis_request",
    fromId: dep.fromRequestId,
    toType: dep.toResultId ? "analysis_result" : "analysis_request",
    toId: dep.toResultId ?? dep.toRequestId,
  };
  assertA7BGovernedRelationWrite(link);
  return link;
}

export function isExecutableAgainstUpstream(input: {
  upstreamStatus: string;
  acceptanceState: string | null;
  stale: boolean;
  requiredAcceptance: "REVIEWED" | "ACCEPTED";
  explicitlyPermitted?: boolean;
}): boolean {
  if (input.explicitlyPermitted) return true;
  if (input.stale) return false;
  if (["FAILED", "STALE", "SUPERSEDED", "REJECTED"].includes(input.upstreamStatus)) return false;
  if (input.requiredAcceptance === "ACCEPTED") return input.acceptanceState === "ACCEPTED";
  return input.acceptanceState === "ACCEPTED" || input.acceptanceState === "UNDER_REVIEW";
}

/** Primary Crushing System synthetic fixture — representation only, no real solvers. */
export function primaryCrushingDependencyFixture() {
  return {
    system: "Primary Crushing System",
    chain: [
      { discipline: "PROCESS", capability: "PROCESS_SIMULATION", produces: "mechanical_duty" },
      { discipline: "MECHANICAL", capability: "FEA", produces: "operating_weight_dynamic_load", requires: "mechanical_duty" },
      { discipline: "STRUCTURAL", capability: "LINEAR_STRUCTURAL_ANALYSIS", produces: "support_frame_analysis", requires: "operating_weight_dynamic_load" },
      { discipline: "GEOTECHNICAL", capability: "FEA", produces: "foundation_action", requires: "support_frame_analysis" },
    ] as const,
    semantics: "REQUIRES_RESULT_FROM" as const,
  };
}
