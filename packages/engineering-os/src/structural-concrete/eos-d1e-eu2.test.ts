import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_EN1992_CONFORMANCE_AUTHORITY,
  AI_ENGINEERING_APPROVAL,
  AI_EU_CONCRETE_ASSISTANCE_ADVISORY_ONLY,
  AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY,
  AI_EU_CONCRETE_NDP_AUTHORITY,
  AI_EU_STRESS_BLOCK_AUTHORITY,
  AI_PARTIAL_FACTOR_AUTHORITY,
  AU_CONCRETE_PARAMETER_LEAKAGE_INTO_EU,
  AUTOMATIC_EU_CONCRETE_APPROVAL,
  BENCHMARK_EQUALS_EN1992_CONFORMANCE,
  COMMON_RC_BENCHMARK_EQUALS_EN1992_CONFORMANCE,
  COMMON_RC_SECTION_KERNEL_REUSED,
  COPYRIGHTED_EN1992_TEXT_COMMITTED,
  D1C_EU_CONCRETE_MOMENT_DEMAND_REUSED,
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  D1E1_EQUILIBRIUM_SOLVER_REUSED,
  D1E1_PLANE_SECTION_KINEMATICS_REUSED,
  D1E1_REINFORCEMENT_GEOMETRY_REUSED,
  D1E1_SECTION_GEOMETRY_REUSED,
  D1E1_SECTION_INTEGRATOR_REUSED,
  D1E_EU2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK,
  D1E_EU2_SCOPE_CONFIRMED,
  D1E_EU_ROADMAP_HANDOFF_VALIDATED,
  D1E_EU_VALIDATION_DEBT_UPDATED,
  DEFAULT_EU_CONCRETE_CARBON_FACTOR,
  DEFAULT_EU_CONCRETE_COST_RATE,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR,
  ELASTIC_RC_REFERENCE_EQUALS_EN1992_FLEXURAL_RESISTANCE,
  EOS_D1E_EU2_CLOSED,
  EU1_STANDARD_BINDING_REUSED,
  EU_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED,
  EU_BIAXIAL_CODE_DESIGN_IMPLEMENTED,
  EU_CHARACTERISTIC_AND_DESIGN_MATERIAL_VALUES_SEPARATE,
  EU_CONCRETE_COLUMN_STABILITY_CODE_DESIGN_IMPLEMENTED,
  EU_CONCRETE_COMPRESSION_PARAMETER_GUESSED,
  EU_CONCRETE_COMPRESSION_RESPONSE_FRAMEWORK,
  EU_CONCRETE_FLEXURE_CONTEXT,
  EU_CONCRETE_FLEXURE_FAIL_CLOSED,
  EU_CONCRETE_FLEXURE_METHOD_REGISTRY,
  EU_CONCRETE_FLEXURE_RESULT,
  EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  EU_CONCRETE_IMPLEMENTATION_MATURITY,
  EU_CONCRETE_MATERIAL_PROPERTIES_GOVERNED,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_AU,
  EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_RESULT_WARNING_MODEL,
  EU_CONCRETE_RULES_CONFINED_TO_EU_ADAPTER,
  EU_CONCRETE_STANDARD_AMENDMENT_STATE,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EU_CONCRETE_STRESS_BLOCK_RULE_FRAMEWORK,
  EU_CONCRETE_TENSION_TREATMENT_EXPLICIT,
  EU_CONCRETE_ULTIMATE_STRAIN_GUESSED,
  EU_DESIGN_STRENGTH_DERIVATION_GOVERNED,
  EU_DUCTILITY_LIMIT_GUESSED,
  EU_FLEXURAL_RESISTANCE_EQUALS_DETAILING_COMPLIANCE,
  EU_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT,
  EU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL,
  EU_FLEXURE_CHECK_STATE,
  EU_FLEXURE_D1C_PROVENANCE,
  EU_FLEXURE_DEPENDENCY_INVALIDATION,
  EU_FLEXURE_HUMAN_VALIDATION_REQUIRED,
  EU_FLEXURE_INDEPENDENT_BENCHMARKS,
  EU_FLEXURE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  EU_FLEXURE_NDP_VALUE_GUESSED,
  EU_FLEXURE_PARTIAL_FACTOR_GUESSED,
  EU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND,
  EU_FLEXURE_RESULT_PROVENANCE,
  EU_FLEXURE_STANDARD_PART_REQUIRED,
  EU_HIGH_WATER_MARK_INHERITED,
  EU_LONG_TERM_DEFLECTION_IMPLEMENTED,
  EU_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED,
  EU_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED,
  EU_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE_STATE,
  EU_ONLY_CONCRETE_CORE,
  EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL,
  EU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  EU_RC_INVERSE_DESIGN_HANDOFF_READY,
  EU_RC_MTO_HANDOFF_REUSED,
  EU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  EU_RC_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  EU_REINFORCEMENT_PROPERTIES_GOVERNED,
  EU_REINFORCEMENT_STRAIN_LIMIT_GUESSED,
  EU_STRESS_BLOCK_PARAMETER_GUESSED,
  EU_UNIAXIAL_FLEXURE_SCOPE,
  GENERATIVE_EU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK,
  GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT,
  GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE,
  HISTORICAL_EU_FLEXURE_RESULT_REPRODUCIBLE,
  LLM_EU_CONCRETE_NUMERICAL_AUTHORITY,
  MECHANICS_RATIO_LABELLED_AS_EN1992_CHECK,
  NONZERO_AXIAL_ACTION_SILENTLY_IGNORED,
  NUMERICAL_EU_CODE_COVER_CHECK_IMPLEMENTED,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_EU_CRACK_WIDTH_DESIGN_IMPLEMENTED,
  NUMERICAL_EU_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_EU_DURABILITY_CHECK_IMPLEMENTED,
  NUMERICAL_EU_LAP_SPLICE_DESIGN_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  PARALLEL_CAPABILITY_MANIFEST_CREATED,
  PARALLEL_EU_NEUTRAL_AXIS_SOLVER_CREATED,
  PARALLEL_EU_RC_SECTION_SOLVER_CREATED,
  PARALLEL_EU_SECTION_INTEGRATOR_CREATED,
  PARALLEL_EU_STANDARD_CONTEXT_CREATED,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU2,
  SELF_REFERENTIAL_EU_FLEXURE_BENCHMARKS,
  SILENT_EN1992_EDITION_INFERENCE,
  STALE_EU_FLEXURE_RESULT_REUSE_ALLOWED,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  UNKNOWN_EU_FLEXURE_CODE_PARAMETER_GUESSED,
  type ConcreteMaterial,
  type EurocodeConcreteProjectContext,
  type EurocodeNationalAnnex,
  type ReinforcementLayout,
  type ReinforcementMaterial,
  type StructuralDemandResult,
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
  D1E_EU2_D0_RISK_DISPOSITION,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
  EU_CONCRETE_FLEXURE_METHODS,
  EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER,
  EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY,
  EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY,
  EU_CONCRETE_STRESS_BLOCK_DEPENDENCY,
  FRAMEWORK_ONLY_EU_CONCRETE_FLEXURE_METHODS,
  IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS,
  IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS,
  STRUCTURAL_CAPABILITY_MANIFEST,
  assertEuConcreteReusesD1e1Kernel,
  assertEuFlexureAiBoundary,
  assertEuFlexureOptimizerRejectsUndetermined,
  assertEuParetoRejectsUndetermined,
  assertNoCrossGenerationMixing,
  assertNoCopyrightedEn1992Text,
  assertStaleEuFlexureNotReused,
  emptyResolverInput,
  euConcreteMtoHandoff,
  euFlexureFingerprint,
  euFlexureInvalidationTags,
  evaluateEuConcreteFlexure,
  geometricClearances,
  historicalEuConcreteContextRemainsReproducible,
  rectangleSection,
  resolveEuConcreteCatalogGrade,
  resolveEurocodeConcreteContext,
  screenEuFlexureCandidate,
  snapshotIssuedEuConcreteContext,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));
