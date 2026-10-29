/**
 * EOS-D1E-EU-C10-R1 independent-validation readiness.
 * Evidence inventory and execution plan only. No engineering formula,
 * runtime method, member orchestrator, or conformance promotion.
 */
import {
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_C2_BENCHMARK_SOURCE_INDEPENDENCE,
  EU_C2_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C2_SELF_REFERENTIAL_BENCHMARKS,
  EU_C3_BENCHMARK_SOURCE_INDEPENDENCE,
  EU_C3_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C3_SELF_REFERENTIAL_BENCHMARKS,
  EU_C4_BENCHMARK_SOURCE_INDEPENDENCE,
  EU_C4_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C4_SELF_REFERENTIAL_BENCHMARKS,
  EU_C5_BENCHMARK_SOURCE_INDEPENDENCE,
  EU_C5_EXTERNAL_SOFTWARE_COMPARISON,
  EU_C5_SELF_REFERENTIAL_BENCHMARKS,
  EU_C7_R1_REFERENCE_PROFILE_ID,
  EU_C7_R3_CALCULATED_CREEP_IMPLEMENTED,
  EU_C7_R3_CALCULATED_SHRINKAGE_IMPLEMENTED,
} from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP } from "../capability";
import { EU_C8_R2_COVER_RULE_SOURCE_INDEPENDENCE_STATE } from "../eu-c8/evaluate";
import { EU_C8_R3B_RULE_SOURCE_INDEPENDENCE_STATE } from "../eu-c8/spacing-evaluate";
import { EU_C8_R4B_RULE_SOURCE_INDEPENDENCE_STATE } from "../eu-c8/anchorage-evaluate";
import { EU_C9_DEFERRED_CAPABILITY_IDS } from "../eu-c8/closeout";
import { DEFLECTION_RUNTIME_CAPABILITY } from "../eu-c7/deflection-authority";
import { EU_C7_R1_PRIMARY_SOURCE_ID, EU_C7_R1_PROFILE_SOURCES } from "../eu-c7/profile-binding";
import { EU_C6_R1_CORROBORATING_SOURCE_ID, EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_PRIMARY_SOURCE_ID, EU_C6_R1_TRAINING_SOURCE_ID } from "../eu-c6/profile-binding";
import { EU_C5_T3R_CORROBORATING_SOURCE_IDS, EU_C5_T3R_PRIMARY_SOURCE_ID } from "../eu-c5/profile-binding";
import { EU_C5_SOURCES } from "../eu-c5/parameters";
import { EU_C8_R1_COVER_SOURCE_ID, EU_C8_R1_REFERENCE_PROFILE_ID } from "../eu-c8/profile";
import { EU_C8_R3_SPACING_PROFILE_ID, EU_C8_R3_SPACING_SOURCE_ID } from "../eu-c8/spacing-profile";
import { EU_C8_R4_ANCHORAGE_PROFILE_ID, EU_C8_R4_SOURCE_ID } from "../eu-c8/anchorage-profile";
import {
  EU_C9_BOUNDED_TRACK_COMPLETE,
  EU_C9_COMPLETE_EN1992_MEMBER_DESIGN,
  EU_C9_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT,
  EU_C9_MEMBER_SPECIFIC_VALIDATION_DEBT,
} from "../eu-c9/closeout";

export const NEW_C10_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const NEW_C10_ENGINEERING_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const NEW_C10_MEMBER_ORCHESTRATOR_IMPLEMENTED = false as const;
export const NEW_STRUCTURAL_ANALYSIS_ENGINE_IMPLEMENTED = false as const;
export const D1E_FROZEN_ARCHITECTURE_PRESERVED = true as const;
export const PARALLEL_RULE_REGISTRY_CREATED = false as const;
export const PARALLEL_METHOD_REGISTRY_CREATED = false as const;
export const PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const PARALLEL_VALIDATION_FRAMEWORK_CREATED = false as const;
export const PARALLEL_STANDARD_CONTEXT_CREATED = false as const;
export const C10_READINESS_EQUALS_VALIDATION = false as const;
export const C10_NUMERICAL_VALIDATION_EQUALS_INDEPENDENT_VALIDATION = false as const;
export const C10_INDEPENDENT_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const C10_ENGINEER_VALIDATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const C10_REFERENCE_PROFILE_EQUALS_NATIONAL_PROFILE = false as const;
export const EU_C10_VALIDATION_MATURITY_MODEL = [
  "REFERENCE_IMPLEMENTED",
  "NUMERICALLY_VALIDATED",
  "ENGINEER_VALIDATED",
  "CONFORMANCE_VALIDATED",
] as const;
export const EU_C10_VALIDATION_MATURITY_MODEL_REUSED = true as const;
export const EU_C10_INDEPENDENT_VALIDATION_DEFINITION =
  "Expected or reference result is not generated from the same production implementation and is not copied from its own internal calculation path." as const;
export const EU_C10_INDEPENDENT_EVIDENCE_CATEGORIES = [
  "AUTHORITATIVE_PUBLISHED_EXAMPLE",
  "INDEPENDENT_HAND_CALCULATION",
  "INDEPENDENT_ENGINEERING_SPREADSHEET",
  "CERTIFIED_EXTERNAL_SOFTWARE_REFERENCE",
  "RECOGNIZED_THIRD_PARTY_ENGINEERING_SOFTWARE",
  "PEER_REVIEWED_REFERENCE_RESULT",
  "ENGINEER_AUTHORED_INDEPENDENT_CALCULATION",
  "FORMAL_TEST_VECTOR_FROM_GOVERNED_SOURCE",
] as const;
export const EU_C10_INDEPENDENT_VALIDATION_DEFINITION_COMPLETE = true as const;
export const EU_C10_SELF_REFERENCE_COUNTS_AS_INDEPENDENT_VALIDATION = false as const;
export const LLM_GENERATED_EXPECTED_VALUE_COUNTS_AS_INDEPENDENT_VALIDATION = false as const;
export const EU_C10_CANONICAL_EVIDENCE_CLASSES = [
  "METHOD_SOURCE_AUTHORITY",
  "SOURCE_INDEPENDENCE",
  "NUMERICAL_BENCHMARK",
  "NEGATIVE_FAIL_CLOSED_VALIDATION",
  "UNIT_EQUIVALENCE",
  "ENGINEER_REVIEW",
  "ENGINEER_VALIDATION",
  "NATIONAL_PROFILE_IDENTITY",
  "NDP_VALIDATION",
  "REFERENCE_EXAMPLE_COMPARISON",
  "THIRD_PARTY_SOFTWARE_COMPARISON",
  "MEMBER_ORCHESTRATOR_EQUIVALENCE",
  "CROSS_METHOD_INTEGRATION",
  "PROVENANCE_TRACEABILITY",
  "FINGERPRINT_REPRODUCIBILITY",
  "HISTORICAL_REPRODUCIBILITY",
  "SECURITY_GOVERNANCE",
  "RELEASE_GOVERNANCE",
] as const;
export const EU_C10_EVIDENCE_STATUSES = [
  "PRESENT_VERIFIED",
  "PRESENT_WITH_LIMITATIONS",
  "MISSING",
  "NOT_APPLICABLE",
  "DEFERRED",
  "BLOCKED_AUTHORITY",
  "BLOCKED_PROFILE",
  "BLOCKED_ENGINEER_REVIEW",
  "BLOCKED_INDEPENDENCE",
  "CONFLICTED",
] as const;
export const EU_C10_EVIDENCE_STATUS_TAXONOMY_DEFINED = true as const;
export const EU_C10_IMPLEMENTED_CAPABILITY_INVENTORY = [
  "C2_FLEXURE",
  "C3_UNIAXIAL_AXIAL_FLEXURE",
  "C4_BIAXIAL_PMM",
  "C5_SHEAR",
  "C5_PUNCHING",
  "C5_TORSION",
  "C6_NOMINAL_CURVATURE",
  "C7_CRACK_WIDTH",
  "C7_EXPLICIT_LONG_TERM_STATE",
  "C8_COVER_ASSEMBLY",
  "C8_MINIMUM_CLEAR_SPACING",
  "C8_BASIC_REQUIRED_ANCHORAGE",
  "C9_BEAM_ORCHESTRATION",
  "C9_COLUMN_ORCHESTRATION",
  "C9_SOLID_SLAB_ORCHESTRATION",
  "C9_WALL_SECTION_ORCHESTRATION",
] as const;
export const EU_C10_DEFERRED_CAPABILITY_INVENTORY = [
  "C7_DEFLECTION",
  "C7_CALCULATED_CREEP",
  "C7_CALCULATED_SHRINKAGE",
  "C8_DURABILITY_COVER_LOOKUP",
  "C8_PROVIDED_COVER_COMPLIANCE",
  "C8_UNEQUAL_DIAMETER_SPACING",
  "C8_BUNDLES",
  "C8_MESH",
  "C8_PRESTRESS_SPACING",
  "C8_DESIGN_BOND_STRENGTH_DERIVATION",
  "C8_BOND_CONDITION_DERIVATION",
  "C8_DESIGN_ANCHORAGE",
  "C8_MINIMUM_DESIGN_ANCHORAGE",
  "C8_COMPRESSION_ANCHORAGE",
  "C8_HOOKS_BENDS",
  "C8_LAPS",
  "C9_BIAXIAL_SECOND_ORDER",
  "C9_GENERAL_PDELTA",
  "C9_GENERAL_STRUCTURAL_ANALYSIS",
  "C9_TWO_WAY_SLAB_ANALYSIS",
  "C9_WALL_STABILITY",
  "C9_WALL_SHEAR",
  "C9_WALL_GLOBAL_ANALYSIS",
] as const;
export const EU_C10_VALIDATION_QUEUE = EU_C10_IMPLEMENTED_CAPABILITY_INVENTORY;

