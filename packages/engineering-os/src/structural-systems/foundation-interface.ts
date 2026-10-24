import type { D1fR1SupportInput, D1fR5Completeness, D1fR5ScopeState } from "@rtb/types";
import { fingerprintStructuralSubject } from "./fingerprint";

const GOVERNING = ["HUMAN_AUTHORED", "HUMAN_CONFIRMED", "GOVERNED_IMPORTED", "EXPLICIT_GOVERNED_MODEL"] as const;
const FAMILIES = ["ISOLATED_FOOTING", "STRIP_FOOTING", "COMBINED_FOOTING", "RAFT_OR_MAT", "PILE_CAP", "PILE_FOUNDATION", "PEDESTAL", "GROUND_BEAM_INTERFACE", "OTHER"] as const;
const COMPONENTS = ["FX", "FY", "FZ", "MX", "MY", "MZ"] as const;
const COORDINATES = ["GLOBAL", "SYSTEM", "SUPPORT_LOCAL", "FOUNDATION_LOCAL", "ANALYSIS_PROVIDER_LOCAL"] as const;
const FORBIDDEN_SELECTION = ["MAX_ABS", "SUM", "ENVELOPE", "CROSS_COMBINATION"];

export type D1fR5ReactionComponent = {
  quantity: (typeof COMPONENTS)[number];
  presence: "PRESENT" | "ABSENT" | "EXPLICIT_ZERO";
  value: number | null;
  unit: string | null;
};

export type D1fR5Reaction = {
  reactionId: string;
  projectId: string;
  structuralSystemId: string;
  supportId: string;
  authority: string;
  completenessState: string;
  runStatus: string;
  convergenceStatus: string;
  modelValidationEvidenceRef: string | null;
  loadCaseId: string | null;
  combinationId: string | null;
  locationRef: string | null;
  coordinateKind: string | null;
  coordinateMappingRef: string | null;
  signConventionRef: string | null;
  signConversionsApplied: number;
  topologyFingerprint: string;
  analysisModelId: string;
  analysisRunId: string;
  resultSetFingerprint: string;
  reactionFingerprint: string;
  rawUnnormalized: boolean;
  components: readonly D1fR5ReactionComponent[];
};

export type D1fR5Foundation = {
  foundationId: string;
  projectId: string;
  structuralSystemId: string;
  supportIds: readonly string[];
  connectionIds: readonly string[];
  forceTransferContextIds: readonly string[];
  locationRef: string | null;
  coordinateKind: string | null;
  family: (typeof FAMILIES)[number] | null;
  profileId: string | null;
  authority: string;
  sourceHint: string;
  status: string;
  version: string;
  topologyFingerprint: string;
  provenanceRef: string;
  inferredByLlm: boolean;
  inferredFromReactionPattern: boolean;
  inferredFromMemberType: boolean;
  inferredFromGeometryOnly: boolean;
  familyDefinesCapacity: boolean;
  familyDefinesDimensions: boolean;
  familyDefinesReinforcement: boolean;
  familyDefinesSoilModel: boolean;
};

export type D1fR5Mapping = {
  mappingId: string;
  projectId: string;
  supportIds: readonly string[];
  foundationId: string;
  connectionIds: readonly string[];
  cardinality: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_ONE";
  authority: string;
  provenanceRef: string;
};

export type D1fR5GeotechRef = {
  referenceId: string;
  projectId: string;
  kind: string;
  authority: string;
  sourceHint: string;
  valuePresent: boolean;
  locationApplicabilityRef: string | null;
  units: string | null;
  version: string;
  fingerprint: string;
  siteWideAssumed: boolean;
};

export type D1fR5EnvelopeInput = {
  sourceReactionIds: readonly string[];
  selectionRule: string;
  caseIds: readonly string[];
  quantity: string;
  locationRef: string;
  governingState: string;
  authority: string;
  provenanceRef: string;
  fingerprint: string;
} | null;

