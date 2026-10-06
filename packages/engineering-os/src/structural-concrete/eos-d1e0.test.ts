import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CONCRETE_ASSISTANCE_ADVISORY_ONLY,
  AI_CONCRETE_CODE_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AU_CONCRETE_ADAPTER_READY,
  AU_CONCRETE_STANDARD_EDITION,
  AU_CONCRETE_STANDARD_FAMILY_READY,
  AU_ONLY_CONCRETE_CORE,
  AU_STEEL_PACK_CERTIFIED,
  AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL,
  CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED,
  COMMON_REINFORCEMENT_GEOMETRY_MECHANICS,
  COMPOSITE_CONCRETE_DESIGN_IMPLEMENTED,
  CONCRETE_APPROVAL_STATE_SEPARATE,
  CONCRETE_AXIAL_FLEXURE_FRAMEWORK,
  CONCRETE_CAPACITY_EQUALS_DETAILING_COMPLIANCE,
  CONCRETE_CARBON_HANDOFF_READY,
  CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  CONCRETE_CONSTRUCTION_STAGE_CONTEXT,
  CONCRETE_CONSTRUCTION_TYPE_CONTEXT,
  CONCRETE_CONTEXT_PII_REQUIRED,
  CONCRETE_COVER_MODEL,
  CONCRETE_CRACK_CONTROL_FRAMEWORK,
  CONCRETE_DEMAND_PROVENANCE,
  CONCRETE_DESIGN_COMPLETENESS_MODEL,
  CONCRETE_DESIGN_LIFE_CONTEXT,
  CONCRETE_DESIGN_ORCHESTRATION_FRAMEWORK,
  CONCRETE_DESIGN_STANDARD_AND_MATERIAL_STANDARD_SEPARATE,
  CONCRETE_DETAILING_FRAMEWORK,
  CONCRETE_DEVELOPMENT_ANCHORAGE_FRAMEWORK,
  CONCRETE_DOMAIN_MODEL,
  CONCRETE_DURABILITY_CONTEXT,
  CONCRETE_ELEMENT_DIMENSIONALITY_MODEL,
  CONCRETE_ELEMENT_TYPES,
  CONCRETE_ELEMENT_TYPE_MODEL,
  CONCRETE_ENGINEERING_RULE_AUTHORITY_REUSED,
  CONCRETE_FAIL_CLOSED_MODEL,
  CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  CONCRETE_FLEXURE_FRAMEWORK,
  CONCRETE_GLOBAL_GOVERNANCE_REUSED,
  CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  CONCRETE_HUMAN_REVIEW_MODEL,
  CONCRETE_IMPLEMENTATION_MATURITY,
  CONCRETE_INTERACTION_SURFACE_INTERFACE,
  CONCRETE_INVERSE_DESIGN_COMPATIBILITY,
  CONCRETE_LAP_SPLICE_FRAMEWORK,
  CONCRETE_LIMIT_STATES,
  CONCRETE_LIMIT_STATE_TAXONOMY,
  CONCRETE_MATERIAL_MODEL,
  CONCRETE_MATERIAL_PROPERTIES_GOVERNED,
  CONCRETE_MATERIAL_RESPONSE_INTERFACE,
  CONCRETE_MEMBER_DESIGN_IMPLIES_GEOTECHNICAL_VALIDATION,
  CONCRETE_MTO_HANDOFF_READY,
  CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  CONCRETE_OPTIMIZATION_HANDOFF_READY,
  CONCRETE_PRODUCT_CAPABILITY_GATING,
  CONCRETE_PUNCHING_SHEAR_FRAMEWORK,
  CONCRETE_REINFORCEMENT_CONSTRUCTABILITY_CONTEXT,
  CONCRETE_RESULT_PROVENANCE_MODEL,
  CONCRETE_RESULT_VERSIONING_MODEL,
  CONCRETE_SECOND_ORDER_STABILITY_FRAMEWORK,
  CONCRETE_SECTION_COMPATIBILITY_INTERFACE,
  CONCRETE_SECTION_EQUILIBRIUM_CONTRACT,
  CONCRETE_SECTION_GEOMETRY_MODEL,
  CONCRETE_SECTION_INTEGRATION_EXTENSIBILITY,
  CONCRETE_SECTION_VOID_MODEL,
  CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  CONCRETE_SERVICEABILITY_FRAMEWORK,
  CONCRETE_SHEAR_FRAMEWORK,
  CONCRETE_STANDARD_CONFORMANCE_STATE,
  CONCRETE_STANDARD_PROFILE_AND_CONFORMANCE_SEPARATE,
  CONCRETE_STRENGTH_RESULT_CLASSES,
  CONCRETE_STRENGTH_RESULT_SEMANTICS,
  CONCRETE_TIME_DEPENDENT_BEHAVIOR_FRAMEWORK,
  CONCRETE_TORSION_FRAMEWORK,
  CONCRETE_TRANSVERSE_REINFORCEMENT_MODEL,
  CONCRETE_VALIDATION_DIMENSIONS_REUSED,
  CONSTRUCTION_STAGE_ANALYSIS_IMPLEMENTED,
  COPYRIGHTED_CONCRETE_STANDARD_TEXT_COMMITTED,
  D1C_ACTION_MODEL_REUSED,
  D1C_DEFLECTION_REUSED_WHERE_VALID,
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  D1D_CANONICAL_NEXT_PHASE,
  D1D_CAPABILITY_MANIFEST_REUSED,
  D1D_FROZEN_ARCHITECTURE_PRESERVED,
  D1E0_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  D1E_CANONICAL_SCOPE,
  D1E_CANONICAL_SCOPE_CONFIRMED,
  D1E_INTERNAL_ROADMAP_DEFINED,
  DEFAULT_CREEP_MODEL,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  DEFAULT_LAP_LENGTH,
  DEFAULT_MINIMUM_CONCRETE_COVER,
  DEFAULT_SHRINKAGE_MODEL,
  DEFAULT_CONCRETE_CARBON_FACTOR,
  ELASTIC_DEFLECTION_EQUALS_LONG_TERM_RC_DEFLECTION,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EOS_D1E0_CLOSED,
  EOS_D1E0_PHASE,
  EU_CONCRETE_ADAPTER_READY,
  EU_CONCRETE_STANDARD_EDITION,
  EU_CONCRETE_STANDARD_FAMILY_READY,
  EU_HIGH_WATER_MARK_INHERITED,
  EU_ONLY_CONCRETE_CORE,
  EU_STEEL_PACK_CERTIFIED,
  FORBIDDEN_ENGINEERING_RULE_AUTHORITIES,
  GENERAL_CONCRETE_FEA_CLAIMED,
  GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY,
  GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED,
  GLOBAL_CONCRETE_ARCHITECTURE,
  GLOBAL_CONCRETE_SAFETY_FACTOR_MODEL_NEUTRAL,
  GLOBAL_CORE_CONTAINS_JURISDICTION_EXPOSURE_CLASS,
  LLM_CONCRETE_NUMERICAL_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED,
  NUMERICAL_CONCRETE_CODE_FLEXURE_IMPLEMENTED,
  NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED,
  NUMERICAL_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_AU_CONCRETE_CORE_CREATED,
  PARALLEL_CONCRETE_DEMAND_ENGINE_CREATED,
  PARALLEL_CONCRETE_RULE_AUTHORITY_CREATED,
  PARALLEL_CONCRETE_SECURITY_MODEL_CREATED,
  PARALLEL_CONCRETE_VALIDATION_MODEL_CREATED,
  PARALLEL_EU_CONCRETE_CORE_CREATED,
  PARALLEL_US_CONCRETE_CORE_CREATED,
  PRECAST_LIFTING_DESIGN_IMPLEMENTED,
  PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  PRESTRESSED_CONCRETE_EXTENSION_READY,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  REINFORCEMENT_LAYOUT_MODEL,
  REINFORCEMENT_MATERIAL_MODEL,
  REINFORCEMENT_PROPERTIES_GOVERNED,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E0,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  STALE_CONCRETE_RESULT_REUSE_ALLOWED,
  STEEL_STABILITY_RULE_REUSED_FOR_CONCRETE,
  UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA,
  UNIVERSAL_CONCRETE_INTERACTION_EQUATION,
  US_CONCRETE_ADAPTER_READY,
  US_CONCRETE_STANDARD_EDITION,
  US_CONCRETE_STANDARD_FAMILY_READY,
  US_ONLY_CONCRETE_CORE,
  US_STEEL_PACK_CERTIFIED,
  type ConcreteCapacityEngineInput,
  type ConcreteCover,
  type ConcreteDesignContext,
  type ConcreteMaterial,
  type ConcreteSection,
  type ReinforcementBar,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isEuOnlyArchitecture, isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  D1D_CAPABILITY_MANIFEST,
  STEEL_ADAPTER_BOUNDARIES,
} from "../structural-steel";
import {
  aggregateReinforcementGeometry,
  assertAiCannotApproveConcrete,
  assertAiCannotClaimConcreteConformance,
  assertAiCannotInventConcreteStrength,
  assertAiCannotInventCover,
  assertAiCannotInventCrackLimit,
  assertAiCannotInventStressBlock,
  assertBarAreaNotInferredFromDesignation,
  assertCandidateFullConcreteRecheck,
  assertConcreteEngineeringRuleAuthority,
  assertConcreteProductCapabilityGating,
  assertD1e0RiskLedger,
  assertGradeDoesNotSynthesizeProperties,
  assertNoCodeReinforcementRatio,
  assertStaleConcreteResultsNotReused,
  completenessForUnsupported,
  CONCRETE_ADAPTER_BOUNDARIES,
  CONCRETE_CAPABILITY_MANIFEST,
  concreteProductCapabilityVisible,
  consumeConcreteDemandHandoff,
  D1E0_D0_RISK_DISPOSITION,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
  evaluateConcreteCapacity,
  failClosedCheckState,
  concreteInvalidationTags,
  selectConcreteAdapter,
  STRUCTURAL_CAPABILITY_MANIFEST,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

const auContext = createConfiguredKnowledgeContext({
  contextId: "ctx-as3600",
  jurisdictionProfileRef: "australia",
  standardFamily: "AS",
  standardCode: "AS 3600",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function provenance() {
  return governedProvenance({ jurisdiction: "australia", standard: "AS 3600", version: "d1e0" });
}

function governed(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "cert-1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function material(strength = true): ConcreteMaterial {
  return {
    materialRef: "conc-1",
    designation: "N32",
    compressiveStrength: strength ? governed("fc", 32, "MPa") : null,
    tensileStrength: null,
    elasticModulus: governed("Ec", 30100, "MPa"),
    density: governed("rho", 2400, "kg/m3"),
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "AS 1379",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: "mill-1",
    environmentalMetadata: null,
    version: "1",
    provenance: provenance(),
  };
}

function reoMaterial(): ReinforcementMaterial {
  return {
    materialRef: "reo-1",
    designation: "D500N",
    yieldStrength: governed("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: governed("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "AS/NZS 4671",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "1",
    provenance: provenance(),
  };
}

function bar(id: string, x: number, y: number, area = 314): ReinforcementBar {
  return {
    barId: id,
    designation: "N20",
    diameterMm: governed("d", 20, "mm"),
    areaMm2: governed("As", area, "mm2"),
    count: 1,
    xMm: x,
    yMm: y,
    layerId: "layer-1",
    face: "bottom",
    direction: "longitudinal",
    spacingMm: 150,
    groupId: "group-1",
    materialRef: "reo-1",
    anchorageMetadata: null,
    lapMetadata: null,
    provenanceRef: "layout-1",
  };
}

function layout(): ReinforcementLayout {
  return {
    layoutId: "lay-1",
    bars: [bar("b1", 50, 50), bar("b2", 250, 50)],
    groups: [{ groupId: "group-1", barIds: ["b1", "b2"], face: "bottom", materialRef: "reo-1", provenanceRef: "layout-1" }],
    layers: [{ layerId: "layer-1", groupIds: ["group-1"], face: "bottom", provenanceRef: "layout-1" }],
    transverse: [{
      linkId: "st-1",
      linkType: "closed-stirrup",
      legs: 2,
      diameterMm: governed("d", 10, "mm"),
      areaMm2: governed("Asv", 78.5, "mm2"),
      spacingMm: 150,
      orientation: "transverse",
      zone: "span",
      materialRef: "reo-1",
      provenanceRef: "layout-1",
    }],
    provenanceRef: "layout-1",
  };
}

function section(): ConcreteSection {
  return {
    sectionId: "sec-1",
    shape: "RECTANGULAR",
    explicitGeometryRef: "geom-1",
    widthMm: 300,
    depthMm: 500,
    diameterMm: null,
    voids: [{ voidId: "void-1", kind: "DUCT", geometryRef: "duct-1", numericalDesignSupported: false }],
    provenanceRef: "sec-1",
  };
}

function covers(): ConcreteCover[] {
  return [{
    coverId: "c1",
    nominalCoverMm: 40,
    modelledCoverMm: 40,
    face: "bottom",
    reinforcementGroupRef: "group-1",
    source: "modelled",
    governingContextRef: "dur-1",
    provenanceRef: "cover-1",
  }];
}

function demand(): StructuralDemandResult {
  return {
    resultId: "demand-1",
    memberId: "m1",
    boundaryCondition: "SIMPLE_SIMPLE",
    spanM: 8,
    combinationId: "comb-1",
    loadCaseIds: ["g"],
    methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 80000, unit: "N", locationM: 0, signed: 80000 },
    moment: { value: 160000, unit: "N.m", locationM: 4, signed: 160000 },
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    deflection: { status: "NOT_IMPLEMENTED", reason: "elastic D1C not long-term RC" },
    torsion: { status: "NOT_IMPLEMENTED" },
    stiffness: null,
    equilibriumResidual: { forceN: 0, momentNm: 0 },
    outputClass: "DETERMINISTIC_DEMAND",
    capacityPresent: false,
    designPassFailPresent: false,
    humanReviewRequired: true,
    approvalState: "not_approved",
    llmOriginated: false,
    standardContext: auContext,
    toolRef: "d1c",
    toolVersion: "d1c",
    provenanceRef: provenance(),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function designContext(): ConcreteDesignContext {
  return {
    designContextId: "dc-1",
    elementRef: "el-1",
    memberRef: "m1",
    sectionRef: "sec-1",
    concreteMaterialRef: "conc-1",
    reinforcementMaterialRef: "reo-1",
    reinforcementLayoutRef: "lay-1",
    demandRefs: ["demand-1"],
    standardContextRef: auContext.contextId,
    designStandardRef: "AS 3600",
    materialStandardRef: "AS 1379",
    reinforcementProductStandardRef: "AS/NZS 4671",
    durabilityContextRef: "dur-1",
    constructionStageRef: null,
    evidenceRefs: [],
    toolRef: "d1e0",
    methodRef: "FRAMEWORK_ONLY",
    provenanceRef: provenance(),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
    approvalState: "not_approved",
  };
}

function engineInput(patch: Partial<ConcreteCapacityEngineInput> = {}): ConcreteCapacityEngineInput {
  return {
    adapterId: "AU_CONCRETE",
    designContext: designContext(),
    standardContext: auContext,
    demand: demand(),
    material: material(),
    reinforcement: reoMaterial(),
    layout: layout(),
    section: section(),
    covers: covers(),
    limitState: "FLEXURE",
    requiredProperties: ["concrete.compressiveStrength", "reinforcement.yieldStrength"],
    ...patch,
  };
}

function readTree(dir: string): string {
  return readdirSync(dir, { withFileTypes: true }).map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") return readTree(path);
    if (entry.name.endsWith(".test.ts")) return "";
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".md")) return readFileSync(path, "utf8");
    return "";
  }).join("\n");
}

describe("EOS-D1E-0 global concrete design foundation", () => {
  it("confirms canonical D1E scope and preserves the D1D architecture freeze", () => {
    expect(EOS_D1E0_PHASE).toBe("EOS-D1E-0");
    expect(D1E_CANONICAL_SCOPE_CONFIRMED).toBe(true);
    expect(D1E_CANONICAL_SCOPE).toBe("Concrete Design Capability");
    expect(D1D_CANONICAL_NEXT_PHASE).toBe("D1E");
    expect(D1D_FROZEN_ARCHITECTURE_PRESERVED).toBe(true);
    expect(D1D_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(GLOBAL_CONCRETE_ARCHITECTURE).toBe(true);
    expect(PARALLEL_AU_CONCRETE_CORE_CREATED).toBe(false);
    expect(PARALLEL_EU_CONCRETE_CORE_CREATED).toBe(false);
    expect(PARALLEL_US_CONCRETE_CORE_CREATED).toBe(false);
    expect(AU_ONLY_CONCRETE_CORE).toBe(false);
    expect(EU_ONLY_CONCRETE_CORE).toBe(false);
    expect(US_ONLY_CONCRETE_CORE).toBe(false);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(D1E0_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });

  it("models governed materials, reinforcement geometry, cover, and D1C demand without code rules", () => {
    expect(CONCRETE_DOMAIN_MODEL).toBe(true);
    expect(CONCRETE_ELEMENT_TYPE_MODEL).toBe(true);
    expect(CONCRETE_ELEMENT_TYPES).toEqual(expect.arrayContaining(["BEAM", "COLUMN", "SLAB", "WALL", "PEDESTAL", "PILE", "FOOTING", "MAT_RAFT", "OTHER_CONCRETE_ELEMENT"]));
    expect(CONCRETE_ELEMENT_DIMENSIONALITY_MODEL).toBe(true);
    expect(GENERAL_CONCRETE_FEA_CLAIMED).toBe(false);
    expect(CONCRETE_MATERIAL_MODEL).toBe(true);
    expect(CONCRETE_MATERIAL_PROPERTIES_GOVERNED).toBe(true);
    expect(CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES).toBe(false);
    expect(() => assertGradeDoesNotSynthesizeProperties(material(false))).toThrow(/missing material/);
    expect(REINFORCEMENT_MATERIAL_MODEL).toBe(true);
    expect(REINFORCEMENT_PROPERTIES_GOVERNED).toBe(true);
    expect(REINFORCEMENT_LAYOUT_MODEL).toBe(true);
    expect(UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA).toBe(false);
    expect(() => assertBarAreaNotInferredFromDesignation("N20", null)).toThrow(/missing reinforcement geometry/);
    expect(COMMON_REINFORCEMENT_GEOMETRY_MECHANICS).toBe(true);
    const aggregated = aggregateReinforcementGeometry(layout());
    expect(aggregated.totalAreaMm2).toBe(628);
    expect(aggregated.groupAreasMm2["group-1"]).toBe(628);
    expect(aggregated.layerAreasMm2["layer-1"]).toBe(628);
    expect(aggregated.centroid).toEqual({ xMm: 150, yMm: 50 });
    expect(CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED).toBe(false);
    expect(() => assertNoCodeReinforcementRatio(0.01)).toThrow(/ratio/);
    expect(CONCRETE_SECTION_GEOMETRY_MODEL).toBe(true);
    expect(CONCRETE_SECTION_VOID_MODEL).toBe(true);
    expect(section().voids[0]?.numericalDesignSupported).toBe(false);
    expect(CONCRETE_COVER_MODEL).toBe(true);
    expect(DEFAULT_MINIMUM_CONCRETE_COVER).toBe(false);
    expect(CONCRETE_DURABILITY_CONTEXT).toBe(true);
    expect(GLOBAL_CORE_CONTAINS_JURISDICTION_EXPOSURE_CLASS).toBe(false);
    expect(CONCRETE_DESIGN_LIFE_CONTEXT).toBe(true);
    expect(D1C_ACTION_MODEL_REUSED).toBe(true);
    expect(PARALLEL_CONCRETE_DEMAND_ENGINE_CREATED).toBe(false);
    expect(consumeConcreteDemandHandoff(demand())).toBe("demand-1");
    expect(CONCRETE_DEMAND_PROVENANCE).toBe(true);
  });

  it("defines jurisdiction-neutral frameworks without numerical code methods", () => {
    expect(CONCRETE_LIMIT_STATE_TAXONOMY).toBe(true);
    expect(CONCRETE_LIMIT_STATES).toHaveLength(18);
    expect(CONCRETE_STRENGTH_RESULT_SEMANTICS).toBe(true);
    expect(CONCRETE_STRENGTH_RESULT_CLASSES).toEqual(["MECHANICS_REFERENCE", "NOMINAL_CAPACITY", "CODE_DESIGN_CAPACITY", "CODE_ALLOWABLE_CAPACITY", "SERVICEABILITY_RESULT"]);
    expect(GLOBAL_CONCRETE_SAFETY_FACTOR_MODEL_NEUTRAL).toBe(true);
    expect(CONCRETE_MATERIAL_RESPONSE_INTERFACE).toBe(true);
    expect(GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED).toBe(false);
    expect(CONCRETE_SECTION_COMPATIBILITY_INTERFACE).toBe(true);
    expect(CONCRETE_SECTION_EQUILIBRIUM_CONTRACT).toBe(true);
    expect(CONCRETE_SECTION_INTEGRATION_EXTENSIBILITY).toBe(true);
    expect(CONCRETE_FLEXURE_FRAMEWORK).toBe(true);
    expect(NUMERICAL_CONCRETE_CODE_FLEXURE_IMPLEMENTED).toBe(false);
    expect(CONCRETE_AXIAL_FLEXURE_FRAMEWORK).toBe(true);
    expect(UNIVERSAL_CONCRETE_INTERACTION_EQUATION).toBe(false);
    expect(CONCRETE_INTERACTION_SURFACE_INTERFACE).toBe(true);
    expect(CONCRETE_SHEAR_FRAMEWORK).toBe(true);
    expect(NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED).toBe(false);
    expect(CONCRETE_TRANSVERSE_REINFORCEMENT_MODEL).toBe(true);
    expect(layout().transverse).toHaveLength(1);
    expect(CONCRETE_PUNCHING_SHEAR_FRAMEWORK).toBe(true);
    expect(NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED).toBe(false);
    expect(CONCRETE_TORSION_FRAMEWORK).toBe(true);
    expect(NUMERICAL_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect(CONCRETE_SERVICEABILITY_FRAMEWORK).toBe(true);
    expect(D1C_DEFLECTION_REUSED_WHERE_VALID).toBe(true);
    expect(ELASTIC_DEFLECTION_EQUALS_LONG_TERM_RC_DEFLECTION).toBe(false);
    expect(CONCRETE_CRACK_CONTROL_FRAMEWORK).toBe(true);
    expect(NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED).toBe(false);
    expect(CONCRETE_TIME_DEPENDENT_BEHAVIOR_FRAMEWORK).toBe(true);
    expect(DEFAULT_CREEP_MODEL).toBe(false);
    expect(DEFAULT_SHRINKAGE_MODEL).toBe(false);
    expect(CONCRETE_SECOND_ORDER_STABILITY_FRAMEWORK).toBe(true);
    expect(STEEL_STABILITY_RULE_REUSED_FOR_CONCRETE).toBe(false);
    expect(CONCRETE_DEVELOPMENT_ANCHORAGE_FRAMEWORK).toBe(true);
    expect(NUMERICAL_DEVELOPMENT_LENGTH_IMPLEMENTED).toBe(false);
    expect(CONCRETE_LAP_SPLICE_FRAMEWORK).toBe(true);
    expect(DEFAULT_LAP_LENGTH).toBe(false);
    expect(CONCRETE_DETAILING_FRAMEWORK).toBe(true);
    expect(CONCRETE_CAPACITY_EQUALS_DETAILING_COMPLIANCE).toBe(false);
    expect(CONCRETE_REINFORCEMENT_CONSTRUCTABILITY_CONTEXT).toBe(true);
    expect(CONCRETE_MTO_HANDOFF_READY).toBe(true);
    expect(CONCRETE_CARBON_HANDOFF_READY).toBe(true);
    expect(DEFAULT_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(PRESTRESSED_CONCRETE_EXTENSION_READY).toBe(true);
    expect(PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(COMPOSITE_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(CONCRETE_CONSTRUCTION_TYPE_CONTEXT).toBe(true);
    expect(PRECAST_LIFTING_DESIGN_IMPLEMENTED).toBe(false);
    expect(CONCRETE_CONSTRUCTION_STAGE_CONTEXT).toBe(true);
    expect(CONSTRUCTION_STAGE_ANALYSIS_IMPLEMENTED).toBe(false);
  });

  it("keeps AU/EU/US adapters ready, fail-closed, and without inferred editions or code authority", () => {
    expect(AU_CONCRETE_ADAPTER_READY).toBe(true);
    expect(AU_CONCRETE_STANDARD_FAMILY_READY).toBe(true);
    expect(AU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(EU_CONCRETE_ADAPTER_READY).toBe(true);
    expect(EU_CONCRETE_STANDARD_FAMILY_READY).toBe(true);
    expect(EU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(US_CONCRETE_ADAPTER_READY).toBe(true);
    expect(US_CONCRETE_STANDARD_FAMILY_READY).toBe(true);
    expect(US_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE).toMatchObject({ ready: true, implemented: false, standards: ["AS 3600"] });
    expect(CONCRETE_ADAPTER_BOUNDARIES.EU_CONCRETE.defaultNationalAnnex).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.US_CONCRETE.implemented).toBe(false);
    selectConcreteAdapter("AU_CONCRETE", auContext);
    expect(evaluateConcreteCapacity(engineInput()).capacity).toBeNull();
    expect(evaluateConcreteCapacity(engineInput()).implemented).toBe(false);
    const euContext = createConfiguredKnowledgeContext({
      contextId: "ctx-en1992",
      jurisdictionProfileRef: "eu-eea",
      standardFamily: "EN",
      standardCode: "EN 1992",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "concrete",
    });
    expect(() => selectConcreteAdapter("EU_CONCRETE", euContext)).toThrow(/National Annex/);
    const usContext = createConfiguredKnowledgeContext({
      contextId: "ctx-aci318",
      jurisdictionProfileRef: "united-states",
      standardFamily: "ACI",
      standardCode: "ACI 318",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      materialScope: "concrete",
    });
    selectConcreteAdapter("US_CONCRETE", usContext);
    expect(CONCRETE_DESIGN_STANDARD_AND_MATERIAL_STANDARD_SEPARATE).toBe(true);
    expect(CONCRETE_ENGINEERING_RULE_AUTHORITY_REUSED).toBe(true);
    expect(PARALLEL_CONCRETE_RULE_AUTHORITY_CREATED).toBe(false);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(FORBIDDEN_ENGINEERING_RULE_AUTHORITIES).toEqual(expect.arrayContaining(["LLM_MEMORY_ONLY", "UNSOURCED_WEB_SUMMARY", "UNVERIFIED_GENERATED_RULE"]));
    assertConcreteEngineeringRuleAuthority("ESTABLISHED_ENGINEERING_MECHANICS");
    expect(CONCRETE_VALIDATION_DIMENSIONS_REUSED).toBe(true);
    expect(PARALLEL_CONCRETE_VALIDATION_MODEL_CREATED).toBe(false);
    expect(CONCRETE_STANDARD_PROFILE_AND_CONFORMANCE_SEPARATE).toBe(true);
    expect(CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_ONLY");
    expect(CONCRETE_RESULT_PROVENANCE_MODEL).toBe(true);
    expect(CONCRETE_RESULT_VERSIONING_MODEL).toBe(true);
    expect(STALE_CONCRETE_RESULT_REUSE_ALLOWED).toBe(false);
    const current = {
      elementRef: "el-1",
      sectionRef: "sec-1",
      concreteMaterialRef: "conc-1",
      reinforcementMaterialRef: "reo-1",
      reinforcementLayoutRef: "lay-1",
      coverFingerprint: "c1",
      demandResultId: "demand-1",
      combinationId: "comb-1",
      standardContextId: "ctx-as3600",
      engineeringRuleRef: null,
      methodVersion: "d1e0",
      durabilityContextRef: "dur-1",
      serviceabilityCriterionRef: null,
    };
    const tags = concreteInvalidationTags({ ...current, demandResultId: "demand-0" }, current);
    expect(tags).toContain("DEMAND_CHANGED");
    expect(() => assertStaleConcreteResultsNotReused(tags, true)).toThrow(/stale result/);
    expect(CONCRETE_DESIGN_ORCHESTRATION_FRAMEWORK).toBe(true);
    expect(CONCRETE_DESIGN_COMPLETENESS_MODEL).toBe(true);
    expect(completenessForUnsupported("FLEXURE")).toBe("METHOD_NOT_IMPLEMENTED");
    expect(CONCRETE_FAIL_CLOSED_MODEL).toBe(true);
    expect(failClosedCheckState("MISSING_INPUT")).toBe("CHECK_UNDETERMINED");
    expect(() => evaluateConcreteCapacity(engineInput({ material: material(false), requiredProperties: ["concrete.compressiveStrength"] }))).toThrow(/missing material/);
  });

  it("restricts AI, optimization, product gating, and adjacent-discipline claims", () => {
    expect(AI_CONCRETE_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_CONCRETE_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_CONCRETE_CODE_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    assertAiCannotInventConcreteStrength();
    assertAiCannotInventStressBlock();
    assertAiCannotInventCover();
    assertAiCannotInventCrackLimit();
    assertAiCannotClaimConcreteConformance();
    assertAiCannotApproveConcrete();
    expect(CONCRETE_OPTIMIZATION_HANDOFF_READY).toBe(true);
    expect(CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(() => assertCandidateFullConcreteRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined/);
    expect(CONCRETE_INVERSE_DESIGN_COMPATIBILITY).toBe(true);
    expect(GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(CONCRETE_HUMAN_REVIEW_MODEL).toBe(true);
    expect(CONCRETE_APPROVAL_STATE_SEPARATE).toBe(true);
    expect(AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL).toBe(false);
    expect(CONCRETE_CONNECTION_DESIGN_IMPLEMENTED).toBe(false);
    expect(CONCRETE_MEMBER_DESIGN_IMPLIES_GEOTECHNICAL_VALIDATION).toBe(false);
    expect(CONCRETE_FIRE_DESIGN_IMPLEMENTED).toBe(false);
    expect(CONCRETE_SEISMIC_DESIGN_IMPLEMENTED).toBe(false);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_CONCRETE_STANDARD_TEXT_COMMITTED).toBe(false);
    expect(CONCRETE_GLOBAL_GOVERNANCE_REUSED).toBe(true);
    expect(PARALLEL_CONCRETE_SECURITY_MODEL_CREATED).toBe(false);
    expect(CONCRETE_CONTEXT_PII_REQUIRED).toBe(false);
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);
    expect(D1D_CAPABILITY_MANIFEST_REUSED).toBe(true);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(CONCRETE_CAPABILITY_MANIFEST).toHaveLength(4);
    expect(CONCRETE_PRODUCT_CAPABILITY_GATING).toBe(true);
    expect(concreteProductCapabilityVisible("FRAMEWORK")).toBe(true);
    expect(concreteProductCapabilityVisible("CERTIFIED")).toBe(false);
    assertConcreteProductCapabilityGating();
    expect(D1E_VALIDATION_DEBT_REGISTER.length).toBeGreaterThanOrEqual(20);
    expect(new Set(D1E_VALIDATION_DEBT_REGISTER.map((row) => row.category)).size).toBeGreaterThanOrEqual(20);
    expect(D1E_INTERNAL_ROADMAP_DEFINED).toBe(true);
    expect(D1E_INTERNAL_ROADMAP[1]?.id).toBe("D1E-1");
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("D1E-1");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/common RC section mechanics/);
    expect(D1E0_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E0_D0_RISK_DISPOSITION.REDUCED).toEqual(["D0-R01"]);
    expect(D1E0_D0_RISK_DISPOSITION.INTRODUCED).toBe("NONE");
    expect(D1E0_D0_RISK_DISPOSITION.REMAINING).toEqual(["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"]);
    assertD1e0RiskLedger();
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E0).toBe(false);
    expect(EOS_D1E0_CLOSED).toBe(true);
  });

  it("does not regress D1A/D1B/D1C/D1D steel architecture or leak copyrighted standard text", () => {
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(AU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(D1D_CAPABILITY_MANIFEST.length).toBeGreaterThan(100);
    const corpus = `${readTree(here)}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E0_CONCRETE_DESIGN_FOUNDATION.md"), "utf8")}`;
    for (const pattern of [
      /is AS 3600 compliant/i,
      /is Eurocode 2 compliant/i,
      /is ACI 318 compliant/i,
      /CONCRETE_PACK_CERTIFIED\s*=\s*true/i,
      /φ\s*=\s*0\.9/,
      /gamma_c\s*=/,
      /β1\s*=/,
    ]) {
      expect(corpus).not.toMatch(pattern);
    }
  });
});
