/**
 * EOS-D1E-EU-C10-R3A qualified-human review-pack preparation.
 * AI prepares version-bound evidence packs. A qualified human reviews them.
 * This module does not sign engineering, promote validation, or edit formulas.
 */
import { createHash } from "node:crypto";
import {
  type EuC10R2BenchmarkRecord,
  executeEuC10R2Benchmarks,
} from "./benchmarks";

export const EU_C10_R3A_PACK_FORMAT_VERSION = "c10-r3a.1" as const;
export const AI_ENGINEER_VALIDATION_AUTHORITY = false as const;
export const CURSOR_ENGINEER_VALIDATION_AUTHORITY = false as const;
export const LLM_ENGINEERING_SIGNOFF_ALLOWED = false as const;
export const AUTOMATED_ENGINEER_VALIDATION_PROMOTION = false as const;
export const AI_GENERATED_ENGINEER_SIGNATURE_ALLOWED = false as const;
export const AI_GENERATED_REVIEW_APPROVAL_ALLOWED = false as const;
export const PLACEHOLDER_SIGNATURE_TREATED_AS_APPROVAL = false as const;
export const EU_C10_R3A_ENGINEER_VALIDATED_METHOD_COUNT = 0 as const;
export const EU_C10_R3A_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT = 0 as const;
export const EU_C10_R3A_ENGINEER_VALIDATED_PACK_COUNT = 0 as const;
export const AUTO_APPROVED_REVIEW_PACK_COUNT = 0 as const;
export const EU_C10_R3A_DEFAULT_REVIEW_OUTCOME = "PENDING_HUMAN_REVIEW" as const;
export const STALE_ENGINEER_REVIEW_REUSE_ALLOWED = false as const;
export const EU_C10_R3A_REVIEW_VERSION_BOUND = true as const;
export const EU_C10_R3A_SIGNATURE_IMAGE_REQUIRED = false as const;
export const EU_C10_R3A_REVIEW_ATTESTATION_REFERENCE_ALLOWED = true as const;
export const EU_C10_R3A_REVIEWER_DATA_MINIMIZATION = true as const;
export const EU_C10_R3A_SELF_REVIEW_COUNTS_AS_HIGH_INDEPENDENCE = false as const;
export const EU_C10_R3A_LEVEL1_REPRESENTED_AS_HIGH_ASSURANCE_EXTERNAL_VALIDATION = false as const;
export const EU_C10_R3A_LEVEL2_EQUALS_ENGINEER_VALIDATION = false as const;
export const EU_C10_R3A_EXTERNAL_SOFTWARE_GAP_PRESERVED = true as const;
export const EU_C10_R3A_NATIONAL_PROFILE_VALIDATION_PERFORMED = false as const;
export const EU_C10_R3A_PROFILE_PARAMETER_AUTOMATICALLY_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R3A_EXPLICIT_INPUT_AUTOMATICALLY_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R3A_C6_PHIEF_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R3A_C6_C_CLASSIFIED_AS_NDP = false as const;
export const EU_C10_R3A_ENGINEER_REVIEW_EQUALS_FORMAL_CONFORMANCE = false as const;
export const EU_C10_R3A_REVIEW_REJECTION_AUTO_REPAIRS_ENGINE = false as const;
export const EU_C10_R3B_ENGINEER_REVIEW_EVIDENCE_CAN_DIRECTLY_MUTATE_ENGINEERING_FORMULA = false as const;
export const EU_C10_R3B_VALIDATION_REQUIRES_EXTERNAL_HUMAN_EVIDENCE = true as const;
export const EU_C10_R3A_ORCHESTRATOR_VALIDATION_CAPPED_BY_UNDERLYING_METHOD_STATE = true as const;
export const EU_C10_R3A_BEAM_ROUTING_REVIEW_EQUALS_END_TO_END_ENGINEERING_VALIDATION = false as const;
export const EU_C10_R3A_COLUMN_ORCHESTRATOR_REVIEW_REQUIRES_C6_C3_CHAIN_EVIDENCE = true as const;
export const EU_C10_R3A_SLAB_REVIEW_EQUALS_TWO_WAY_SLAB_VALIDATION = false as const;
export const EU_C10_R3A_WALL_REVIEW_EQUALS_WALL_MEMBER_VALIDATION = false as const;
export const EU_C10_R3A_C7_C8_PACKS_HIDE_INDEPENDENCE_GAP = false as const;
export const EU_C10_R3A_PARTIAL_ENGINEER_VALIDATION_SUPPORTED = true as const;
export const EU_C10_R3A_C3_NONZERO_NM_INDEPENDENT_CASE_PRESENT = false as const;
export const EU_C10_R3A_C3_INTERACTION_REGION_COVERAGE = "MISSING" as const;
export const EU_C10_R3A_C4_UNIAXIAL_REDUCTION_COVERAGE = "MISSING" as const;
export const EDGE_PUNCHING_ENGINEER_REVIEW_PACK_PRESENT = false as const;
export const CORNER_PUNCHING_ENGINEER_REVIEW_PACK_PRESENT = false as const;
export const NEW_C10_R3A_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const NEW_C10_R3A_ENGINEERING_RUNTIME_METHOD_IMPLEMENTED = false as const;
export const NEW_C10_R3A_MEMBER_ORCHESTRATOR_IMPLEMENTED = false as const;
export const NEW_STRUCTURAL_ANALYSIS_ENGINE_IMPLEMENTED = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_C10_R3A = false as const;

export const EU_C10_R3A_REVIEW_ROLES = [
  "EVIDENCE_AUTHOR",
  "ENGINEERING_REVIEWER",
  "PRODUCTION_IMPLEMENTATION_AUTHOR",
] as const;

export const EU_C10_R3A_REVIEW_ASSURANCE_LEVELS = [
  "INTERNAL_QUALIFIED_REVIEW",
  "INDEPENDENT_QUALIFIED_REVIEW",
  "EXTERNAL_QUALIFIED_REVIEW",
] as const;

export const EU_C10_R3A_ENGINEER_REVIEW_DECISION_TAXONOMY = [
  "PENDING_HUMAN_REVIEW",
  "VALIDATED",
  "VALIDATED_WITH_LIMITATIONS",
  "REJECTED",
  "BLOCKED_INSUFFICIENT_EVIDENCE",
  "BLOCKED_PROFILE",
  "REQUIRES_SUPPLEMENTAL_CALCULATION",
  "REQUIRES_CORRECTIVE_ENGINEERING_CHANGE",
] as const;