const E_CONC = 30000;
const RECT_IX = (300 * 500 ** 3) / 12;
const PHIX = 1e-6;
const RECT_MX = (E_CONC * PHIX * RECT_IX) / 1000;

const euDemandContext = createConfiguredKnowledgeContext({
  contextId: "ctx-en1992-flexure",
  jurisdictionProfileRef: "eu-eea",
  standardFamily: "EN",
  standardCode: "EN 1992",
  edition: "UNKNOWN_PENDING_CONFIRMATION",
  materialScope: "concrete",
});

function provenance() {
  return governedProvenance({ jurisdiction: "eu-eea", standard: "EN 1992", version: "d1e-eu2" });
}

function annex(country: string, overrides: Partial<EurocodeNationalAnnex> = {}): EurocodeNationalAnnex {
  return {
    nationalAnnexId: `NA-${country}-EN1992-1-1`,
    countryCode: country,
    standardPartRef: "EN_1992_1_1",
    edition: "UNKNOWN_PENDING_CONFIRMATION",
    publicationDate: null,
    amendment: null,
    effectiveDate: null,
    status: "FRAMEWORK_ONLY",
    nationalParameterSetRef: `NDP-${country}-EN1992-1-1`,
    sourceAuthorityRef: "project-declared-annex-metadata",
    validationState: "FRAMEWORK_ONLY",
    generationFamily: "UNKNOWN_PENDING_CONFIRMATION",
    ...overrides,
  };
}

