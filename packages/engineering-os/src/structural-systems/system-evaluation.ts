import type { SteelCapacityEngineInput, SteelDesignCheckOutcome, SteelDesignContext } from "@rtb/types";
import type { D1fR3MemberState, D1fR3SystemState } from "@rtb/types";
import { orchestrateEuTensionDesignCheck } from "../structural-steel/orchestrate";
import {
  orchestrateEuC9R2Beam,
  type EuC9R2BeamInput,
  type EuC9R2SectionActions,
} from "../structural-concrete/eu-c9/beam";
import { orchestrateEuC9R3Column, type EuC9R3ColumnInput } from "../structural-concrete/eu-c9/column";
import { orchestrateEuC9R4SolidSlab, type EuC9R4SlabInput } from "../structural-concrete/eu-c9/slab";
import { orchestrateEuC9R5WallSection, type EuC9R5WallInput } from "../structural-concrete/eu-c9/wall";
import { fingerprintStructuralSubject } from "./fingerprint";

const GOVERNING_AUTHORITIES = ["HUMAN_AUTHORED", "HUMAN_CONFIRMED", "GOVERNED_IMPORTED", "EXPLICIT_GOVERNED_MODEL"] as const;
const FORBIDDEN_SELECTION = ["MAX_ABS", "MIN", "ABSOLUTE", "WORST_CASE", "SUM", "MAX_N", "MAX_V", "MAX_M", "MAX_T"];
const AGGREGATION_VERSION = "D1F-R3-AGGREGATION-1";

export type D1fR3DispatchKind =
  | "D1D_EU_TENSION"
  | "D1E_C9_BEAM"
  | "D1E_C9_COLUMN"
  | "D1E_C9_SOLID_SLAB"
  | "D1E_C9_WALL_SECTION";

export type D1fR3GovernedBinding = {
  bindingId: string;
  projectId: string;
  structuralSystemId: string;
  physicalMemberId: string;
  designMemberId: string;
  authority: string;
  completenessState: string;
  topologyFingerprint: string;
  analysisModelFingerprint: string;
  analysisRunFingerprint: string;
  resultSetFingerprint: string;
  bindingFingerprint: string;
  modelValidationEvidenceRef: string | null;
  runStatus: string;
  convergenceStatus: string;
  combinationId: string | null;
  locationKind: string | null;
  locationProvenanceRef: string | null;
  steelDemand: SteelCapacityEngineInput["demand"] | null;
  concreteSectionActions: EuC9R2SectionActions | null;
  absentQuantities: readonly string[];
};

export type D1fR3EnvelopeRef = {
  sourceResultIds: readonly string[];
  selectionRule: string;
  quantity: string;
  locationRef: string;
  governingCaseId: string;
  authority: string;
  fingerprint: string;
} | null;

export type D1fR3PlanEntry = {
  entryId: string;
  projectId: string;
  physicalMemberId: string;
  designMemberId: string;
  materialDomain: "STEEL" | "CONCRETE" | null;
  memberType: string | null;
  capabilityId: D1fR3DispatchKind | null;
  profileId: string | null;
  jurisdiction: string | null;
  generation: string | null;
  declaredScope: readonly string[];
  candidateBindingIds: readonly string[];
  selectedBindingId: string | null;
  role: "REQUIRED_CHECK" | "INFORMATIONAL_CHECK";
  authority: string;
  selectionRule: string | null;
  componentCombinationIds: readonly string[];
  envelope: D1fR3EnvelopeRef;
  connectionRequired: boolean;
  foundationRequired: boolean;
  materialInferredByLlm: boolean;
  materialInferredFromSectionName: boolean;
  memberTypeInferredByAi: boolean;
  memberTypeInferredFromGeometryOnly: boolean;
  standardSelectedByAi: boolean;
  jurisdictionInferredFromLocation: boolean;
  checkEngineSelectedByLlm: boolean;
  checkEngineSelectedFromMemberName: boolean;
  steelCheck?: {
    designCheckId: string;
    designContext: SteelDesignContext;
    capacityInput: SteelCapacityEngineInput;
  } | null;
  beamInput?: EuC9R2BeamInput | null;
  columnInput?: EuC9R3ColumnInput | null;
  slabInput?: EuC9R4SlabInput | null;
  wallInput?: EuC9R5WallInput | null;
};

