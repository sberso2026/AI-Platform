/**
 * EOS-D1E-EU-1 — Eurocode concrete standard-context foundation.
 * EN 1992 family / part / National Annex / NDP binding only.
 * Not a numerical EN 1992 resistance engine.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { EngineeringRuleAuthorityType } from "./structural-steel";
import type {
  EurocodeGenerationFamily,
  EurocodeNationalAnnex,
  EurocodeNdpRecord,
  EurocodeResolverFailReason,
  EurocodeStandardContextConfirmation,
  EurocodeStandardVersion,
} from "./structural-steel";
import { EU_CONCRETE_STANDARD_EDITION } from "./structural-concrete";

export const EOS_D1E_EU1_PHASE = "EOS-D1E-EU-1" as const;
export const D1E_EU1_SCOPE = "EN 1992 family/part/annex/NDP binding foundation before bounded methods" as const;
export const D1E_EU1_SCOPE_CONFIRMED = true as const;
export const PARALLEL_EU_CONCRETE_STANDARD_FRAMEWORK_CREATED = false as const;
export const PARALLEL_EU_RC_SECTION_KERNEL_CREATED = false as const;
export const EU_CONCRETE_STANDARD_FAMILY_BOUND = true as const;
export const EUROCODE_CONCRETE_NOT_HARDCODED_TO_EU_MEMBERSHIP = true as const;
export const EU_CONCRETE_STANDARD_GENERATION_MODEL = true as const;
export const CROSS_GENERATION_RULE_MIXING_ALLOWED = false as const;
export const EU_CONCRETE_STANDARD_AMENDMENT_STATE = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const SILENT_EN1992_EDITION_INFERENCE = false as const;
export const EU_CONCRETE_STANDARD_PART_MODEL = true as const;
export const EU_CONCRETE_GENERAL_DESIGN_PART_PROFILE = true as const;
export const EU_CONCRETE_STANDARD_PART_DEPENDENCY_MODEL = true as const;
export const EU_CONCRETE_NATIONAL_ANNEX_MODEL = true as const;
export const EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION = false as const;
export const EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY_MODEL = true as const;
export const EU_CONCRETE_NDP_MODEL = true as const;
export const EU_CONCRETE_NDP_VALUE_GUESSED = false as const;
export const EU_CONCRETE_ANNEX_EDITION_COMPATIBILITY = true as const;
export const EU_CONCRETE_NDP_EDITION_COMPATIBILITY = true as const;
export const EU_CONCRETE_MULTI_COUNTRY_SUPPORT = true as const;
export const UK_EUROCODE_CONCRETE_EXTENSIBILITY = true as const;
export const INTERNATIONAL_EUROCODE_CONCRETE_PROFILE_SUPPORTED = true as const;
export const EU_CONCRETE_PROJECT_STANDARD_CONTEXT = true as const;
export const EU_CONCRETE_CALCULATION_CONTEXT = true as const;
export const ISSUED_EU_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE = true as const;
export const EU_CONCRETE_RULE_VERSION_IMMUTABILITY = true as const;
export const STANDARD_UPDATE_OVERWRITES_HISTORICAL_CONCRETE_RULE = false as const;
export const HISTORICAL_EU_CONCRETE_RESULT_REPRODUCIBLE = true as const;
export const EU_CONCRETE_PROJECT_OVERRIDE_GOVERNANCE = true as const;
export const EU_CONCRETE_SOURCE_PRECEDENCE_MODEL = true as const;
export const EU_CONCRETE_STANDARD_CONTEXT_RESOLVER = true as const;
export const EU_CONCRETE_STANDARD_CONTEXT_CONFLICT_DETECTION = true as const;
export const UNRESOLVED_EU_CONCRETE_STANDARD_CONFLICT_FAILS_CLOSED = true as const;
export const EU_CONCRETE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE = true as const;
export const EU_CONCRETE_MATERIAL_PROPERTY_SOURCE_REQUIRED = true as const;
export const EU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES = false as const;
export const EU_REINFORCEMENT_PROPERTY_SOURCE_REQUIRED = true as const;
export const EU_CONCRETE_MATERIAL_CATALOG_ADAPTER_READY = true as const;
export const EU_REINFORCEMENT_CATALOG_ADAPTER_READY = true as const;
export const D1E1_GEOMETRY_REUSED_FOR_EU_CONCRETE = true as const;
export const GEOMETRIC_CLEARANCE_EQUALS_EN1992_COVER_COMPLIANCE = false as const;
export const D1E1_KINEMATICS_REUSED_FOR_EU_CONCRETE = true as const;
export const D1E1_SECTION_INTEGRATOR_REUSED_FOR_EU_CONCRETE = true as const;
export const PARALLEL_EU_CONCRETE_SECTION_INTEGRATOR_CREATED = false as const;
export const D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_EU_CONCRETE = true as const;
export const PARALLEL_EU_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED = false as const;
export const EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER_READY = true as const;
export const EU_CONCRETE_STRESS_BLOCK_DEPENDENCY_MODEL = true as const;
export const EU_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED = false as const;
export const EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY_MODEL = true as const;
export const EU_CONCRETE_STRAIN_LIMIT_GUESSED = false as const;
export const EU_CONCRETE_PARTIAL_FACTOR_MODEL = true as const;
export const EU_CONCRETE_PARTIAL_FACTOR_GUESSED = false as const;
export const EU_CONCRETE_NDP_DEPENDENCY_EXPLICIT = true as const;
export const EU_PARTIAL_FACTOR_SEMANTICS_CONFINED_TO_EU_ADAPTER = true as const;
export const EU_CONCRETE_FLEXURE_PROFILE_READY = true as const;
export const IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS = [
  "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
  "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
] as const;
export const EU_CONCRETE_AXIAL_FLEXURE_PROFILE_READY = true as const;
export const EU_CONCRETE_SHEAR_PROFILE_READY = true as const;
export const NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED = false as const;
export const EU_CONCRETE_PUNCHING_PROFILE_READY = true as const;
export const NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED = false as const;
export const EU_CONCRETE_SERVICEABILITY_PROFILE_READY = true as const;
export const EU_CONCRETE_TIME_DEPENDENT_MODEL_INTERFACE = true as const;
export const DEFAULT_EU_CREEP_MODEL = false as const;
export const DEFAULT_EU_SHRINKAGE_MODEL = false as const;
export const EU_CONCRETE_DURABILITY_PROFILE_READY = true as const;
export const NUMERICAL_EU_CODE_COVER_CHECK_IMPLEMENTED = false as const;
export const DEFAULT_EU_CONCRETE_COVER = false as const;
export const EU_CONCRETE_DETAILING_PROFILE_READY = true as const;
export const NUMERICAL_EU_DEVELOPMENT_LENGTH_IMPLEMENTED = false as const;
export const DEFAULT_EU_LAP_LENGTH = false as const;
export const EU_CONCRETE_SECOND_ORDER_PROFILE_READY = true as const;
export const STEEL_STABILITY_RULE_REUSED_FOR_EU_CONCRETE = false as const;
export const EU_PRESTRESSED_CONCRETE_PROFILE_EXTENSIBLE = true as const;
export const EU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED = false as const;
export const EU_CONCRETE_FIRE_DESIGN_IMPLEMENTED = false as const;
export const EU_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED = false as const;
export const EU_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const EU_CONCRETE_ENGINEERING_RULE_AUTHORITY_REQUIRED = true as const;
export const EU_CONCRETE_PROFILE_AND_CONFORMANCE_SEPARATE = true as const;
export const EU_CONCRETE_STANDARD_CONFORMANCE_STATE = "INTENDED_PROFILE" as const;
export const EU_CONCRETE_PACK_CERTIFIED = false as const;
export const EU_CONCRETE_STANDARD_CONTEXT_HUMAN_CONFIRMATION = true as const;
export const AI_EU_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_EN1992_EDITION_AUTHORITY = false as const;
export const AI_EU_CONCRETE_NATIONAL_ANNEX_AUTHORITY = false as const;
export const AI_EU_CONCRETE_NDP_AUTHORITY = false as const;
export const AI_PARTIAL_FACTOR_AUTHORITY = false as const;
export const AI_EU_CONCRETE_CODE_CAPACITY_AUTHORITY = false as const;
export const AI_EU_CONCRETE_STANDARD_CONFORMANCE_AUTHORITY = false as const;
export const EU_CONCRETE_STANDARD_TENANT_ISOLATION = true as const;
export const EU_CONCRETE_STANDARD_WORKSPACE_ISOLATION = true as const;
export const EU_CONCRETE_INVERSE_DESIGN_CONTEXT_READY = true as const;
export const GENERATIVE_MODEL_SELECTS_NATIONAL_ANNEX = false as const;
export const GENERATIVE_MODEL_SELECTS_NDP = false as const;
export const EU_CONCRETE_OPTIMIZATION_RECHECK_REQUIRED = true as const;
export const EU_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_CONCRETE_MTO_HANDOFF_READY = true as const;
export const DEFAULT_EU_CONCRETE_COST_RATE = false as const;
export const DEFAULT_EU_CONCRETE_CARBON_FACTOR = false as const;
export const DEFAULT_EU_REINFORCEMENT_CARBON_FACTOR = false as const;
export const EU_CONCRETE_PRODUCT_CLAIM_LEVEL = "EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY" as const;
export const EU_CONCRETE_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_COMMON_MECHANICS" as const;
export const EU_CONCRETE_STANDARD_CONTEXT_FAIL_CLOSED = true as const;
export const COPYRIGHTED_EN1992_TEXT_COMMITTED = false as const;
export const AU_CONCRETE_PARAMETER_LEAKAGE_INTO_EU = false as const;
export const EU_CONCRETE_PARAMETER_LEAKAGE_INTO_AU = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU1 = false as const;
export const D1E_EU1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const EOS_D1E_EU1_CLOSED = true as const;
export const EU_CONCRETE_IMPLEMENTATION_VERSION = "d1e-eu1.0" as const;

export const EU_CONCRETE_STANDARD_FAMILY = "EN 1992" as const;
export const EU_CONCRETE_STANDARD_IDENTIFIER = "EN 1992" as const;
export const EU_INITIAL_CONCRETE_STANDARD_PART = "EN_1992_1_1" as const;

export const EN1992_PART_IDS = [
  "EN_1992_1_1",
  "EN_1992_1_2",
  "EN_1992_2",
  "EN_1992_3",
  "EN_1992_4",
] as const;
export type En1992PartId = (typeof EN1992_PART_IDS)[number];

export const EU_CONCRETE_SOURCE_PRECEDENCE_KINDS = [
  "EN_1992_BASE_STANDARD",
  "NATIONAL_ANNEX",
  "PROJECT_REQUIREMENT",
  "CLIENT_REQUIREMENT",
  "ENGINEERING_DESIGN_CRITERIA",
  "VALIDATED_PROJECT_OVERRIDE",
] as const;
export type EuConcreteSourcePrecedenceKind = (typeof EU_CONCRETE_SOURCE_PRECEDENCE_KINDS)[number];

export const EU_CONCRETE_RESOLVER_FAIL_REASONS = [
  "STANDARD_EDITION_REQUIRED",
  "NATIONAL_ANNEX_REQUIRED",
  "NATIONAL_ANNEX_MISMATCH",
  "NDP_REQUIRED",
  "STANDARD_PART_UNSUPPORTED",
  "STANDARD_VERSION_CONFLICT",
  "USER_LOCATION_INFERENCE_DENIED",
  "AI_AUTHORITY_DENIED",
  "HUMAN_CONFIRMATION_REQUIRED",
  "RULE_AUTHORITY_DENIED",
  "STANDARD_CONTEXT_INCOMPLETE",
  "STANDARD_CONTEXT_CONFLICT",
  "PROJECT_OVERRIDE_CONFLICT",
  "NDP_EDITION_INCOMPATIBLE",
  "MISSING_MATERIAL_PROPERTY_SOURCE",
  "STALE_STANDARD_CONTEXT",
] as const;
export type EuConcreteResolverFailReason = (typeof EU_CONCRETE_RESOLVER_FAIL_REASONS)[number];

export type EuConcreteNdpRecord = EurocodeNdpRecord & {
  generationFamily: EurocodeGenerationFamily;
  provenanceRef: string;
};

export type EuConcreteProjectOverride = {
  overrideId: string;
  baseStandardFamily: typeof EU_CONCRETE_STANDARD_FAMILY;
  partRef: En1992PartId | string;
  edition: string;
  nationalAnnexRef: string | null;
  ndpContextRef: string | null;
  authorityRef: string;
  scope: string;
  reason: string;
  approverReviewerRef: string;
  version: string;
  provenanceRef: string;
  sourceExplicit: true;
  authorityExplicit: true;
  scopeExplicit: true;
  conflictBehavior: "FAIL_CLOSED";
};

export type EuConcreteStandardContextConfirmation = EurocodeStandardContextConfirmation & {
  ndpSetConfirmed: boolean;
  materialStandardsConfirmed: boolean;
  projectOverridesConfirmed: boolean;
};

export type EurocodeConcreteProjectContext = {
  projectRef: string;
  tenantId: string;
  workspaceId: string;
  jurisdictionProfileRef: string;
  countryCode: string | null;
  standardFamily: typeof EU_CONCRETE_STANDARD_FAMILY;
  standardGeneration: EurocodeGenerationFamily;
  standardEdition: typeof EU_CONCRETE_STANDARD_EDITION | string;
  amendmentState: typeof EU_CONCRETE_STANDARD_AMENDMENT_STATE | string;
  standardPartRefs: readonly (En1992PartId | string)[];
  nationalAnnexRef: string | null;
  nationalAnnexSet: readonly EurocodeNationalAnnex[];
  ndpSetRef: string | null;
  ndpSet: readonly EuConcreteNdpRecord[];
  concreteMaterialStandardRefs: readonly string[];
  reinforcementMaterialStandardRefs: readonly string[];
  loadStandardContextRef: string | null;
  durabilityContextRef: string | null;
  serviceabilityContextRef: string | null;
  projectOverrideRefs: readonly EuConcreteProjectOverride[];
  authorityRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  provenance: EosGlobalProvenanceContract;
  validationState: string;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  workspaceGlobalAnnexId: null;
  statutoryEuMembershipRequired: false;
  statutoryEuComplianceClaimed: false;
  internationalContractualUse: boolean;
};

export type EurocodeConcreteCalculationContext = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectRef: string;
  jurisdictionProfileRef: string;
  countryCode: string;
  standardFamily: "EUROCODE";
  standardCode: string;
  standardPart: En1992PartId | string;
  version: EurocodeStandardVersion;
  nationalAnnex: EurocodeNationalAnnex | null;
  ndpSet: readonly EuConcreteNdpRecord[];
  concreteMaterialStandardRefs: readonly string[];
  reinforcementMaterialStandardRefs: readonly string[];
  loadStandardContextRef: string | null;
  durabilityContextRef: string | null;
  serviceabilityContextRef: string | null;
  projectOverrideRefs: readonly EuConcreteProjectOverride[];
  sourcePrecedence: readonly EuConcreteSourcePrecedenceKind[];
  authorityRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  intendedStandardProfile: "EN1992";
  standardConformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  validationState: string;
  provenanceRef: string;
  issued: boolean;
  humanConfirmation: EuConcreteStandardContextConfirmation | null;
  statutoryEuMembershipRequired: false;
  statutoryEuComplianceClaimed: false;
  internationalContractualUse: boolean;
  piiPresent: false;
};

export type EuConcreteResolverInput = {
  projectContext: EurocodeConcreteProjectContext | null;
  explicitCalculationContext: EurocodeConcreteCalculationContext | null;
  issuedContext: EurocodeConcreteCalculationContext | null;
  requestedPartId: En1992PartId | string;
  requiredNdpIds: readonly string[];
  ruleRequiresNdp: boolean;
  source: "explicit" | "project_default" | "locale" | "ip" | "browser_locale" | "physical_location" | "tenant_address" | "ai" | "ui_location";
  aiSelectedAnnex: boolean;
  aiSuppliedNdp: boolean;
  aiInferredEdition: boolean;
  aiClaimedConformance: boolean;
  humanConfirmed: boolean;
  ruleAuthorityType: EngineeringRuleAuthorityType | string;
  uiLocation?: string | null;
};

export type EuConcreteResolverResult =
  | { ok: true; context: EurocodeConcreteCalculationContext; failReason: null }
  | { ok: false; context: null; failReason: EuConcreteResolverFailReason | EurocodeResolverFailReason; detail: string; checkState: "CHECK_UNDETERMINED" };

export type EuConcreteMethodDependency = {
  methodId: string;
  methodType: string;
  standardPartRefs: readonly (En1992PartId | string)[];
  generationApplicability: readonly EurocodeGenerationFamily[];
  nationalAnnexRequired: boolean;
  ndpDependencies: readonly string[];
  materialResponseRef: string | null;
  stressBlockRef: string | null;
  strainLimitRefs: readonly string[];
  partialFactorRefs: readonly string[];
  numericalImplemented: false;
  methodScope: "FRAMEWORK_ONLY" | "NOT_IMPLEMENTED";
};

export type EuConcreteEngineeringRule = {
  ruleId: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  standardFamily: typeof EU_CONCRETE_STANDARD_FAMILY;
  generation: EurocodeGenerationFamily;
  edition: typeof EU_CONCRETE_STANDARD_EDITION | string;
  part: En1992PartId | string;
  nationalAnnexDependency: boolean;
  ndpDependency: readonly string[];
  applicability: string;
  implementationVersion: typeof EU_CONCRETE_IMPLEMENTATION_VERSION;
  validationState: string;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
};