const NUMERICAL = "PRESENT_WITH_LIMITATIONS" as const;
const MISSING = "MISSING" as const;
const PROVEN = "PRESENT_VERIFIED" as const;

export const EU_C10_CURRENT_EVIDENCE_MATRIX = [
  { capability: "C2_FLEXURE", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C4_BIAXIAL_PMM", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C5_SHEAR", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "BLOCKED_PROFILE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C5_PUNCHING", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "BLOCKED_PROFILE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C5_TORSION", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C6_NOMINAL_CURVATURE", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: NUMERICAL, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C7_CRACK_WIDTH", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "BLOCKED_INDEPENDENCE", referenceExample: MISSING, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C7_EXPLICIT_LONG_TERM_STATE", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "BLOCKED_INDEPENDENCE", referenceExample: MISSING, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "NOT_APPLICABLE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C8_COVER_ASSEMBLY", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "BLOCKED_INDEPENDENCE", referenceExample: MISSING, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C8_MINIMUM_CLEAR_SPACING", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "BLOCKED_INDEPENDENCE", referenceExample: MISSING, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "BLOCKED_PROFILE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: PROVEN, sourceIndependence: "BLOCKED_INDEPENDENCE", referenceExample: MISSING, thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: MISSING, provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C9_BEAM_ORCHESTRATION", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: "PRESENT_WITH_LIMITATIONS", sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: "NOT_APPLICABLE", thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "NOT_APPLICABLE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C9_COLUMN_ORCHESTRATION", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: "PRESENT_WITH_LIMITATIONS", sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: "NOT_APPLICABLE", thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "NOT_APPLICABLE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C9_SOLID_SLAB_ORCHESTRATION", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: "PRESENT_WITH_LIMITATIONS", sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: "NOT_APPLICABLE", thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "NOT_APPLICABLE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
  { capability: "C9_WALL_SECTION_ORCHESTRATION", implementationState: "IMPLEMENTED_NUMERICALLY_VALIDATED", numericalValidation: NUMERICAL, engineerValidation: MISSING, conformance: "INTENDED_PROFILE", sourceAuthority: "PRESENT_WITH_LIMITATIONS", sourceIndependence: "PRESENT_WITH_LIMITATIONS", referenceExample: "NOT_APPLICABLE", thirdPartySoftware: MISSING, profileValidation: MISSING, ndpValidation: "NOT_APPLICABLE", provenance: PROVEN, fingerprint: PROVEN, failClosed: PROVEN, integration: NUMERICAL },
] as const;

export const EU_C10_READY_WITH_LIMITATIONS_DEFINITION =
  "IMPLEMENTED AND SUFFICIENTLY DEFINED TO ENTER INDEPENDENT VALIDATION, BUT NOT YET INDEPENDENTLY VALIDATED, ENGINEER VALIDATED, OR CONFORMANCE VALIDATED" as const;
export const EU_C10_READY_WITH_LIMITATIONS_DEFINITION_RESULT = "PASS" as const;
export const READY_WITH_LIMITATIONS_EQUALS_NEAR_CONFORMANCE = false as const;

const COMMON_GAPS = [
  "MISSING_INDEPENDENT_VALIDATION",
  "MISSING_ENGINEER_VALIDATION",
  "MISSING_NATIONAL_PROFILE_VALIDATION",
  "MISSING_THIRD_PARTY_OR_REFERENCE_COMPARISON",
] as const;

export const EU_C10_EVIDENCE_GAP_MATRIX = [
  { capability: "C2_FLEXURE", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON", "MISSING_NDP_NATIONAL_VALIDATION"] },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON", "MISSING_NDP_NATIONAL_VALIDATION"] },
  { capability: "C4_BIAXIAL_PMM", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON", "MISSING_NDP_NATIONAL_VALIDATION"] },
  { capability: "C5_SHEAR", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON", "MISSING_NDP_VALUE_VALIDATION"] },
  { capability: "C5_PUNCHING", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON", "MISSING_NDP_VALUE_VALIDATION"] },
  { capability: "C5_TORSION", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON"] },
  { capability: "C6_NOMINAL_CURVATURE", gaps: [...COMMON_GAPS, "MISSING_EXTERNAL_SOFTWARE_COMPARISON", "MISSING_NDP_NATIONAL_VALIDATION"] },
  { capability: "C7_CRACK_WIDTH", gaps: [...COMMON_GAPS, "BLOCKED_INDEPENDENCE_SINGLE_GOVERNED_SOURCE", "MISSING_NDP_NATIONAL_VALIDATION"] },
  { capability: "C7_EXPLICIT_LONG_TERM_STATE", gaps: [...COMMON_GAPS, "BLOCKED_INDEPENDENCE_SINGLE_GOVERNED_SOURCE"] },
  { capability: "C8_COVER_ASSEMBLY", gaps: [...COMMON_GAPS, "BLOCKED_INDEPENDENCE_SINGLE_GOVERNED_SOURCE"] },
  { capability: "C8_MINIMUM_CLEAR_SPACING", gaps: [...COMMON_GAPS, "BLOCKED_INDEPENDENCE_SINGLE_GOVERNED_SOURCE", "MISSING_NDP_VALUE_VALIDATION"] },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", gaps: [...COMMON_GAPS, "BLOCKED_INDEPENDENCE_SINGLE_GOVERNED_SOURCE"] },
  { capability: "C9_BEAM_ORCHESTRATION", gaps: [...COMMON_GAPS, "MISSING_INDEPENDENT_MEMBER_EQUIVALENCE_REVIEW"] },
  { capability: "C9_COLUMN_ORCHESTRATION", gaps: [...COMMON_GAPS, "MISSING_C6_C3_HANDOFF_INDEPENDENT_REVIEW"] },
  { capability: "C9_SOLID_SLAB_ORCHESTRATION", gaps: [...COMMON_GAPS, "MISSING_SLAB_ANALYSIS_BOUNDARY_INDEPENDENT_REVIEW"] },
  { capability: "C9_WALL_SECTION_ORCHESTRATION", gaps: [...COMMON_GAPS, "MISSING_SECTION_ONLY_BOUNDARY_INDEPENDENT_REVIEW"] },
] as const;

export const EU_C10_SOURCE_AUTHORITY_MATRIX = [
  { capability: "C2_FLEXURE", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: ["JRC_WALRAVEN_2008", "TCC_LECTURE2_2016", "OASYS_ADSEC_PARABOLA_RECTANGLE", "PLEVRIS_EC2_ULS_SECTIONS"], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR"], parameterIds: ["gamma_c", "gamma_s"], formulaFingerprint: "C1C_CONSTITUTIVE_PLUS_C2_MATERIAL_INTEGRATION" },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: ["JRC_WALRAVEN_2008", "TCC_LECTURE2_2016", "OASYS_ADSEC_PARABOLA_RECTANGLE"], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL"], parameterIds: ["gamma_c", "gamma_s"], formulaFingerprint: "C1C_CONSTITUTIVE_PLUS_C3_PM_INTEGRATION" },
  { capability: "C4_BIAXIAL_PMM", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: ["JRC_WALRAVEN_2008", "TCC_LECTURE2_2016", "OASYS_ADSEC_PARABOLA_RECTANGLE"], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_RC_BIAXIAL_PMM_EN1992"], parameterIds: ["gamma_c", "gamma_s"], formulaFingerprint: "C1C_CONSTITUTIVE_PLUS_C4_PMM_INTEGRATION" },
  { capability: "C5_SHEAR", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: ["JRC_WALRAVEN_2011", "SOFISTIK_DCE_EN7"], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C5_SHEAR_CONCRETE_RESISTANCE"], parameterIds: ["CRd,c", "v_min_coefficient", "k_depth_numerator"], formulaFingerprint: "EU_C5_SHEAR_PARAMETER_PACK" },
  { capability: "C5_PUNCHING", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: ["INFOGRAPH_EN1992_PUNCHING", "TCC_LECTURE6_2017", "MARKOVA_PUNCHING_2019", "JRC_WALRAVEN_2011"], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C5_PUNCHING_CONTROL_PERIMETER", "EU_C5_PUNCHING_CONCRETE_RESISTANCE", "EU_C5_PUNCHING_DECLARED_CRDC", "EU_C5_PUNCHING_DECLARED_VMIN"], parameterIds: ["CRd,c", "v_min_coefficient", "punching_control_perimeter_offset_factor"], formulaFingerprint: "EU_C5_PUNCHING_INTERIOR_RECTANGULAR" },
  { capability: "C5_TORSION", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C5_T3R_PRIMARY_SOURCE_ID, ...EU_C5_T3R_CORROBORATING_SOURCE_IDS], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C5_T3R_EFFECTIVE_WALL_THICKNESS", "EU_C5_T3R_ENCLOSED_AREA", "EU_C5_T3R_SHEAR_FLOW"], parameterIds: ["effectiveWallThickness", "enclosedArea"], formulaFingerprint: "EU_C5_T3R_RECTANGULAR_TORSION" },
  { capability: "C6_NOMINAL_CURVATURE", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C6_R1_PRIMARY_SOURCE_ID, EU_C6_R1_TRAINING_SOURCE_ID, EU_C6_R1_FORMULA_SOURCE_ID, EU_C6_R1_CORROBORATING_SOURCE_ID], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C6_NOMINAL_CURVATURE", "EU_C6_TO_C3_HANDOFF"], parameterIds: ["phiEf", "c", "nBal", "curvatureBaseFactor", "betaConstant"], formulaFingerprint: "EU_C6_R1_NOMINAL_CURVATURE_PROFILE" },
  { capability: "C7_CRACK_WIDTH", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C7_CRACK_WIDTH"], parameterIds: ["coverCoefficient", "barCoefficient", "k1HighBond", "k2Bending", "ktLong"], formulaFingerprint: "EU_C7_R1_CRACK_WIDTH_PROFILE" },
  { capability: "C7_EXPLICIT_LONG_TERM_STATE", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C7_R1_PRIMARY_SOURCE_ID], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C7_EXPLICIT_CREEP_STATE", "EU_C7_EXPLICIT_SHRINKAGE_STATE"], parameterIds: ["phi", "shrinkageStrain"], formulaFingerprint: "EU_C7_R3_EXPLICIT_LONG_TERM_INPUT" },
  { capability: "C8_COVER_ASSEMBLY", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C8_R1_COVER_SOURCE_ID], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C8_CMIN", "EU_C8_CNOM"], parameterIds: ["absoluteMinimumCoverMm"], formulaFingerprint: "C8-R1-COVER-ASSEMBLY-1" },
  { capability: "C8_MINIMUM_CLEAR_SPACING", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C8_R3_SPACING_SOURCE_ID], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C8_SMIN"], parameterIds: ["barDiameterCoefficient", "aggregateAllowanceMm"], formulaFingerprint: "EU_C8_R3_SMIN" },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", authorityClass: "VALIDATED_ENGINEERING_REFERENCE", sourceIds: [EU_C8_R4_SOURCE_ID], generation: "EN1992-1-1-GEN1", ruleIds: ["EU_C8_R4_LB_RQD_BASIC"], parameterIds: ["diameterDivisor", "designSteelStress", "designBondStrength"], formulaFingerprint: "EU_C8_R4_BASIC_REQUIRED" },
] as const;
export const EU_C10_UNSOURCED_IMPLEMENTED_RULE_COUNT = 0 as const;

export const EU_C10_SOURCE_INDEPENDENCE_MATRIX = [
  { capability: "C2_FLEXURE", state: "CORROBORATED_CONSTITUTIVE_SOURCES_HAND_CALCULATION_RECORDED", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", state: "CORROBORATED_CONSTITUTIVE_SOURCES_HAND_CALCULATION_RECORDED", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C4_BIAXIAL_PMM", state: "CORROBORATED_CONSTITUTIVE_SOURCES_HAND_CALCULATION_RECORDED", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C5_SHEAR", state: "CORROBORATED_PARAMETER_SOURCES", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C5_PUNCHING", state: "CORROBORATED_PARAMETER_SOURCES", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C5_TORSION", state: "CORROBORATED_PARAMETER_SOURCES", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C6_NOMINAL_CURVATURE", state: "CORROBORATED_GOVERNED_SOURCES", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C7_CRACK_WIDTH", state: "SINGLE_GOVERNED_SOURCE", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C7_EXPLICIT_LONG_TERM_STATE", state: "SINGLE_GOVERNED_SOURCE", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C8_COVER_ASSEMBLY", state: "SINGLE_GOVERNED_SOURCE", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C8_MINIMUM_CLEAR_SPACING", state: "SINGLE_GOVERNED_SOURCE", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", state: "SINGLE_GOVERNED_SOURCE", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C9_BEAM_ORCHESTRATION", state: "INHERITED_FROM_UNDERLYING_METHODS", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C9_COLUMN_ORCHESTRATION", state: "INHERITED_FROM_UNDERLYING_METHODS", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C9_SOLID_SLAB_ORCHESTRATION", state: "INHERITED_FROM_UNDERLYING_METHODS", externalSoftware: "NOT_AVAILABLE" },
  { capability: "C9_WALL_SECTION_ORCHESTRATION", state: "INHERITED_FROM_UNDERLYING_METHODS", externalSoftware: "NOT_AVAILABLE" },
] as const;
export const EU_C10_SINGLE_SOURCE_CAPABILITIES = [
  "C7_CRACK_WIDTH",
  "C7_EXPLICIT_LONG_TERM_STATE",
  "C8_COVER_ASSEMBLY",
  "C8_MINIMUM_CLEAR_SPACING",
  "C8_BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C10_MULTI_SOURCE_PREFERRED = true as const;
export const EU_C10_SOURCE_CONFLICT_FAILS_CLOSED = true as const;
export const SOURCE_CONFLICT_AVERAGING_ALLOWED = false as const;
export const SOURCE_CONFLICT_MAJORITY_VOTING_ALLOWED = false as const;
export const AI_SOURCE_CONFLICT_SELECTION_AUTHORITY = false as const;
export const EU_C10_BENCHMARK_TYPE_TAXONOMY = [
  "ALGEBRAIC_REFERENCE",
  "PUBLISHED_WORKED_EXAMPLE",
  "INDEPENDENT_HAND_CALCULATION",
  "INDEPENDENT_SPREADSHEET",
  "EXTERNAL_SOFTWARE",
  "CERTIFIED_EXTERNAL_TOOL",
  "CROSS_IMPLEMENTATION",
  "ROUND_TRIP_UNIT_EQUIVALENCE",
  "BOUNDARY_LIMIT_CASE",
  "NEGATIVE_FAIL_CLOSED_CASE",
] as const;
export const EU_C10_BENCHMARK_INDEPENDENCE_LEVELS = [
  "LEVEL_0_SELF_REFERENCE",
  "LEVEL_1_INDEPENDENT_TEST_DERIVATION",
  "LEVEL_2_INDEPENDENT_REFERENCE_EXAMPLE",
  "LEVEL_3_INDEPENDENT_EXTERNAL_TOOL_OR_ENGINEER",
  "LEVEL_4_MULTI_SOURCE_CROSS_VALIDATED",
] as const;
export const LEVEL_0_ACCEPTABLE_AS_INDEPENDENT_VALIDATION = false as const;

const METHOD_PACKAGE = [
  "REPRESENTATIVE_CASE",
  "BOUNDARY_CASE",
  "UNIT_EQUIVALENCE_CASE",
  "NEGATIVE_FAIL_CLOSED_CASE",
  "PROFILE_MISMATCH_CASE",
  "INDEPENDENT_EXPECTED_VALUE_DERIVATION",
  "EXTERNAL_OR_REFERENCE_COMPARISON_WHERE_PRACTICAL",
] as const;

export const EU_C10_METHOD_BENCHMARK_REQUIREMENT_MATRIX = [
  { capability: "C2_FLEXURE", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_WITH_EXISTING_HAND_DERIVATION" },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_WITH_EXISTING_HAND_DERIVATION" },
  { capability: "C4_BIAXIAL_PMM", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_WITH_EXISTING_HAND_DERIVATION" },
  { capability: "C5_SHEAR", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_FROM_GOVERNED_PUBLISHED_SOURCES" },
  { capability: "C5_PUNCHING", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_FROM_GOVERNED_PUBLISHED_SOURCES" },
  { capability: "C5_TORSION", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_FROM_GOVERNED_PUBLISHED_SOURCES" },
  { capability: "C6_NOMINAL_CURVATURE", package: METHOD_PACKAGE, r2Disposition: "EXECUTABLE_FROM_CORROBORATING_SOURCES" },
  { capability: "C7_CRACK_WIDTH", package: METHOD_PACKAGE, r2Disposition: "BLOCKED_INDEPENDENCE" },
  { capability: "C7_EXPLICIT_LONG_TERM_STATE", package: METHOD_PACKAGE, r2Disposition: "BLOCKED_INDEPENDENCE" },
  { capability: "C8_COVER_ASSEMBLY", package: METHOD_PACKAGE, r2Disposition: "BLOCKED_INDEPENDENCE" },
  { capability: "C8_MINIMUM_CLEAR_SPACING", package: METHOD_PACKAGE, r2Disposition: "BLOCKED_INDEPENDENCE" },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", package: METHOD_PACKAGE, r2Disposition: "BLOCKED_INDEPENDENCE" },
] as const;

const ORCHESTRATOR_PACKAGE = [
  "ROUTING",
  "METHOD_APPLICABILITY",
  "NODE_ROLES",
  "AGGREGATION",
  "UNDERLYING_METHOD_EQUIVALENCE",
  "FAILURE_PROPAGATION",
  "COMPLETENESS_STATE",
  "CLAIM_BOUNDARIES",
] as const;

export const EU_C10_ORCHESTRATOR_BENCHMARK_REQUIREMENT_MATRIX = [
  { capability: "C9_BEAM_ORCHESTRATION", package: ORCHESTRATOR_PACKAGE, equivalenceProvesFormulaTruth: false },
  { capability: "C9_COLUMN_ORCHESTRATION", package: ORCHESTRATOR_PACKAGE, equivalenceProvesFormulaTruth: false },
  { capability: "C9_SOLID_SLAB_ORCHESTRATION", package: ORCHESTRATOR_PACKAGE, equivalenceProvesFormulaTruth: false },
  { capability: "C9_WALL_SECTION_ORCHESTRATION", package: ORCHESTRATOR_PACKAGE, equivalenceProvesFormulaTruth: false },
] as const;
export const EU_C10_COLUMN_SPECIAL_VALIDATION_REQUIREMENTS = [
  "C6_TO_C3_HANDOFF",
  "SINGLE_AXIAL_SIGN_CONVERSION",
  "C6_TOTAL_MOMENT_HANDOFF",
  "PHIEF_SEMANTICS",
  "EFFECTIVE_LENGTH_EXPLICIT_INPUT",
  "C6_TO_C4_PROHIBITED",
  "BIAXIAL_SECOND_ORDER_PROHIBITED",
] as const;
export const EU_C10_SLAB_SPECIAL_VALIDATION_REQUIREMENTS = [
  "STRIP_SECTION_IS_NOT_SLAB_ANALYSIS",
  "C2_SLAB_STRIP_APPLICABILITY",
  "ONE_WAY_SHEAR_SCOPE",
  "PUNCHING_SCOPE",
  "INTERIOR_LOADED_AREA_LIMITATION",
  "NO_AUTOMATIC_REACTION_GENERATION",
  "NO_C4_TWO_WAY_SUBSTITUTION",
  "NO_DEFLECTION",
] as const;
export const EU_C10_WALL_SPECIAL_VALIDATION_REQUIREMENTS = [
  "WALL_CANONICAL_IDENTITY",
  "SECTION_ONLY_CLASSIFICATION",
  "AXIS_MAPPING",
  "LENGTH_THICKNESS_MAPPING",
  "C2_C3_C4_SECTION_ROUTING",
  "C6_EXCLUSION",
  "WALL_SHEAR_EXCLUSION",
  "WALL_STABILITY_EXCLUSION",
  "BOUNDARY_ELEMENT_EXCLUSION",
  "SEISMIC_WALL_EXCLUSION",
] as const;
export const EU_C10_ENGINEER_VALIDATION_DEFINITION_COMPLETE = true as const;
export const EU_C10_ENGINEER_VALIDATION_EVIDENCE_FIELDS = [
  "ENGINEER_IDENTITY_REFERENCE",
  "QUALIFICATION_COMPETENCE_BASIS",
  "REVIEW_SCOPE",
  "CAPABILITY_VERSION",
  "PROFILE_REVIEWED",
  "BENCHMARK_SET_REVIEWED",
  "EXCEPTIONS",
  "LIMITATIONS",
  "REVIEW_DATE",
  "REVIEW_OUTCOME",
  "SIGNOFF_EVIDENCE",
] as const;
export const EU_C10_ENGINEER_VALIDATION_EVIDENCE_CONTRACT_DEFINED = true as const;
export const EU_C10_ENGINEER_PERSONAL_DATA_IN_PRODUCT_RUNTIME = false as const;
export const AI_ENGINEER_VALIDATION_AUTHORITY = false as const;
export const DEVELOPER_SELF_ASSERTION_COUNTS_AS_ENGINEER_VALIDATION = false as const;
export const NUMERICAL_TEST_PASS_COUNTS_AS_ENGINEER_VALIDATION = false as const;
export const EU_C10_ENGINEER_VALIDATION_SCOPE_MODEL = "METHOD_AND_ORCHESTRATOR_AND_PROFILE" as const;
export const EU_C10_NATIONAL_PROFILE_EVIDENCE_CONTRACT = [
  "JURISDICTION",
  "STANDARD_GENERATION_EDITION",
  "AMENDMENT_STATE",
  "NATIONAL_ANNEX_IDENTITY",
  "NDP_PARAMETER_IDENTITY",
  "NDP_PARAMETER_VALUES",
  "UNITS",
  "SOURCE_AUTHORITY",
  "EFFECTIVE_DATE_VERSION",
  "APPLICABILITY",
  "PROFILE_FINGERPRINT",
] as const;
export const NATIONAL_ANNEX_DOCUMENT_REQUIRED_IN_REPOSITORY = false as const;
export const FULL_NATIONAL_ANNEX_TEXT_REQUIRED = false as const;
export const EU_C10_NA_COPYRIGHT_AND_ENGINEERING_AUTHORITY_SEPARATED = true as const;
export const NATIONAL_PROFILE_INFERRED_FROM_LOCATION = false as const;
export const AI_NATIONAL_PROFILE_AUTHORITY = false as const;
export const EU_C10_NDP_DEPENDENT_CAPABILITY_MATRIX = [
  { capability: "C2_FLEXURE", parameterId: "gamma_c", profile: "EN1992-1-1-GEN1-REFERENCE", source: "PARTIAL_FACTOR_RESOLVER", value: "EXPLICIT_PROFILE_INPUT", units: "1", applicability: "normal design partial factor", validationState: "MISSING" },
  { capability: "C2_FLEXURE", parameterId: "gamma_s", profile: "EN1992-1-1-GEN1-REFERENCE", source: "PARTIAL_FACTOR_RESOLVER", value: "EXPLICIT_PROFILE_INPUT", units: "1", applicability: "normal design partial factor", validationState: "MISSING" },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", parameterId: "gamma_c", profile: "EN1992-1-1-GEN1-REFERENCE", source: "PARTIAL_FACTOR_RESOLVER", value: "EXPLICIT_PROFILE_INPUT", units: "1", applicability: "normal design partial factor", validationState: "MISSING" },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", parameterId: "gamma_s", profile: "EN1992-1-1-GEN1-REFERENCE", source: "PARTIAL_FACTOR_RESOLVER", value: "EXPLICIT_PROFILE_INPUT", units: "1", applicability: "normal design partial factor", validationState: "MISSING" },
  { capability: "C4_BIAXIAL_PMM", parameterId: "gamma_c", profile: "EN1992-1-1-GEN1-REFERENCE", source: "PARTIAL_FACTOR_RESOLVER", value: "EXPLICIT_PROFILE_INPUT", units: "1", applicability: "normal design partial factor", validationState: "MISSING" },
  { capability: "C4_BIAXIAL_PMM", parameterId: "gamma_s", profile: "EN1992-1-1-GEN1-REFERENCE", source: "PARTIAL_FACTOR_RESOLVER", value: "EXPLICIT_PROFILE_INPUT", units: "1", applicability: "normal design partial factor", validationState: "MISSING" },
  { capability: "C5_SHEAR", parameterId: "CRd,c", profile: "EN1992-1-1-GEN1-REFERENCE", source: "JRC_WALRAVEN_2011+SOFISTIK_DCE_EN7+INFOGRAPH_EN1992_PUNCHING", value: "EXPLICIT_DECLARED_INPUT", units: "1", applicability: "declared shear coefficient; recommended value is not packed", validationState: "MISSING" },
  { capability: "C5_SHEAR", parameterId: "v_min_coefficient", profile: "EN1992-1-1-GEN1-REFERENCE", source: "SOFISTIK_DCE_EN7+INFOGRAPH_EN1992_PUNCHING", value: "EXPLICIT_DECLARED_INPUT", units: "1", applicability: "declared minimum-stress coefficient", validationState: "MISSING" },
  { capability: "C5_PUNCHING", parameterId: "CRd,c", profile: "EN1992-1-1-GEN1-REFERENCE", source: "JRC_WALRAVEN_2011+INFOGRAPH_EN1992_PUNCHING", value: "EXPLICIT_DECLARED_INPUT", units: "1", applicability: "declared punching coefficient", validationState: "MISSING" },
  { capability: "C5_PUNCHING", parameterId: "v_min_coefficient", profile: "EN1992-1-1-GEN1-REFERENCE", source: "INFOGRAPH_EN1992_PUNCHING", value: "EXPLICIT_DECLARED_INPUT", units: "1", applicability: "declared punching minimum-stress coefficient", validationState: "MISSING" },
  { capability: "C6_NOMINAL_CURVATURE", parameterId: "phiEf", profile: "EN1992-1-1-GEN1-C6-REFERENCE", source: EU_C6_R1_PRIMARY_SOURCE_ID, value: "EXPLICIT_INPUT", units: "1", applicability: "effective creep ratio; not C7 phi", validationState: "MISSING" },
  { capability: "C6_NOMINAL_CURVATURE", parameterId: "c", profile: "EN1992-1-1-GEN1-C6-REFERENCE", source: EU_C6_R1_TRAINING_SOURCE_ID, value: "DESIGNER_SELECTED_WITHIN_BOUNDS", units: "1", applicability: "curvature distribution factor", validationState: "MISSING" },
  { capability: "C7_CRACK_WIDTH", parameterId: "coverCoefficient", profile: EU_C7_R1_REFERENCE_PROFILE_ID, source: EU_C7_R1_PRIMARY_SOURCE_ID, value: "REFERENCE_PROFILE_BOUND", units: "1", applicability: "crack-spacing cover term", validationState: "MISSING" },
  { capability: "C7_CRACK_WIDTH", parameterId: "ktLong", profile: EU_C7_R1_REFERENCE_PROFILE_ID, source: EU_C7_R1_PRIMARY_SOURCE_ID, value: "REFERENCE_PROFILE_BOUND", units: "1", applicability: "long-term tension stiffening", validationState: "MISSING" },
  { capability: "C8_COVER_ASSEMBLY", parameterId: "absoluteMinimumCoverMm", profile: EU_C8_R1_REFERENCE_PROFILE_ID, source: EU_C8_R1_COVER_SOURCE_ID, value: "REFERENCE_PROFILE_BOUND", units: "mm", applicability: "absolute minimum cover; durability lookup remains deferred", validationState: "MISSING" },
  { capability: "C8_MINIMUM_CLEAR_SPACING", parameterId: "barDiameterCoefficient", profile: EU_C8_R3_SPACING_PROFILE_ID, source: EU_C8_R3_SPACING_SOURCE_ID, value: "EXPLICIT_NDP_INPUT", units: "1", applicability: "equal-diameter clear spacing", validationState: "MISSING" },
  { capability: "C8_MINIMUM_CLEAR_SPACING", parameterId: "aggregateAllowanceMm", profile: EU_C8_R3_SPACING_PROFILE_ID, source: EU_C8_R3_SPACING_SOURCE_ID, value: "EXPLICIT_NDP_INPUT", units: "mm", applicability: "aggregate allowance", validationState: "MISSING" },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", parameterId: "diameterDivisor", profile: EU_C8_R4_ANCHORAGE_PROFILE_ID, source: EU_C8_R4_SOURCE_ID, value: "REFERENCE_PROFILE_BOUND", units: "1", applicability: "basic required straight-bar tension length", validationState: "MISSING" },
] as const;
export const EU_C10_NDP_SEMANTIC_IDENTITY_REQUIRED = true as const;
export const EU_C10_NDP_VALUE_ONLY_MATCH_COUNTS_AS_VALIDATION = false as const;
export const EU_C10_THIRD_PARTY_OR_REFERENCE_COMPARISON_PLAN = [
  "RECOGNIZED_ENGINEERING_SOFTWARE",
  "PUBLISHED_WORKED_EXAMPLE",
  "INSTITUTIONAL_REFERENCE_CALCULATION",
  "INDEPENDENT_ENGINEER_CALCULATION",
  "CERTIFIED_EXTERNAL_TOOL_RESULT",
] as const;
export const EU_C10_EXTERNAL_TOOL_COMPARISON_FIELDS = [
  "TOOL_NAME",
  "VERSION",
  "METHOD_PROFILE_ASSUMPTIONS",
  "INPUT_MAPPING",
  "OUTPUT_MAPPING",
  "TOLERANCES",
  "KNOWN_IMPLEMENTATION_DIFFERENCES",
  "COMPARISON_DATE",
] as const;
export const EU_C10_EXTERNAL_TOOL_COMPARISON_CONTRACT_DEFINED = true as const;
export const EU_C10_REFERENCE_EXAMPLE_FIELDS = [
  "SOURCE",
  "EDITION_VERSION",
  "PROBLEM_DEFINITION",
  "PROFILE_ASSUMPTIONS",
  "INPUT_TRANSFORMATION",
  "EXPECTED_OUTPUTS",
  "TOLERANCE",
  "KNOWN_DIFFERENCES",
] as const;
export const EU_C10_REFERENCE_EXAMPLE_CONTRACT_DEFINED = true as const;
export const EU_C10_TOLERANCE_CATEGORIES = [
  "EXACT_ALGEBRAIC",
  "FLOATING_POINT_ALGEBRAIC",
  "ITERATIVE_EQUILIBRIUM",
  "INTERACTION_SURFACE",
  "ENGINEERING_ROUNDING",
  "EXTERNAL_TOOL_COMPARISON",
] as const;
export const EU_C10_TOLERANCE_POLICY_DEFINED = true as const;
export const EU_C10_UNIVERSAL_PERCENTAGE_TOLERANCE_ALLOWED = false as const;
export const EU_C10_DISPLAY_ROUNDING_DOES_NOT_DEFINE_NUMERICAL_TOLERANCE = true as const;
export const EU_C10_UNIT_EQUIVALENCE_REQUIRED = true as const;
export const EU_C10_BOUNDARY_CASE_PLAN = [
  { capability: "C2_FLEXURE", boundaries: ["ZERO_MOMENT", "PURE_FLEXURE_AXIAL_EDGE", "NON_RECTANGULAR_UNSUPPORTED"] },
  { capability: "C3_UNIAXIAL_AXIAL_FLEXURE", boundaries: ["PURE_AXIAL", "BALANCED_REGION_EDGE", "TENSION_AXIAL"] },
  { capability: "C4_BIAXIAL_PMM", boundaries: ["ZERO_MINOR_MOMENT", "UNIAXIAL_REDUCTION", "UNSUPPORTED_GEOMETRY"] },
  { capability: "C5_SHEAR", boundaries: ["ZERO_SHEAR", "NONZERO_AXIAL_UNSUPPORTED", "MISSING_NDP"] },
  { capability: "C5_PUNCHING", boundaries: ["INTERIOR_RECTANGULAR_EDGE", "NON_INTERIOR_UNSUPPORTED", "MISSING_FORCE"] },
  { capability: "C5_TORSION", boundaries: ["ZERO_TORSION", "UNSUPPORTED_SECTION", "MISSING_REINFORCEMENT"] },
  { capability: "C6_NOMINAL_CURVATURE", boundaries: ["EFFECTIVE_LENGTH_EDGE", "CURVATURE_FACTOR_BOUNDS", "C4_HANDOFF_BLOCKED"] },
  { capability: "C7_CRACK_WIDTH", boundaries: ["ZERO_TENSION", "UNSUPPORTED_MEMBER", "MISSING_PROFILE"] },
  { capability: "C7_EXPLICIT_LONG_TERM_STATE", boundaries: ["MISSING_EXPLICIT_INPUT", "CALCULATED_MODEL_REJECTED"] },
  { capability: "C8_COVER_ASSEMBLY", boundaries: ["ZERO_DEVIATION", "MISSING_COMPONENT", "DURABILITY_LOOKUP_REJECTED"] },
  { capability: "C8_MINIMUM_CLEAR_SPACING", boundaries: ["EQUAL_DIAMETER_EDGE", "UNEQUAL_DIAMETER_REJECTED", "MISSING_AGGREGATE"] },
  { capability: "C8_BASIC_REQUIRED_ANCHORAGE", boundaries: ["ZERO_AVAILABLE_LENGTH", "COMPRESSION_REJECTED", "DESIGN_FACTORS_REJECTED"] },
] as const;
export const EU_C10_NEGATIVE_VALIDATION_PLAN_DEFINED = true as const;
export const EU_C10_NEGATIVE_VALIDATION_CASES = [
  "MISSING_PROFILE",
  "WRONG_GENERATION",
  "MISSING_GOVERNED_INPUTS",
  "INVALID_UNITS",
  "UNSUPPORTED_GEOMETRY",
  "UNSUPPORTED_MEMBER_TYPE",
  "UNSUPPORTED_FORCE_STATE",
  "STALE_FINGERPRINTS",
  "SOURCE_CONFLICT",
] as const;
export const EU_C10_CROSS_METHOD_INTEGRATION_PLAN = [
  "D1C_ACTION_TO_C2_C3_C4",
  "C6_TO_C3",
  "C7_PHI_DISTINCT_FROM_C6_PHIEF",
  "C8_COVER_REQUIREMENT_DISTINCT_FROM_PROVIDED_COVER",
  "C8_SPACING_DISTINCT_FROM_ANCHORAGE_CONFINEMENT",
  "C8_BASIC_ANCHORAGE_DISTINCT_FROM_DESIGN_ANCHORAGE",
  "C9_AGGREGATION_PRESERVES_UNDERLYING_STATES",
] as const;
export const EU_C10_MEMBER_ORCHESTRATOR_EQUIVALENCE_PLAN =
  "For identical normalized inputs, each C9 orchestrator method output must equal the direct underlying method output. Equivalence proves routing. It does not independently validate the underlying formula." as const;
export const EU_C10_CLAIM_VALIDATION_PLAN = [
  "REFERENCE_CAPABILITY",
  "NUMERICALLY_VALIDATED",
  "ENGINEER_VALIDATED",
  "CONFORMANCE_VALIDATED",
  "FULL_STANDARD_COVERAGE",
  "MEMBER_DESIGN_COMPLETENESS",
  "STRUCTURAL_ANALYSIS_AVAILABILITY",
] as const;
export const EU_C10_CONFORMANCE_GATE_REQUIREMENTS = [
  "GOVERNED_METHOD_AUTHORITY",
  "INDEPENDENT_NUMERICAL_VALIDATION",
  "ENGINEER_VALIDATION",
  "PROFILE_IDENTITY_VALIDATION",
  "REQUIRED_NDP_VALIDATION",
  "INTEGRATION_VALIDATION",
  "CLAIM_BOUNDARY_VALIDATION",
  "PROVENANCE_REPRODUCIBILITY",
  "SECURITY_RELEASE_GOVERNANCE",
  "DEFERRED_SCOPE_RESOLVED_OR_EXPLICITLY_EXCLUDED",
] as const;
export const EU_C10_BOUNDED_CONFORMANCE_MODEL = "METHOD_PROFILE_SCOPE_SPECIFIC" as const;
export const ONE_VALIDATED_METHOD_PROMOTES_ENTIRE_CONCRETE_PACK = false as const;
export const EU_C10_CONFORMANCE_SCOPE_IDENTITY_CONTRACT = [
  "METHOD",
  "PROFILE",
  "GENERATION",
  "JURISDICTION",
  "MEMBER_OR_SECTION_SCOPE",
  "VERSION",
  "RULE_FINGERPRINT",
  "PARAMETER_FINGERPRINT",
] as const;
export const C10_R1_CAN_SET_PACK_CERTIFIED = false as const;
export const FORMAL_STANDARD_CONFORMANCE_VALIDATED = false as const;
export const C10_R1_CAN_SET_FORMAL_CONFORMANCE = false as const;
export const EU_C10_ENGINEER_VALIDATED_METHOD_COUNT = 0 as const;
export const EU_C10_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT = 0 as const;
export const EU_C10_VALIDATION_LEDGER_FIELDS = [
  "CAPABILITY_ID",
  "METHOD_OR_ORCHESTRATOR_VERSION",
  "PROFILE_ID",
  "EVIDENCE_CLASS",
  "EVIDENCE_SOURCE_REFERENCE",
  "EVIDENCE_STATUS",
  "INDEPENDENCE_LEVEL",
  "BENCHMARK_OR_REFERENCE_ID",
  "REVIEW_STATE",
  "ENGINEER_VALIDATION_STATE",
  "NATIONAL_PROFILE_STATE",
  "CONFORMANCE_STATE",
  "EXCEPTIONS",
  "TIMESTAMP_VERSION",
  "FINGERPRINTS",
] as const;
export const EU_C10_VALIDATION_LEDGER_CONTRACT_DEFINED = true as const;
export const EU_C10_VALIDATION_LEDGER_PERSISTENCE_SCHEMA_CREATED = false as const;
export const EU_C10_VALIDATION_EVIDENCE_VERSION_BOUND = true as const;
export const EU_C10_STALE_VALIDATION_EVIDENCE_REUSE_ALLOWED = false as const;
export const EU_C10_EVIDENCE_FINGERPRINT_BINDING = [
  "METHOD_VERSION",
  "FORMULA_FINGERPRINT",
  "PARAMETER_PROFILE_FINGERPRINT",
  "BENCHMARK_INPUTS",
  "EXPECTED_OUTPUTS",
  "TOLERANCE_POLICY",
] as const;
export const EU_C10_EVIDENCE_FINGERPRINT_BINDING_DEFINED = true as const;
export const EU_C10_VALIDATION_INVALIDATION_CONTRACT_DEFINED = true as const;
export const EU_C10_EVIDENCE_TRACEABILITY_CONTRACT_DEFINED = true as const;
export const EU_C10_R2_BENCHMARK_PRIORITY_ORDER = [
  "C2_FLEXURE",
  "C3_UNIAXIAL_AXIAL_FLEXURE",
  "C4_BIAXIAL_PMM",
  "C6_NOMINAL_CURVATURE",
  "C5_SHEAR",
  "C5_PUNCHING",
  "C5_TORSION",
  "C9_COLUMN_ORCHESTRATION",
  "C9_BEAM_ORCHESTRATION",
  "C9_SOLID_SLAB_ORCHESTRATION",
  "C9_WALL_SECTION_ORCHESTRATION",
  "C7_CRACK_WIDTH",
  "C7_EXPLICIT_LONG_TERM_STATE",
  "C8_COVER_ASSEMBLY",
  "C8_MINIMUM_CLEAR_SPACING",
  "C8_BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C10_R2_BENCHMARK_GROUPS = [
  { group: "A", capabilities: ["C2_FLEXURE", "C3_UNIAXIAL_AXIAL_FLEXURE", "C4_BIAXIAL_PMM"] },
  { group: "B", capabilities: ["C5_SHEAR", "C5_PUNCHING", "C5_TORSION"] },
  { group: "C", capabilities: ["C6_NOMINAL_CURVATURE"] },
  { group: "D", capabilities: ["C7_CRACK_WIDTH", "C7_EXPLICIT_LONG_TERM_STATE"] },
  { group: "E", capabilities: ["C8_COVER_ASSEMBLY", "C8_MINIMUM_CLEAR_SPACING", "C8_BASIC_REQUIRED_ANCHORAGE"] },
  { group: "F", capabilities: ["C9_BEAM_ORCHESTRATION", "C9_COLUMN_ORCHESTRATION", "C9_SOLID_SLAB_ORCHESTRATION", "C9_WALL_SECTION_ORCHESTRATION"] },
] as const;
export const EU_C10_R2_CAN_GENERATE_EXPECTED_TRUTH_WITH_LLM = false as const;
export const EU_C10_R3_ENGINEER_VALIDATION_PLAN =
  "Prepare review packs, record review outcomes, and bind sign-off to exact versions and fingerprints. AI review and developer assertion do not replace qualified engineer review." as const;
export const EU_C10_R4_NATIONAL_PROFILE_PLAN =
  "Validate explicit profile and NDP identity, values, units, and fingerprints without placing copyrighted standard text in the repository or runtime." as const;
export const EU_C10_R5_INTEGRATION_PLAN =
  "Verify action-to-section, C6-to-C3, long-term versus phiEf, detailing distinctions, and orchestrator aggregation. Do not invent new engineering rules." as const;
export const EU_C10_FINAL_DECISION_GATE_PLAN =
  "Evaluate only recorded evidence. Missing evidence stays missing. The decision phase cannot manufacture conformance, certification, or engineer validation." as const;
export const EU_C10_CANONICAL_PHASE_SEQUENCE = [
  "EOS-D1E-EU-C10-R1-INDEPENDENT-VALIDATION-READINESS",
  "EOS-D1E-EU-C10-R2-METHOD-MEMBER-BENCHMARKS",
  "EOS-D1E-EU-C10-R3-ENGINEER-VALIDATION-EVIDENCE",
  "EOS-D1E-EU-C10-R4-NATIONAL-PROFILE-NDP-VALIDATION",
  "EOS-D1E-EU-C10-R5-CROSS-METHOD-INTEGRATION-VALIDATION",
  "EOS-D1E-EU-C10-FINAL-CONFORMANCE-RELEASE-DECISION",
] as const;
export const EU_C10_DEFERRED_CAPABILITIES_AUTOMATICALLY_INCLUDED_IN_CONFORMANCE = false as const;
export const C10_R1_PRODUCT_CLAIM_PROMOTION = false as const;
export const AI_C10_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_C10_NUMERICAL_AUTHORITY = false as const;
export const AI_BENCHMARK_TRUTH_AUTHORITY = false as const;
export const AI_NDP_AUTHORITY = false as const;
export const AI_CONFORMANCE_AUTHORITY = false as const;
export const AI_CERTIFICATION_AUTHORITY = false as const;
export const AI_ENGINEERING_APPROVAL = false as const;
export const EU_VALIDATION_DEBT_REDUCED_ITEMS = [
  "C10_EVIDENCE_ARCHITECTURE",
  "C10_VALIDATION_READINESS_CLASSIFICATION",
  "C10_BENCHMARK_EXECUTION_PLAN",
  "C10_ENGINEER_VALIDATION_PLAN",
  "C10_NATIONAL_PROFILE_VALIDATION_PLAN",
  "C10_INTEGRATION_VALIDATION_PLAN",
  "C10_CONFORMANCE_GATE_DEFINITION",
] as const;
export const EU_VALIDATION_DEBT_REMAINING_ITEMS = [
  "ENGINEER_VALIDATION",
  "INDEPENDENT_BENCHMARK_EXECUTION",
  "NATIONAL_PROFILE_VALIDATION",
  "NDP_VALIDATION",
  "THIRD_PARTY_COMPARISON",
  "FORMAL_CONFORMANCE",
] as const;
export const SCHEMA_CHANGE_REQUIRED = false as const;
export const EU_C10_NEXT_PHASE = "EOS-D1E-EU-C10-R2-METHOD-MEMBER-BENCHMARKS" as const;
export const EU_C10_NEXT_PHASE_TYPE = "EU_C10_INDEPENDENT_BENCHMARK_EXECUTION" as const;
export const EU_C10_NEXT_PHASE_SCOPE =
  "EXECUTE INDEPENDENT METHOD AND MEMBER BENCHMARKS USING GOVERNED NON-SELF-REFERENTIAL REFERENCE EVIDENCE WITHOUT PROMOTING ENGINEER VALIDATION OR FORMAL CONFORMANCE" as const;

const IMPLEMENTED_MANIFEST_IDS = [
  "D1E.EU.C2.FLEXURE.UNIAXIAL",
  "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL",
  "D1E.EU.C4.BIAXIAL.PMM",
  "D1E.EU.C5.SHEAR",
  "D1E.EU.C5.PUNCHING",
  "D1E.EU.C5.TORSION",
  "D1E.EU.C6.NOMINAL_CURVATURE",
  "D1E.EU.C7.SLS_REFERENCE",
  "D1E.EU.C7.EXPLICIT_LONG_TERM",
  "D1E.EU.C8.COVER_ASSEMBLY",
  "D1E.EU.C8.MIN_CLEAR_SPACING",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
  "D1E.EU.C9.BEAM_ORCHESTRATION",
  "D1E.EU.C9.COLUMN_ORCHESTRATION",
  "D1E.EU.C9.SOLID_SLAB_ORCHESTRATION",
  "D1E.EU.C9.WALL_SECTION_ORCHESTRATION",
] as const;

export function assertEuC10ReadinessPreservesLimits(): void {
  if (EU_CONCRETE_PRODUCT_CLAIM_LEVEL !== "EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY") throw new Error("C10-R1 cannot promote the product claim");
  if (EU_CONCRETE_PACK_CERTIFIED || C10_R1_CAN_SET_PACK_CERTIFIED) throw new Error("C10-R1 cannot certify the pack");
  if (EU_CONCRETE_STANDARD_CONFORMANCE_STATE !== "INTENDED_PROFILE" || FORMAL_STANDARD_CONFORMANCE_VALIDATED || C10_R1_CAN_SET_FORMAL_CONFORMANCE) {
    throw new Error("C10-R1 cannot promote formal conformance");
  }
  if (EU_C10_ENGINEER_VALIDATED_METHOD_COUNT !== 0 || EU_C10_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT !== 0 || EU_C9_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT !== 0) {
    throw new Error("engineer validation remains absent");
  }
  if (!EU_C9_BOUNDED_TRACK_COMPLETE || EU_C9_COMPLETE_EN1992_MEMBER_DESIGN) throw new Error("C9 closeout state drifted");
  if (EU_C8_R2_COVER_RULE_SOURCE_INDEPENDENCE_STATE !== "SINGLE_GOVERNED_SOURCE" || EU_C8_R3B_RULE_SOURCE_INDEPENDENCE_STATE !== "SINGLE_GOVERNED_SOURCE" || EU_C8_R4B_RULE_SOURCE_INDEPENDENCE_STATE !== "SINGLE_GOVERNED_SOURCE") {
    throw new Error("C8 single-source state drifted");
  }
  if (EU_C7_R1_PROFILE_SOURCES.length !== 1 || EU_C7_R1_PROFILE_SOURCES[0] !== EU_C7_R1_PRIMARY_SOURCE_ID) {
    throw new Error("C7 profile is not a single governed source");
  }
  if (EU_C2_SELF_REFERENTIAL_BENCHMARKS || EU_C3_SELF_REFERENTIAL_BENCHMARKS || EU_C4_SELF_REFERENTIAL_BENCHMARKS || EU_C5_SELF_REFERENTIAL_BENCHMARKS) {
    throw new Error("recorded section benchmarks changed self-reference state");
  }
  if (EU_C2_BENCHMARK_SOURCE_INDEPENDENCE !== "PASS" || EU_C3_BENCHMARK_SOURCE_INDEPENDENCE !== "PASS" || EU_C4_BENCHMARK_SOURCE_INDEPENDENCE !== "PASS" || EU_C5_BENCHMARK_SOURCE_INDEPENDENCE !== "PASS") {
    throw new Error("recorded benchmark independence flag drifted");
  }
  if (EU_C2_EXTERNAL_SOFTWARE_COMPARISON !== "NOT_AVAILABLE" || EU_C3_EXTERNAL_SOFTWARE_COMPARISON !== "NOT_AVAILABLE" || EU_C4_EXTERNAL_SOFTWARE_COMPARISON !== "NOT_AVAILABLE" || EU_C5_EXTERNAL_SOFTWARE_COMPARISON !== "NOT_AVAILABLE") {
    throw new Error("external software comparison was promoted without a new contract");
  }
  if (DEFLECTION_RUNTIME_CAPABILITY !== "NOT_IMPLEMENTED" || EU_C7_R3_CALCULATED_CREEP_IMPLEMENTED || EU_C7_R3_CALCULATED_SHRINKAGE_IMPLEMENTED) {
    throw new Error("deferred C7 runtime changed");
  }
  const deferredIds = [
    "DEFLECTION",
    "CALCULATED_CREEP",
    "CALCULATED_SHRINKAGE",
    "DURABILITY_COVER_LOOKUP",
    "PROVIDED_COVER_COMPLIANCE",
    "UNEQUAL_DIAMETER_SPACING",
    "BUNDLE_SPACING",
    "MESH_SPACING",
    "PRESTRESS_SPACING",
    "DESIGN_BOND_STRENGTH_DERIVATION",
    "BOND_CONDITION_DERIVATION",
    "DESIGN_ANCHORAGE",
    "MINIMUM_DESIGN_ANCHORAGE",
    "COMPRESSION_ANCHORAGE",
    "HOOKED_BENT_BAR_ANCHORAGE",
    "LAPS",
  ];
  for (const id of deferredIds) {
    if (!EU_C9_DEFERRED_CAPABILITY_IDS.includes(id as (typeof EU_C9_DEFERRED_CAPABILITY_IDS)[number])) throw new Error(`deferred capability disappeared: ${id}`);
  }
  const columnDebt: readonly string[] = EU_C9_MEMBER_SPECIFIC_VALIDATION_DEBT.COLUMN;
  const slabDebt: readonly string[] = EU_C9_MEMBER_SPECIFIC_VALIDATION_DEBT.SLAB;
  const wallDebt: readonly string[] = EU_C9_MEMBER_SPECIFIC_VALIDATION_DEBT.WALL;
  for (const id of ["BIAXIAL_SECOND_ORDER", "GENERAL_PDELTA", "GENERAL_FRAME_ANALYSIS"]) {
    if (!columnDebt.includes(id)) throw new Error(`column debt disappeared: ${id}`);
  }
  if (!slabDebt.includes("TWO_WAY_SLAB_ANALYSIS") || !wallDebt.includes("WALL_STABILITY") || !wallDebt.includes("WALL_SHEAR") || !wallDebt.includes("WALL_GLOBAL_ANALYSIS")) {
    throw new Error("C9 member debt disappeared");
  }
  const unsourced = EU_C10_SOURCE_AUTHORITY_MATRIX.filter((row) => (row.sourceIds as readonly string[]).length === 0);
  if (unsourced.length !== EU_C10_UNSOURCED_IMPLEMENTED_RULE_COUNT) throw new Error("unsourced implemented rule count drifted");
  for (const id of IMPLEMENTED_MANIFEST_IDS) {
    const row = CONCRETE_CAPABILITY_MANIFEST.find((item) => item.capabilityId === id);
    if (!row || row.conformanceState !== "INTENDED_PROFILE" || row.validationState !== "NUMERICALLY_VALIDATED") {
      throw new Error(`manifest validation drifted: ${id}`);
    }
  }
  if (D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R1-INDEPENDENT-VALIDATION-READINESS")?.status !== "CLOSED") {
    throw new Error("C10-R1 roadmap is not closed");
  }
  if (D1E_INTERNAL_ROADMAP.find((row) => row.id === EU_C10_NEXT_PHASE)?.status !== "CLOSED") {
    throw new Error("C10-R2 benchmark execution is not closed");
  }
  if (D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R3A-ENGINEER-REVIEW-PACK-PREPARATION")?.status !== "CLOSED") {
    throw new Error("C10-R3A review-pack preparation is not closed");
  }
  if (D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R3-ENGINEER-VALIDATION-EVIDENCE")?.status !== "NOT_STARTED") {
    throw new Error("C10-R3 must remain not started");
  }
  if (D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C10-R3B-ENGINEER-VALIDATION-EVIDENCE-INGESTION")?.status !== "NOT_STARTED") {
    throw new Error("C10-R3B must remain not started until human evidence exists");
  }
  if (EU_C5_SOURCES.length < 2) throw new Error("C5 source inventory collapsed");
  for (const deferred of EU_C10_DEFERRED_CAPABILITY_INVENTORY) {
    if (EU_C10_VALIDATION_QUEUE.includes(deferred as (typeof EU_C10_VALIDATION_QUEUE)[number])) {
      throw new Error(`deferred capability entered the validation queue: ${deferred}`);
    }
  }
}