export type D1fR3Plan = {
  evaluationPlanId: string;
  structuralSystemId: string;
  projectId: string;
  topologyFingerprint: string;
  profileId: string;
  jurisdiction: string;
  generation: string;
  declaredScope: readonly string[];
  authority: string;
  status: string;
  version: string;
  provenanceRef: string;
  entries: readonly D1fR3PlanEntry[];
};

export type D1fR3EvaluationInput = {
  plan: D1fR3Plan;
  bindings: readonly D1fR3GovernedBinding[];
  currentTopologyFingerprint: string;
  currentProfileId: string;
  currentMethodFingerprint: string;
};

export type D1fR3MemberResult = {
  memberEvaluationId: string;
  evaluationPlanId: string;
  entryId: string;
  physicalMemberId: string;
  designMemberId: string;
  materialDomain: string | null;
  memberType: string | null;
  capabilityId: string | null;
  profileId: string | null;
  actionBindingIds: readonly string[];
  topologyFingerprint: string;
  bindingFingerprint: string | null;
  declaredScope: readonly string[];
  state: D1fR3MemberState;
  underlyingResult: unknown;
  underlyingValidationState: string;
  underlyingConformanceState: string;
  findings: readonly string[];
  blockingFindings: readonly string[];
  failedChecks: readonly string[];
  unavailableChecks: readonly string[];
  deferredChecks: readonly string[];
  provenance: readonly string[];
  fingerprint: string;
  warnings: readonly string[];
  connectionIdentity: string | null;
  memberEndRefs: readonly string[];
};

export type D1fR3SystemResult = {
  systemEvaluationId: string;
  evaluationPlanId: string;
  structuralSystemId: string;
  topologyFingerprint: string;
  planFingerprint: string;
  resultSetFingerprints: readonly string[];
  requiredMemberCount: number;
  executedMemberCount: number;
  satisfiedMemberCount: number;
  failedMemberCount: number;
  incompleteMemberCount: number;
  undeterminedMemberCount: number;
  invalidMemberCount: number;
  staleMemberCount: number;
  memberResultIds: readonly string[];
  members: readonly D1fR3MemberResult[];
  failedFindings: readonly string[];
  blockingFindings: readonly string[];
  unavailableCapabilities: readonly string[];
  declaredScope: readonly string[];
  evaluationCompleteForDeclaredScope: boolean;
  allChecksSatisfied: boolean;
  overallState: D1fR3SystemState;
  assuranceSummary: string;
  fullStructuralCoverage: false;
  engineeringApproved: false;
  conformanceValidated: false;
  provenance: readonly string[];
  fingerprint: string;
  warnings: readonly string[];
  events: readonly { type: string; subjectId: string; approval: false }[];
  connectionIdentities: readonly string[];
  memberEndMappings: readonly { memberId: string; ends: readonly string[] }[];
};

function planFingerprint(plan: D1fR3Plan): string {
  return fingerprintStructuralSubject("SYSTEM_EVALUATION", {
    kind: "PLAN",
    evaluationPlanId: plan.evaluationPlanId,
    structuralSystemId: plan.structuralSystemId,
    projectId: plan.projectId,
    topologyFingerprint: plan.topologyFingerprint,
    profileId: plan.profileId,
    jurisdiction: plan.jurisdiction,
    generation: plan.generation,
    version: plan.version,
    authority: plan.authority,
    status: plan.status,
    entries: [...plan.entries].map((entry) => entry.entryId).sort(),
  });
}

function memberFingerprint(parts: Record<string, unknown>): string {
  return fingerprintStructuralSubject("MEMBER_BINDING", parts);
}

