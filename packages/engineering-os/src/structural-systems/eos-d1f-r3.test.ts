import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_D1F_R3_ASSISTANCE_ADVISORY_ONLY,
  AI_EVALUATION_PLAN_AUTHORITY,
  D1F_R3_ABSENT_ACTION_INVENTED_AS_ZERO,
  D1F_R3_AUTOMATIC_ENVELOPE_IMPLEMENTED,
  D1F_R3_AUTOMATIC_GOVERNING_CASE_SELECTION,
  D1F_R3_CONNECTION_DESIGN_IMPLEMENTED,
  D1F_R3_ENGINEER_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT,
  D1F_R3_FORMAL_CONFORMANCE_VALIDATED,
  D1F_R3_FOUNDATION_DESIGN_IMPLEMENTED,
  D1F_R3_FULL_STRUCTURAL_SYSTEM_COVERAGE,
  D1F_R3_GENERIC_MAX_ABS_GOVERNS,
  D1F_R3_LOAD_PATH_ANALYSIS_IMPLEMENTED,
  D1F_R3_MEMBER_PASS_EQUALS_GLOBAL_STRUCTURAL_ADEQUACY,
  D1F_R3_NEW_ENGINEERING_FORMULA_COUNT,
  D1F_R3_ORCHESTRATION_CAN_EXCEED_UNDERLYING_VALIDATION_MATURITY,
  D1F_R3_STEEL_CROSS_JURISDICTION_RULE_REUSE,
  D1F_R3_SYSTEM_EVALUATION_EQUALS_STRUCTURAL_ANALYSIS,
  D1F_R3_SYSTEM_EVALUATION_ORCHESTRATOR_COUNT,
  D1F_R3_WALL_RESULT_EQUALS_WALL_MEMBER_DESIGN,
  type EurocodeNationalAnnex,
  type EurocodeSteelDesignContext,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type StructuralStandardContext,
} from "@rtb/types";
import { governedProvenance } from "../structural-domain/catalog";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { unknownEurocodeVersion } from "../structural-steel/eu-standard/resolver";
import { orchestrateEuTensionDesignCheck } from "../structural-steel/orchestrate";
import { orchestrateEuC9R2Beam, type EuC9R2SectionActions } from "../structural-concrete/eu-c9/beam";
import {
  EU_C9_R3_C6_C3_SIGN_CONVERSION_COUNT,
  EU_C9_R3_C6_C4_HANDOFF_STATE,
  EU_C9_R3_C6_OUTPUT_USED_FOR_C4,
  EU_C9_R3_SECOND_ORDER_METHOD,
  orchestrateEuC9R3Column,
} from "../structural-concrete/eu-c9/column";
import { orchestrateEuC9R4SolidSlab } from "../structural-concrete/eu-c9/slab";
import { orchestrateEuC9R5WallSection } from "../structural-concrete/eu-c9/wall";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  evaluateSystemMemberPlan,
  recordSuccessorSystemEvaluation,
  type D1fR3EvaluationInput,
  type D1fR3GovernedBinding,
  type D1fR3Plan,
  type D1fR3PlanEntry,
} from "./system-evaluation";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function annex(country: string): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1993-1-1`,
    countryCode: country,
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
      contextId: "ctx-en1993-r3",
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

function steelDemand(context: StructuralStandardContext, valueN = 1_000_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-r3",
    memberId: "m-eu2",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: context,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-r3",
  };
}

function steelCheck(valueN = 1_000_000) {
  const standardContext = euStandard();
  const demand = steelDemand(standardContext, valueN);
  const material: SteelMaterialDesignProperties = {
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
  };
  const section: SteelSectionDesignProperties = {
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
  };
  const designContext: SteelDesignContext = {
    designContextId: "dc-r3",
    memberRef: "m-eu2",
    sectionRef: "sec-eu2",
    materialRef: "mat-eu2",
    demandRefs: ["demand-r3"],
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
    contextId: "ctx-eu-tension-r3",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    projectId: "proj-1",
    assetId: "asset-r3",
    jurisdictionProfileRef: "eu-eea",
    countryCode: "DE",
    standardFamily: "EUROCODE",
    standardPart: "EN_1993_1_1",
    standardCode: "EN 1993-1-1",
    version: unknownEurocodeVersion("EN 1993-1-1"),
    nationalAnnex: annex("DE"),
    ndpSet: [],
    materialSourceKind: "PROJECT_SPECIFICATION",
    sectionCatalogRef: null,
    projectContextRef: "proj-1",
    calculationContextRef: "calc-r3",
    sourceAuthorityRef: "governed-project-profile",
    intendedStandardProfile: "EN1993",
    standardConformanceState: "INTENDED_PROFILE",
    validationState: "FRAMEWORK_ONLY",
    provenanceRef: "r3:tension",
    issued: false,
    humanConfirmation: null,
    piiPresent: false,
  };
  const capacityInput: SteelCapacityEngineInput = {
    adapterId: "EU_STEEL",
    designContext,
    standardContext,
    material,
    section,
    stability: null,
    demand,
    limitState: "TENSION",
    requiredProperties: ["material.yieldStrength", "material.ultimateStrength", "section.area", "section.netArea"],
    eurocodeContext,
  };
  return { designCheckId: "chk-r3", designContext, capacityInput, demand };
}

function actions(): EuC9R2SectionActions {
  return {
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    majorMoment: { status: "PRESENT", signedNm: 50000 },
    minorMoment: { status: "ABSENT" },
  };
}

function entry(patch: Partial<D1fR3PlanEntry> = {}): D1fR3PlanEntry {
  const check = steelCheck();
  return {
    entryId: "e-steel",
    projectId: "proj-1",
    physicalMemberId: "phys-steel",
    designMemberId: "m-eu2",
    materialDomain: "STEEL",
    memberType: "MEMBER",
    capabilityId: "D1D_EU_TENSION",
    profileId: "EN 1993-1-1",
    jurisdiction: "eu-eea",
    generation: "GEN1",
    declaredScope: ["MEMBER_TENSION"],
    candidateBindingIds: ["b-steel"],
    selectedBindingId: "b-steel",
    role: "REQUIRED_CHECK",
    authority: "HUMAN_AUTHORED",
    selectionRule: null,
    componentCombinationIds: ["comb-r3"],
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
    steelCheck: { designCheckId: check.designCheckId, designContext: check.designContext, capacityInput: check.capacityInput },
    beamInput: null,
    columnInput: null,
    slabInput: null,
    wallInput: null,
    ...patch,
  };
}

function binding(patch: Partial<D1fR3GovernedBinding> = {}): D1fR3GovernedBinding {
  return {
    bindingId: "b-steel",
    projectId: "proj-1",
    structuralSystemId: "sys-1",
    physicalMemberId: "phys-steel",
    designMemberId: "m-eu2",
    authority: "VERIFIED_GOVERNED",
    completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
    topologyFingerprint: "topo-1",
    analysisModelFingerprint: "model-1",
    analysisRunFingerprint: "run-1",
    resultSetFingerprint: "set-1",
    bindingFingerprint: "bind-1",
    modelValidationEvidenceRef: "validation-1",
    runStatus: "COMPLETED",
    convergenceStatus: "CONVERGED",
    combinationId: "comb-r3",
    locationKind: "MEMBER_START",
    locationProvenanceRef: "station-origin",
    steelDemand: steelCheck().demand,
    concreteSectionActions: null,
    absentQuantities: [],
    ...patch,
  };
}

function plan(entries: D1fR3PlanEntry[], patch: Partial<D1fR3Plan> = {}): D1fR3Plan {
  return {
    evaluationPlanId: "plan-1",
    structuralSystemId: "sys-1",
    projectId: "proj-1",
    topologyFingerprint: "topo-1",
    profileId: "project-profile-1",
    jurisdiction: "eu-eea",
    generation: "GEN1",
    declaredScope: ["BOUNDED_MEMBER_EVALUATION"],
    authority: "HUMAN_AUTHORED",
    status: "GOVERNED",
    version: "1",
    provenanceRef: "plan-authored",
    entries,
    ...patch,
  };
}

function run(entries: D1fR3PlanEntry[], bindings: D1fR3GovernedBinding[], patch: Partial<D1fR3EvaluationInput> = {}) {
  return evaluateSystemMemberPlan({
    plan: plan(entries),
    bindings,
    currentTopologyFingerprint: "topo-1",
    currentProfileId: "project-profile-1",
    currentMethodFingerprint: "method-1",
    ...patch,
  });
}

function concreteEntry(kind: D1fR3PlanEntry["capabilityId"], id: string): D1fR3PlanEntry {
  const shared = {
    memberId: id,
    standardContext: { family: "EN1992", generation: "EN1992-1-1-GEN1", profileId: "EU-EN1992-1-1-GEN1" },
    actions: actions(),
    combinationId: "uls-1",
  };
  return entry({
    entryId: id,
    physicalMemberId: `phys-${id}`,
    designMemberId: id,
    materialDomain: "CONCRETE",
    memberType: kind === "D1E_C9_BEAM" ? "BEAM" : kind === "D1E_C9_COLUMN" ? "COLUMN" : kind === "D1E_C9_SOLID_SLAB" ? "SOLID_SLAB" : "WALL",
    capabilityId: kind,
    profileId: "EU-EN1992-1-1-GEN1",
    candidateBindingIds: [`b-${id}`],
    selectedBindingId: `b-${id}`,
    declaredScope: ["DECLARED_CONCRETE_SCOPE"],
    steelCheck: null,
    beamInput: kind === "D1E_C9_BEAM" ? { ...shared, memberType: "BEAM", declaredEvaluationScope: ["ULS_SECTION"] } : null,
    columnInput: kind === "D1E_C9_COLUMN" ? { ...shared, memberType: "COLUMN", geometryShape: "RECTANGULAR", declaredEvaluationScope: ["SECTION_UNIAXIAL"], actions: { axial: { status: "AXIAL_DIRECT", valueN: -500000 }, majorMoment: { status: "PRESENT", signedNm: 20000 }, minorMoment: { status: "ABSENT" } } } : null,
    slabInput: kind === "D1E_C9_SOLID_SLAB" ? { ...shared, memberType: "SOLID_SLAB", slabForm: "SOLID", declaredEvaluationScope: ["STRIP_FLEXURE"], strip: { stripId: "strip-1", orientation: "MAJOR", widthMm: 1000 } } : null,
    wallInput: kind === "D1E_C9_WALL_SECTION" ? { ...shared, memberType: "WALL", declaredEvaluationScope: ["SECTION_PURE_FLEXURE"], wallSection: { wallLengthMm: 3000, wallThicknessMm: 200, lengthMapsTo: "SECTION_WIDTH" } } : null,
  });
}

describe("EOS-D1F-R3 system member evaluation", () => {
  it("keeps system evaluation distinct from analysis, adequacy, and approval", () => {
    expect(D1F_R3_SYSTEM_EVALUATION_ORCHESTRATOR_COUNT).toBe(1);
    expect(D1F_R3_SYSTEM_EVALUATION_EQUALS_STRUCTURAL_ANALYSIS).toBe(false);
    expect(D1F_R3_MEMBER_PASS_EQUALS_GLOBAL_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1F_R3_GENERIC_MAX_ABS_GOVERNS).toBe(false);
    expect(D1F_R3_AUTOMATIC_GOVERNING_CASE_SELECTION).toBe(false);
    expect(D1F_R3_AUTOMATIC_ENVELOPE_IMPLEMENTED).toBe(false);
    expect(AI_EVALUATION_PLAN_AUTHORITY).toBe(false);
    expect(AI_D1F_R3_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(D1F_R3_ABSENT_ACTION_INVENTED_AS_ZERO).toBe(false);
    expect(D1F_R3_STEEL_CROSS_JURISDICTION_RULE_REUSE).toBe(false);
    expect(D1F_R3_CONNECTION_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1F_R3_FOUNDATION_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1F_R3_LOAD_PATH_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(D1F_R3_FULL_STRUCTURAL_SYSTEM_COVERAGE).toBe(false);
    expect(D1F_R3_WALL_RESULT_EQUALS_WALL_MEMBER_DESIGN).toBe(false);
    expect(D1F_R3_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1F_R3_ENGINEER_VALIDATED_SYSTEM_ORCHESTRATOR_COUNT).toBe(0);
    expect(D1F_R3_FORMAL_CONFORMANCE_VALIDATED).toBe(false);
    expect(D1F_R3_ORCHESTRATION_CAN_EXCEED_UNDERLYING_VALIDATION_MATURITY).toBe(false);
  });

  it("matches a direct EU tension check and aggregates a bounded satisfied scope", () => {
    const check = steelCheck();
    const direct = orchestrateEuTensionDesignCheck({
      designCheckId: check.designCheckId,
      designContext: check.designContext,
      capacityInput: check.capacityInput,
    });
    const result = run(
      [entry({ steelCheck: { designCheckId: check.designCheckId, designContext: check.designContext, capacityInput: check.capacityInput } })],
      [binding({ steelDemand: check.demand })],
    );
    const member = result.members[0];
    expect(member?.underlyingResult).toEqual(direct);
    expect(member?.state).toBe("MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE");
    expect(member?.underlyingValidationState).toBe(direct.designCheck.validationState);
    expect(result.overallState).toBe("SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE");
    expect(result.evaluationCompleteForDeclaredScope).toBe(true);
    expect(result.allChecksSatisfied).toBe(true);
    expect(result.engineeringApproved).toBe(false);
    expect(result.conformanceValidated).toBe(false);
    expect(result.assuranceSummary).toBe("PENDING_HUMAN_ENGINEERING_REVIEW");
    expect(result.fullStructuralCoverage).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/STRUCTURE SAFE|STRUCTURE ADEQUATE|BUILDING PASS/);
  });

  it("matches direct C9 beam, column, slab, and wall calls without promoting validation", () => {
    const beam = concreteEntry("D1E_C9_BEAM", "beam-1");
    const column = concreteEntry("D1E_C9_COLUMN", "column-1");
    const slab = concreteEntry("D1E_C9_SOLID_SLAB", "slab-1");
    const wall = concreteEntry("D1E_C9_WALL_SECTION", "wall-1");
    const payloadActions = (item: D1fR3PlanEntry) => item.beamInput?.actions ?? item.columnInput?.actions ?? item.slabInput?.actions ?? item.wallInput?.actions ?? actions();
    const concreteBinding = (item: D1fR3PlanEntry): D1fR3GovernedBinding => binding({
      bindingId: `b-${item.entryId}`,
      physicalMemberId: `phys-${item.entryId}`,
      designMemberId: item.designMemberId,
      steelDemand: null,
      concreteSectionActions: payloadActions(item),
      combinationId: "uls-1",
    });
    const result = run(
      [beam, column, slab, wall],
      [beam, column, slab, wall].map(concreteBinding),
    );
    expect(result.members.find((item) => item.entryId === "beam-1")?.underlyingResult).toEqual(orchestrateEuC9R2Beam({ ...beam.beamInput!, memberId: "beam-1" }));
    expect(result.members.find((item) => item.entryId === "column-1")?.underlyingResult).toEqual(orchestrateEuC9R3Column({ ...column.columnInput!, memberId: "column-1" }));
    expect(result.members.find((item) => item.entryId === "slab-1")?.underlyingResult).toEqual(orchestrateEuC9R4SolidSlab({ ...slab.slabInput!, memberId: "slab-1" }));
    expect(result.members.find((item) => item.entryId === "wall-1")?.underlyingResult).toEqual(orchestrateEuC9R5WallSection({ ...wall.wallInput!, memberId: "wall-1" }));
    const columnResult = result.members.find((item) => item.entryId === "column-1")?.underlyingResult as { executedCapabilityIds: string[]; c6Intermediate: unknown };
    expect(columnResult.executedCapabilityIds.join(" ")).not.toMatch(/C4/);
    expect(columnResult.c6Intermediate).toBeNull();
    expect(EU_C9_R3_C6_OUTPUT_USED_FOR_C4).toBe(false);
    expect(EU_C9_R3_C6_C4_HANDOFF_STATE).toBe("BLOCKED_MISSING_AUTHORITY");
    expect(EU_C9_R3_SECOND_ORDER_METHOD).toBe("C6_THEN_C3");
    expect(EU_C9_R3_C6_C3_SIGN_CONVERSION_COUNT).toBe(1);
    const slabResult = result.members.find((item) => item.entryId === "slab-1")?.underlyingResult as { fullStandardCoverage: boolean };
    const wallResult = result.members.find((item) => item.entryId === "wall-1")?.underlyingResult as { fullStandardCoverage: boolean; engineerValidationState: string; conformanceState: string };
    expect(slabResult.fullStandardCoverage).toBe(false);
    expect(wallResult.fullStandardCoverage).toBe(false);
    expect(wallResult.engineerValidationState).not.toBe("ENGINEER_VALIDATED");
    expect(wallResult.conformanceState).not.toBe("CONFORMANCE_VALIDATED");
    expect(result.members.every((item) => item.underlyingValidationState !== "ENGINEER_VALIDATED")).toBe(true);
  });

  it("supports a mixed steel and concrete plan and preserves both results", () => {
    const beam = concreteEntry("D1E_C9_BEAM", "beam-1");
    const result = run(
      [entry(), beam],
      [binding(), binding({ bindingId: "b-beam-1", designMemberId: "beam-1", physicalMemberId: "phys-beam-1", steelDemand: null, concreteSectionActions: actions() })],
    );
    expect(result.members).toHaveLength(2);
    expect(result.members.map((item) => item.materialDomain).sort()).toEqual(["CONCRETE", "STEEL"]);
    expect(result.members.find((item) => item.materialDomain === "STEEL")?.underlyingResult).toBeTruthy();
    expect(result.members.find((item) => item.materialDomain === "CONCRETE")?.underlyingResult).toBeTruthy();
  });

  it("fails closed for ungoverned plans, bindings, selection, and scope gaps", () => {
    const cases: Array<{ name: string; result: ReturnType<typeof run>; state: string }> = [
      { name: "missing plan authority", result: run([entry()], [binding()], { plan: plan([entry()], { authority: "UNCONFIRMED_CANDIDATE" }) }), state: "SYSTEM_INVALID" },
      { name: "draft plan", result: run([entry()], [binding()], { plan: plan([entry()], { status: "DRAFT" }) }), state: "SYSTEM_INCOMPLETE" },
      { name: "stale plan", result: run([entry()], [binding()], { plan: plan([entry()], { status: "STALE" }) }), state: "SYSTEM_STALE" },
      { name: "wrong system", result: run([entry()], [binding({ structuralSystemId: "other" })]), state: "SYSTEM_INVALID" },
      { name: "topology mismatch", result: run([entry()], [binding()], { currentTopologyFingerprint: "other" }), state: "SYSTEM_STALE" },
      { name: "stale binding", result: run([entry()], [binding({ completenessState: "STALE", authority: "STALE" })]), state: "SYSTEM_STALE" },
      { name: "unverified import", result: run([entry()], [binding({ authority: "IMPORTED_PENDING_VERIFICATION", completenessState: "BINDING_INCOMPLETE" })]), state: "SYSTEM_INCOMPLETE" },
      { name: "failed analysis", result: run([entry()], [binding({ runStatus: "FAILED" })]), state: "SYSTEM_INCOMPLETE" },
      { name: "nonconverged", result: run([entry()], [binding({ convergenceStatus: "NONCONVERGED" })]), state: "SYSTEM_INCOMPLETE" },
      { name: "missing validation", result: run([entry()], [binding({ modelValidationEvidenceRef: null })]), state: "SYSTEM_INCOMPLETE" },
      { name: "missing binding", result: run([entry({ selectedBindingId: null, candidateBindingIds: [] })], []), state: "SYSTEM_INCOMPLETE" },
      { name: "absent action", result: run([entry()], [binding({ absentQuantities: ["N"] })]), state: "SYSTEM_INCOMPLETE" },
      { name: "multiple bindings", result: run([entry({ candidateBindingIds: ["b-steel", "b-2"], selectedBindingId: null })], [binding()]), state: "SYSTEM_UNDETERMINED" },
      { name: "max abs", result: run([entry({ selectionRule: "MAX_ABS" })], [binding()]), state: "SYSTEM_UNDETERMINED" },
      { name: "synthetic tuple", result: run([entry({ componentCombinationIds: ["A", "B"] })], [binding()]), state: "SYSTEM_UNDETERMINED" },
      { name: "profile mismatch", result: run([entry({ profileId: "AS 4100" })], [binding()]), state: "SYSTEM_INVALID" },
      { name: "jurisdiction mismatch", result: run([entry({ jurisdiction: "australia" })], [binding()]), state: "SYSTEM_INVALID" },
      { name: "unsupported", result: run([entry({ capabilityId: null, steelCheck: null })], [binding()]), state: "SYSTEM_INCOMPLETE" },
      { name: "empty set", result: run([], []), state: "SYSTEM_UNDETERMINED" },
      { name: "informational only", result: run([entry({ role: "INFORMATIONAL_CHECK" })], [binding()]), state: "SYSTEM_UNDETERMINED" },
      { name: "connection required", result: run([entry({ connectionRequired: true })], [binding()]), state: "SYSTEM_INCOMPLETE" },
      { name: "foundation required", result: run([entry({ foundationRequired: true })], [binding()]), state: "SYSTEM_INCOMPLETE" },
      { name: "cross project", result: run([entry()], [binding({ projectId: "other" })]), state: "SYSTEM_INVALID" },
      { name: "critical location", result: run([entry()], [binding({ locationKind: "CRITICAL_LOCATION", locationProvenanceRef: null })]), state: "SYSTEM_INCOMPLETE" },
      { name: "untraceable envelope", result: run([entry({ envelope: { sourceResultIds: [], selectionRule: "MAX_ABS", quantity: "N", locationRef: "x", governingCaseId: "A", authority: "", fingerprint: "" } })], [binding()]), state: "SYSTEM_INCOMPLETE" },
    ];
    for (const item of cases) expect(item.result.overallState, item.name).toBe(item.state);
    expect(run([entry({ connectionRequired: true })], [binding()]).members[0]?.state).toBe("MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE");
    expect(run([entry({ connectionRequired: true })], [binding()]).unavailableCapabilities).toContain("CONNECTION_UNAVAILABLE");
  });

  it("preserves failure together with incompleteness and does not let informational scope pass", () => {
    const failing = steelCheck(5_000_000);
    failing.capacityInput.demand.memberId = "m-fail";
    failing.capacityInput.designContext = { ...failing.designContext, memberRef: "m-fail" };
    failing.designContext = failing.capacityInput.designContext;
    const failed = entry({
      entryId: "failed",
      designMemberId: "m-fail",
      selectedBindingId: "b-fail",
      candidateBindingIds: ["b-fail"],
      steelCheck: { designCheckId: "chk-fail", designContext: failing.designContext, capacityInput: failing.capacityInput },
    });
    const open = entry({ entryId: "open", capabilityId: null, steelCheck: null, selectedBindingId: "b-open", candidateBindingIds: ["b-open"] });
    const result = run(
      [failed, open],
      [binding({ bindingId: "b-fail", steelDemand: failed.steelCheck!.capacityInput.demand }), binding({ bindingId: "b-open" })],
    );
    expect(result.overallState).toBe("SYSTEM_NOT_SATISFIED");
    expect(result.failedMemberCount).toBe(1);
    expect(result.incompleteMemberCount).toBe(1);
    expect(result.evaluationCompleteForDeclaredScope).toBe(false);
    expect(result.allChecksSatisfied).toBe(false);
    expect(result.blockingFindings.length).toBeGreaterThan(1);
  });

  it("keeps fingerprints order-independent and invalidates history without overwrite", () => {
    const first = entry({ entryId: "a" });
    const second = entry({ entryId: "b", selectedBindingId: "b2", candidateBindingIds: ["b2"] });
    const left = run([first, second], [binding(), binding({ bindingId: "b2", bindingFingerprint: "bind-2" })]);
    const right = run([second, first], [binding({ bindingId: "b2", bindingFingerprint: "bind-2" }), binding()]);
    expect(left.fingerprint).toBe(right.fingerprint);
    const changedPlan = run([first], [binding()], { plan: plan([first], { version: "2" }) });
    expect(changedPlan.fingerprint).not.toBe(run([first], [binding()]).fingerprint);
    const changedBinding = run([first], [binding({ bindingFingerprint: "bind-9" })]);
    expect(changedBinding.fingerprint).not.toBe(run([first], [binding()]).fingerprint);
    const changedMethod = run([first], [binding()], { currentMethodFingerprint: "method-2" });
    expect(changedMethod.fingerprint).not.toBe(run([first], [binding()]).fingerprint);
    const successor = recordSuccessorSystemEvaluation(left, changedPlan);
    expect(left.overallState).toBe("SYSTEM_SATISFIED_FOR_EXECUTED_DECLARED_BOUNDED_SCOPE");
    expect(successor.prior.overallState).toBe("SYSTEM_STALE");
    expect(successor.history[0]).toBe(left);
    expect(successor.history).toHaveLength(2);
    expect(successor.current.events.every((event) => event.approval === false)).toBe(true);
  });

  it("scans the R3 runtime for analysis and resistance implementations", () => {
    const files = [
      "packages/engineering-os/src/structural-systems/system-evaluation.ts",
      "packages/types/src/structural-systems-r3.ts",
      "docs/architecture/engineering-os/EOS_D1F_R3_SYSTEM_TO_MEMBER_EVALUATION_ORCHESTRATION.md",
    ];
    const hits = files.flatMap((file) => scanAnalysisFormulaBypass(file, readFileSync(join(ROOT, file), "utf8")));
    expect(hits).toEqual([]);
    const source = readFileSync(join(ROOT, files[0]!), "utf8");
    expect(source.includes("Math.max")).toBe(false);
    expect(source.includes("Math.abs")).toBe(false);
  });
});