export type D1fR5FoundationInput = {
  projectId: string;
  structuralSystemId: string;
  supports: readonly D1fR1SupportInput[];
  foundation: D1fR5Foundation;
  mapping: D1fR5Mapping | null;
  reactions: readonly D1fR5Reaction[];
  geotechnicalRefs: readonly D1fR5GeotechRef[];
  envelope: D1fR5EnvelopeInput;
  selectionRequest: string | null;
  synthesizeCombinationIds: readonly string[];
  localAxisInferred: boolean;
  interpretSpringAsSoil: boolean;
  restraintDefinesFoundation: boolean;
  eccentricityRequested: boolean;
  momentTransportRequested: boolean;
  jurisdictionInferredFromLocation: boolean;
  geotechnicalStandardSelectedByAi: boolean;
  foundationRequired: boolean;
  geotechnicalRequired: boolean;
  memberEvaluationSatisfied: boolean;
  connectionInterfaceComplete: boolean;
  currentTopologyFingerprint: string;
  currentProfileId: string | null;
};

export type D1fR5ReactionContext = {
  supportReactionContextId: string;
  supportIds: readonly string[];
  reactionIds: readonly string[];
  reactions: readonly D1fR5Reaction[];
  combinationIds: readonly string[];
  aggregatedDemand: null;
  fingerprint: string;
  canGovern: boolean;
};

export type D1fR5FoundationResult = {
  foundationInterfaceResultId: string;
  foundationId: string;
  structuralSystemId: string;
  supportIds: readonly string[];
  connectionIds: readonly string[];
  supportReactionContext: D1fR5ReactionContext;
  geotechnicalRefs: readonly string[];
  profileId: string | null;
  authority: string;
  findings: readonly string[];
  blockingFindings: readonly string[];
  completenessState: D1fR5Completeness;
  scopeState: D1fR5ScopeState;
  foundationDesignAvailability: "FOUNDATION_DESIGN_NOT_IMPLEMENTED";
  geotechnicalDesignAvailability: "GEOTECHNICAL_DESIGN_NOT_IMPLEMENTED";
  foundationPass: false;
  foundationAdequate: false;
  designResult: false;
  inputContextEqualsDesign: false;
  eccentricityRoute: "DEFERRED";
  equilibriumDiagnostic: "DEFERRED_NON_GOVERNING_DIAGNOSTIC";
  multiSupportAggregationRoute: "DEFER_TO_FUTURE_FOUNDATION_DESIGN_ORCHESTRATION";
  memberPassHidesFoundationGap: false;
  connectionCompleteHidesFoundationGap: false;
  r3ResultsRewritten: false;
  r4ResultsRewritten: false;
  provenance: readonly string[];
  fingerprint: string;
  reactionFingerprint: string;
  warnings: readonly string[];
  events: readonly { type: string; subjectId: string; approval: false }[];
};

function sortIds(values: readonly string[]): string[] {
  return [...values].sort();
}

function completeness(findings: readonly string[]): D1fR5Completeness {
  if (findings.some((item) => item.startsWith("STALE_"))) return "FOUNDATION_INTERFACE_STALE";
  if (findings.some((item) => ["AUTHORITY_NOT_GOVERNING", "AI_MAPPING", "CROSS_PROJECT", "FAMILY_DEFINES_BEHAVIOR", "TYPE_INFERRED", "RESTRAINT_DEFINES_FOUNDATION", "SPRING_AS_SOIL", "UNCONFIRMED_GEOTECH"].includes(item))) {
    return "FOUNDATION_INTERFACE_INVALID";
  }
  if (findings.some((item) => ["MAX_ABS_DEMAND", "AUTOMATIC_SUM", "AUTOMATIC_ENVELOPE", "CROSS_COMBINATION", "MIXED_COORDINATES", "MIXED_REFERENCE_POINTS"].includes(item))) {
    return "FOUNDATION_INTERFACE_UNDETERMINED";
  }
  if (findings.length > 0) return "FOUNDATION_INTERFACE_INCOMPLETE";
  return "FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE";
}