function concreteState(result: { failedChecks?: readonly string[]; overallState?: string }): D1fR3MemberState {
  const overall = result.overallState ?? "";
  if (overall.includes("NOT_SATISFIED") || (result.failedChecks?.length ?? 0) > 0) return "MEMBER_NOT_SATISFIED";
  if (overall.includes("UNDETERMINED") || overall.includes("BLOCKED")) return "MEMBER_UNDETERMINED";
  if (overall.includes("INVALID")) return "MEMBER_INVALID";
  if (overall.includes("SATISFIED")) return "MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE";
  return "MEMBER_INCOMPLETE";
}

function steelState(outcome: SteelDesignCheckOutcome): D1fR3MemberState {
  if (outcome.verdict === "CHECK_SATISFIED") return "MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE";
  if (outcome.verdict === "CHECK_NOT_SATISFIED") return "MEMBER_NOT_SATISFIED";
  return "MEMBER_UNDETERMINED";
}

function blockedMember(entry: D1fR3PlanEntry, plan: D1fR3Plan, state: D1fR3MemberState, findings: string[]): D1fR3MemberResult {
  return {
    memberEvaluationId: `member-eval:${plan.evaluationPlanId}:${entry.entryId}`,
    evaluationPlanId: plan.evaluationPlanId,
    entryId: entry.entryId,
    physicalMemberId: entry.physicalMemberId,
    designMemberId: entry.designMemberId,
    materialDomain: entry.materialDomain,
    memberType: entry.memberType,
    capabilityId: entry.capabilityId,
    profileId: entry.profileId,
    actionBindingIds: entry.selectedBindingId ? [entry.selectedBindingId] : [],
    topologyFingerprint: plan.topologyFingerprint,
    bindingFingerprint: null,
    declaredScope: entry.declaredScope,
    state,
    underlyingResult: null,
    underlyingValidationState: "NOT_VALIDATED",
    underlyingConformanceState: "INTENDED_PROFILE",
    findings,
    blockingFindings: findings,
    failedChecks: state === "MEMBER_NOT_SATISFIED" ? findings : [],
    unavailableChecks: findings.filter((item) => item.includes("UNAVAILABLE") || item === "UNSUPPORTED_MEMBER"),
    deferredChecks: [],
    provenance: [plan.provenanceRef, entry.entryId],
    fingerprint: memberFingerprint({
      plan: plan.evaluationPlanId,
      entry: entry.entryId,
      state,
      findings: [...findings].sort(),
    }),
    warnings: [],
    connectionIdentity: entry.connectionRequired ? `connection-required:${entry.physicalMemberId}` : null,
    memberEndRefs: [`${entry.physicalMemberId}:START`, `${entry.physicalMemberId}:END`],
  };
}

