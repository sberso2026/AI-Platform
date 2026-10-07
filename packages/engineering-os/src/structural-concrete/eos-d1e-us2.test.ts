import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE,
  ACI_FLEXURE_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE,
  AI_ACI_CONFORMANCE_AUTHORITY,
  AI_BUILDING_CODE_COMPLIANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_STRAIN_THRESHOLD_AUTHORITY,
  AI_STRENGTH_FACTOR_AUTHORITY,
  AI_STRESS_BLOCK_AUTHORITY,
  AU_CONCRETE_PARAMETER_LEAKAGE_INTO_US,
  AUTOMATIC_US_CONCRETE_APPROVAL,
  BENCHMARK_EQUALS_ACI_CONFORMANCE,
  COMMON_RC_BENCHMARK_EQUALS_ACI_CONFORMANCE,
  COMMON_RC_SECTION_KERNEL_REUSED,
  COPYRIGHTED_ACI318_TEXT_COMMITTED,
  D1C_US_CONCRETE_MOMENT_DEMAND_REUSED,
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  D1E1_EQUILIBRIUM_SOLVER_REUSED,
  D1E1_PLANE_SECTION_KINEMATICS_REUSED,
  D1E1_REINFORCEMENT_GEOMETRY_REUSED,
  D1E1_SECTION_GEOMETRY_REUSED,
  D1E1_SECTION_INTEGRATOR_REUSED,
  D1E_CONCRETE_ARCHITECTURE_READY_FOR_CLOSEOUT,
  D1E_US2_SCOPE_CONFIRMED,
  DEFAULT_US_CONCRETE_CARBON_FACTOR,
  DEFAULT_US_CONCRETE_COST_RATE,
  DEFAULT_US_REINFORCEMENT_CARBON_FACTOR,
  DIRECT_CONTRACT_ACI_FLEXURE_EQUALS_BUILDING_CODE_COMPLIANCE,
  ELASTIC_RC_REFERENCE_EQUALS_ACI_FLEXURAL_STRENGTH,
  EOS_D1E_US2_CLOSED,
  EU_CONCRETE_CONFORMANCE_TRACK_ARCHITECTURALLY_READY,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_US,
  GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT,
  GENERATIVE_US_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK,
  GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE,
  HISTORICAL_US_FLEXURE_RESULT_REPRODUCIBLE,
  LLM_US_CONCRETE_NUMERICAL_AUTHORITY,
  MECHANICS_RATIO_LABELLED_AS_ACI_CHECK,
  NONZERO_AXIAL_ACTION_SILENTLY_IGNORED,
  NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED,
  NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED,
  NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_US_CRACK_CONTROL_IMPLEMENTED,
  NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_US_DURABILITY_CHECK_IMPLEMENTED,
  NUMERICAL_US_LAP_SPLICE_DESIGN_IMPLEMENTED,
  NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_US_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_US_RC_SECTION_SOLVER_CREATED,
  PARALLEL_US_SECTION_INTEGRATOR_CREATED,
  PARALLEL_US_STANDARD_CONTEXT_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_US2,
  SELF_REFERENTIAL_US_FLEXURE_BENCHMARKS,
  SILENT_ACI318_EDITION_INFERENCE,
  STALE_US_FLEXURE_RESULT_REUSE_ALLOWED,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE,
  THREE_JURISDICTION_RC_KERNEL_REUSE_AUDIT,
  UNKNOWN_US_FLEXURE_CODE_PARAMETER_GUESSED,
  US1_CONCRETE_STANDARD_BINDING_REUSED,
  US_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED,
  US_BIAXIAL_CODE_DESIGN_IMPLEMENTED,
  US_CONCRETE_COLUMN_STABILITY_CODE_DESIGN_IMPLEMENTED,
  US_CONCRETE_COMPRESSION_PARAMETER_GUESSED,
  US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  US_CONCRETE_FLEXURE_CONTEXT,
  US_CONCRETE_FLEXURE_FAIL_CLOSED,
  US_CONCRETE_FLEXURE_METHOD_REGISTRY,
  US_CONCRETE_FLEXURE_RESULT,
  US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  US_CONCRETE_IMPLEMENTATION_MATURITY,
  US_CONCRETE_MATERIAL_PROPERTIES_GOVERNED,
  US_CONCRETE_PACK_CERTIFIED,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_AU,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  US_CONCRETE_PARAMETER_LEAKAGE_INTO_EU,
  US_CONCRETE_PRODUCT_CLAIM_LEVEL,
  US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  US_CONCRETE_STANDARD_AMENDMENT_STATE,
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_EDITION,
  US_CONCRETE_STANDARD_ERRATA_STATE,
  US_CONCRETE_ULTIMATE_STRAIN_GUESSED,
  US_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT,
  US_FLEXURE_BUILDING_CODE_COMPLIANCE_STATE,
  US_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL,
  US_FLEXURE_CHECK_STATE,
  US_FLEXURE_D1C_PROVENANCE,
  US_FLEXURE_DEPENDENCY_INVALIDATION,
  US_FLEXURE_HUMAN_VALIDATION_REQUIRED,
  US_FLEXURE_INDEPENDENT_BENCHMARKS,
  US_FLEXURE_RESULT_PROVENANCE,
  US_FLEXURE_STRENGTH_LAYERS_SEPARATE,
  US_FLEXURE_STRENGTH_REDUCTION_FACTOR_GUESSED,
  US_FLEXURE_STRAIN_THRESHOLD_GUESSED,
  US_LONG_TERM_DEFLECTION_IMPLEMENTED,
  US_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED,
  US_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED,
  US_NEUTRAL_AXIS_EQUALS_ACI_CODE_STRENGTH_STATE,
  US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  US_RC_INVERSE_DESIGN_HANDOFF_READY,
  US_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  US_RC_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  US_REINFORCEMENT_PROPERTIES_GOVERNED,
  US_REINFORCEMENT_STRAIN_LIMIT_GUESSED,
  US_STRESS_BLOCK_PARAMETER_GUESSED,
  US_UNIAXIAL_FLEXURE_SCOPE,
  type ConcreteMaterial,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
  type UsConcreteBuildingCodeAdoptionContext,
  type UsConcreteLocalAmendment,
  type UsConcreteProjectStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isEuOnlyArchitecture, isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { D1D_CAPABILITY_MANIFEST, STEEL_ADAPTER_BOUNDARIES } from "../structural-steel";
