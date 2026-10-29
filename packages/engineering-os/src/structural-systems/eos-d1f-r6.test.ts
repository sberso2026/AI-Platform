import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CONNECTIVITY_AUTHORITY,
  AI_ENGINEERING_ACCEPTANCE_AUTHORITY,
  AI_EVALUATION_PLAN_AUTHORITY,
  AI_FOUNDATION_AUTHORITY,
  AI_GOVERNING_ACTION_AUTHORITY,
  AI_RESULT_AUTHORITY,
  AI_SOIL_PARAMETER_AUTHORITY,
  AI_STRUCTURAL_ANALYSIS_AUTHORITY,
  AI_SUPPORT_AUTHORITY,
  AI_TOPOLOGY_AUTHORITY,
  D1F_CLOSEOUT_EQUALS_COMPLETE_STRUCTURAL_DESIGN,
  D1F_CLOSEOUT_EQUALS_GENERAL_AVAILABILITY,
  D1F_CLOSEOUT_EQUALS_GENERAL_STRUCTURAL_ANALYSIS,
  D1F_ENGINEER_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT,
  D1F_GENERAL_STEEL_SYSTEM_ORCHESTRATION_IMPLEMENTED,
  D1F_NEW_ENGINEERING_FORMULA_COUNT,
  D1F_NUMERICALLY_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT,
  D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE,
  D1F_R6_CANONICAL_DEBT_LEDGER,
  D1F_R6_CONCRETE_END_TO_END_ROUTE,
  D1F_R6_DEBT_CLASSIFICATION_MATRIX,
  D1F_R6_FINAL_MATURITY_STATE,
  D1F_R6_PRODUCT_CLAIM_MATRIX,
  D1F_R6_RECOMMENDED_D1G_FIRST_PHASE,
  D1F_UNBOUNDED_PASS_ALIAS_PRESENT,
  D1G_EXTERNAL_SOLVER_INTEGRATION_READINESS,
  GENERAL_STRUCTURAL_DESIGN_READINESS,
  type D1fR1TopologyInput,
  type D1fR2EvaluationInput,
  type D1fR2RawResult,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type StructuralStandardContext,
} from "@rtb/types";
import { governedProvenance } from "../structural-domain/catalog";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { unknownEurocodeVersion } from "../structural-steel/eu-standard/resolver";
import type { EuC9R2SectionActions } from "../structural-concrete/eu-c9/beam";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { executeD1fCloseoutFixture, type D1fR6FixtureInput } from "./closeout";
import { type D1fR4ConnectionInput } from "./connection-interface";
import { type D1fR5FoundationInput } from "./foundation-interface";
import {
  evaluateSystemMemberPlan,
  recordSuccessorAnalysisRun,
  recordSuccessorConnectionInterface,
  recordSuccessorFoundationInterface,
  recordSuccessorSystemEvaluation,
  reviseStructuralTopology,
} from "./index";
import { evaluateStructuralSystemTopology } from "./runtime";
import { type D1fR3GovernedBinding, type D1fR3PlanEntry } from "./system-evaluation";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function annex(): EurocodeNationalAnnex {
  return {
    nationalAnnexId: "NA-DE-EN1993-1-1",
    countryCode: "DE",
    standardPartRef: "EN_1993_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: null,
    sourceAuthorityRef: "metadata-reference-only",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
  };
}

function euStandard(): StructuralStandardContext {
  return {
    ...createConfiguredKnowledgeContext({
      contextId: "ctx-en1993-r6",
      jurisdictionProfileRef: "eu-eea",
      standardFamily: "EN",
      standardCode: "EN 1993-1-1",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "steel",
    }),
    nationalAnnexRef: {
      annexId: "NA-DE-EN1993-1-1",
      country: "DE",
      jurisdiction: "eu-eea",
      standardCode: "EN 1993-1-1",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      annexEdition: null,
      effectiveFrom: "1970-01-01",
      effectiveTo: null,
      parameterSetRef: null,
      sourceReference: "National Annex metadata reference only",
      validationState: "FRAMEWORK_ONLY",
    },
  };
}