function gateEntry(entry: D1fR3PlanEntry, plan: D1fR3Plan, input: D1fR3EvaluationInput, binding: D1fR3GovernedBinding | null): string[] {
  const findings: string[] = [];
  if (!GOVERNING_AUTHORITIES.includes(plan.authority as (typeof GOVERNING_AUTHORITIES)[number]) || plan.authority === "UNCONFIRMED_CANDIDATE") {
    findings.push("PLAN_AUTHORITY_NOT_GOVERNING");
  }
  if (plan.status !== "GOVERNED") findings.push(`PLAN_${plan.status || "MISSING"}`);
  if (entry.projectId !== plan.projectId) findings.push("CROSS_PROJECT");
  if (entry.materialInferredByLlm || entry.materialInferredFromSectionName) findings.push("MATERIAL_INFERRED");
  if (entry.memberTypeInferredByAi || entry.memberTypeInferredFromGeometryOnly) findings.push("MEMBER_TYPE_INFERRED");
  if (entry.standardSelectedByAi || entry.jurisdictionInferredFromLocation) findings.push("STANDARD_INFERRED");
  if (entry.checkEngineSelectedByLlm || entry.checkEngineSelectedFromMemberName) findings.push("ENGINE_GUESSED");
  if (!entry.materialDomain || !entry.memberType || !entry.capabilityId || !entry.profileId || !entry.jurisdiction) findings.push("IDENTITY_INCOMPLETE");
  if (plan.profileId !== input.currentProfileId) findings.push("STALE_PROFILE");
  if (entry.capabilityId === "D1D_EU_TENSION" && entry.steelCheck && entry.profileId !== entry.steelCheck.capacityInput.standardContext.standardCode) {
    findings.push("PROFILE_MISMATCH");
  }
  const concreteProfile = entry.beamInput?.standardContext?.profileId
    ?? entry.columnInput?.standardContext?.profileId
    ?? entry.slabInput?.standardContext?.profileId
    ?? entry.wallInput?.standardContext?.profileId
    ?? null;
  if (concreteProfile && entry.profileId !== concreteProfile) findings.push("PROFILE_MISMATCH");
  if (entry.jurisdiction && entry.jurisdiction !== plan.jurisdiction) findings.push("JURISDICTION_MISMATCH");
  if (entry.selectionRule && FORBIDDEN_SELECTION.includes(entry.selectionRule)) findings.push("MAX_ABS_SELECTION");
  if (new Set(entry.componentCombinationIds).size > 1) findings.push("SYNTHETIC_CROSS_COMBINATION");
  if (entry.envelope) {
    const rule = entry.envelope.selectionRule;
    if (!entry.envelope.sourceResultIds.length || !entry.envelope.fingerprint || !entry.envelope.authority || FORBIDDEN_SELECTION.includes(rule)) {
      findings.push("UNTRACEABLE_ENVELOPE");
    }
  }
  if (entry.candidateBindingIds.length > 1 && !entry.selectedBindingId) findings.push("MULTIPLE_BINDINGS_WITHOUT_SELECTION");
  if (!entry.selectedBindingId) findings.push("MISSING_ACTION_BINDING");
  if (!binding && entry.selectedBindingId) findings.push("MISSING_ACTION_BINDING");
  if (binding) {
    if (binding.projectId !== plan.projectId || binding.structuralSystemId !== plan.structuralSystemId) findings.push("CROSS_PROJECT");
    if (binding.authority !== "VERIFIED_GOVERNED" || binding.completenessState !== "BINDING_COMPLETE_FOR_DECLARED_SCOPE") findings.push("BINDING_NOT_GOVERNED");
    if (binding.completenessState === "STALE") findings.push("STALE_BINDING");
    if (binding.authority === "IMPORTED_PENDING_VERIFICATION") findings.push("UNVERIFIED_IMPORT");
    if (binding.runStatus === "FAILED" || binding.runStatus === "NONCONVERGED" || binding.convergenceStatus === "NONCONVERGED" || binding.convergenceStatus === "FAILED") {
      findings.push("ANALYSIS_NOT_USABLE");
    }
    if (!binding.modelValidationEvidenceRef) findings.push("MISSING_MODEL_VALIDATION");
    if (binding.topologyFingerprint !== plan.topologyFingerprint || input.currentTopologyFingerprint !== plan.topologyFingerprint) findings.push("TOPOLOGY_MISMATCH");
    if (binding.absentQuantities.length > 0) findings.push("ABSENT_ACTION");
    if ((binding.locationKind === "CRITICAL_LOCATION" || binding.locationKind === "GOVERNING_ENVELOPE_LOCATION") && !binding.locationProvenanceRef) {
      findings.push("CRITICAL_LOCATION_UNPROVEN");
    }
  }
  if (entry.connectionRequired) findings.push("CONNECTION_UNAVAILABLE");
  if (entry.foundationRequired) findings.push("FOUNDATION_UNAVAILABLE");
  if (!entry.capabilityId) findings.push("UNSUPPORTED_MEMBER");
  return [...new Set(findings)];
}