function project(country: string, overrides: Partial<EurocodeConcreteProjectContext> = {}): EurocodeConcreteProjectContext {
  return {
    projectRef: `proj-${country}`,
    tenantId: "tenant-1",
    workspaceId: "ws-1",
    jurisdictionProfileRef: "eu-eea",
    countryCode: country,
    standardFamily: "EN 1992",
    standardGeneration: "UNKNOWN_PENDING_CONFIRMATION",
    standardEdition: "UNKNOWN_PENDING_CONFIRMATION",
    amendmentState: "UNKNOWN_PENDING_CONFIRMATION",
    standardPartRefs: ["EN_1992_1_1"],
    nationalAnnexRef: `NA-${country}-EN1992-1-1`,
    nationalAnnexSet: [annex(country)],
    ndpSetRef: `NDP-${country}-EN1992-1-1`,
    ndpSet: [],
    concreteMaterialStandardRefs: ["EN 206"],
    reinforcementMaterialStandardRefs: ["EN 10080"],
    loadStandardContextRef: "EN 1990/EN 1991",
    durabilityContextRef: null,
    serviceabilityContextRef: null,
    projectOverrideRefs: [],
    authorityRefs: ["VALIDATED_ENGINEERING_REFERENCE"],
    technicalBasisRefs: ["d1e-eu2-flexure"],
    provenance: provenance(),
    validationState: "STANDARD_BINDING_FRAMEWORK",
    conformanceState: "INTENDED_PROFILE",
    workspaceGlobalAnnexId: null,
    statutoryEuMembershipRequired: false,
    statutoryEuComplianceClaimed: false,
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
    designation: "C30/37",
    compressiveStrength: governed("fc", 30, "MPa"),
    tensileStrength: null,
    elasticModulus: governed("E", E_CONC, "MPa"),
    density: null,
    poissonRatio: null,
    age: null,
    strengthReferenceAge: null,
    materialClass: null,
    materialStandardRef: "EN 206",
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
    designation: "B500B",
    yieldStrength: governed("fy", 500, "MPa"),
    ultimateStrength: null,
    elasticModulus: governed("Es", 200000, "MPa"),
    ductilityClass: "B",
    productStandardRef: "EN 10080",
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
      { barId: "b1", designation: "H16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 50, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
      { barId: "b2", designation: "H16", diameterMm: governed("d", 16, "mm"), areaMm2: governed("a", 201, "mm2"), count: 1, xMm: 250, yMm: 50, layerId: null, face: "bottom", direction: null, spacingMm: null, groupId: null, materialRef: "s1", anchorageMetadata: null, lapMetadata: null, provenanceRef: "p" },
    ],
    groups: [],
    layers: [],
    transverse: [],
    provenanceRef: "p",
  };
}

function demand(momentNm = RECT_MX, axialN = 0): StructuralDemandResult {
  return {
    resultId: "demand-eu-1",
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
    standardContext: euDemandContext,
    toolRef: "d1c",
    toolVersion: "d1c",
    provenanceRef: provenance(),
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    foundationReactionHandoff: { startFyN: 0, endFyN: 0, startMzNm: 0, endMzNm: 0, geotechnicalCapacityCalculated: false },
  };
}

