/**
 * Shared Discipline Intelligence contracts.
 * Empty method stubs are not implemented — future modules satisfy these types.
 */

export const LLM_AS_SOLVER_RULE =
  "LLMs may interpret context, retrieve evidence, explain results, and prepare review material. LLMs must not replace deterministic engineering solvers for structural analysis, piping stress, power flow, process simulation, finite element analysis, or other validated computational methods.";

export const HUMAN_AUTHORITY_RULE =
  "Discipline intelligence must not independently approve engineering design, issue IFC documents, certify design compliance, accept safety-critical changes, or select a final Optimization solution.";

export const LLM_AS_SOLVER: "PROHIBITED" = "PROHIBITED";

export type DisciplineIntelligenceOperations = {
  identifyContext: true;
  retrieveEvidence: true;
  identifyRequirements: true;
  identifyAssumptions: true;
  identifyInterfaces: true;
  identifyApplicableStandards: true;
  analyse: true;
  review: true;
  validate: true;
  proposeAlternatives: true;
  evaluateImpact: true;
  explain: true;
  trace: true;
};

/** Foundation operations that A7A actually implements. Later modules fill analyse/validate/etc. */
export const DISCIPLINE_INTELLIGENCE_FOUNDATION_OPERATIONS: DisciplineIntelligenceOperations = {
  identifyContext: true,
  retrieveEvidence: true,
  identifyRequirements: true,
  identifyAssumptions: true,
  identifyInterfaces: true,
  identifyApplicableStandards: true,
  analyse: true,
  review: true,
  validate: true,
  proposeAlternatives: true,
  evaluateImpact: true,
  explain: true,
  trace: true,
};

export type DisciplineEvidenceContract = {
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  disciplineCode: string;
  systemId: string | null;
  assetId: string | null;
  interfaceId: string | null;
  requirementIds: string[];
  assumptionIds: string[];
  configurationBaselineId: string | null;
  applicableStandardCodes: string[];
  externalToolProfileId: string | null;
  toolVersion: string | null;
  adapterVersion: string | null;
  inputArtifactRefs: string[];
  resultRef: string | null;
  evidenceRefs: string[];
  provenance: { sourceKind: "ADAPTER" | "REVIEW" | "MANUAL" | "SYSTEM"; recordedAt: string };
  confidence: "low" | "medium" | "high" | "unknown";
  reviewState: "not_reviewed" | "in_review" | "accepted" | "rejected";
};

export type DisciplineAnalysisResult = {
  disciplineCode: string;
  capabilityKey: string;
  status: "NOT_RUN" | "BLOCKED" | "SUCCEEDED" | "FAILED" | "INCOMPLETE";
  context: DisciplineEvidenceContract;
  metrics: Array<{ metricKey: string; value: number | null; unit: string | null }>;
  findingRefs: string[];
  evidenceRefs: string[];
  toolProvenance: {
    externalToolProfileId: string | null;
    toolCode: string | null;
    toolVersion: string | null;
    adapterVersion: string | null;
  };
  assumptions: string[];
  warnings: string[];
  limitations: string[];
};

export function assertLlmMustNotSolve(capabilityKey: string): void {
  const solverLike = /ANALYSIS|SIMULATION|CALCULATION|FEA|STRESS|POWER_FLOW|OPTIMIZATION/i.test(capabilityKey);
  if (solverLike) {
    throw new Error(`llm_must_not_replace_solver:${capabilityKey}`);
  }
}

export function blockedSolverResult(
  disciplineCode: string,
  capabilityKey: string,
  reason: string,
): DisciplineAnalysisResult {
  return {
    disciplineCode,
    capabilityKey,
    status: "BLOCKED",
    context: {
      tenantId: "",
      workspaceId: "",
      projectId: null,
      disciplineCode,
      systemId: null,
      assetId: null,
      interfaceId: null,
      requirementIds: [],
      assumptionIds: [],
      configurationBaselineId: null,
      applicableStandardCodes: [],
      externalToolProfileId: null,
      toolVersion: null,
      adapterVersion: null,
      inputArtifactRefs: [],
      resultRef: null,
      evidenceRefs: [],
      provenance: { sourceKind: "SYSTEM", recordedAt: new Date().toISOString() },
      confidence: "unknown",
      reviewState: "not_reviewed",
    },
    metrics: [],
    findingRefs: [],
    evidenceRefs: [],
    toolProvenance: { externalToolProfileId: null, toolCode: null, toolVersion: null, adapterVersion: null },
    assumptions: [],
    warnings: [reason],
    limitations: [LLM_AS_SOLVER_RULE, HUMAN_AUTHORITY_RULE],
  };
}