function execute(entry: D1fR3PlanEntry, binding: D1fR3GovernedBinding): { result: unknown; state: D1fR3MemberState; validation: string; conformance: string; failed: string[] } {
  if (entry.capabilityId === "D1D_EU_TENSION") {
    if (entry.jurisdiction !== "eu-eea" || !entry.steelCheck || !binding.steelDemand) {
      return { result: null, state: "MEMBER_INCOMPLETE", validation: "NOT_VALIDATED", conformance: "INTENDED_PROFILE", failed: ["STEEL_INPUT_UNAVAILABLE"] };
    }
    const outcome = orchestrateEuTensionDesignCheck({
      designCheckId: entry.steelCheck.designCheckId,
      designContext: entry.steelCheck.designContext,
      capacityInput: { ...entry.steelCheck.capacityInput, demand: binding.steelDemand },
    });
    return {
      result: outcome,
      state: steelState(outcome),
      validation: outcome.designCheck.validationState,
      conformance: "INTENDED_PROFILE",
      failed: outcome.verdict === "CHECK_NOT_SATISFIED" ? [entry.entryId] : [],
    };
  }
  const actions = binding.concreteSectionActions;
  if (!actions) return { result: null, state: "MEMBER_INCOMPLETE", validation: "NOT_VALIDATED", conformance: "INTENDED_PROFILE", failed: ["CONCRETE_ACTIONS_UNAVAILABLE"] };
  if (entry.capabilityId === "D1E_C9_BEAM" && entry.beamInput) {
    const result = orchestrateEuC9R2Beam({ ...entry.beamInput, actions, memberId: entry.designMemberId });
    return { result, state: concreteState(result), validation: result.engineerValidationState, conformance: result.conformanceState, failed: [...result.failedChecks] };
  }
  if (entry.capabilityId === "D1E_C9_COLUMN" && entry.columnInput) {
    const result = orchestrateEuC9R3Column({ ...entry.columnInput, actions, memberId: entry.designMemberId });
    return { result, state: concreteState(result), validation: result.engineerValidationState, conformance: result.conformanceState, failed: [...result.failedChecks] };
  }
  if (entry.capabilityId === "D1E_C9_SOLID_SLAB" && entry.slabInput) {
    const result = orchestrateEuC9R4SolidSlab({ ...entry.slabInput, actions, memberId: entry.designMemberId });
    return { result, state: concreteState(result), validation: result.engineerValidationState, conformance: result.conformanceState, failed: [...result.failedChecks] };
  }
  if (entry.capabilityId === "D1E_C9_WALL_SECTION" && entry.wallInput) {
    const result = orchestrateEuC9R5WallSection({ ...entry.wallInput, actions, memberId: entry.designMemberId });
    return { result, state: concreteState(result), validation: result.engineerValidationState, conformance: result.conformanceState, failed: [...result.failedChecks] };
  }
  return { result: null, state: "MEMBER_INCOMPLETE", validation: "NOT_VALIDATED", conformance: "INTENDED_PROFILE", failed: ["UNSUPPORTED_MEMBER"] };
}

function stateFromFindings(findings: readonly string[]): D1fR3MemberState {
  if (findings.some((item) => item === "STALE_BINDING" || item === "STALE_PROFILE" || item === "TOPOLOGY_MISMATCH" || item.startsWith("PLAN_STALE"))) return "MEMBER_STALE";
  if (findings.some((item) => ["PROFILE_MISMATCH", "JURISDICTION_MISMATCH", "CROSS_PROJECT", "PLAN_AUTHORITY_NOT_GOVERNING", "PLAN_INVALID"].includes(item))) {
    return "MEMBER_INVALID";
  }
  if (findings.some((item) => item === "MULTIPLE_BINDINGS_WITHOUT_SELECTION" || item === "MAX_ABS_SELECTION" || item === "SYNTHETIC_CROSS_COMBINATION")) {
    return "MEMBER_UNDETERMINED";
  }
  return "MEMBER_INCOMPLETE";
}

const EXECUTION_BLOCKS = [
  "PLAN_AUTHORITY_NOT_GOVERNING",
  "PLAN_DRAFT",
  "PLAN_STALE",
  "PLAN_INVALID",
  "PLAN_SUPERSEDED",
  "PLAN_ARCHIVED",
  "PLAN_MISSING",
  "CROSS_PROJECT",
  "MATERIAL_INFERRED",
  "MEMBER_TYPE_INFERRED",
  "STANDARD_INFERRED",
  "ENGINE_GUESSED",
  "IDENTITY_INCOMPLETE",
  "STALE_PROFILE",
  "PROFILE_MISMATCH",
  "JURISDICTION_MISMATCH",
  "MAX_ABS_SELECTION",
  "SYNTHETIC_CROSS_COMBINATION",
  "UNTRACEABLE_ENVELOPE",
  "MULTIPLE_BINDINGS_WITHOUT_SELECTION",
  "MISSING_ACTION_BINDING",
  "BINDING_NOT_GOVERNED",
  "STALE_BINDING",
  "UNVERIFIED_IMPORT",
  "ANALYSIS_NOT_USABLE",
  "MISSING_MODEL_VALIDATION",
  "TOPOLOGY_MISMATCH",
  "ABSENT_ACTION",
  "CRITICAL_LOCATION_UNPROVEN",
  "UNSUPPORTED_MEMBER",
];