export const EU_C10_R3A_PACK_STATUS_VALUES = [
  "PENDING_HUMAN_REVIEW",
  "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
] as const;

export const EU_C10_R3A_ELIGIBILITY_VALUES = [
  "READY_FOR_HUMAN_REVIEW",
  "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
  "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
  "BLOCKED_EVIDENCE",
] as const;

export const EU_C10_R3A_QUALIFIED_ENGINEER_REVIEWER_CONTRACT = {
  aiDeterminesLegalRegistration: false,
  hardcodedJurisdictionalCredential: false,
  requiredCompetence: [
    "REINFORCED_CONCRETE_DESIGN",
    "REVIEWED_METHOD",
    "STANDARD_OR_PROFILE_CONTEXT",
    "RELEVANT_STRUCTURAL_BEHAVIOR",
  ],
} as const;

export const EU_C10_R3A_REVIEWER_COMPETENCE_METADATA = [
  "reviewerRef",
  "competenceBasis",
  "relevantDiscipline",
  "standardFamiliarity",
  "reviewScope",
  "reviewDate",
  "organizationRef",
] as const;

export const EU_C10_R3A_REVIEWER_INDEPENDENCE_METADATA = [
  "involvedInFormulaImplementation",
  "involvedInBenchmarkPreparation",
  "involvedInSourceRuleExtraction",
  "involvedInOrchestratorImplementation",
] as const;

export const EU_C10_R3A_INVALIDATION_TRIGGERS = [
  "FORMULA_FINGERPRINT",
  "GOVERNING_RULE",
  "GOVERNING_PARAMETER",
  "PROFILE_IDENTITY",
  "SCOPE",
  "MATERIAL_MODEL",
  "METHOD_VERSION",
] as const;

export const EU_C10_R3A_METHOD_REVIEW_QUESTIONS = [
  "SCOPE_CORRECTNESS",
  "FORMULA_OR_RULE_INTERPRETATION",
  "PARAMETER_SEMANTICS",
  "UNITS_AND_SIGN_CONVENTIONS",
  "BENCHMARK_ADEQUACY",
  "BOUNDARY_BEHAVIOR",
  "FAIL_CLOSED_BEHAVIOR",
  "PROFILE_ASSUMPTIONS",
  "LIMITATIONS",
  "CLAIM_WORDING",
] as const;

export const EU_C10_R3A_ORCHESTRATOR_REVIEW_QUESTIONS = [
  "APPLICABILITY_ROUTING",
  "NODE_ROLES",
  "AGGREGATION",
  "FAILURE_PROPAGATION",
  "COMPLETENESS_SEMANTICS",
  "SCOPE_CLAIMS",
] as const;

export const EU_C10_R3B_ENGINEER_EVIDENCE_INPUT_FIELDS = [
  "reviewPackId",
  "reviewPackFingerprint",
  "reviewerRef",
  "competenceBasis",
  "reviewScope",
  "reviewOutcome",
  "reviewDate",
  "reviewNotes",
  "limitations",
  "exceptions",
  "supplementalEvidenceRefs",
  "signedEvidenceRef",
  "reviewedMethodFingerprint",
  "reviewedProfileFingerprint",
  "assuranceLevel",
] as const;

export const EU_C10_R3A_SUPPLEMENTAL_CALCULATION_FIELDS = [
  "inputDefinition",
  "assumptions",
  "sourceAuthority",
  "formulaOrDerivation",
  "units",
  "intermediateValues",
  "expectedOutputs",
  "tolerance",
  "authorRef",
  "date",
  "evidenceFingerprint",
  "productionOutputUsedAsExpectedTruth",
] as const;

export const EU_C10_R3A_INVALID_REVIEW_REJECTION_RULES = [
  "MISSING_REVIEWER_COMPETENCE_BASIS",
  "UNKNOWN_PACK_FINGERPRINT",
  "STALE_METHOD_FINGERPRINT",
  "AI_GENERATED_APPROVAL",
  "UNSIGNED_OR_UNATTESTED_APPROVAL",
  "SCOPE_MISMATCH",
  "PROFILE_MISMATCH",
  "GENERIC_BLANKET_APPROVAL",
  "UNRESOLVED_EVIDENCE_GAP_WITHOUT_LIMITATIONS",
] as const;

export const EU_C10_R3A_VALIDATION_SCOPE_IDENTITY = [
  "CAPABILITY",
  "METHOD_OR_ORCHESTRATOR",
  "SCOPE",
  "PROFILE",
  "GENERATION",
  "VERSION",
  "FINGERPRINTS",
] as const;

export const EU_C10_R3A_C3_SUPPLEMENTAL_EVIDENCE_ITEM = {
  id: "C10-R3A-C3-NONZERO-NM-INDEPENDENT-CALC",
  status: "REQUIRED_BEFORE_C3_ENGINEER_VALIDATION",
  requirement: "NONZERO_COMPRESSION_PLUS_BENDING_INDEPENDENT_CALCULATION",
} as const;