function steelCheck() {
  const standardContext = euStandard();
  const demand: SteelCapacityEngineInput["demand"] = {
    resultId: "demand-r6",
    memberId: "m-eu2",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-r6",
  };
  const designContext: SteelDesignContext = {
    designContextId: "dc-r6",
    memberRef: "m-eu2",
    sectionRef: "sec-eu2",
    materialRef: "mat-eu2",
    demandRefs: ["demand-r6"],
    standardContextRef: standardContext.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: null,
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_EU_STEEL_TENSION",
    methodRef: "EU_TENSION",
    provenanceRef: governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1993-1-1", calculationMethod: "EU_TENSION" }),
    validationState: "BENCHMARKED",
    reviewState: "required",
  };
  const eurocodeContext: EurocodeSteelDesignContext = {
    contextId: "ctx-eu-tension-r6",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    assetId: "asset-r6",
    jurisdictionProfileRef: "eu-eea",
    countryCode: "DE",
    standardFamily: "EUROCODE",
    standardPart: "EN_1993_1_1",
    standardCode: "EN 1993-1-1",
    version: unknownEurocodeVersion("EN 1993-1-1"),
    nationalAnnex: annex(),
    ndpSet: [],
    materialSourceKind: "PROJECT_SPECIFICATION",
    sectionCatalogRef: null,
    projectContextRef: "project-1",
    calculationContextRef: "calc-r6",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "r6:tension",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
  };
  const capacityInput: SteelCapacityEngineInput = {
    adapterId: "EU_STEEL",
    designContext,
    standardContext,
    material: {
      materialRef: "mat-eu2",
      grade: "S355",
      yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
      ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
      elasticModulus: null,
      shearModulus: null,
      poissonRatio: null,
      density: null,
      thicknessDependentMetadata: null,
      jurisdictionApplicability: ["eu-eea"],
    },
    section: {
      sectionRef: "sec-eu2",
      sectionFamily: "IPE",
      catalogSource: "ENGINEER_SUPPLIED",
      catalogVersion: null,
      jurisdictionApplicability: ["eu-eea"],
      area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      Iyy: null,
      Izz: null,
      sectionModulusYy: null,
      sectionModulusZz: null,
      plasticModulusYy: null,
      plasticModulusZz: null,
      torsionConstant: null,
      warpingConstant: null,
      radiusOfGyrationYy: null,
      radiusOfGyrationZz: null,
      netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
      geometricDimensions: {},
    },
    stability: null,
    demand,
    limitState: "TENSION",
    requiredProperties: ["material.yieldStrength", "material.ultimateStrength", "section.area", "section.netArea"],
    eurocodeContext,
  };
  return { designCheckId: "chk-r6", designContext, capacityInput, demand };
}

function actions(): EuC9R2SectionActions {
  return {
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    majorMoment: { status: "PRESENT", signedNm: 50000 },
    minorMoment: { status: "ABSENT" },
  };
}

function topology(version = "t1"): D1fR1TopologyInput {
  const member = (memberId: string, start: string, end: string) => ({
    memberId,
    projectId: "project-1",
    memberKind: "BEAM",
    candidateMemberKind: null,
    memberTypeInferredByLlm: false,
    memberTypeInferredFromGeometryOnly: false,
    startNodeId: start,
    endNodeId: end,
    sectionRef: "section-a",
    materialRef: "material-a",
    authority: "HUMAN_CONFIRMED",
    provenanceRef: `prov-${memberId}`,
    sourceOrigin: "MANUAL_HUMAN_INPUT" as const,
    status: "GOVERNED",
  });
  return {
    structuralSystemId: "ss-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    disciplineRef: "structural",
    context: { contextId: "ctx-1", projectId: "project-1", discipline: "structural" },
    systemVersion: "1",
    status: "GOVERNED",
    topologyVersion: version,
    unitSystemRef: "SI",
    globalCoordinateSystemRef: "global-cs",
    provenanceRef: "prov-system",
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    declaredMemberIds: null,
    declaredNodeIds: null,
    members: [member("m-steel", "n1", "n2"), member("m-beam", "n2", "n3")],
    nodes: ["n1", "n2", "n3"].map((nodeId, index) => ({
      nodeId,
      projectId: "project-1",
      x: index * 6,
      y: 0,
      z: 0,
      unit: "m",
      coordinateSystemRef: "global-cs",
      authority: "HUMAN_CONFIRMED",
      provenanceRef: `prov-${nodeId}`,
      sourceOrigin: "MANUAL_HUMAN_INPUT" as const,
      status: "GOVERNED",
    })),
    edges: [],
    supports: [{
      supportId: "s1",
      projectId: "project-1",
      nodeRef: "n1",
      memberRef: null,
      supportType: "PINNED",
      restraints: [{ axis: "UX", state: "FIXED" as const, springValue: null, springUnit: null, valueInvented: false }],
      authority: "HUMAN_CONFIRMED",
      provenanceRef: "prov-s1",
      sourceOrigin: "MANUAL_HUMAN_INPUT" as const,
      status: "GOVERNED",
    }],
    releases: [],
    connections: [],
    coordinateSystems: [{ systemId: "global-cs", kind: "GLOBAL", authority: "HUMAN_AUTHORED", provenanceRef: "prov-cs", sourceOrigin: "MANUAL_HUMAN_INPUT" }],
    transforms: [],
    signConvention: {
      forceSign: "FORCE_SIGN",
      momentSign: "MOMENT_SIGN",
      memberEndConvention: "MEMBER_END_CONVENTION",
      localAxisOrientation: "LOCAL_AXIS_ORIENTATION",
      designMethodConvention: "DESIGN_METHOD_CONVENTION",
      solverNameAssumed: false,
    },
    directionalSemanticsPresent: true,
    loadCaseIds: ["LC1"],
    combinationIds: ["ULS-1"],
    loadPaths: [],
    analyticalElements: [],
    analyticalMappings: [],
    designMappings: [],
    uiSelection: null,
    viewport: null,
    displayColor: null,
  };
}