export function evaluateSystemMemberPlan(input: D1fR3EvaluationInput): D1fR3SystemResult {
  const planPrint = planFingerprint(input.plan);
  const required = input.plan.entries.filter((entry) => entry.role === "REQUIRED_CHECK");
  const informational = input.plan.entries.filter((entry) => entry.role === "INFORMATIONAL_CHECK");
  const members = input.plan.entries.map((entry) => {
    const binding = input.bindings.find((item) => item.bindingId === entry.selectedBindingId) ?? null;
    const findings = gateEntry(entry, input.plan, input, binding);
    const hard = findings.filter((item) => EXECUTION_BLOCKS.includes(item));
    if (hard.length > 0 || !binding) return blockedMember(entry, input.plan, stateFromFindings(hard.length ? hard : findings), findings);
    let executed: ReturnType<typeof execute>;
    try {
      executed = execute(entry, binding);
    } catch {
      return blockedMember(entry, input.plan, "MEMBER_INVALID", [...findings, "ENGINE_REJECTED"]);
    }
    const extra = [...findings.filter((item) => item === "CONNECTION_UNAVAILABLE" || item === "FOUNDATION_UNAVAILABLE")];
    return {
      ...blockedMember(entry, input.plan, executed.state, [...new Set([...extra, ...executed.failed])]),
      underlyingResult: executed.result,
      underlyingValidationState: executed.validation,
      underlyingConformanceState: executed.conformance,
      actionBindingIds: [binding.bindingId],
      bindingFingerprint: binding.bindingFingerprint,
      failedChecks: executed.failed,
      unavailableChecks: extra,
      provenance: [
        input.plan.structuralSystemId,
        input.plan.topologyFingerprint,
        binding.analysisRunFingerprint,
        binding.resultSetFingerprint,
        binding.bindingId,
        input.plan.evaluationPlanId,
        entry.entryId,
        entry.capabilityId ?? "NONE",
      ],
      fingerprint: memberFingerprint({
        plan: planPrint,
        member: entry.designMemberId,
        capability: entry.capabilityId,
        profile: entry.profileId,
        binding: binding.bindingFingerprint,
        topology: binding.topologyFingerprint,
        model: binding.analysisModelFingerprint,
        run: binding.analysisRunFingerprint,
        resultSet: binding.resultSetFingerprint,
        method: input.currentMethodFingerprint,
        scope: [...entry.declaredScope].sort(),
      }),
    };
  });
  const requiredMembers = members.filter((member) => required.some((entry) => entry.entryId === member.entryId));
  const count = (state: D1fR3MemberState) => requiredMembers.filter((member) => member.state === state).length;
  const failed = count("MEMBER_NOT_SATISFIED");
  const invalid = count("MEMBER_INVALID");
  const undetermined = count("MEMBER_UNDETERMINED");
  const incomplete = count("MEMBER_INCOMPLETE");
  const stale = count("MEMBER_STALE");
  const satisfied = count("MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE");
  const gaps = requiredMembers.some((member) => member.unavailableChecks.length > 0);
  let overallState: D1fR3SystemState = "SYSTEM_UNDETERMINED";
  if (required.length === 0) overallState = "SYSTEM_UNDETERMINED";
  else if (failed > 0) overallState = "SYSTEM_NOT_SATISFIED";
  else if (invalid > 0) overallState = "SYSTEM_INVALID";
  else if (undetermined > 0) overallState = "SYSTEM_UNDETERMINED";
  else if (incomplete > 0 || gaps) overallState = "SYSTEM_INCOMPLETE";
  else if (stale > 0) overallState = "SYSTEM_STALE";
  else if (satisfied === required.length) overallState = "SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE";
  const terminal = requiredMembers.every((member) => member.state === "MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE" || member.state === "MEMBER_NOT_SATISFIED");
  const complete = required.length > 0 && terminal && !gaps && incomplete === 0 && stale === 0 && invalid === 0 && undetermined === 0;
  const findings = [...new Set(members.flatMap((member) => member.findings))].sort();
  const memberPrints = [...requiredMembers].map((member) => member.fingerprint).sort();
  const resultSetFingerprints = [...new Set(input.bindings.map((binding) => binding.resultSetFingerprint))].sort();
  return {
    systemEvaluationId: `system-eval:${input.plan.evaluationPlanId}:${planPrint.slice(0, 12)}`,
    evaluationPlanId: input.plan.evaluationPlanId,
    structuralSystemId: input.plan.structuralSystemId,
    topologyFingerprint: input.plan.topologyFingerprint,
    planFingerprint: planPrint,
    resultSetFingerprints,
    requiredMemberCount: required.length,
    executedMemberCount: requiredMembers.filter((member) => member.underlyingResult !== null).length,
    satisfiedMemberCount: satisfied,
    failedMemberCount: failed,
    incompleteMemberCount: incomplete + informational.filter((entry) => !required.some((item) => item.entryId === entry.entryId)).length * 0,
    undeterminedMemberCount: undetermined,
    invalidMemberCount: invalid,
    staleMemberCount: stale,
    memberResultIds: [...members].map((member) => member.memberEvaluationId).sort(),
    members,
    failedFindings: findings.filter((item) => requiredMembers.some((member) => member.state === "MEMBER_NOT_SATISFIED" && member.findings.includes(item))),
    blockingFindings: findings,
    unavailableCapabilities: findings.filter((item) => item.includes("UNAVAILABLE") || item === "UNSUPPORTED_MEMBER"),
    declaredScope: input.plan.declaredScope,
    evaluationCompleteForDeclaredScope: complete,
    allChecksSatisfied: complete && overallState === "SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE",
    overallState,
    assuranceSummary: "PENDING_HUMAN_ENGINEERING_REVIEW",
    fullStructuralCoverage: false,
    engineeringApproved: false,
    conformanceValidated: false,
    provenance: [input.plan.structuralSystemId, input.plan.topologyFingerprint, input.plan.evaluationPlanId, AGGREGATION_VERSION],
    fingerprint: fingerprintStructuralSubject("SYSTEM_EVALUATION", {
      plan: planPrint,
      topology: input.plan.topologyFingerprint,
      members: memberPrints,
      results: resultSetFingerprints,
      aggregation: AGGREGATION_VERSION,
      method: input.currentMethodFingerprint,
    }),
    warnings: findings,
    events: [
      { type: "EVALUATION_PLAN_CREATED", subjectId: input.plan.evaluationPlanId, approval: false },
      { type: "SYSTEM_EVALUATION_EXECUTED", subjectId: input.plan.evaluationPlanId, approval: false },
      ...members.filter((member) => member.state === "MEMBER_NOT_SATISFIED").map((member) => ({
        type: "MEMBER_EVALUATION_FAILED",
        subjectId: member.memberEvaluationId,
        approval: false as const,
      })),
    ],
    connectionIdentities: members.flatMap((member) => member.connectionIdentity ? [member.connectionIdentity] : []),
    memberEndMappings: members.map((member) => ({ memberId: member.designMemberId, ends: member.memberEndRefs })),
  };
}

export function recordSuccessorSystemEvaluation(prior: D1fR3SystemResult, current: D1fR3SystemResult): {
  prior: D1fR3SystemResult;
  current: D1fR3SystemResult;
  history: readonly D1fR3SystemResult[];
} {
  return {
    prior: { ...prior, overallState: "SYSTEM_STALE", events: [...prior.events, { type: "SYSTEM_EVALUATION_INVALIDATED", subjectId: prior.systemEvaluationId, approval: false }] },
    current,
    history: [prior, current],
  };
}