function flexureInput(overrides: Partial<Parameters<typeof evaluateEuConcreteFlexure>[0]> = {}) {
  return {
    methodId: "EU_RC_FLEXURE_ELASTIC_MAJOR",
    axis: "MAJOR_AXIS" as const,
    geometry: rectangleSection("r", 300, 500, "p"),
    layout: emptyLayout(),
    concrete: concrete(),
    reinforcement: reo(),
    demand: demand(),
    resolverInput: emptyResolverInput({ projectContext: project("DE") }),
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

describe("EOS-D1E-EU-2 bounded Eurocode uniaxial RC flexure", () => {
  it("confirms EU-2 scope, reuses EU-1 binding and D1E-1 kernel, and does not infer edition", () => {
    expect(D1E_EU2_SCOPE_CONFIRMED).toBe(true);
    expect(EU1_STANDARD_BINDING_REUSED).toBe(true);
    expect(PARALLEL_EU_STANDARD_CONTEXT_CREATED).toBe(false);
    expect(COMMON_RC_SECTION_KERNEL_REUSED).toBe(true);
    expect(PARALLEL_EU_RC_SECTION_SOLVER_CREATED).toBe(false);
    expect(PARALLEL_EU_SECTION_INTEGRATOR_CREATED).toBe(false);
    expect(PARALLEL_EU_NEUTRAL_AXIS_SOLVER_CREATED).toBe(false);
    expect(EU_CONCRETE_RULES_CONFINED_TO_EU_ADAPTER).toBe(true);
    expect(EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL).toBe(false);
    expect(EU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(EU_CONCRETE_STANDARD_AMENDMENT_STATE).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_EN1992_EDITION_INFERENCE).toBe(false);
    expect(EU_FLEXURE_STANDARD_PART_REQUIRED).toBe(true);
    expect(DEFAULT_EU_CONCRETE_NATIONAL_ANNEX).toBe(false);
    expect(EU_FLEXURE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION).toBe(false);
    expect(EU_FLEXURE_NDP_VALUE_GUESSED).toBe(false);
    expect(EU_CONCRETE_FLEXURE_CONTEXT).toBe(true);
    expect(D1C_EU_CONCRETE_MOMENT_DEMAND_REUSED).toBe(true);
    expect(EU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND).toBe(false);
    expect(EU_UNIAXIAL_FLEXURE_SCOPE).toBe(true);
    expect(EU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "D1E-EU")?.status).toBe("CLOSED");
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("D1E-US");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/ACI 318/);
    expect(D1E_CANONICAL_ROADMAP_HANDOFF.nextPhase).toBe("D1E-US");
    expect(D1E_EU_ROADMAP_HANDOFF_VALIDATED).toBe(true);
    expect(EOS_D1E_EU2_CLOSED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU2).toBe(false);
    assertEuConcreteReusesD1e1Kernel();
    expect(D1E1_SECTION_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_REINFORCEMENT_GEOMETRY_REUSED).toBe(true);
    expect(D1E1_PLANE_SECTION_KINEMATICS_REUSED).toBe(true);
    expect(D1E1_SECTION_INTEGRATOR_REUSED).toBe(true);
    expect(D1E1_EQUILIBRIUM_SOLVER_REUSED).toBe(true);
  });

  it("reuses the D1E-1 kernel for elastic major-axis mechanics without labelling EN 1992 resistance", () => {
    const result = evaluateEuConcreteFlexure(flexureInput());
    expect(result.resultAuthority).toBe("MECHANICS_REFERENCE");
    expect(result.labelledEn1992Resistance).toBe(false);
    expect(result.designResistanceNm).toBeNull();
    expect(result.en1992Utilization).toBeNull();
    expect(result.checkState).toBe("CHECK_UNDETERMINED");
    expect(result.mechanicsState).toBe("EQUILIBRATED");
    expect(result.referenceMomentNm).toBeCloseTo(RECT_MX, 0);
    expect(result.warnings).toEqual(expect.arrayContaining(["EN1992_DESIGN_METHOD_UNAVAILABLE", "HUMAN_ENGINEERING_REVIEW_REQUIRED", "STANDARD_EDITION_UNCONFIRMED"]));
    expect(result.edition).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(result.part).toBe("EN_1992_1_1");
    expect(result.approvalState).toBe("not_approved");
    expect(ELASTIC_RC_REFERENCE_EQUALS_EN1992_FLEXURAL_RESISTANCE).toBe(false);
    expect(EU_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE_STATE).toBe(false);
    expect(MECHANICS_RATIO_LABELLED_AS_EN1992_CHECK).toBe(false);
    expect(result.neutralAxis.labelledCodeResistance).toBe(false);
    expect(geometricClearances(twoBarLayout(), rectangleSection("r", 300, 500, "p"))[0]?.codeCoverCompliance).toBe(false);
    expect(GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE).toBe(false);
    const minor = evaluateEuConcreteFlexure(flexureInput({ methodId: "EU_RC_FLEXURE_ELASTIC_MINOR", axis: "MINOR_AXIS" }));
    expect(minor.resultAuthority).toBe("MECHANICS_REFERENCE");
    expect(minor.axis).toBe("MINOR_AXIS");
  });

  it("keeps EN 1992 code flexure framework-only and fails closed on missing annex, NDP, and axial action", () => {
    expect(IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(FRAMEWORK_ONLY_EU_CONCRETE_FLEXURE_METHODS).toContain("EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR");
    expect(FRAMEWORK_ONLY_EU_CONCRETE_FLEXURE_METHODS).toContain("EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR");
    expect(EU_CONCRETE_FLEXURE_METHOD_REGISTRY).toBe(true);
    expect(EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.eta.value).toBeNull();
    expect(EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.lambda.value).toBeNull();
    expect(EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.concreteMaterial.value).toBeNull();
    expect(EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ultimateConcreteStrain.value).toBeNull();
    expect(EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER.concreteTensionTreatment.explicit).toBe(true);
    expect(EU_STRESS_BLOCK_PARAMETER_GUESSED).toBe(false);
    expect(EU_FLEXURE_PARTIAL_FACTOR_GUESSED).toBe(false);
    expect(EU_CONCRETE_ULTIMATE_STRAIN_GUESSED).toBe(false);
    expect(EU_REINFORCEMENT_STRAIN_LIMIT_GUESSED).toBe(false);
    expect(UNKNOWN_EU_FLEXURE_CODE_PARAMETER_GUESSED).toBe(false);
    const missingAnnex = evaluateEuConcreteFlexure(flexureInput({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      resolverInput: emptyResolverInput({
        projectContext: project("DE", { nationalAnnexRef: null, nationalAnnexSet: [] }),
      }),
    }));
    expect(missingAnnex.checkState).toBe("CHECK_UNDETERMINED");
    expect(missingAnnex.warnings).toContain("NATIONAL_ANNEX_MISSING");
    const missingNdp = evaluateEuConcreteFlexure(flexureInput({
      methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      layout: twoBarLayout(),
    }));
    expect(missingNdp.checkState).toBe("CHECK_UNDETERMINED");
    expect(missingNdp.resultAuthority).toBe("CODE_PROFILE_REFERENCE");
    expect(missingNdp.designResistanceNm).toBeNull();
    expect(missingNdp.warnings).toContain("NDP_MISSING");
    const axial = evaluateEuConcreteFlexure(flexureInput({ demand: demand(RECT_MX, 25000) }));
    expect(axial.checkState).toBe("CHECK_UNDETERMINED");
    expect(axial.warnings).toContain("UNSUPPORTED_AXIAL_ACTION");
    expect(NONZERO_AXIAL_ACTION_SILENTLY_IGNORED).toBe(false);
    expect(EU_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT).toBe(true);
    expect(() => resolveEuConcreteCatalogGrade("C30/37")).toThrow(/catalog unpopulated/i);
    expect(EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES).toBe(false);
    expect(EU_CONCRETE_MATERIAL_PROPERTIES_GOVERNED).toBe(true);
    expect(EU_REINFORCEMENT_PROPERTIES_GOVERNED).toBe(true);
    expect(EU_CHARACTERISTIC_AND_DESIGN_MATERIAL_VALUES_SEPARATE).toBe(true);
    expect(EU_DESIGN_STRENGTH_DERIVATION_GOVERNED).toBe(true);
    expect(EU_CONCRETE_COMPRESSION_RESPONSE_FRAMEWORK).toBe(true);
    expect(EU_CONCRETE_COMPRESSION_PARAMETER_GUESSED).toBe(false);
    expect(EU_CONCRETE_TENSION_TREATMENT_EXPLICIT).toBe(true);
    expect(EU_CONCRETE_STRESS_BLOCK_RULE_FRAMEWORK).toBe(true);
  });

  it("isolates multi-country, generation, and international contractual flexure contexts", () => {
    const de = evaluateEuConcreteFlexure(flexureInput({ resolverInput: emptyResolverInput({ projectContext: project("DE") }) }));
    const fr = evaluateEuConcreteFlexure(flexureInput({ resolverInput: emptyResolverInput({ projectContext: project("FR") }) }));
    expect(de.nationalAnnexRef).toBe("NA-DE-EN1992-1-1");
    expect(fr.nationalAnnexRef).toBe("NA-FR-EN1992-1-1");
    expect(de.nationalAnnexRef).not.toBe(fr.nationalAnnexRef);
    const first = evaluateEuConcreteFlexure(flexureInput({
      resolverInput: emptyResolverInput({
        projectContext: project("DE", {
          standardGeneration: "FIRST_GENERATION",
          nationalAnnexSet: [annex("DE", { generationFamily: "FIRST_GENERATION" })],
        }),
      }),
    }));
    const second = evaluateEuConcreteFlexure(flexureInput({
      resolverInput: emptyResolverInput({
        projectContext: project("DE", {
          projectRef: "proj-DE-g2",
          standardGeneration: "SECOND_GENERATION",
          nationalAnnexSet: [annex("DE", { generationFamily: "SECOND_GENERATION" })],
        }),
      }),
    }));
    expect(first.generation).toBe("FIRST_GENERATION");
    expect(second.generation).toBe("SECOND_GENERATION");
    const firstResolved = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE", { standardGeneration: "FIRST_GENERATION", nationalAnnexSet: [annex("DE", { generationFamily: "FIRST_GENERATION" })] }),
      ruleRequiresNdp: false,
    }));
    const secondResolved = resolveEurocodeConcreteContext(emptyResolverInput({
      projectContext: project("DE", { projectRef: "proj-DE-g2", standardGeneration: "SECOND_GENERATION", nationalAnnexSet: [annex("DE", { generationFamily: "SECOND_GENERATION" })] }),
      ruleRequiresNdp: false,
    }));
    expect(firstResolved.ok && secondResolved.ok).toBe(true);
    if (firstResolved.ok && secondResolved.ok) {
      expect(() => assertNoCrossGenerationMixing(firstResolved.context.version, secondResolved.context.version)).toThrow();
    }
    const international = evaluateEuConcreteFlexure(flexureInput({
      resolverInput: emptyResolverInput({
        projectContext: project("SG", {
          jurisdictionProfileRef: "other",
          nationalAnnexRef: null,
          nationalAnnexSet: [],
          ndpSetRef: null,
          internationalContractualUse: true,
          statutoryEuMembershipRequired: false,
          statutoryEuComplianceClaimed: false,
        }),
      }),
    }));
    expect(international.statutoryEuComplianceClaimed).toBe(false);
    expect(international.checkState).toBe("CHECK_UNDETERMINED");
    expect(international.mechanicsState).toBe("EQUILIBRATED");
  });

  it("invalidates stale results, rejects invalid candidates, and refuses undetermined optimization", () => {
    const fp1 = euFlexureFingerprint({
      memberRef: "m1",
      sectionGeometryVersion: "1",
      reinforcementFingerprint: "a",
      concreteMaterialRef: "c",
      reinforcementMaterialRef: "r",
      momentDemandRef: "d",
      combinationId: "c1",
      d1cRevision: "d1c",
      standardFamily: "EN 1992",
      generation: "UNKNOWN_PENDING_CONFIRMATION",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      part: "EN_1992_1_1",
      nationalAnnexRef: "NA-DE-EN1992-1-1",
      ndpSetRef: "NDP-DE",
      materialModelRef: "e",
      stressBlockOrDesignModelRef: null,
      strainLimitRuleRef: null,
      partialFactorRef: null,
      methodVersion: "d1e-eu2.0",
    });
    const fp2 = euFlexureFingerprint({
      memberRef: "m1",
      sectionGeometryVersion: "2",
      reinforcementFingerprint: "a",
      concreteMaterialRef: "c",
      reinforcementMaterialRef: "r",
      momentDemandRef: "d",
      combinationId: "c1",
      d1cRevision: "d1c",
      standardFamily: "EN 1992",
      generation: "UNKNOWN_PENDING_CONFIRMATION",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      part: "EN_1992_1_1",
      nationalAnnexRef: "NA-DE-EN1992-1-1",
      ndpSetRef: "NDP-DE",
      materialModelRef: "e",
      stressBlockOrDesignModelRef: null,
      partialFactorRef: null,
      strainLimitRuleRef: null,
      methodVersion: "d1e-eu2.0",
    });
    expect(fp1).toBe(fp1);
    expect(euFlexureInvalidationTags(fp1, fp2).length).toBeGreaterThan(0);
    expect(() => assertStaleEuFlexureNotReused(euFlexureInvalidationTags(fp1, fp2), true)).toThrow(/stale/i);
    expect(STALE_EU_FLEXURE_RESULT_REUSE_ALLOWED).toBe(false);
    expect(EU_FLEXURE_DEPENDENCY_INVALIDATION).toBe(true);
    expect(HISTORICAL_EU_FLEXURE_RESULT_REPRODUCIBLE).toBe(true);
    const geom = rectangleSection("r", 300, 500, "p");
    const resolved = resolveEurocodeConcreteContext(emptyResolverInput({ projectContext: project("DE"), ruleRequiresNdp: false }));
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(historicalEuConcreteContextRemainsReproducible(snapshotIssuedEuConcreteContext(resolved.context), project("DE")).issued).toBe(true);
    }
    expect(screenEuFlexureCandidate({
      geometry: geom,
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      resolverInput: emptyResolverInput({ projectContext: project("DE"), ruleRequiresNdp: false }),
    }).accepted).toBe(true);
    const bad = twoBarLayout();
    bad.bars = [{ ...bad.bars[0]!, xMm: 900, yMm: 50 }];
    expect(() => screenEuFlexureCandidate({
      geometry: geom,
      layout: bad,
      concrete: concrete(),
      reinforcement: reo(),
      resolverInput: emptyResolverInput({ projectContext: project("DE"), ruleRequiresNdp: false }),
    })).toThrow(/fail closed/i);
    expect(() => screenEuFlexureCandidate({
      geometry: geom,
      layout: twoBarLayout(),
      concrete: concrete(),
      reinforcement: reo(),
      resolverInput: emptyResolverInput({ projectContext: project("DE"), ruleRequiresNdp: false }),
      generativeAttemptedStandardContextChange: true,
    })).toThrow(/standard context/i);
    expect(() => assertEuFlexureOptimizerRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(() => assertEuParetoRejectsUndetermined("CHECK_UNDETERMINED")).toThrow(/undetermined/i);
    expect(EU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(EU_RC_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE).toBe(false);
    expect(GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT).toBe(false);
    expect(GENERATIVE_EU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK).toBe(false);
    expect(EU_RC_INVERSE_DESIGN_HANDOFF_READY).toBe(true);
    expect(euConcreteMtoHandoff({ geometry: geom, layout: twoBarLayout() }).emissionFactorEmbedded).toBe(false);
    expect(EU_RC_MTO_HANDOFF_REUSED).toBe(true);
    expect(DEFAULT_EU_CONCRETE_COST_RATE).toBe(false);
    expect(DEFAULT_EU_CONCRETE_CARBON_FACTOR).toBe(false);
    expect(DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR).toBe(false);
  });

  it("preserves boundaries, AI limits, debt, regressions, and copyright", () => {
    expect(EU_CONCRETE_FLEXURE_METHODS.every((row) => row.methodScope === "MECHANICS_REFERENCE_ONLY" || row.methodScope === "FRAMEWORK_ONLY")).toBe(true);
    expect(EU_CONCRETE_FLEXURE_METHODS.every((row) => row.part === "EN_1992_1_1")).toBe(true);
    expect(EU_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED).toBe(false);
    expect(EU_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED).toBe(false);
    expect(EU_DUCTILITY_LIMIT_GUESSED).toBe(false);
    expect(EU_FLEXURAL_RESISTANCE_EQUALS_DETAILING_COMPLIANCE).toBe(false);
    expect(EU_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_BIAXIAL_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_CRACK_WIDTH_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_LONG_TERM_DEFLECTION_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_CODE_COVER_CHECK_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_DURABILITY_CHECK_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_DEVELOPMENT_LENGTH_IMPLEMENTED).toBe(false);
    expect(NUMERICAL_EU_LAP_SPLICE_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_CONCRETE_COLUMN_STABILITY_CODE_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED).toBe(false);
    expect(EU_FLEXURE_D1C_PROVENANCE).toBe("PASS");
    expect(EU_FLEXURE_RESULT_PROVENANCE).toBe("PASS");
    expect(EU_FLEXURE_INDEPENDENT_BENCHMARKS).toBe("PASS");
    expect(SELF_REFERENTIAL_EU_FLEXURE_BENCHMARKS).toBe(false);
    expect(COMMON_RC_BENCHMARK_EQUALS_EN1992_CONFORMANCE).toBe(false);
    expect(BENCHMARK_EQUALS_EN1992_CONFORMANCE).toBe(false);
    expect(EU_CONCRETE_FLEXURE_RESULT).toBe(true);
    expect(EU_FLEXURE_CHECK_STATE).toBe(true);
    expect(EU_CONCRETE_RESULT_WARNING_MODEL).toBe(true);
    expect(EU_CONCRETE_FLEXURE_FAIL_CLOSED).toBe(true);
    expect(AI_EU_CONCRETE_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(LLM_EU_CONCRETE_NUMERICAL_AUTHORITY).toBe(false);
    expect(AI_EU_STRESS_BLOCK_AUTHORITY).toBe(false);
    expect(AI_PARTIAL_FACTOR_AUTHORITY).toBe(false);
    expect(AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY).toBe(false);
    expect(AI_EU_CONCRETE_NDP_AUTHORITY).toBe(false);
    expect(AI_EN1992_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(AUTOMATIC_EU_CONCRETE_APPROVAL).toBe(false);
    expect(EU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(EU_FLEXURE_HUMAN_VALIDATION_REQUIRED).toBe(true);
    assertEuFlexureAiBoundary();
    expect(() => evaluateEuConcreteFlexure(flexureInput({ generativeAttemptedStandardContextChange: true }))).toThrow(/standard context/i);
    const aiAnnex = evaluateEuConcreteFlexure(flexureInput({
      resolverInput: emptyResolverInput({ projectContext: project("DE"), aiSelectedAnnex: true }),
    }));
    expect(aiAnnex.checkState).toBe("CHECK_UNDETERMINED");
    expect(D1E_EU2_D0_RISK_DISPOSITION.CLOSED).toBe("NONE");
    expect(D1E_EU2_D0_RISK_DISPOSITION.INTRODUCED).toBe("NONE");
    expect(D1E_EU_VALIDATION_DEBT_UPDATED).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-EU-VD-FLEXURE")).toBe(true);
    expect(D1E_VALIDATION_DEBT_REGISTER.some((row) => row.debtId === "D1E-EU-VD-DESIGN-STRENGTH")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.EU.FLEXURE.UNIAXIAL")).toBe(true);
    expect(PARALLEL_CAPABILITY_MANIFEST_CREATED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.length).toBeGreaterThan(D1D_CAPABILITY_MANIFEST.length);
    expect(AU_CONCRETE_FLEXURE_METHODS.length).toBeGreaterThan(0);
    expect(IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(AU_STRESS_BLOCK_RULE.parameters).toBeNull();
    expect(AU_CONCRETE_PARAMETER_LEAKAGE_INTO_EU).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_AU).toBe(false);
    expect(EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.EU_CONCRETE.implemented).toBe(false);
    expect(CONCRETE_ADAPTER_BOUNDARIES.AU_CONCRETE.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.ready).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.ready).toBe(true);
    expect(D1D_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(isEuOnlyArchitecture()).toBe(false);
    expect(EU_ONLY_CONCRETE_CORE).toBe(false);
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(D1E_EU2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK).toBe(true);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_EN1992_TEXT_COMMITTED).toBe(false);
    assertNoCopyrightedEn1992Text();
    const corpus = `${readTree(join(here, "eu-flexure"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E_EU2_RC_FLEXURE.md"), "utf8")}`;
    for (const pattern of [/is EN 1992 compliant/i, /γc\s*=\s*1\.5/, /eta\s*=\s*1\.0/, /lambda\s*=\s*0\.8/, /CONCRETE_PACK_CERTIFIED\s*=\s*true/i]) {
      expect(corpus).not.toMatch(pattern);
    }
  });
});