export const EU_C10_R3A_C7_C8_SUPPLEMENTAL_EVIDENCE_REQUIREMENTS = [
  { capabilityId: "D1E.EU.C7.CRACK_WIDTH", requirement: "INDEPENDENT_ENGINEER_CALCULATION_OR_GOVERNED_REFERENCE", status: "REQUIRED_BEFORE_STRONG_VALIDATION" },
  { capabilityId: "D1E.EU.C7.EXPLICIT_LONG_TERM_STATE", requirement: "INDEPENDENT_ENGINEER_CALCULATION_OR_GOVERNED_REFERENCE", status: "REQUIRED_BEFORE_STRONG_VALIDATION" },
  { capabilityId: "D1E.EU.C8.COVER_ASSEMBLY", requirement: "INDEPENDENT_ENGINEER_CALCULATION_OR_GOVERNED_REFERENCE", status: "REQUIRED_BEFORE_STRONG_VALIDATION" },
  { capabilityId: "D1E.EU.C8.MINIMUM_CLEAR_SPACING", requirement: "INDEPENDENT_ENGINEER_CALCULATION_OR_GOVERNED_REFERENCE", status: "REQUIRED_BEFORE_STRONG_VALIDATION" },
  { capabilityId: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", requirement: "INDEPENDENT_ENGINEER_CALCULATION_OR_GOVERNED_REFERENCE", status: "REQUIRED_BEFORE_STRONG_VALIDATION" },
] as const;

export const EU_C10_R3A_BLOCKED_INDEPENDENCE_CAPABILITIES = [
  "D1E.EU.C7.CRACK_WIDTH",
  "D1E.EU.C7.EXPLICIT_LONG_TERM_STATE",
  "D1E.EU.C8.COVER_ASSEMBLY",
  "D1E.EU.C8.MINIMUM_CLEAR_SPACING",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
] as const;

export const EU_C10_R3A_VALIDATION_DEBT_REDUCED_ITEMS = [
  "ENGINEER_REVIEW_PACK_PREPARATION",
  "R2_EVIDENCE_COVERAGE_AUDIT",
  "ENGINEER_EVIDENCE_CONTRACT",
  "REVIEW_FINGERPRINT_BINDING",
  "SUPPLEMENTAL_CALCULATION_CONTRACT",
] as const;

export const EU_C10_R3A_VALIDATION_DEBT_REMAINING_ITEMS = [
  "ENGINEER_VALIDATION",
  "NATIONAL_PROFILE_VALIDATION",
  "NDP_VALIDATION",
  "FORMAL_CONFORMANCE",
  "C7_C8_INDEPENDENCE_GAPS",
  "C3_INTERACTION_COVERAGE_GAP",
  "C4_UNIAXIAL_REDUCTION_GAP",
  "C2_PROFILE_IDENTITY_MISMATCH_GAP",
  "LEVEL_3_EXTERNAL_SOFTWARE_NOT_AVAILABLE",
] as const;

export const EU_C10_R3A_REVIEW_PACK_ARTIFACT_PATHS = [
  "packages/engineering-os/src/structural-concrete/eu-c10/review-packs.ts",
  "docs/architecture/engineering-os/EOS_D1E_EU_C10_R3A_ENGINEER_REVIEW_PACK_PREPARATION.md",
  "docs/architecture/engineering-os/eu-c10/review-packs/REVIEW_TEMPLATE.md",
] as const;

export const EU_C10_R3A_BENCHMARK_COVERAGE_MATRIX = [
  { capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL", state: "PARTIAL_EVIDENCE", note: "Representative rectangle, boundary, units, fail-closed, and Level-1 derivation are present. A distinct profile-identity mismatch is not a separate ledger row." },
  { capabilityId: "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL", state: "PARTIAL_EVIDENCE", note: "Only C10-R2-C3-ZERO-AXIAL. Nonzero compression plus bending is absent." },
  { capabilityId: "D1E.EU.C4.BIAXIAL.PMM", state: "PARTIAL_EVIDENCE", note: "C10-R2-C4-DIAGONAL exercises biaxial action at zero axial. One-axis reduction was not executed." },
  { capabilityId: "D1E.EU.C5.SHEAR", state: "ADEQUATE_FOR_ENGINEER_REVIEW", note: "Published anchors and generation mismatch cover the implemented zero-axial scope. Profile coefficients are not national validation." },
  { capabilityId: "D1E.EU.C5.PUNCHING", state: "ADEQUATE_FOR_ENGINEER_REVIEW", note: "Interior rectangular loaded area only. Edge fails closed. No edge or corner pack." },
  { capabilityId: "D1E.EU.C5.TORSION", state: "ADEQUATE_FOR_ENGINEER_REVIEW", note: "Rectangular closed form, unsupported section, stale profile, and profile mismatch. No general interaction." },
  { capabilityId: "D1E.EU.C6.NOMINAL_CURVATURE", state: "ADEQUATE_FOR_ENGINEER_REVIEW", note: "Closed form checks curvature, moments, length, phiEf, and the curvature-factor bound." },
  { capabilityId: "D1E.EU.C7.CRACK_WIDTH", state: "BLOCKED_INDEPENDENCE", note: "One repository recovery found no second governed source." },
  { capabilityId: "D1E.EU.C7.EXPLICIT_LONG_TERM_STATE", state: "BLOCKED_INDEPENDENCE", note: "Explicit state only. No second governed source." },
  { capabilityId: "D1E.EU.C8.COVER_ASSEMBLY", state: "BLOCKED_INDEPENDENCE", note: "Single governed source." },
  { capabilityId: "D1E.EU.C8.MINIMUM_CLEAR_SPACING", state: "BLOCKED_INDEPENDENCE", note: "Single governed source." },
  { capabilityId: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", state: "BLOCKED_INDEPENDENCE", note: "Single governed source." },
  { capabilityId: "D1E.EU.C9.BEAM", state: "PARTIAL_EVIDENCE", note: "Routing contract only. Not end-to-end engineering validation." },
  { capabilityId: "D1E.EU.C9.COLUMN", state: "PARTIAL_EVIDENCE", note: "Routing plus C6-to-C3 handoff inputs. Underlying C3 interaction coverage is missing." },
  { capabilityId: "D1E.EU.C9.SOLID_SLAB", state: "PARTIAL_EVIDENCE", note: "Strip routing only. Not two-way slab validation." },
  { capabilityId: "D1E.EU.C9.WALL_SECTION", state: "PARTIAL_EVIDENCE", note: "Section routing only. Not wall-member validation." },
] as const;

type CoverageState = (typeof EU_C10_R3A_BENCHMARK_COVERAGE_MATRIX)[number]["state"];
type Eligibility = (typeof EU_C10_R3A_ELIGIBILITY_VALUES)[number];
type PackStatus = (typeof EU_C10_R3A_PACK_STATUS_VALUES)[number];

type Attention = {
  packId: string;
  kind: "METHOD" | "ORCHESTRATOR";
  eligibility: Eligibility;
  packStatus: PackStatus;
  scope: string;
  exclusions: readonly string[];
  attention: readonly string[];
  discrepancies: readonly string[];
  limitations: readonly string[];
  deferred: readonly string[];
  ndpState: string;
  unitEvidence: string;
  boundaryEvidence: string;
  negativeEvidence: string;
  supplementalRequirement: string | null;
};

const ATTENTION: Record<string, Attention> = {
  "D1E.EU.C2.FLEXURE.UNIAXIAL": {
    packId: "C10-R3A-PACK-C2-FLEXURE",
    kind: "METHOD",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Rectangular uniaxial pure flexure on an explicit major axis.",
    exclusions: ["UNSUPPORTED_GEOMETRY", "MEMBER_STABILITY", "NATIONAL_PROFILE_VALIDATION"],
    attention: ["RECTANGULAR_SECTION", "MATERIAL_MODEL", "NEUTRAL_AXIS_EQUILIBRIUM", "SIGN_CONVENTION", "PURE_FLEXURE_CLAIM", "LEVEL_1_HAND_DERIVATION", "RECTANGLE_PARABOLA_MATERIAL_MODEL_DIFFERENCE"],
    discrepancies: ["EQUIVALENT_RECTANGLE_HAND_MODEL_MAY_DIFFER_FROM_FIBER_INTEGRATION"],
    limitations: ["LEVEL_1_INDEPENDENT_TEST_DERIVATION", "PROFILE_IDENTITY_MISMATCH_NOT_A_SEPARATE_LEDGER_CASE"],
    deferred: ["NATIONAL_PROFILE", "NDP_VALIDATION"],
    ndpState: "DECLARED_TEST_PARTIAL_FACTORS_NOT_NATIONALLY_VALIDATED",
    unitEvidence: "Resistance moment unit N.m is checked.",
    boundaryEvidence: "Unsupported circular geometry fails closed.",
    negativeEvidence: "Missing partial-factor context fails closed.",
    supplementalRequirement: null,
  },
  "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL": {
    packId: "C10-R3A-PACK-C3-UNIAXIAL",
    kind: "METHOD",
    eligibility: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    packStatus: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    scope: "Uniaxial axial-flexure interaction point on an explicit axis.",
    exclusions: ["MEMBER_STABILITY", "BIAXIAL_INTERACTION", "NATIONAL_PROFILE_VALIDATION"],
    attention: ["SUPPLEMENTAL_INDEPENDENT_NM_CALCULATION_REQUIRED", "NONZERO_NM_INTERACTION_COVERAGE_MISSING", "PURE_AXIAL_EXPLICIT_AXIS", "AXIAL_SIGN_CONVENTION", "INTERACTION_REGION", "C2_ZERO_AXIAL_REDUCTION_RELATIONSHIP"],
    discrepancies: ["ZERO_AXIAL_REDUCTION_IS_NOT_A_NONZERO_INTERACTION_CASE"],
    limitations: ["C10-R2-C3-ZERO-AXIAL_ONLY", "LEVEL_1_INDEPENDENT_TEST_DERIVATION"],
    deferred: ["NONZERO_COMPRESSION_PLUS_BENDING_INDEPENDENT_CALCULATION"],
    ndpState: "DECLARED_TEST_PARTIAL_FACTORS_NOT_NATIONALLY_VALIDATED",
    unitEvidence: "Resistance moment unit N.m is checked at axial 0 N.",
    boundaryEvidence: "Pure axial routing without an explicit axis fails closed.",
    negativeEvidence: "No nonzero compression-plus-bending independent case was executed.",
    supplementalRequirement: EU_C10_R3A_C3_SUPPLEMENTAL_EVIDENCE_ITEM.id,
  },
  "D1E.EU.C4.BIAXIAL.PMM": {
    packId: "C10-R3A-PACK-C4-BIAXIAL",
    kind: "METHOD",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Rectangular biaxial section interaction at an explicit axial target.",
    exclusions: ["MEMBER_STABILITY", "UNSUPPORTED_GEOMETRY", "BIAXIAL_SECOND_ORDER"],
    attention: ["BIAXIAL_SECTION_INTERACTION", "RECTANGULAR_SCOPE", "MESH_EQUILIBRIUM", "ONE_AXIS_REDUCTION_MISSING", "SECTION_RESULT_IS_NOT_MEMBER_STABILITY"],
    discrepancies: ["LEVEL_1_HAND_MESH_VERSUS_PRODUCTION_INTEGRATION"],
    limitations: ["UNIAXIAL_REDUCTION_NOT_EXECUTED", "AXIAL_TARGET_IS_ZERO"],
    deferred: ["ONE_AXIS_REDUCTION_CONSISTENCY_CHECK"],
    ndpState: "DECLARED_TEST_PARTIAL_FACTORS_NOT_NATIONALLY_VALIDATED",
    unitEvidence: "Resultant moment magnitude unit N.m is checked.",
    boundaryEvidence: "Unsupported circular geometry fails closed.",
    negativeEvidence: "No one-axis reduction benchmark was executed.",
    supplementalRequirement: null,
  },
  "D1E.EU.C5.SHEAR": {
    packId: "C10-R3A-PACK-C5-SHEAR",
    kind: "METHOD",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Implemented zero-axial shear resistance with reference-profile coefficients.",
    exclusions: ["DESIGN_SHEAR_REINFORCEMENT", "NONZERO_AXIAL", "NATIONAL_NDP_VALIDATION"],
    attention: ["ZERO_AXIAL_BOUNDED_SCOPE", "REFERENCE_PROFILE_VALUES", "PUBLISHED_ANCHORS", "NDP_NOT_NATIONALLY_VALIDATED", "SHEAR_REINFORCEMENT_LIMITATIONS"],
    discrepancies: [],
    limitations: ["PROFILE_VALUE_ASSUMED_FOR_REFERENCE_BENCHMARK", "LEVEL_2_IS_NOT_ENGINEER_VALIDATION"],
    deferred: ["NATIONAL_PROFILE", "DESIGN_SHEAR_REINFORCEMENT"],
    ndpState: "REFERENCE_COEFFICIENTS_ARE_NOT_VALIDATED_NDPS",
    unitEvidence: "Resistance unit N is checked.",
    boundaryEvidence: "Second-generation profile context fails closed.",
    negativeEvidence: "Generation mismatch does not return a resistance.",
    supplementalRequirement: null,
  },
  "D1E.EU.C5.PUNCHING": {
    packId: "C10-R3A-PACK-C5-PUNCHING",
    kind: "METHOD",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Interior rectangular loaded area with explicit demand.",
    exclusions: ["EDGE_PUNCHING", "CORNER_PUNCHING", "OPENINGS"],
    attention: ["INTERIOR_RECTANGULAR_LOADED_AREA", "CONTROL_PERIMETER", "EXPLICIT_DEMAND", "PUBLISHED_ANCHOR", "EDGE_AND_CORNER_EXCLUDED"],
    discrepancies: [],
    limitations: ["LEVEL_2_IS_NOT_ENGINEER_VALIDATION", "PROFILE_VALUE_ASSUMED_FOR_REFERENCE_BENCHMARK"],
    deferred: ["EDGE_PUNCHING", "CORNER_PUNCHING"],
    ndpState: "REFERENCE_COEFFICIENTS_ARE_NOT_VALIDATED_NDPS",
    unitEvidence: "Resistance unit MPa and perimeter millimetres are checked.",
    boundaryEvidence: "Edge support position fails closed.",
    negativeEvidence: "Edge punching is unsupported.",
    supplementalRequirement: null,
  },
  "D1E.EU.C5.TORSION": {
    packId: "C10-R3A-PACK-C5-TORSION",
    kind: "METHOD",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Solid rectangular torsion resistance from an independent closed form.",
    exclusions: ["GENERAL_V_T_N_M", "WALL_TORSION", "SLAB_TORSION"],
    attention: ["RECTANGULAR_TORSION_SCOPE", "PROFILE_INPUTS", "CLOSED_FORM_INDEPENDENT_DERIVATION", "INTERACTION_EXCLUDED"],
    discrepancies: [],
    limitations: ["LEVEL_1_INDEPENDENT_TEST_DERIVATION", "NO_GENERAL_INTERACTION"],
    deferred: ["GENERAL_V_T_N_M"],
    ndpState: "DECLARED_PROFILE_INPUTS_NOT_NATIONALLY_VALIDATED",
    unitEvidence: "Resistance unit N.m is checked.",
    boundaryEvidence: "Non-rectangular section, stale profile version, and mismatched profile id fail closed.",
    negativeEvidence: "Other section kind fails closed.",
    supplementalRequirement: null,
  },
  "D1E.EU.C6.NOMINAL_CURVATURE": {
    packId: "C10-R3A-PACK-C6-NOMINAL-CURVATURE",
    kind: "METHOD",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Isolated prismatic rectangular uniaxial compression nominal curvature.",
    exclusions: ["C6_TO_C4", "BIAXIAL_SECOND_ORDER", "SLENDERNESS_NEGLECT_RULE"],
    attention: ["ISOLATED_PRISMATIC_RECTANGULAR", "UNIAXIAL_COMPRESSION", "EFFECTIVE_LENGTH", "M01_M02", "IMPERFECTION_SEMANTICS", "PHIEF_EXPLICIT_GOVERNED_ENGINEERING_INPUT", "ES", "C_BOUNDS_8_TO_10", "CURVATURE", "SECOND_ORDER_MOMENT", "TOTAL_MOMENT", "C6_TO_C3", "NO_C6_TO_C4"],
    discrepancies: [],
    limitations: ["LEVEL_1_INDEPENDENT_TEST_DERIVATION", "PHIEF_IS_NOT_AN_NDP", "C_IS_NOT_AN_NDP"],
    deferred: ["NATIONAL_PROFILE"],
    ndpState: "PHIEF_EXPLICIT_GOVERNED_ENGINEERING_INPUT_AND_C_DESIGNER_SELECTED_WITHIN_8_TO_10",
    unitEvidence: "Moments in N.mm and a metre-to-millimetre eccentricity check are present.",
    boundaryEvidence: "Curvature factor below the governed lower bound fails closed. Effective length is not inferred.",
    negativeEvidence: "Stale profile version fails closed.",
    supplementalRequirement: null,
  },
  "D1E.EU.C7.CRACK_WIDTH": {
    packId: "C10-R3A-PACK-C7-CRACK-WIDTH",
    kind: "METHOD",
    eligibility: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    packStatus: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    scope: "Implemented crack-width method awaiting independent evidence.",
    exclusions: ["STRONG_VALIDATION_WITHOUT_INDEPENDENT_EVIDENCE"],
    attention: ["BLOCKED_INDEPENDENCE", "INDEPENDENT_CALCULATION_OR_GOVERNED_REFERENCE_REQUIRED"],
    discrepancies: [],
    limitations: ["BLOCKED_INDEPENDENCE_VISIBLE", "ONE_REPOSITORY_RECOVERY"],
    deferred: ["INDEPENDENT_GOVERNED_REFERENCE"],
    ndpState: "NOT_CLASSIFIED_BY_THIS_PACK",
    unitEvidence: "Not executed. Expected truth was not invented.",
    boundaryEvidence: "Not executed.",
    negativeEvidence: "Self-reference was not used as expected truth.",
    supplementalRequirement: "C10-R3A-C7-CRACK-INDEPENDENT-CALC",
  },
  "D1E.EU.C7.EXPLICIT_LONG_TERM_STATE": {
    packId: "C10-R3A-PACK-C7-LONG-TERM",
    kind: "METHOD",
    eligibility: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    packStatus: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    scope: "Explicit creep-coefficient and shrinkage state only.",
    exclusions: ["CALCULATED_CREEP_MODEL", "CALCULATED_SHRINKAGE_MODEL", "DEFLECTION"],
    attention: ["EXPLICIT_PHI_AND_SHRINKAGE_STATE", "NO_CALCULATED_CREEP_MODEL", "NO_CALCULATED_SHRINKAGE_MODEL", "NO_DEFLECTION", "BLOCKED_INDEPENDENCE"],
    discrepancies: [],
    limitations: ["BLOCKED_INDEPENDENCE_VISIBLE"],
    deferred: ["CREEP_MODEL", "SHRINKAGE_MODEL", "DEFLECTION"],
    ndpState: "NOT_CLASSIFIED_BY_THIS_PACK",
    unitEvidence: "Not executed.",
    boundaryEvidence: "Not executed.",
    negativeEvidence: "No calculated long-term model is claimed.",
    supplementalRequirement: "C10-R3A-C7-LONG-TERM-INDEPENDENT-CALC",
  },
  "D1E.EU.C8.COVER_ASSEMBLY": {
    packId: "C10-R3A-PACK-C8-COVER",
    kind: "METHOD",
    eligibility: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    packStatus: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    scope: "Cover assembly from explicit components.",
    exclusions: ["DURABILITY_LOOKUP", "PROVIDED_COVER_COMPLIANCE"],
    attention: ["COVER_ASSEMBLY_ONLY", "EXPLICIT_DURABILITY_COVER_COMPONENT", "NO_DURABILITY_LOOKUP", "NO_PROVIDED_COVER_COMPLIANCE", "BLOCKED_INDEPENDENCE"],
    discrepancies: [],
    limitations: ["BLOCKED_INDEPENDENCE_VISIBLE", "SINGLE_GOVERNED_SOURCE"],
    deferred: ["DURABILITY_LOOKUP"],
    ndpState: "NOT_CLASSIFIED_BY_THIS_PACK",
    unitEvidence: "Not executed.",
    boundaryEvidence: "Not executed.",
    negativeEvidence: "No durability lookup is claimed.",
    supplementalRequirement: "C10-R3A-C8-COVER-INDEPENDENT-CALC",
  },
  "D1E.EU.C8.MINIMUM_CLEAR_SPACING": {
    packId: "C10-R3A-PACK-C8-SPACING",
    kind: "METHOD",
    eligibility: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    packStatus: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    scope: "Minimum clear spacing for equal-diameter adjacent bars.",
    exclusions: ["UNEQUAL_DIAMETER", "BUNDLES", "MESH", "PRESTRESS"],
    attention: ["EQUAL_DIAMETER_ADJACENT_BARS", "EXPLICIT_ADJACENCY", "SURFACE_TO_SURFACE", "EXPLICIT_AGGREGATE_INPUT", "PROFILE_AND_NDP_INPUTS_NOT_VALIDATED", "BLOCKED_INDEPENDENCE"],
    discrepancies: [],
    limitations: ["BLOCKED_INDEPENDENCE_VISIBLE", "SINGLE_GOVERNED_SOURCE"],
    deferred: ["UNEQUAL_DIAMETER", "BUNDLES", "MESH", "PRESTRESS"],
    ndpState: "PROFILE_INPUTS_NOT_AUTOMATICALLY_CLASSIFIED_AS_VALIDATED_NDPS",
    unitEvidence: "Not executed.",
    boundaryEvidence: "Not executed.",
    negativeEvidence: "No unequal-diameter extension is claimed.",
    supplementalRequirement: "C10-R3A-C8-SPACING-INDEPENDENT-CALC",
  },
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE": {
    packId: "C10-R3A-PACK-C8-ANCHORAGE",
    kind: "METHOD",
    eligibility: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    packStatus: "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION",
    scope: "Basic required anchorage of a tension straight bar.",
    exclusions: ["DESIGN_ANCHORAGE", "COMPRESSION_ANCHORAGE", "LAPS"],
    attention: ["BASIC_REQUIRED_ANCHORAGE_ONLY", "TENSION_STRAIGHT_BAR", "EXPLICIT_STRESS", "EXPLICIT_BOND_STRESS", "NO_DESIGN_ANCHORAGE", "NO_COMPRESSION_ANCHORAGE", "NO_LAP_VALIDATION", "BLOCKED_INDEPENDENCE"],
    discrepancies: [],
    limitations: ["BLOCKED_INDEPENDENCE_VISIBLE", "SINGLE_GOVERNED_SOURCE"],
    deferred: ["DESIGN_ANCHORAGE", "LAPS"],
    ndpState: "EXPLICIT_INPUTS_NOT_AUTOMATICALLY_CLASSIFIED_AS_VALIDATED_NDPS",
    unitEvidence: "Not executed.",
    boundaryEvidence: "Not executed.",
    negativeEvidence: "Design anchorage and laps are outside this pack.",
    supplementalRequirement: "C10-R3A-C8-ANCHORAGE-INDEPENDENT-CALC",
  },
  "D1E.EU.C9.BEAM": {
    packId: "C10-R3A-PACK-C9-BEAM",
    kind: "ORCHESTRATOR",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Bounded beam routing across existing methods.",
    exclusions: ["END_TO_END_ENGINEERING_VALIDATION", "C6_FOR_BEAM"],
    attention: ["C2_C3_C4_ROUTING", "C5_LIMITATIONS", "C6_EXCLUSION", "C7_C8_BLOCKED_UNDERLYING_INDEPENDENCE", "NODE_ROLES", "AGGREGATION", "FULL_SCOPE_LIMITATIONS"],
    discrepancies: [],
    limitations: ["ROUTING_REVIEW_IS_NOT_END_TO_END_VALIDATION", "UNDERLYING_C7_C8_BLOCKED_INDEPENDENCE"],
    deferred: ["C7_INDEPENDENCE", "C8_INDEPENDENCE"],
    ndpState: "NOT_VALIDATED",
    unitEvidence: "Contract states are exact.",
    boundaryEvidence: "Declared punching and second-order scopes stay not applicable.",
    negativeEvidence: "C6 is not invoked for a beam.",
    supplementalRequirement: null,
  },
  "D1E.EU.C9.COLUMN": {
    packId: "C10-R3A-PACK-C9-COLUMN",
    kind: "ORCHESTRATOR",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Bounded column section routing and C6-to-C3 handoff.",
    exclusions: ["C6_TO_C4", "BIAXIAL_SECOND_ORDER", "END_TO_END_MEMBER_VALIDATION"],
    attention: ["C3_C4_SECTION_ROUTING", "C6_TO_C3_CHAIN", "SINGLE_SIGN_CONVERSION", "EFFECTIVE_LENGTH", "PHIEF", "NO_C6_TO_C4", "NO_BIAXIAL_SECOND_ORDER", "UNDERLYING_C3_COVERAGE_PARTIAL"],
    discrepancies: [],
    limitations: ["C3_NONZERO_NM_CASE_MISSING", "ROUTING_DOES_NOT_PROVE_FORMULA_TRUTH"],
    deferred: ["C3_SUPPLEMENTAL_NM_CALCULATION"],
    ndpState: "NOT_VALIDATED",
    unitEvidence: "C6 handoff units are checked on the C6 closed form.",
    boundaryEvidence: "Incomplete second-order scope stays unsatisfied.",
    negativeEvidence: "C6 output is not used for C4.",
    supplementalRequirement: null,
  },
  "D1E.EU.C9.SOLID_SLAB": {
    packId: "C10-R3A-PACK-C9-SLAB",
    kind: "ORCHESTRATOR",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Supplied-strip section orchestration.",
    exclusions: ["SLAB_ANALYSIS", "TWO_WAY_SLAB_VALIDATION", "SUPPORT_REACTION_GENERATION", "DEFLECTION"],
    attention: ["STRIP_SECTION_SEMANTICS", "NO_SLAB_ANALYSIS", "C2_STRIP_SCOPE", "ONE_WAY_SHEAR_SCOPE", "INTERIOR_PUNCHING_SCOPE", "NO_REACTION_GENERATION", "NO_C4_TWO_WAY_SUBSTITUTION", "NO_DEFLECTION"],
    discrepancies: [],
    limitations: ["SLAB_REVIEW_IS_NOT_TWO_WAY_SLAB_VALIDATION"],
    deferred: ["TWO_WAY_SLAB_ANALYSIS", "DEFLECTION"],
    ndpState: "NOT_VALIDATED",
    unitEvidence: "Contract states are exact.",
    boundaryEvidence: "Orthogonal moments do not route to biaxial section interaction.",
    negativeEvidence: "No support reactions are generated.",
    supplementalRequirement: null,
  },
  "D1E.EU.C9.WALL_SECTION": {
    packId: "C10-R3A-PACK-C9-WALL",
    kind: "ORCHESTRATOR",
    eligibility: "READY_FOR_HUMAN_REVIEW_WITH_LIMITATIONS",
    packStatus: "PENDING_HUMAN_REVIEW",
    scope: "Rectangular wall-section evaluation only.",
    exclusions: ["WALL_MEMBER_VALIDATION", "WALL_SHEAR", "WALL_STABILITY", "BOUNDARY_ELEMENT", "SEISMIC_DETAILING", "C6_FOR_WALL"],
    attention: ["WALL_CANONICAL_IDENTITY", "RECTANGULAR_WALL_SECTION", "SECTION_ONLY", "AXIS_MAPPING", "LENGTH_THICKNESS_MAPPING", "C2_C3_C4_ROUTING", "C6_EXCLUSION", "WALL_SHEAR_EXCLUSION", "STABILITY_EXCLUSION", "BOUNDARY_AND_SEISMIC_EXCLUSIONS"],
    discrepancies: [],
    limitations: ["WALL_REVIEW_IS_NOT_WALL_MEMBER_VALIDATION"],
    deferred: ["WALL_SHEAR", "WALL_STABILITY", "BOUNDARY_ELEMENT", "SEISMIC_DETAILING"],
    ndpState: "NOT_VALIDATED",
    unitEvidence: "Contract states are exact.",
    boundaryEvidence: "Excluded scopes do not execute.",
    negativeEvidence: "C6 is not invoked for a wall section.",
    supplementalRequirement: null,
  },
};

export type EuC10R3aReviewPack = {
  packId: string;
  capabilityId: string;
  methodId: string;
  methodVersion: string;
  formulaFingerprint: string;
  parameterFingerprint: string;
  profileId: string;
  generation: string;
  scope: string;
  exclusions: readonly string[];
  authoritySources: readonly string[];
  sourceIndependenceState: string;
  benchmarkIds: readonly string[];
  benchmarkResults: readonly string[];
  independenceLevel: string;
  unitEvidence: string;
  boundaryEvidence: string;
  negativeEvidence: string;
  knownDiscrepancies: readonly string[];
  knownLimitations: readonly string[];
  deferredDependencies: readonly string[];
  nationalProfileState: "NOT_VALIDATED";
  ndpState: string;
  engineerValidationState: "PENDING_HUMAN_REVIEW";
  conformanceState: "INTENDED_PROFILE";
  certified: false;
  reviewerAttention: readonly string[];
  questions: readonly string[];
  reviewOutcome: "PENDING_HUMAN_REVIEW";
  reviewStatus: PackStatus;
  eligibility: Eligibility;
  coverageState: CoverageState;
  supplementalRequirement: string | null;
  reviewerRef: "";
  reviewSignature: "";
  packFormatVersion: typeof EU_C10_R3A_PACK_FORMAT_VERSION;
  packFingerprint: string;
};

export type HumanReviewEvidenceInput = {
  reviewPackId: string;
  reviewPackFingerprint: string;
  reviewerRef: string;
  competenceBasis: string;
  reviewScope: string;
  reviewOutcome: string;
  reviewDate: string;
  reviewNotes: string;
  limitations: string;
  exceptions: string;
  supplementalEvidenceRefs: readonly string[];
  signedEvidenceRef: string;
  reviewedMethodFingerprint: string;
  reviewedProfileFingerprint: string;
  assuranceLevel: string;
  aiGeneratedApproval: boolean;
  blanketAllConcreteApproval: boolean;
  involvedInFormulaImplementation: boolean;
  involvedInBenchmarkPreparation: boolean;
  involvedInSourceRuleExtraction: boolean;
  involvedInOrchestratorImplementation: boolean;
};

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function reviewPackFingerprint(input: {
  capabilityId: string;
  methodVersion: string;
  formulaFingerprint: string;
  parameterFingerprint: string;
  evidenceIds: readonly string[];
  reviewScope: string;
  packFormatVersion: string;
}): string {
  return digest([
    input.capabilityId,
    input.methodVersion,
    input.formulaFingerprint,
    input.parameterFingerprint,
    input.evidenceIds.join(","),
    input.reviewScope,
    input.packFormatVersion,
  ].join("|"));
}

function coverageFor(capabilityId: string): CoverageState {
  const row = EU_C10_R3A_BENCHMARK_COVERAGE_MATRIX.find((item) => item.capabilityId === capabilityId);
  if (!row) throw new Error(`coverage missing: ${capabilityId}`);
  return row.state;
}

function materialize(row: EuC10R2BenchmarkRecord, attention: Attention): EuC10R3aReviewPack {
  const questions = attention.kind === "ORCHESTRATOR"
    ? [...EU_C10_R3A_METHOD_REVIEW_QUESTIONS, ...EU_C10_R3A_ORCHESTRATOR_REVIEW_QUESTIONS]
    : [...EU_C10_R3A_METHOD_REVIEW_QUESTIONS];
  const fingerprint = reviewPackFingerprint({
    capabilityId: row.capabilityId,
    methodVersion: row.methodVersion,
    formulaFingerprint: row.formulaFingerprint,
    parameterFingerprint: row.parameterFingerprint,
    evidenceIds: [row.benchmarkId],
    reviewScope: attention.scope,
    packFormatVersion: EU_C10_R3A_PACK_FORMAT_VERSION,
  });
  return {
    packId: attention.packId,
    capabilityId: row.capabilityId,
    methodId: row.methodId,
    methodVersion: row.methodVersion,
    formulaFingerprint: row.formulaFingerprint,
    parameterFingerprint: row.parameterFingerprint,
    profileId: row.profileId,
    generation: row.generation,
    scope: attention.scope,
    exclusions: attention.exclusions,
    authoritySources: [row.sourceId, row.sourceAuthority],
    sourceIndependenceState: row.independenceLevel,
    benchmarkIds: [row.benchmarkId],
    benchmarkResults: [row.evidenceStatus],
    independenceLevel: row.independenceLevel,
    unitEvidence: attention.unitEvidence,
    boundaryEvidence: attention.boundaryEvidence,
    negativeEvidence: attention.negativeEvidence,
    knownDiscrepancies: attention.discrepancies,
    knownLimitations: attention.limitations,
    deferredDependencies: attention.deferred,
    nationalProfileState: "NOT_VALIDATED",
    ndpState: attention.ndpState,
    engineerValidationState: "PENDING_HUMAN_REVIEW",
    conformanceState: "INTENDED_PROFILE",
    certified: false,
    reviewerAttention: attention.attention,
    questions,
    reviewOutcome: "PENDING_HUMAN_REVIEW",
    reviewStatus: attention.packStatus,
    eligibility: attention.eligibility,
    coverageState: coverageFor(row.capabilityId),
    supplementalRequirement: attention.supplementalRequirement,
    reviewerRef: "",
    reviewSignature: "",
    packFormatVersion: EU_C10_R3A_PACK_FORMAT_VERSION,
    packFingerprint: fingerprint,
  };
}

export function buildEuC10R3aReviewPacks(): readonly EuC10R3aReviewPack[] {
  const executed = executeEuC10R2Benchmarks();
  if (executed.ledger.length !== 16) throw new Error("R2 evidence ledger count drifted");
  if (EU_C10_R3A_ENGINEER_VALIDATED_METHOD_COUNT !== 0 || EU_C10_R3A_ENGINEER_VALIDATED_ORCHESTRATOR_COUNT !== 0) {
    throw new Error("R3A cannot promote engineer validation");
  }
  return executed.ledger.map((row) => {
    const attention = ATTENTION[row.capabilityId];
    if (!attention) throw new Error(`review attention missing: ${row.capabilityId}`);
    const pack = materialize(row, attention);
    if (pack.reviewOutcome !== "PENDING_HUMAN_REVIEW" || pack.certified !== false) {
      throw new Error("review pack generation prefilled an approval");
    }
    return pack;
  });
}

export function reviewPackIsCurrent(
  pack: EuC10R3aReviewPack,
  live: { formulaFingerprint: string; parameterFingerprint: string; methodVersion: string; scope: string },
): boolean {
  if (STALE_ENGINEER_REVIEW_REUSE_ALLOWED) return false;
  const rebound = reviewPackFingerprint({
    capabilityId: pack.capabilityId,
    methodVersion: live.methodVersion,
    formulaFingerprint: live.formulaFingerprint,
    parameterFingerprint: live.parameterFingerprint,
    evidenceIds: pack.benchmarkIds,
    reviewScope: live.scope,
    packFormatVersion: pack.packFormatVersion,
  });
  return pack.formulaFingerprint === live.formulaFingerprint
    && pack.parameterFingerprint === live.parameterFingerprint
    && pack.methodVersion === live.methodVersion
    && pack.scope === live.scope
    && pack.packFingerprint === rebound;
}

export function classifyHumanReviewEvidence(
  evidence: HumanReviewEvidenceInput,
  pack: EuC10R3aReviewPack,
): { promotableByR3a: false; wouldBeEligibleForR3bIngestion: boolean; rejectionReasons: string[] } {
  const reasons: string[] = [];
  if (!evidence.competenceBasis.trim()) reasons.push("MISSING_REVIEWER_COMPETENCE_BASIS");
  if (evidence.reviewPackFingerprint !== pack.packFingerprint) reasons.push("UNKNOWN_PACK_FINGERPRINT");
  if (evidence.reviewedMethodFingerprint !== pack.formulaFingerprint) reasons.push("STALE_METHOD_FINGERPRINT");
  if (evidence.reviewedProfileFingerprint !== pack.parameterFingerprint) reasons.push("PROFILE_MISMATCH");
  if (evidence.aiGeneratedApproval || AI_GENERATED_REVIEW_APPROVAL_ALLOWED) reasons.push("AI_GENERATED_APPROVAL");
  if (!evidence.signedEvidenceRef.trim()) reasons.push("UNSIGNED_OR_UNATTESTED_APPROVAL");
  if (evidence.reviewScope.trim() !== pack.scope) reasons.push("SCOPE_MISMATCH");
  if (evidence.blanketAllConcreteApproval) reasons.push("GENERIC_BLANKET_APPROVAL");
  if (evidence.reviewPackId !== pack.packId) reasons.push("UNKNOWN_PACK_FINGERPRINT");
  if (!(EU_C10_R3A_REVIEW_ASSURANCE_LEVELS as readonly string[]).includes(evidence.assuranceLevel)) reasons.push("MISSING_REVIEWER_COMPETENCE_BASIS");
  if (pack.supplementalRequirement && evidence.supplementalEvidenceRefs.length === 0) reasons.push("UNRESOLVED_EVIDENCE_GAP_WITHOUT_LIMITATIONS");
  if (pack.reviewStatus === "REQUIRES_SUPPLEMENTAL_INDEPENDENT_CALCULATION" && !evidence.limitations.trim()) {
    reasons.push("UNRESOLVED_EVIDENCE_GAP_WITHOUT_LIMITATIONS");
  }
  if (!(EU_C10_R3A_ENGINEER_REVIEW_DECISION_TAXONOMY as readonly string[]).includes(evidence.reviewOutcome)) {
    reasons.push("SCOPE_MISMATCH");
  }
  if (evidence.reviewOutcome === "PENDING_HUMAN_REVIEW") reasons.push("UNSIGNED_OR_UNATTESTED_APPROVAL");
  return {
    promotableByR3a: false,
    wouldBeEligibleForR3bIngestion: reasons.length === 0 && EU_C10_R3B_VALIDATION_REQUIRES_EXTERNAL_HUMAN_EVIDENCE,
    rejectionReasons: reasons,
  };
}

export function euC10R3aHumanReviewEligibilityMatrix(packs: readonly EuC10R3aReviewPack[]): readonly { packId: string; capabilityId: string; eligibility: Eligibility; reviewStatus: PackStatus }[] {
  return packs.map((pack) => ({
    packId: pack.packId,
    capabilityId: pack.capabilityId,
    eligibility: pack.eligibility,
    reviewStatus: pack.reviewStatus,
  }));
}