import {
  AU_CONCRETE_FLEXURE_METHODS,
  AU_STRESS_BLOCK_RULE,
  CONCRETE_ADAPTER_BOUNDARIES,
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_CANONICAL_ROADMAP_HANDOFF,
  D1E_INTERNAL_ROADMAP,
  D1E_US2_D0_RISK_DISPOSITION,
  D1E_VALIDATION_DEBT_REGISTER,
  EU_CONCRETE_FLEXURE_METHODS,
  FRAMEWORK_ONLY_US_CONCRETE_FLEXURE_METHODS,
  IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS,
  IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS,
  IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS,
  STRUCTURAL_CAPABILITY_MANIFEST,
  US_CONCRETE_FLEXURE_METHODS,
  US_CONCRETE_MATERIAL_RESPONSE_ADAPTER,
  US_CONCRETE_STRAIN_LIMIT_DEPENDENCY,
  US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY,
  US_CONCRETE_STRESS_BLOCK_DEPENDENCY,
  assertNoCopyrightedAci318Text,
  assertStaleUsFlexureNotReused,
  assertThreeJurisdictionRcKernelReuse,
  assertUsConcreteReusesD1e1Kernel,
  assertUsFlexureAiBoundary,
  assertUsFlexureOptimizerRejectsUndetermined,
  assertUsParetoRejectsUndetermined,
  emptyUsConcreteResolverInput,
  evaluateUsConcreteFlexure,
  geometricClearances,
  historicalUsConcreteContextRemainsReproducible,
  rectangleSection,
  resolveUsConcreteCatalogGrade,
  resolveUsConcreteContext,
  screenUsFlexureCandidate,
  snapshotIssuedUsConcreteContext,
  usConcreteMtoHandoff,
  usFlexureFingerprint,
  usFlexureInvalidationTags,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));
const E_CONC = 30000;
const RECT_IX = (300 * 500 ** 3) / 12;
const PHIX = 1e-6;
const RECT_MX = (E_CONC * PHIX * RECT_IX) / 1000;

const usDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-aci318-flexure",
  jurisdictionProfileRef: "united-states",
  standardFamily: "ACI",
  standardCode: "ACI 318",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function provenance() {
  return governedProvenance({ jurisdiction: "united-states", standard: "ACI 318", version: "d1e-us2" });
}

function adoption(profile: string, overrides: Partial<UsConcreteBuildingCodeAdoptionContext> = {}): UsConcreteBuildingCodeAdoptionContext {
  return {
    adoptionId: `adopt-${profile}`,
    jurisdiction: `us-${profile.toLowerCase()}`,
    adoptingAuthority: `authority-${profile}`,
    buildingCodeFamily: `IBC-PROFILE-${profile}`,
    buildingCodeEdition: `${profile}-ADOPTION-PROFILE`,
    effectiveDate: null,
    localAmendmentSetRef: `amend-${profile}`,
    referencedStandards: ["ACI 318"],
    projectOverrideRefs: [],
    validationState: "FRAMEWORK_ONLY",
    sourceAuthorityRef: `source-${profile}`,
    referencedConcreteStandard: "ACI 318",
    referencedConcreteStandardEdition: `ACI-318-PROFILE-${profile}`,
    version: "d1e-us2",
    provenanceRef: `prov-adopt-${profile}`,
    ...overrides,
  };
}

function amendment(profile: string, overrides: Partial<UsConcreteLocalAmendment> = {}): UsConcreteLocalAmendment {
  return {
    amendmentSetId: `amend-set-${profile}`,
    jurisdiction: `us-${profile.toLowerCase()}`,
    authority: `authority-${profile}`,
    baseCodeRef: `IBC-PROFILE-${profile}`,
    editionCompatibility: `${profile}-ADOPTION-PROFILE`,
    effectiveDate: null,
    ruleOverrides: [],
    sourceAuthorityRef: `source-${profile}`,
    validationState: "FRAMEWORK_ONLY",
    amendmentId: `amend-${profile}`,
    affectedStandardProfile: `ACI-318-PROFILE-${profile}`,
    scope: "concrete-design-context",
    version: "d1e-us2",
    provenanceRef: `prov-amend-${profile}`,
    ...overrides,
  };
}