export function evaluateFoundationInterface(input: D1fR5FoundationInput): D1fR5FoundationResult {
  const foundation = input.foundation;
  const findings: string[] = [];
  const knownSupports = new Set(input.supports.map((support) => support.supportId));
  if (!foundation.foundationId) findings.push("MISSING_FOUNDATION_ID");
  if (!GOVERNING.includes(foundation.authority as (typeof GOVERNING)[number]) || foundation.authority === "UNCONFIRMED_CANDIDATE" || foundation.sourceHint === "LLM") {
    findings.push("AUTHORITY_NOT_GOVERNING");
  }
  if (foundation.projectId !== input.projectId || foundation.structuralSystemId !== input.structuralSystemId) findings.push("CROSS_PROJECT");
  if (foundation.inferredByLlm || foundation.inferredFromReactionPattern || foundation.inferredFromMemberType || foundation.inferredFromGeometryOnly) {
    findings.push("TYPE_INFERRED");
  }
  if (foundation.family && !FAMILIES.includes(foundation.family)) findings.push("TYPE_INFERRED");
  if (foundation.familyDefinesCapacity || foundation.familyDefinesDimensions || foundation.familyDefinesReinforcement || foundation.familyDefinesSoilModel) {
    findings.push("FAMILY_DEFINES_BEHAVIOR");
  }
  if (!foundation.locationRef || !foundation.coordinateKind) findings.push("MISSING_FOUNDATION_LOCATION");
  if (input.currentTopologyFingerprint !== foundation.topologyFingerprint) findings.push("STALE_TOPOLOGY");
  if (input.currentProfileId && foundation.profileId && input.currentProfileId !== foundation.profileId) findings.push("STALE_PROFILE");
  if (!foundation.profileId || input.jurisdictionInferredFromLocation) findings.push("PROFILE_NOT_EXPLICIT");
  if (!input.mapping) findings.push("MISSING_MAPPING");
  else {
    if (!GOVERNING.includes(input.mapping.authority as (typeof GOVERNING)[number]) || input.mapping.authority === "UNCONFIRMED_CANDIDATE") findings.push("AI_MAPPING");
    if (input.mapping.projectId !== input.projectId || input.mapping.foundationId !== foundation.foundationId) findings.push("CROSS_PROJECT");
    if (input.mapping.supportIds.length === 0) findings.push("MISSING_SUPPORT");
    for (const supportId of input.mapping.supportIds) {
      if (!knownSupports.has(supportId)) findings.push("MISSING_SUPPORT");
    }
    if (input.mapping.connectionIds.length === 0) findings.push("MISSING_CONNECTION");
  }
  if (input.localAxisInferred) findings.push("AXIS_INFERRED");
  if (input.restraintDefinesFoundation) findings.push("RESTRAINT_DEFINES_FOUNDATION");
  if (input.interpretSpringAsSoil) findings.push("SPRING_AS_SOIL");
  if (input.eccentricityRequested) findings.push("ECCENTRICITY_DEFERRED");
  if (input.momentTransportRequested) findings.push("MOMENT_TRANSPORT_REJECTED");
  if (input.geotechnicalStandardSelectedByAi) findings.push("GEOTECH_STANDARD_BY_AI");
  if (input.selectionRequest && FORBIDDEN_SELECTION.includes(input.selectionRequest)) {
    if (input.selectionRequest === "MAX_ABS") findings.push("MAX_ABS_DEMAND");
    else if (input.selectionRequest === "SUM") findings.push("AUTOMATIC_SUM");
    else findings.push("AUTOMATIC_ENVELOPE");
  }
  if (input.synthesizeCombinationIds.length > 1) findings.push("CROSS_COMBINATION");
  if (input.envelope && (!input.envelope.sourceReactionIds.length || !input.envelope.fingerprint || FORBIDDEN_SELECTION.includes(input.envelope.selectionRule))) {
    findings.push("UNTRACEABLE_ENVELOPE");
  }
  const coordinateKinds = new Set(input.reactions.map((reaction) => reaction.coordinateKind));
  const locations = new Set(input.reactions.map((reaction) => reaction.locationRef));
  if (input.reactions.length > 1 && coordinateKinds.size > 1 && input.selectionRequest === "SUM") findings.push("MIXED_COORDINATES");
  if (input.reactions.length > 1 && locations.size > 1 && input.selectionRequest === "SUM") findings.push("MIXED_REFERENCE_POINTS");
  for (const reaction of input.reactions) {
    if (reaction.projectId !== input.projectId || reaction.structuralSystemId !== input.structuralSystemId) findings.push("CROSS_PROJECT");
    if (reaction.rawUnnormalized) findings.push("RAW_REACTION");
    if (reaction.authority !== "VERIFIED_GOVERNED" || reaction.completenessState !== "BINDING_COMPLETE_FOR_DECLARED_SCOPE") findings.push("UNUSABLE_REACTION");
    if (reaction.authority === "IMPORTED_PENDING_VERIFICATION") findings.push("UNUSABLE_REACTION");
    if (reaction.completenessState === "STALE") findings.push("STALE_REACTION");
    if (reaction.runStatus === "FAILED" || reaction.convergenceStatus === "FAILED") findings.push("FAILED_REACTION");
    if (reaction.runStatus === "NONCONVERGED" || reaction.convergenceStatus === "NONCONVERGED") findings.push("NONCONVERGED_REACTION");
    if (!reaction.modelValidationEvidenceRef) findings.push("MISSING_MODEL_VALIDATION");
    if (!reaction.loadCaseId && !reaction.combinationId) findings.push("MISSING_CASE");
    if (!reaction.locationRef) findings.push("MISSING_LOCATION");
    if (!reaction.coordinateKind || !COORDINATES.includes(reaction.coordinateKind as (typeof COORDINATES)[number]) || !reaction.coordinateMappingRef) {
      findings.push("MISSING_COORDINATE");
    }
    if (!reaction.signConventionRef) findings.push("MISSING_SIGN");
    if (reaction.signConversionsApplied > 1) findings.push("DOUBLE_SIGN");
    if (reaction.topologyFingerprint !== foundation.topologyFingerprint) findings.push("STALE_TOPOLOGY");
    if (!knownSupports.has(reaction.supportId)) findings.push("MISSING_SUPPORT");
    for (const component of reaction.components) {
      if (!COMPONENTS.includes(component.quantity)) findings.push("UNKNOWN_COMPONENT");
      if (!component.unit) findings.push("MISSING_UNITS");
      if (component.presence === "ABSENT" && component.value !== null) findings.push("ABSENT_AS_ZERO");
      if (component.presence === "EXPLICIT_ZERO" && component.value !== 0) findings.push("ABSENT_AS_ZERO");
      if (component.presence === "PRESENT" && component.value === null) findings.push("MISSING_COMPONENT");
    }
  }
  for (const ref of input.geotechnicalRefs) {
    if (ref.projectId !== input.projectId) findings.push("CROSS_PROJECT");
    if (!GOVERNING.includes(ref.authority as (typeof GOVERNING)[number]) || ref.authority === "UNCONFIRMED_CANDIDATE" || ref.sourceHint === "LLM") {
      findings.push("UNCONFIRMED_GEOTECH");
    }
    if (ref.valuePresent && (!ref.locationApplicabilityRef || ref.siteWideAssumed)) findings.push("GEOTECH_APPLICABILITY_MISSING");
  }
  if (input.geotechnicalRequired && input.geotechnicalRefs.length === 0) findings.push("MISSING_GEOTECH_REF");
  const unique = [...new Set(findings)].sort();
  const state = completeness(unique);
  const reactions = [...input.reactions].sort((left, right) => left.reactionId.localeCompare(right.reactionId));
  const reactionFingerprint = fingerprintStructuralSubject("RESULT_SET", {
    kind: "SUPPORT_REACTION_CONTEXT",
    supports: sortIds(input.mapping?.supportIds ?? []),
    foundationId: foundation.foundationId,
    reactions: reactions.map((reaction) => ({
      id: reaction.reactionId,
      fingerprint: reaction.reactionFingerprint,
      supportId: reaction.supportId,
      caseId: reaction.loadCaseId,
      combinationId: reaction.combinationId,
      location: reaction.locationRef,
      unit: reaction.components.map((component) => component.unit).join(","),
      coordinate: reaction.coordinateKind,
      sign: reaction.signConventionRef,
      model: reaction.analysisModelId,
      run: reaction.analysisRunId,
      resultSet: reaction.resultSetFingerprint,
    })),
    authority: foundation.authority,
  });
  const foundationFingerprint = fingerprintStructuralSubject("SYSTEM_EVALUATION", {
    kind: "FOUNDATION_INTERFACE",
    foundationId: foundation.foundationId,
    supports: sortIds(input.mapping?.supportIds ?? []),
    connections: sortIds(input.mapping?.connectionIds ?? []),
    authority: foundation.authority,
    family: foundation.family,
    location: foundation.locationRef,
    coordinate: foundation.coordinateKind,
    profile: foundation.profileId,
    geotech: [...input.geotechnicalRefs].map((ref) => `${ref.referenceId}:${ref.version}:${ref.fingerprint}`).sort(),
    version: foundation.version,
    reactions: reactionFingerprint,
  });
  const gap = input.foundationRequired ? ["FOUNDATION_REQUIRED_NOT_EVALUATED"] : [];
  return {
    foundationInterfaceResultId: `foundation-interface:${foundation.foundationId}:${foundationFingerprint.slice(0, 12)}`,
    foundationId: foundation.foundationId,
    structuralSystemId: input.structuralSystemId,
    supportIds: sortIds(input.mapping?.supportIds ?? []),
    connectionIds: sortIds(input.mapping?.connectionIds ?? []),
    supportReactionContext: {
      supportReactionContextId: `reaction-context:${foundation.foundationId}`,
      supportIds: sortIds(reactions.map((reaction) => reaction.supportId)),
      reactionIds: reactions.map((reaction) => reaction.reactionId),
      reactions,
      combinationIds: sortIds(reactions.flatMap((reaction) => reaction.combinationId ? [reaction.combinationId] : [])),
      aggregatedDemand: null,
      fingerprint: reactionFingerprint,
      canGovern: state === "FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE",
    },
    geotechnicalRefs: sortIds(input.geotechnicalRefs.map((ref) => ref.referenceId)),
    profileId: foundation.profileId,
    authority: foundation.authority,
    findings: [...unique, ...gap],
    blockingFindings: unique,
    completenessState: state,
    scopeState: input.foundationRequired ? "FOUNDATION_DESIGN_UNAVAILABLE" : "FOUNDATION_NOT_IN_DECLARED_SCOPE",
    foundationDesignAvailability: "FOUNDATION_DESIGN_NOT_IMPLEMENTED",
    geotechnicalDesignAvailability: "GEOTECHNICAL_DESIGN_NOT_IMPLEMENTED",
    foundationPass: false,
    foundationAdequate: false,
    designResult: false,
    inputContextEqualsDesign: false,
    eccentricityRoute: "DEFERRED",
    equilibriumDiagnostic: "DEFERRED_NON_GOVERNING_DIAGNOSTIC",
    multiSupportAggregationRoute: "DEFER_TO_FUTURE_FOUNDATION_DESIGN_ORCHESTRATION",
    memberPassHidesFoundationGap: false,
    connectionCompleteHidesFoundationGap: false,
    r3ResultsRewritten: false,
    r4ResultsRewritten: false,
    provenance: [
      input.structuralSystemId,
      ...sortIds(input.mapping?.supportIds ?? []),
      ...sortIds(input.mapping?.connectionIds ?? []),
      ...sortIds(reactions.map((reaction) => reaction.analysisModelId)),
      ...sortIds(reactions.map((reaction) => reaction.analysisRunId)),
      ...reactions.map((reaction) => reaction.reactionId),
      `reaction-context:${foundation.foundationId}`,
      foundation.foundationId,
      ...sortIds(input.geotechnicalRefs.map((ref) => ref.referenceId)),
    ],
    fingerprint: foundationFingerprint,
    reactionFingerprint,
    warnings: [...unique, ...gap],
    events: [
      { type: "FOUNDATION_IDENTITY_CREATED", subjectId: foundation.foundationId, approval: false },
      { type: "SUPPORT_REACTION_CONTEXT_CREATED", subjectId: foundation.foundationId, approval: false },
      { type: "FOUNDATION_INTERFACE_EVALUATED", subjectId: foundation.foundationId, approval: false },
    ],
  };
}

export function recordSuccessorFoundationInterface(prior: D1fR5FoundationResult, current: D1fR5FoundationResult): {
  prior: D1fR5FoundationResult;
  current: D1fR5FoundationResult;
  history: readonly D1fR5FoundationResult[];
} {
  return {
    prior: {
      ...prior,
      completenessState: "FOUNDATION_INTERFACE_STALE",
      supportReactionContext: { ...prior.supportReactionContext, canGovern: false },
      events: [...prior.events, { type: "FOUNDATION_INTERFACE_INVALIDATED", subjectId: prior.foundationId, approval: false }],
    },
    current,
    history: [prior, current],
  };
}