function raw(resultId: string, quantity: string, value: number): D1fR2RawResult {
  return {
    resultId,
    analyticalElementId: "ae-1",
    nodeId: null,
    supportId: null,
    category: "MEMBER_ACTION_EFFECT",
    quantity,
    value,
    explicitZero: false,
    unit: quantity.startsWith("M") ? "kN.m" : "kN",
    coordinateSystemRef: "global",
    signConventionRef: "eos-sign",
    signFactor: 1,
    signConversionsApplied: 0,
    locationKind: "START",
    stationCoordinate: null,
    stationUnit: null,
    stationOrigin: null,
    stationOrientation: null,
    loadCaseId: null,
    combinationId: "ULS-1",
    providerMetadata: "fixture-provider",
    authority: "VERIFIED_GOVERNED",
    provenanceRef: `prov-${resultId}`,
    projectId: "project-1",
  };
}

function analysis(partial: Partial<D1fR2EvaluationInput> & Pick<D1fR2EvaluationInput, "analysisRunId" | "resultSetId" | "physicalMemberId" | "designMemberId" | "designTarget">): D1fR2EvaluationInput {
  return {
    structuralSystemId: "ss-1",
    projectId: "project-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    analysisModelId: "model-1",
    analysisModelVersion: "1",
    sourceTopologyFingerprint: "pending",
    mappingFingerprint: "map-1",
    providerId: "fixture-provider",
    providerName: "provider-neutral",
    providerVersion: "1",
    providerType: "GOVERNED_EXTERNAL_SOLVER",
    modelType: "RESULT_IMPORT",
    unitSystemRef: "SI",
    globalCoordinateSystemRef: "global",
    providerCoordinateSystemRef: "global",
    canonicalCoordinateSystemRef: "global",
    signConventionRef: "eos-sign",
    assumptionsRef: "assumptions-1",
    sourceModelRef: "source-model-1",
    modelStatus: "GOVERNED",
    modelAuthority: "VERIFIED_GOVERNED",
    modelValidationEvidenceRef: "validation-1",
    normalizationRuleVersion: "norm-1",
    analysisType: "STATIC_RESULT_IMPORT",
    inputFingerprint: "input-1",
    loadCaseIds: ["LC1"],
    combinationIds: ["ULS-1"],
    runStatus: "COMPLETED",
    convergenceStatus: "CONVERGED",
    warnings: [],
    runTimestamp: "2026-10-17T00:00:00.000Z",
    runAuthority: "VERIFIED_GOVERNED",
    runProvenanceRef: "prov-run",
    rawResults: [raw("n", "N", 12), raw("v", "V_MAJOR", -3), raw("m", "M_MAJOR", 4)],
    transform: null,
    axisMapAuthority: "EXPLICIT_GOVERNED",
    axisMap: { N: "N", V_MAJOR: "V_MAJOR", V_MINOR: "V_MINOR", M_MAJOR: "M_MAJOR", M_MINOR: "M_MINOR", T: "T" },
    elementDirection: "ALIGNED",
    reversal: null,
    cardinality: "ONE_TO_ONE",
    aggregationRuleRef: null,
    declaredQuantities: ["N", "V_MAJOR", "M_MAJOR"],
    automaticEnvelope: false,
    governedEnvelope: null,
    currentTopologyFingerprint: "pending",
    currentMappingFingerprint: "map-1",
    currentNormalizationRuleVersion: "norm-1",
    promoteActor: null,
    ...partial,
  };
}