function project(profile: string, overrides: Partial<UsConcreteProjectStandardContext> = {}): UsConcreteProjectStandardContext {
  return {
    projectRef: `proj-${profile}`,
    tenantId: "tenant-1",
    workspaceId: "ws-1",
    jurisdictionProfileRef: "united-states",
    buildingCodeContextRef: `adopt-${profile}`,
    buildingCodeAdoption: adoption(profile),
    concreteStandardFamily: "ACI 318",
    concreteStandardEdition: `ACI-318-PROFILE-${profile}`,
    amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
    errataState: "UNKNOWN_PENDING_CONFIRMATION",
    loadStandardContextRef: "asce-7-unconfirmed",
    loadStandard: {
      standardId: "ASCE_7",
      standardCode: "ASCE 7",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      combinationBasis: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    seismicStandardContextRef: "seismic-unconfirmed",
    seismicStandard: {
      applicable: true,
      standardId: "US_CONCRETE_SEISMIC_DEPENDENCY",
      standardCode: "SEISMIC_STANDARD_UNSPECIFIED",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      implemented: false,
    },
    concreteMaterialStandardRefs: ["ASTM"],
    reinforcementMaterialStandardRefs: ["ASTM"],
    localAmendmentSetRef: `amend-${profile}`,
    localAmendmentSet: [amendment(profile)],
    directContractProfileRef: null,
    durabilityContextRef: null,
    serviceabilityContextRef: null,
    projectOverrideRefs: [],
    authorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    technicalBasisRefs: ["d1e-us2-flexure"],
    provenance: provenance(),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalCodeProfileId: null,
    statutoryUsComplianceClaimed: false,
    internationalContractualUse: false,
    ...overrides,
  };
}

function governed(name: string, value: number, unit: string) {
  return { name, value, unit, provenanceRef: "cert-1", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" as const };
}

function concrete(): ConcreteMaterial {
  return {
    materialRef: "c1",
    designation: "fc-governed",
    compressiveStrength: governed("fc", 28, "MPa"),
    tensileStrength: null,
    elasticModulus: governed("E", E_CONC, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "ASTM",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    testCertificateRef: null,
    environmentalMetadata: null,
    version: "1",
    provenance: provenance(),
  };
}

function reo(): ReinforcementMaterial {
  return {
    materialRef: "s1",
    designation: "fy-governed",
    yieldStrength: governed("fy", 420, "MPa"),
    ultimateStrength: null,
    elasticModulus: governed("Es", 200000, "MPa"),
    ductilityClass: null,
    productStandardRef: "ASTM",
    sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE",
    version: "1",
    provenance: provenance(),
  };
}

function emptyLayout(): ReinforcementLayout {
  return { layoutId: "L0", bars: [], groups: [], layers: [], transverse: [], provenanceRef: "p" };
}

function twoBarLayout(): ReinforcementLayout {
  return {
    layoutId: "L1",
    bars: [
      { barId: "b1", designation: "16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 50, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
      { barId: "b2", designation: "16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 250, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
    ],
    groups: [],
    layers: [],
    transverse: [],
    provenanceRef: "p",
  };
}

function demand(momentNm = RECT_MX, axialN = 0): StructuralDemandResult {
  return {
    resultId: "demand-us-1",
    memberId: "m1",
    boundaryCondition: "SIMPLE_SIMPLE",
    spanM: 8,
    combinationId: "comb-1",
    loadCaseIds: ["g"],
    methods: ["SS_BEAM_UDL"],
    reactions: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, unitForce: "N", unitMoment: "N.m" },
    shear: { value: 80000, unit: "N", locationM: 0, signed: 80000 },
    moment: { value: Math.abs(momentNm), unit: "N.m", locationM: 4, signed: momentNm },
    axial: axialN === 0 ? { status: "NO_AXIAL_COMPONENTS", valueN: 0 } : { valueN: axialN, unit: "N", method: "AXIAL_DIRECT" },
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
    standardContext: usDemandContext,
    toolRef: "d1c",
    toolVersion: "d1c",
    provenanceRef: provenance(),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function flexureInput(overrides: Partial<Parameters<typeof evaluateUsConcreteFlexure>[0]> = {}) {
  return {
    methodId: "US_RC_FLEXURE_ELASTIC_MAJOR",
    axis: "MAJOR_AXIS" as const,
    geometry: rectangleSection("r", 300, 500, "p"),
    layout: emptyLayout(),
    concrete: concrete(),
    reinforcement: reo(),
    demand: demand(),
    resolverInput: emptyUsConcreteResolverInput({ projectContext: project("CA") }),
    ...overrides,
  };
}

function readTree(dir: string): string {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return [readTree(path)];
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".md")) return [];
      return [readFileSync(path, "utf8")];
    })
    .join("\n");
}

describe("EOS-D1E-US-2 bounded ACI-profile uniaxial RC flexure", () => {
  it("confirms US-2 scope, reuses US-1 binding and D1E-1 kernel, and does not infer edition", () => {
    expect(D1E_US2_SCOPE_CONFIRMED).toBe(true);
    expect(US1_CONCRETE_STANDARD_BINDING_REUSED).toBe(true);
    expect(PARALLEL_US_STANDARD_CONTEXT_CREATED).toBe(false);
    expect(COMMON_RC_SECTION_KERNEL_REUSED).toBe(true);
    expect(PARALLEL_US_RC_SECTION_SOLVER_CREATED).toBe(false);
    expect(PARALLEL_US_SECTION_INTEGRATOR_CREATED).toBe(false);
    expect(PARALLEL_US_NEUTRAL_AXIS_SOLVER_CREATED).toBe(false);
    expect(US_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(US_CONCRETE_STANDARD_AMENDMENT_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(US_CONCRETE_STANDARD_ERRATA_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_ACI318_EDITION_INFERENCE).toBe(false);
    expect(ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(DIRECT_CONTRACT_ACI_FLEXURE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(US_CONCRETE_FLEXURE_CONTEXT).toBe(true);
    expect(D1C_US_CONCRETE_MOMENT_DEMAND_REUSED).toBe(true);
    expect(US_UNIAXIAL_FLEXURE_SCOPE).toBe(true);
    expect(US_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(US_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("US_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(US_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(US_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "D1E-US")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.some((row) => row.id === RECOMMENDED_D1E_NEXT_PHASE)).toBe(true);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C4");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/Eurocode|EN 1992|rule-gap|C2/i);
    expect(D1E_CANONICAL_ROADMAP_HANDOFF.nextPhase).toBe(RECOMMENDED_D1E_NEXT_PHASE);
    expect(D1E_CONCRETE_ARCHITECTURE_READY_FOR_CLOSEOUT).toBe(true);
    expect(EU_CONCRETE_CONFORMANCE_TRACK_ARCHITECTURALLY_READY).toBe(true);
    expect(EOS_D1E_US2_CLOSED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_US2).toBe(false);
    assertUsConcreteReusesD1e1Kernel();
    expect(D1E1_SECTION_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_REINFORCEMENT_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_PLANE_SECTION_KINEMATICS_REUSED).toBe(true);
    expect(D1E1_SECTION_INTEGRATOR_REUSED).toBe(true);
    expect(D1E1_EQUILIBRIUM_SOLVER_REUSED).toBe(true);
  });

  it("reuses the D1E-1 kernel for elastic major-axis mechanics without labelling ACI strength", () => {
    const result = evaluateUsConcreteFlexure(flexureInput());
    expect(result.resultAuthority).toBe("MECHANICS_REFERENCE");
    expect(result.labelledAciStrength).toBe(false);
    expect(result.nominalStrengthNm).toBeNull();
    expect(result.designStrengthNm).toBeNull();
    expect(result.aciUtilization).toBeNull();
    expect(result.checkState).toBe("CHECK_UNDETERMINED");
    expect(result.buildingCodeComplianceState).toBe("CHECK_UNDETERMINED");
    expect(result.mechanicsState).toBe("EQUILIBRATED");
    expect(result.referenceMomentNm).toBeCloseTo(RECT_MX, 0);
    expect(result.warnings).toEqual(expect.arrayContaining(["ACI_DESIGN_METHOD_UNAVAILABLE", "HUMAN_ENGINEERING_REVIEW_REQUIRED", "STANDARD_EDITION_UNCONFIRMED"]));
    expect(result.approvalState).toBe("not_approved");
    expect(ELASTIC_RC_REFERENCE_EQUALS_ACI_FLEXURAL_STRENGTH).toBe(false);
    expect(US_NEUTRAL_AXIS_EQUALS_ACI_CODE_STRENGTH_STATE).toBe(false);
    expect(MECHANICS_RATIO_LABELLED_AS_ACI_CHECK).toBe(false);
    expect(result.neutralAxis.labelledAciCodeStrength).toBe(false);
    expect(US_FLEXURE_STRENGTH_LAYERS_SEPARATE).toBe(true);
    expect(STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE).toBe(false);
    expect(geometricClearances(twoBarLayout(), rectangleSection("r", 300, 500, "p"))[0]?.codeCoverCompliance).toBe(false);
    expect(GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE).toBe(false);
    const minor = evaluateUsConcreteFlexure(flexureInput({ methodId: "US_RC_FLEXURE_ELASTIC_MINOR", axis: "MINOR_AXIS" }));
    expect(minor.resultAuthority).toBe("MECHANICS_REFERENCE");
    expect(minor.axis).toBe("MINOR_AXIS");
  });

  it("keeps ACI code flexure framework-only and fails closed on missing context and axial action", () => {
    expect(IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(FRAMEWORK_ONLY_US_CONCRETE_FLEXURE_METHODS).toContain("US_RC_FLEXURE_ACI_UNIAXIAL_MAJOR");
    expect(FRAMEWORK_ONLY_US_CONCRETE_FLEXURE_METHODS).toContain("US_RC_FLEXURE_ACI_UNIAXIAL_MINOR");
    expect(US_CONCRETE_FLEXURE_METHOD_REGISTRY).toBe(true);
    expect(US_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.beta1.value).toBeNull();
    expect(US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY.value.value).toBeNull();
    expect(US_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ultimateConcreteStrain.value).toBeNull();
    expect(US_CONCRETE_MATERIAL_RESPONSE_ADAPTER.concreteTensionTreatment.explicit).toBe(true);
    expect(US_STRESS_BLOCK_PARAMETER_GUESSED).toBe(false);
    expect(US_FLEXURE_STRENGTH_REDUCTION_FACTOR_GUESSED).toBe(false);
    expect(US_CONCRETE_ULTIMATE_STRAIN_GUESSED).toBe(false);
    expect(US_REINFORCEMENT_STRAIN_LIMIT_GUESSED).toBe(false);
    expect(US_FLEXURE_STRAIN_THRESHOLD_GUESSED).toBe(false);
    expect(UNKNOWN_US_FLEXURE_CODE_PARAMETER_GUESSED).toBe(false);
    const missingAdoption = evaluateUsConcreteFlexure(flexureInput({
      methodId: "US_RC_FLEXURE_ACI_UNIAXIAL_MAJOR",
      resolverInput: emptyUsConcreteResolverInput({
        projectContext: project("CA", { buildingCodeContextRef: null, buildingCodeAdoption: null }),
      }),
    }));
    expect(missingAdoption.checkState).toBe("CHECK_UNDETERMINED");
    expect(missingAdoption.warnings).toContain("BUILDING_CODE_CONTEXT_MISSING");
    const framework = evaluateUsConcreteFlexure(flexureInput({
      methodId: "US_RC_FLEXURE_ACI_UNIAXIAL_MAJOR",
      layout: twoBarLayout(),
    }));
    expect(framework.checkState).toBe("CHECK_UNDETERMINED");
    expect(framework.resultAuthority).toBe("CODE_PROFILE_REFERENCE");
    expect(framework.designStrengthNm).toBeNull();
    expect(framework.nominalStrengthNm).toBeNull();
    const axial = evaluateUsConcreteFlexure(flexureInput({ demand: demand(RECT_MX, 25000) }));
    expect(axial.checkState).toBe("CHECK_UNDETERMINED");
    expect(axial.warnings).toContain("UNSUPPORTED_AXIAL_ACTION");
    expect(NONZERO_AXIAL_ACTION_SILENTLY_IGNORED).toBe(false);
    expect(US_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT).toBe(true);
    expect(() => resolveUsConcreteCatalogGrade("4000psi")).toThrow(/catalog unpopulated/i);
    expect(US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES).toBe(false);
    expect(US_CONCRETE_MATERIAL_PROPERTIES_GOVERNED).toBe(true);
    expect(US_REINFORCEMENT_PROPERTIES_GOVERNED).toBe(true);
    expect(US_CONCRETE_COMPRESSION_PARAMETER_GUESSED).toBe(false);
  });

  it("isolates adoption, direct-contract, and building-code compliance from ACI flexure checks", () => {
    const ca = evaluateUsConcreteFlexure(flexureInput({ resolverInput: emptyUsConcreteResolverInput({ projectContext: project("CA") }) }));
    const ny = evaluateUsConcreteFlexure(flexureInput({ resolverInput: emptyUsConcreteResolverInput({ projectContext: project("NY") }) }));
    expect(ca.buildingCodeContextRef).toBe("adopt-CA");
    expect(ny.buildingCodeContextRef).toBe("adopt-NY");
    expect(ca.buildingCodeContextRef).not.toBe(ny.buildingCodeContextRef);
    expect(ca.buildingCodeComplianceState).toBe("CHECK_UNDETERMINED");
    expect(ACI_FLEXURE_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
    expect(US_FLEXURE_BUILDING_CODE_COMPLIANCE_STATE).toBe(true);
    const international = evaluateUsConcreteFlexure(flexureInput({
      resolverInput: emptyUsConcreteResolverInput({
        adoptionRequired: false,
        projectContext: project("SG", {
          jurisdictionProfileRef: "other",
          buildingCodeContextRef: null,
          buildingCodeAdoption: null,
          localAmendmentSetRef: null,
          localAmendmentSet: [],
          directContractProfileRef: "aci-direct-sg",
          internationalContractualUse: true,
          statutoryUsComplianceClaimed: false,
        }),
      }),
    }));
    expect(international.directContractProfile).toBe(true);
    expect(international.statutoryUsComplianceClaimed).toBe(false);
    expect(international.checkState).toBe("CHECK_UNDETERMINED");
    expect(international.mechanicsState).toBe("EQUILIBRATED");
    expect(international.warnings).toContain("DIRECT_CONTRACT_NOT_BUILDING_CODE_COMPLIANCE");
    expect(DIRECT_CONTRACT_ACI_FLEXURE_EQUALS_BUILDING_CODE_COMPLIANCE).toBe(false);
  });

  it("invalidates stale results, rejects invalid candidates, and refuses undetermined optimization", () => {
    const fp1 = usFlexureFingerprint({
      memberRef: "m1",
      sectionGeometryVersion: "1",
      reinforcementFingerprint: "a",
      concreteMaterialRef: "c",
      reinforcementMaterialRef: "r",
      momentDemandRef: "d",
      combinationId: "c1",
      d1cRevision: "d1c",
      aciFamily: "ACI 318",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
      errataState: "UNKNOWN_PENDING_CONFIRMATION",
      buildingCodeContextRef: "adopt-CA",
      localAmendmentRef: "amend-CA",
      materialModelRef: "e",
      stressBlockRuleRef: null,
      strainRuleRef: null,
      strengthFactorRef: null,
      methodVersion: "d1e-us2.0",
    });
    const fp2 = usFlexureFingerprint({
      memberRef: "m1",
      sectionGeometryVersion: "2",
      reinforcementFingerprint: "a",
      concreteMaterialRef: "c",
      reinforcementMaterialRef: "r",
      momentDemandRef: "d",
      combinationId: "c1",
      d1cRevision: "d1c",
      aciFamily: "ACI 318",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
      errataState: "UNKNOWN_PENDING_CONFIRMATION",
      buildingCodeContextRef: "adopt-CA",
      localAmendmentRef: "amend-CA",
      materialModelRef: "e",
      stressBlockRuleRef: null,
      strainRuleRef: null,
      strengthFactorRef: null,
      methodVersion: "d1e-us2.0",
    });
    expect(usFlexureInvalidationTags(fp1, fp2).length).toBeGreaterThan(0);
    expect(() => assertStaleUsFlexureNotReused(usFlexureInvalidationTags(fp1, fp2), true)).toThrow(/stale/i);
    expect(STALE_US_FLEXURE_RESULT_REUSE_ALLOWED).toBe(false);
    expect(US_FLEXURE_DEPENDENCY_INVALIDATION).toBe(true);
    expect(HISTORICAL_US_FLEXURE_RESULT_REPRODUCIBLE).toBe(true);
    const geom = rectangleSection("r", 300, 500, "p");
    const resolved = resolveUsConcreteContext(emptyUsConcreteResolverInput({ projectContext: project("CA") }));
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(historicalUsConcreteContextRemainsReproducible(snapshotIssuedUsConcreteContext(resolved.context), project("CA")).issued).toBe(true);
    }
    expect(screenUsFlexureCandidate({
      geometry: geom,
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      resolverInput: emptyUsConcreteResolverInput({ projectContext: project("CA") }),
    }).accepted).toBe(true);
    const bad = twoBarLayout();
    bad.bars = [{ ...bad.bars[0]!, xMm: 900, yMm: 50 }];
    expect(() => screenUsFlexureCandidate({
      geometry: geom,
      layout: bad,
      concrete: concrete(),
      reinforcement: reo(),
      resolverInput: emptyUsConcreteResolverInput({ projectContext: project("CA") }),
    })).toThrow(/fail closed/i);
    expect(() => screenUsFlexureCandidate({
      geometry: geom,
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      resolverInput: emptyUsConcreteResolverInput({ projectContext: project("CA") }),
      generativeAttemptedStandardContextChange: true,
    })).toThrow(/standard context/i);
    expect(() => assertUsFlexureOptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(() => assertUsParetoRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(US_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(US_RC_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE).toBe(false);
    expect(GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT).toBe(false);
    expect(GENERATIVE_US_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK).toBe(false);
    expect(US_RC_INVERSE_DESIGN_HANDOFF_READY).toBe(true);
    expect(usConcreteMtoHandoff({ geometry: geom, layout: twoBarLayout() }).emissionFactorEmbedded).toBe(false);
    expect(DEFAULT_US_CONCRETE_COST_RATE).toBe(false);
    expect(DEFAULT_US_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(DEFAULT_US_REINFORCEMENT_CARBON_FACTOR).toBe(false);
  });

  it("preserves boundaries, AI limits, three-jurisdiction kernel, debt, and copyright", () => {
    expect(US_CONCRETE_FLEXURE_METHODS.every((row) => row.methodScope === "MECHANICS_REFERENCE_ONLY" || row.methodScope === "FRAMEWORK_ONLY")).toBe(true);
    expect(US_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED).toBe(false);
    expect(US_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED).toBe(false);
    expect(US_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_BIAXIAL_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_CRACK_CONTROL_IMPLEMENTED).toBe(false);
    expect(US_LONG_TERM_DEFLECTION_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_DURABILITY_CHECK_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_US_LAP_SPLICE_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_COLUMN_STABILITY_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED).toBe(false);
    expect(US_FLEXURE_D1C_PROVENANCE).toBe("PASS");
    expect(US_FLEXURE_RESULT_PROVENANCE).toBe("PASS");
    expect(US_FLEXURE_INDEPENDENT_BENCHMARKS).toBe("PASS");
    expect(SELF_REFERENTIAL_US_FLEXURE_BENCHMARKS).toBe(false);
    expect(COMMON_RC_BENCHMARK_EQUALS_ACI_CONFORMANCE).toBe(false);
    expect(BENCHMARK_EQUALS_ACI_CONFORMANCE).toBe(false);
    expect(US_CONCRETE_FLEXURE_RESULT).toBe(true);
    expect(US_FLEXURE_CHECK_STATE).toBe(true);
    expect(US_CONCRETE_FLEXURE_FAIL_CLOSED).toBe(true);
    expect(LLM_US_CONCRETE_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_STRESS_BLOCK_AUTHORITY).toBe(false);
    expect(AI_STRAIN_THRESHOLD_AUTHORITY).toBe(false);
    expect(AI_STRENGTH_FACTOR_AUTHORITY).toBe(false);
    expect(AI_ACI_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_BUILDING_CODE_COMPLIANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_US_CONCRETE_APPROVAL).toBe(false);
    expect(US_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(US_FLEXURE_HUMAN_VALIDATION_REQUIRED).toBe(true);
    assertUsFlexureAiBoundary();
    expect(() => evaluateUsConcreteFlexure(flexureInput({ generativeAttemptedStandardContextChange: true }))).toThrow(/standard context/i);
    const aiEdition = evaluateUsConcreteFlexure(flexureInput({
      resolverInput: emptyUsConcreteResolverInput({ projectContext: project("CA"), aiSelectedAciEdition: true }),
    }));
    expect(aiEdition.checkState).toBe("CHECK_UNDETERMINED");
    expect(D1E_US2_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E_US2_D0_RISK_DISPOSITION.INTRODUCED).toBe("NONE");
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-US-VD-FLEXURE")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-US-VD-PHI")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.US.FLEXURE.UNIAXIAL")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(AU_CONCRETE_FLEXURE_METHODS.length).toBeGreaterThan(0);
    expect(EU_CONCRETE_FLEXURE_METHODS.length).toBeGreaterThan(0);
    expect(IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect([...IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS]).toEqual([
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
    ]);
    expect(AU_STRESS_BLOCK_RULE.parameters).toBeNull();
    expect(AU_CONCRETE_PARAMETER_LEAKAGE_INTO_US).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_US).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_AU).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_EU).toBe(false);
    expect(US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(THREE_JURISDICTION_RC_KERNEL_REUSE_AUDIT).toBe("PASS");
    assertThreeJurisdictionRcKernelReuse();
    expect(CONCRETE_ADAPTER_BOUNDARIES.US_CONCRETE.implemented).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.implemented).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.EU_CONCRETE.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.ready).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.ready).toBe(true);
    expect(D1D_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_ACI318_TEXT_COMMITTED).toBe(false);
    assertNoCopyrightedAci318Text();
    const corpus = `${readTree(join(here, "us-flexure"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E_US2_RC_FLEXURE.md"), "utf8")}`;
    for (const pattern of [/is ACI 318 compliant/i, /phi\s*=\s*0\.9/i, /beta1\s*=\s*0\.85/, /ecu\s*=\s*0\.003/, /CONCRETE_PACK_CERTIFIED\s*=\s*true/i]) {
      expect(corpus).not.toMatch(pattern);
    }
  });
});