function entry(kind: "STEEL" | "BEAM"): D1fR3PlanEntry {
  const check = steelCheck();
  const beamActions = actions();
  return {
    entryId: kind === "STEEL" ? "e-steel" : "beam-1",
    projectId: "project-1",
    physicalMemberId: kind === "STEEL" ? "phys-steel" : "phys-beam",
    designMemberId: kind === "STEEL" ? "m-eu2" : "beam-1",
    materialDomain: kind === "STEEL" ? "STEEL" : "CONCRETE",
    memberType: kind === "STEEL" ? "MEMBER" : "BEAM",
    capabilityId: kind === "STEEL" ? "D1D_EU_TENSION" : "D1E_C9_BEAM",
    profileId: kind === "STEEL" ? "EN 1993-1-1" : "EU-EN1992-1-1-GEN1",
    jurisdiction: "eu-eea",
    generation: "GEN1",
    declaredScope: kind === "STEEL" ? ["MEMBER_TENSION"] : ["DECLARED_CONCRETE_SCOPE"],
    candidateBindingIds: [kind === "STEEL" ? "b-steel" : "b-beam"],
    selectedBindingId: kind === "STEEL" ? "b-steel" : "b-beam",
    role: "REQUIRED_CHECK",
    authority: "HUMAN_AUTHORED",
    selectionRule: null,
    componentCombinationIds: [kind === "STEEL" ? "comb-r6" : "uls-1"],
    envelope: null,
    connectionRequired: false,
    foundationRequired: false,
    materialInferredByLlm: false,
    materialInferredFromSectionName: false,
    memberTypeInferredByAi: false,
    memberTypeInferredFromGeometryOnly: false,
    standardSelectedByAi: false,
    jurisdictionInferredFromLocation: false,
    checkEngineSelectedByLlm: false,
    checkEngineSelectedFromMemberName: false,
    steelCheck: kind === "STEEL" ? { designCheckId: check.designCheckId, designContext: check.designContext, capacityInput: check.capacityInput } : null,
    beamInput: kind === "BEAM" ? { memberId: "beam-1", memberType: "BEAM", standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" }, actions: beamActions, combinationId: "uls-1", declaredEvaluationScope: ["ULS_SECTION"] } : null,
    columnInput: null,
    slabInput: null,
    wallInput: null,
  };
}

function governedBinding(kind: "STEEL" | "BEAM"): D1fR3GovernedBinding {
  return {
    bindingId: kind === "STEEL" ? "b-steel" : "b-beam",
    projectId: "project-1",
    structuralSystemId: "ss-1",
    physicalMemberId: kind === "STEEL" ? "phys-steel" : "phys-beam",
    designMemberId: kind === "STEEL" ? "m-eu2" : "beam-1",
    authority: "VERIFIED_GOVERNED",
    completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
    topologyFingerprint: "pending",
    analysisModelFingerprint: "pending",
    analysisRunFingerprint: "pending",
    resultSetFingerprint: "frozen-set",
    bindingFingerprint: "frozen-bind",
    modelValidationEvidenceRef: "validation-1",
    runStatus: "COMPLETED",
    convergenceStatus: "CONVERGED",
    combinationId: kind === "STEEL" ? "comb-r6" : "uls-1",
    locationKind: "MEMBER_START",
    locationProvenanceRef: "station-origin",
    steelDemand: kind === "STEEL" ? steelCheck().demand : null,
    concreteSectionActions: kind === "BEAM" ? actions() : null,
    absentQuantities: [],
  };
}

function connection(): D1fR4ConnectionInput {
  return {
    projectId: "project-1",
    structuralSystemId: "ss-1",
    physicalConnection: {
      connectionId: "conn-1",
      projectId: "project-1",
      connectedMemberIds: ["phys-steel", "phys-beam"],
      classification: null,
      impliesRelease: false,
      authority: "HUMAN_CONFIRMED",
      provenanceRef: "r1-connection",
      sourceOrigin: "MANUAL_HUMAN_INPUT",
      status: "GOVERNED",
      structuralSystemId: "ss-1",
      entityKind: "SUPPORT_CONNECTION",
      connectedMemberEndIds: ["end-a", "end-b"],
      nodeId: "n1",
      version: "1",
      topologyFingerprint: "pending",
      sourceHint: "HUMAN",
      profileId: "profile-1",
    },
    memberEnds: [
      { memberEndId: "end-a", projectId: "project-1", physicalMemberId: "phys-steel", designMemberId: "m-eu2", analyticalElementId: "ae-1", memberEnd: "START", nodeId: "n1", localCoordinateSystemId: "member-local-1", orientation: "I_POSITIVE", orientationGuessed: false, provenanceRef: "end-a" },
      { memberEndId: "end-b", projectId: "project-1", physicalMemberId: "phys-beam", designMemberId: "beam-1", analyticalElementId: "ae-2", memberEnd: "END", nodeId: "n1", localCoordinateSystemId: "member-local-1", orientation: "J_NEGATIVE", orientationGuessed: false, provenanceRef: "end-b" },
    ],
    analyticalJoints: [{
      analyticalJointId: "joint-1",
      projectId: "project-1",
      analysisModelId: "model-1",
      nodeId: "n1",
      connectedEnds: [
        { analyticalElementId: "ae-1", memberEnd: "START", orientation: "I_POSITIVE" },
        { analyticalElementId: "ae-2", memberEnd: "END", orientation: "J_NEGATIVE" },
      ],
      coordinateSystemRef: "member-local-1",
      mappingAuthority: "HUMAN_CONFIRMED",
      provenanceRef: "joint",
    }],
    designConnection: {
      designConnectionId: "design-conn-1",
      projectId: "project-1",
      physicalConnectionId: "conn-1",
      profileId: "profile-1",
      family: "BASE_CONNECTION",
      requiredScope: ["INTERFACE_ONLY"],
      memberEndIds: ["end-a", "end-b"],
      actionContextRefs: ["b-steel", "b-beam"],
      authority: "HUMAN_CONFIRMED",
      status: "GOVERNED",
      provenanceRef: "design-identity",
      inferredByLlm: false,
      inferredFromGeometry: false,
      inferredFromForcePattern: false,
      familyDefinesStiffness: false,
      familyDefinesRelease: false,
      familyDefinesCapacity: false,
    },
    jointMapping: { mappingId: "map-joints", projectId: "project-1", physicalConnectionId: "conn-1", analyticalJointIds: ["joint-1"], authority: "HUMAN_CONFIRMED", provenanceRef: "mapping" },
    releases: [],
    endActions: ["end-a", "end-b"].map((memberEndId) => ({
      bindingId: memberEndId,
      projectId: "project-1",
      structuralSystemId: "ss-1",
      memberEndId,
      authority: "VERIFIED_GOVERNED",
      completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
      runStatus: "COMPLETED",
      convergenceStatus: "CONVERGED",
      modelValidationEvidenceRef: "validation-1",
      loadCaseId: null,
      combinationId: "ULS-1",
      locationKind: "MEMBER_END",
      coordinateKind: "MEMBER_LOCAL",
      coordinateMappingRef: "map-1",
      signConventionRef: "eos-sign",
      signConversionsApplied: 1,
      topologyFingerprint: "pending",
      analysisModelFingerprint: "pending",
      resultSetFingerprint: "frozen-set",
      bindingFingerprint: "frozen-bind",
      rawUnnormalized: false,
      components: [
        { quantity: "N" as const, presence: "PRESENT" as const, value: 1000 },
        { quantity: "V_MAJOR" as const, presence: "ABSENT" as const, value: null },
        { quantity: "M_MAJOR" as const, presence: "EXPLICIT_ZERO" as const, value: 0 },
      ],
    })),
    selectionRequest: null,
    synthesizeCombinationIds: [],
    connectionLocalAxisInferred: false,
    transferPathInferredByAi: false,
    transferPathInferredFromType: false,
    currentTopologyFingerprint: "pending",
    currentProfileId: "profile-1",
    currentReleaseFingerprint: "releases-0",
    connectionRequiredByScope: false,
    r3MemberSatisfied: true,
    supportId: "s1",
    reactionRefs: ["rx-1"],
  };
}

function foundation(): D1fR5FoundationInput {
  return {
    projectId: "project-1",
    structuralSystemId: "ss-1",
    supports: [{
      supportId: "s1",
      projectId: "project-1",
      nodeRef: "n1",
      memberRef: null,
      supportType: "PINNED",
      restraints: [{ axis: "UZ", state: "FIXED", springValue: null, springUnit: null, valueInvented: false }],
      authority: "HUMAN_AUTHORED",
      provenanceRef: "support:s1",
      sourceOrigin: "MANUAL_HUMAN_INPUT",
      status: "GOVERNED",
    }],
    foundation: {
      foundationId: "fdn-1",
      projectId: "project-1",
      structuralSystemId: "ss-1",
      supportIds: ["s1"],
      connectionIds: ["conn-1"],
      forceTransferContextIds: ["ft-1"],
      locationRef: "grid-A1",
      coordinateKind: "GLOBAL",
      family: "ISOLATED_FOOTING",
      profileId: "profile-1",
      authority: "HUMAN_AUTHORED",
      sourceHint: "HUMAN",
      status: "GOVERNED",
      version: "1",
      topologyFingerprint: "pending",
      provenanceRef: "fdn:1",
      inferredByLlm: false,
      inferredFromReactionPattern: false,
      inferredFromMemberType: false,
      inferredFromGeometryOnly: false,
      familyDefinesCapacity: false,
      familyDefinesDimensions: false,
      familyDefinesReinforcement: false,
      familyDefinesSoilModel: false,
    },
    mapping: {
      mappingId: "map-fdn-1",
      projectId: "project-1",
      supportIds: ["s1"],
      foundationId: "fdn-1",
      connectionIds: ["conn-1"],
      cardinality: "ONE_TO_ONE",
      authority: "HUMAN_CONFIRMED",
      provenanceRef: "mapping:1",
    },
    reactions: [{
      reactionId: "rx-1",
      projectId: "project-1",
      structuralSystemId: "ss-1",
      supportId: "s1",
      authority: "VERIFIED_GOVERNED",
      completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
      runStatus: "COMPLETED",
      convergenceStatus: "CONVERGED",
      modelValidationEvidenceRef: "validation-1",
      loadCaseId: null,
      combinationId: "ULS-1",
      locationRef: "loc-s1",
      coordinateKind: "GLOBAL",
      coordinateMappingRef: "map-1",
      signConventionRef: "eos-sign",
      signConversionsApplied: 1,
      topologyFingerprint: "pending",
      analysisModelId: "model-1",
      analysisRunId: "run-steel",
      resultSetFingerprint: "frozen-set",
      reactionFingerprint: "react-1",
      rawUnnormalized: false,
      components: [
        { quantity: "FZ", presence: "PRESENT", value: 120, unit: "kN" },
        { quantity: "FX", presence: "ABSENT", value: null, unit: "kN" },
      ],
    }],
    geotechnicalRefs: [{
      referenceId: "geo-1",
      projectId: "project-1",
      kind: "bearingRecommendationRef",
      authority: "HUMAN_CONFIRMED",
      sourceHint: "GOVERNED_REPORT",
      valuePresent: true,
      locationApplicabilityRef: "borehole-A/2.5m",
      units: "kPa",
      version: "1",
      fingerprint: "geo-fp-1",
      siteWideAssumed: false,
    }],
    envelope: null,
    selectionRequest: null,
    synthesizeCombinationIds: [],
    localAxisInferred: false,
    interpretSpringAsSoil: false,
    restraintDefinesFoundation: false,
    eccentricityRequested: false,
    momentTransportRequested: false,
    jurisdictionInferredFromLocation: false,
    geotechnicalStandardSelectedByAi: false,
    foundationRequired: false,
    geotechnicalRequired: false,
    memberEvaluationSatisfied: true,
    connectionInterfaceComplete: true,
    currentTopologyFingerprint: "pending",
    currentProfileId: "profile-1",
  };
}

function fixture(patch: Partial<D1fR6FixtureInput> = {}): D1fR6FixtureInput {
  const check = steelCheck();
  return {
    topology: topology(),
    analyses: [
      analysis({ analysisRunId: "run-steel", resultSetId: "set-steel", physicalMemberId: "phys-steel", designMemberId: "m-eu2", designTarget: "D1D_STEEL_MEMBER" }),
      analysis({ analysisRunId: "run-beam", resultSetId: "set-beam", physicalMemberId: "phys-beam", designMemberId: "beam-1", designTarget: "D1E_CONCRETE_MEMBER" }),
    ],
    standardContext: check.capacityInput.standardContext,
    evaluation: {
      plan: {
        evaluationPlanId: "plan-1",
        structuralSystemId: "ss-1",
        projectId: "project-1",
        topologyFingerprint: "pending",
        profileId: "project-profile-1",
        jurisdiction: "eu-eea",
        generation: "GEN1",
        declaredScope: ["BOUNDED_MEMBER_EVALUATION"],
        authority: "HUMAN_AUTHORED",
        status: "GOVERNED",
        version: "1",
        provenanceRef: "plan-authored",
        entries: [entry("STEEL"), entry("BEAM")],
      },
      bindings: [governedBinding("STEEL"), governedBinding("BEAM")],
      currentTopologyFingerprint: "pending",
      currentProfileId: "project-profile-1",
      currentMethodFingerprint: "method-1",
    },
    connection: connection(),
    foundation: foundation(),
    alignFingerprints: true,
    linkResultFingerprints: true,
    ...patch,
  };
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return path.endsWith(".ts") ? [path] : [];
  });
}

describe("EOS-D1F-R6 structural systems closeout", () => {
  it("runs one governed chain across topology, results, members, connection, and foundation", () => {
    const topo = evaluateStructuralSystemTopology(topology());
    expect(topo.blockingFindings.map((row) => row.code)).toEqual([]);
    expect(topo.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    const chain = executeD1fCloseoutFixture(fixture());
    expect(chain.analyses.every((row) => row.canGovern)).toBe(true);
    expect(chain.system.executedMemberCount).toBe(chain.system.requiredMemberCount);
    expect(chain.connection.completenessState).toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(chain.foundation.completenessState).toBe("FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(chain.topologyInvalidated).toBe(false);
    expect(chain.resultInvalidated).toBe(false);
    expect(chain.crossProjectRejected).toBe(false);
    expect(chain.chainGoverning).toBe(true);
    expect(chain.system.members.map((member) => member.capabilityId).sort()).toEqual(["D1D_EU_TENSION", "D1E_C9_BEAM"]);
    expect(chain.system.members.find((member) => member.capabilityId === "D1E_C9_BEAM")?.state).toBe("MEMBER_UNDETERMINED");
    expect(chain.system.overallState).toBe("SYSTEM_UNDETERMINED");
    expect(chain.system.engineeringApproved).toBe(false);
    expect(chain.connection.completenessState).toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(chain.connection.forceTransfer?.aggregatedDemand).toBeNull();
    expect(chain.foundation.completenessState).toBe("FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(chain.foundation.foundationPass).toBe(false);
    expect(chain.provenance.join(" ")).toContain(chain.topologyFingerprint);
    expect(chain.provenance.join(" ")).toContain("run-steel");
    expect(chain.provenance.join(" ")).toContain("conn-1");
    expect(chain.provenance.join(" ")).toContain("fdn-1");
    expect(chain.system.members[0]?.provenance.join(" ")).toContain("b-steel");
    expect(JSON.stringify(chain.system)).not.toMatch(/STRUCTURE_PASS|STRUCTURE SAFE|STRUCTURE ADEQUATE/);
    expect(D1F_R3_STEEL_SYSTEM_DISPATCH_SCOPE).toBe("D1D_EU_TENSION only");
    expect(D1F_R6_CONCRETE_END_TO_END_ROUTE).toBe("D1E_C9_BEAM");
    expect(D1F_GENERAL_STEEL_SYSTEM_ORCHESTRATION_IMPLEMENTED).toBe(false);
    expect(D1F_CLOSEOUT_EQUALS_GENERAL_STRUCTURAL_ANALYSIS).toBe(false);
    expect(D1F_CLOSEOUT_EQUALS_COMPLETE_STRUCTURAL_DESIGN).toBe(false);
    expect(D1F_CLOSEOUT_EQUALS_GENERAL_AVAILABILITY).toBe(false);
    expect(D1F_UNBOUNDED_PASS_ALIAS_PRESENT).toBe(false);
    expect(D1G_EXTERNAL_SOLVER_INTEGRATION_READINESS).toBe(true);
    expect(GENERAL_STRUCTURAL_DESIGN_READINESS).toBe(false);
    expect(D1F_R6_RECOMMENDED_D1G_FIRST_PHASE).toBe("EOS-D1G-R1-PROVIDER-NEUTRAL-SOLVER-ADAPTER-FOUNDATION");
    expect(D1F_R6_FINAL_MATURITY_STATE).toBe("STRUCTURAL_SYSTEMS_BOUNDED_RUNTIME_AND_ORCHESTRATION_IMPLEMENTED");
    expect(D1F_NUMERICALLY_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT).toBe(1);
    expect(D1F_ENGINEER_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT).toBe(0);
    expect(D1F_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1F_R6_PRODUCT_CLAIM_MATRIX.structuralAnalysis).toBe("NOT_IMPLEMENTED");
    expect(D1F_R6_PRODUCT_CLAIM_MATRIX.connectionDesign).toBe("NOT_IMPLEMENTED");
    expect(D1F_R6_CANONICAL_DEBT_LEDGER).toContain("GA_SECURITY_DEBT_REMAINS");
    expect(D1F_R6_DEBT_CLASSIFICATION_MATRIX.NO_EXTERNAL_SOLVER_CONNECTOR).toBe("FUTURE_CAPABILITY_ONLY");
    expect(D1F_R6_DEBT_CLASSIFICATION_MATRIX.GA_SECURITY_DEBT_REMAINS).toBe("BLOCKS_GENERAL_AVAILABILITY");
    expect(AI_STRUCTURAL_ANALYSIS_AUTHORITY).toBe(false);
    expect(AI_TOPOLOGY_AUTHORITY).toBe(false);
    expect(AI_CONNECTIVITY_AUTHORITY).toBe(false);
    expect(AI_SUPPORT_AUTHORITY).toBe(false);
    expect(AI_RESULT_AUTHORITY).toBe(false);
    expect(AI_EVALUATION_PLAN_AUTHORITY).toBe(false);
    expect(AI_GOVERNING_ACTION_AUTHORITY).toBe(false);
    expect(AI_FOUNDATION_AUTHORITY).toBe(false);
    expect(AI_SOIL_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_ACCEPTANCE_AUTHORITY).toBe(false);
  });

  it("propagates topology, result, plan, connection, and foundation invalidation without overwriting history", () => {
    const current = executeD1fCloseoutFixture(fixture());
    const topologyChanged = executeD1fCloseoutFixture(fixture({
      topology: topology("t2"),
      alignFingerprints: false,
    }));
    expect(topologyChanged.topologyFingerprint).not.toBe(current.topologyFingerprint);
    expect(topologyChanged.chainGoverning).toBe(false);
    expect(topologyChanged.topologyInvalidated).toBe(true);
    expect(topologyChanged.system.overallState).toBe("SYSTEM_STALE");
    expect(topologyChanged.connection.completenessState).toBe("CONNECTION_INTERFACE_STALE");
    expect(topologyChanged.foundation.completenessState).toBe("FOUNDATION_INTERFACE_STALE");
    const resultChanged = executeD1fCloseoutFixture(fixture({
      analyses: [
        analysis({ analysisRunId: "run-steel", resultSetId: "set-steel", physicalMemberId: "phys-steel", designMemberId: "m-eu2", designTarget: "D1D_STEEL_MEMBER", rawResults: [raw("n", "N", 40), raw("v", "V_MAJOR", -3), raw("m", "M_MAJOR", 4)] }),
        analysis({ analysisRunId: "run-beam", resultSetId: "set-beam", physicalMemberId: "phys-beam", designMemberId: "beam-1", designTarget: "D1E_CONCRETE_MEMBER" }),
      ],
      linkResultFingerprints: false,
    }));
    expect(resultChanged.analyses[0]?.resultSetFingerprint).not.toBe(current.analyses[0]?.resultSetFingerprint);
    expect(resultChanged.resultInvalidated).toBe(true);
    expect(resultChanged.system.members.some((member) => member.state === "MEMBER_STALE")).toBe(true);
    const replanned = executeD1fCloseoutFixture(fixture({
      evaluation: { ...fixture().evaluation, plan: { ...fixture().evaluation.plan, version: "2" } },
    }));
    expect(replanned.system.planFingerprint).not.toBe(current.system.planFingerprint);
    const priorTopology = evaluateStructuralSystemTopology(topology());
    const revised = reviseStructuralTopology(priorTopology, topology("t2"));
    expect(priorTopology.systemStatus).toBe("GOVERNED");
    expect(revised.prior.systemStatus).toBe("SUPERSEDED");
    expect(revised.prior.topologyFingerprint).toBe(priorTopology.topologyFingerprint);
    const successor = recordSuccessorSystemEvaluation(current.system, replanned.system);
    expect(current.system.overallState).toBe("SYSTEM_UNDETERMINED");
    expect(successor.history[0]?.fingerprint).toBe(current.system.fingerprint);
    const connectionHistory = recordSuccessorConnectionInterface(current.connection, topologyChanged.connection);
    expect(current.connection.completenessState).toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(connectionHistory.prior.completenessState).toBe("CONNECTION_INTERFACE_STALE");
    const foundationHistory = recordSuccessorFoundationInterface(current.foundation, topologyChanged.foundation);
    expect(current.foundation.fingerprint).toBe(foundationHistory.history[0]?.fingerprint);
    const runHistory = recordSuccessorAnalysisRun(current.analyses[0]!, fixture().analyses[0]!, euStandard());
    expect(runHistory.history[0]?.bindingFingerprint).toBe(current.analyses[0]?.bindingFingerprint);
  });

  it("rejects cross-project and cross-tenant binding and keeps required scope fail-closed", () => {
    const otherProject = fixture();
    otherProject.foundation = { ...otherProject.foundation, projectId: "project-2" };
    expect(executeD1fCloseoutFixture(otherProject).crossProjectRejected).toBe(true);
    const otherTenant = fixture();
    otherTenant.analyses = [{ ...otherTenant.analyses[0]!, tenantId: "tenant-2" }, otherTenant.analyses[1]!];
    expect(executeD1fCloseoutFixture(otherTenant).crossTenantRejected).toBe(true);
    const nonconverged = executeD1fCloseoutFixture(fixture({
      analyses: [
        analysis({ analysisRunId: "run-steel", resultSetId: "set-steel", physicalMemberId: "phys-steel", designMemberId: "m-eu2", designTarget: "D1D_STEEL_MEMBER", convergenceStatus: "NONCONVERGED" }),
        analysis({ analysisRunId: "run-beam", resultSetId: "set-beam", physicalMemberId: "phys-beam", designMemberId: "beam-1", designTarget: "D1E_CONCRETE_MEMBER" }),
      ],
    }));
    expect(nonconverged.chainGoverning).toBe(false);
    const empty = evaluateSystemMemberPlan({ ...fixture().evaluation, plan: { ...fixture().evaluation.plan, entries: [] } });
    expect(empty.overallState).not.toBe("SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE");
    const gap = evaluateSystemMemberPlan({
      ...fixture().evaluation,
      plan: { ...fixture().evaluation.plan, entries: [entry("STEEL"), { ...entry("BEAM"), foundationRequired: true }] },
    });
    expect(gap.overallState).not.toBe("SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE");
  });

  it("does not add analysis or design formulas in the closeout layer", () => {
    const files = walk(join(ROOT, "packages/engineering-os/src/structural-systems")).filter((path) => !path.endsWith(".test.ts"));
    const hits = files.flatMap((path) => scanAnalysisFormulaBypass(path, readFileSync(path, "utf8")));
    expect(hits).toEqual([]);
    const closeout = readFileSync(join(ROOT, "packages/engineering-os/src/structural-systems/closeout.ts"), "utf8");
    const doc = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_D1F_R6_STRUCTURAL_SYSTEMS_CLOSEOUT.md"), "utf8");
    for (const token of [["bearing", "Capacity"].join(""), ["Math.max"].join(""), [".reduce("].join("")]) {
      expect(closeout.includes(token), token).toBe(false);
      expect(doc.includes(token), token).toBe(false);
    }
    expect(doc.includes("```")).toBe(false);
  });
});
