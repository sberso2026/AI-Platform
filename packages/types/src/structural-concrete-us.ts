/**
 * EOS-D1E-US-1 — US ACI 318 concrete standard-context foundation.
 * Family / edition / building-code adoption / local amendment binding only.
 * Not a numerical ACI 318 capacity engine.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { EngineeringRuleAuthorityType } from "./structural-steel";
import type {
  BuildingCodeAdoptionContext,
  UsLoadStandardDependency,
  UsLocalAmendment,
  UsProjectOverride,
} from "./structural-steel";
import { US_CONCRETE_STANDARD_EDITION } from "./structural-concrete";

export const EOS_D1E_US1_PHASE = "EOS-D1E-US-1" as const;
export const D1E_US1_SCOPE = "ACI 318 family/edition/adoption binding foundation before bounded methods" as const;
export const D1E_US1_SCOPE_CONFIRMED = true as const;
export const PARALLEL_US_CONCRETE_STANDARD_FRAMEWORK_CREATED = false as const;
export const PARALLEL_US_RC_SECTION_KERNEL_CREATED = false as const;
export const US_CONCRETE_STANDARD_FAMILY_BOUND = true as const;
export const US_CONCRETE_STANDARD_AMENDMENT_STATE = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const US_CONCRETE_STANDARD_ERRATA_STATE = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const SILENT_ACI318_EDITION_INFERENCE = false as const;
export const US_CONCRETE_PROFILE_AND_CONFORMANCE_SEPARATE = true as const;
export const US_CONCRETE_JURISDICTION_AND_STANDARD_SEPARATE = true as const;
export const US_CONCRETE_STANDARD_INFERRED_FROM_USER_LOCATION = false as const;
export const US_BUILDING_CODE_AND_ACI_CONCRETE_STANDARD_SEPARATE = true as const;
export const ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const US_CONCRETE_BUILDING_CODE_ADOPTION_CONTEXT = true as const;
export const DEFAULT_US_CONCRETE_BUILDING_CODE = false as const;
export const SILENT_US_BUILDING_CODE_EDITION_INFERENCE = false as const;
export const US_CONCRETE_BUILDING_CODE_ADOPTION_RESOLVER = true as const;
export const US_CONCRETE_ADOPTION_CONFLICT_DETECTION = true as const;
export const UNRESOLVED_US_CONCRETE_ADOPTION_CONFLICT_FAILS_CLOSED = true as const;
export const US_CONCRETE_DIRECT_CONTRACT_PROFILE_SUPPORTED = true as const;
export const DIRECT_CONTRACT_ACI_PROFILE_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const ACI_CONCRETE_NOT_HARDCODED_TO_US_GEOGRAPHY = true as const;
export const INTERNATIONAL_ACI_CONCRETE_PROFILE_SUPPORTED = true as const;
export const US_CONCRETE_LOCAL_AMENDMENT_MODEL = true as const;
export const US_CONCRETE_LOCAL_AMENDMENT_VALUE_GUESSED = false as const;
export const US_CONCRETE_LOCAL_AMENDMENT_EDITION_COMPATIBILITY = true as const;
export const US_CONCRETE_PROJECT_STANDARD_CONTEXT = true as const;
export const US_CONCRETE_CALCULATION_CONTEXT = true as const;
export const ISSUED_US_CONCRETE_CALCULATION_CONTEXT_IMMUTABLE = true as const;
export const US_CONCRETE_RULE_VERSION_IMMUTABILITY = true as const;
export const STANDARD_UPDATE_OVERWRITES_HISTORICAL_US_CONCRETE_RULE = false as const;
export const HISTORICAL_US_CONCRETE_RESULT_REPRODUCIBLE = true as const;
export const US_CONCRETE_PROJECT_OVERRIDE_GOVERNANCE = true as const;
export const US_CONCRETE_SOURCE_PRECEDENCE_MODEL = true as const;
export const US_CONCRETE_STANDARD_CONTEXT_RESOLVER = true as const;
export const US_CONCRETE_LOAD_STANDARD_DEPENDENCY_MODEL = true as const;
export const SILENT_US_LOAD_STANDARD_EDITION_INFERENCE = false as const;
export const D1C_DEMAND_ENGINE_REUSED_FOR_US_CONCRETE = true as const;
export const PARALLEL_US_CONCRETE_LOAD_COMBINATION_ENGINE_CREATED = false as const;
export const US_CONCRETE_SEISMIC_STANDARD_DEPENDENCY_MODEL = true as const;
export const US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED = false as const;
export const US_CONCRETE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE = true as const;
export const US_CONCRETE_MATERIAL_PROPERTY_SOURCE_REQUIRED = true as const;
export const US_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES = false as const;
export const US_REINFORCEMENT_PROPERTY_SOURCE_REQUIRED = true as const;
export const US_CONCRETE_MATERIAL_CATALOG_ADAPTER_READY = true as const;
export const US_REINFORCEMENT_CATALOG_ADAPTER_READY = true as const;
export const D1E1_GEOMETRY_REUSED_FOR_US_CONCRETE = true as const;
export const GEOMETRIC_CLEARANCE_EQUALS_ACI_COVER_COMPLIANCE = false as const;
export const D1E1_KINEMATICS_REUSED_FOR_US_CONCRETE = true as const;
export const D1E1_SECTION_INTEGRATOR_REUSED_FOR_US_CONCRETE = true as const;
export const PARALLEL_US_CONCRETE_SECTION_INTEGRATOR_CREATED = false as const;
export const D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_US_CONCRETE = true as const;
export const PARALLEL_US_CONCRETE_NEUTRAL_AXIS_SOLVER_CREATED = false as const;
export const US_CONCRETE_MATERIAL_RESPONSE_ADAPTER_READY = true as const;
export const US_CONCRETE_STRESS_BLOCK_DEPENDENCY_MODEL = true as const;
export const US_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED = false as const;
export const US_CONCRETE_STRAIN_LIMIT_DEPENDENCY_MODEL = true as const;
export const US_CONCRETE_STRAIN_LIMIT_GUESSED = false as const;
export const US_CONCRETE_STRENGTH_REDUCTION_FACTOR_MODEL = true as const;
export const US_CONCRETE_STRENGTH_REDUCTION_FACTOR_GUESSED = false as const;
export const US_CONCRETE_STRENGTH_FACTOR_DEPENDENCY_EXPLICIT = true as const;
export const STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE = false as const;
export const US_CONCRETE_STRENGTH_FACTOR_SEMANTICS_CONFINED_TO_US_ADAPTER = true as const;
export const US_CONCRETE_FLEXURE_PROFILE_READY = true as const;
export const IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS = "NONE" as const;
export const US_CONCRETE_AXIAL_FLEXURE_PROFILE_READY = true as const;
export const US_CONCRETE_SHEAR_PROFILE_READY = true as const;
export const NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED = false as const;
export const US_CONCRETE_PUNCHING_PROFILE_READY = true as const;
export const NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED = false as const;
export const US_CONCRETE_TORSION_PROFILE_READY = true as const;
export const NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED = false as const;
export const US_CONCRETE_SERVICEABILITY_PROFILE_READY = true as const;
export const US_CONCRETE_TIME_DEPENDENT_MODEL_INTERFACE = true as const;
export const DEFAULT_US_CREEP_MODEL = false as const;
export const DEFAULT_US_SHRINKAGE_MODEL = false as const;
export const US_CONCRETE_DURABILITY_PROFILE_READY = true as const;
export const DEFAULT_US_CONCRETE_EXPOSURE_CLASS = false as const;
export const NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED = false as const;
export const DEFAULT_US_CONCRETE_COVER = false as const;
export const US_CONCRETE_DETAILING_PROFILE_READY = true as const;
export const NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED = false as const;
export const NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED = false as const;
export const DEFAULT_US_LAP_LENGTH = false as const;
export const US_CONCRETE_SECOND_ORDER_PROFILE_READY = true as const;
export const STEEL_STABILITY_RULE_REUSED_FOR_US_CONCRETE = false as const;
export const US_PRESTRESSED_CONCRETE_PROFILE_EXTENSIBLE = true as const;
export const US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED = false as const;
export const US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const US_CONCRETE_FIRE_DESIGN_IMPLEMENTED = false as const;
export const US_CONCRETE_ENGINEERING_RULE_AUTHORITY_REQUIRED = true as const;
export const COPYRIGHTED_ACI318_TEXT_COMMITTED = false as const;
export const US_CONCRETE_STANDARD_CONFORMANCE_STATE = "INTENDED_PROFILE" as const;
export const US_CONCRETE_PACK_CERTIFIED = false as const;
export const US_CONCRETE_STANDARD_CONTEXT_HUMAN_CONFIRMATION = true as const;
export const AI_US_CONCRETE_STANDARD_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_ACI318_EDITION_AUTHORITY = false as const;
export const AI_BUILDING_CODE_ADOPTION_AUTHORITY = false as const;
export const AI_LOAD_STANDARD_AUTHORITY = false as const;
export const AI_CODE_CAPACITY_AUTHORITY = false as const;
export const AI_ACI_CONFORMANCE_AUTHORITY = false as const;
export const US_CONCRETE_STANDARD_TENANT_ISOLATION = true as const;
export const US_CONCRETE_STANDARD_WORKSPACE_ISOLATION = true as const;
export const US_CONCRETE_PROJECT_CONTEXT_ISOLATION = true as const;
export const US_CONCRETE_INVERSE_DESIGN_CONTEXT_READY = true as const;
export const GENERATIVE_MODEL_SELECTS_ACI_EDITION = false as const;
export const GENERATIVE_MODEL_SELECTS_BUILDING_CODE = false as const;
export const GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT = false as const;
export const GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION = false as const;
export const GENERATIVE_OPTIMIZER_CAN_SILENTLY_CHANGE_US_STANDARD_CONTEXT = false as const;
export const US_CONCRETE_OPTIMIZATION_RECHECK_REQUIRED = true as const;
export const US_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const US_CONCRETE_MTO_HANDOFF_READY = true as const;
export const DEFAULT_US_CONCRETE_COST_RATE = false as const;
export const DEFAULT_US_REINFORCEMENT_COST_RATE = false as const;
export const DEFAULT_US_CONCRETE_CARBON_FACTOR = false as const;
export const DEFAULT_US_REINFORCEMENT_CARBON_FACTOR = false as const;
export const US_CONCRETE_STANDARD_CONTEXT_FAIL_CLOSED = true as const;
export const US_CONCRETE_STANDARD_CONTEXT_UNIT_INDEPENDENT = true as const;
export const US_CONCRETE_PRODUCT_CLAIM_LEVEL = "US_CONCRETE_STANDARD_PROFILE_FOUNDATION" as const;
export const US_CONCRETE_IMPLEMENTATION_MATURITY = "STANDARD_BINDING_FRAMEWORK" as const;
export const D1E_US_VALIDATION_DEBT_UPDATED = true as const;
export const AU_CONCRETE_PARAMETER_LEAKAGE_INTO_US = false as const;
export const EU_CONCRETE_PARAMETER_LEAKAGE_INTO_US = false as const;
export const US_CONCRETE_PARAMETER_LEAKAGE_INTO_AU = false as const;
export const US_CONCRETE_PARAMETER_LEAKAGE_INTO_EU = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_US1 = false as const;
export const D1E_US1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const EOS_D1E_US1_CLOSED = true as const;
export const D1E_US_ROADMAP_HANDOFF_VALIDATED = true as const;
export const US_CONCRETE_IMPLEMENTATION_VERSION = "d1e-us1.0" as const;

export const US_CONCRETE_STANDARD_FAMILY = "ACI 318" as const;
export const US_CONCRETE_STANDARD_IDENTIFIER = "ACI 318" as const;
export const ACI_UNKNOWN_EDITION_TOKEN = "UNKNOWN_PENDING_CONFIRMATION" as const;

export const US_CONCRETE_ECOSYSTEM_IDS = [
  "ACI_318",
  "ASCE_7",
  "IBC",
  "ASTM_CONCRETE",
  "ASTM_REINFORCEMENT",
] as const;
export type UsConcreteEcosystemId = (typeof US_CONCRETE_ECOSYSTEM_IDS)[number];

export const US_CONCRETE_SOURCE_PRECEDENCE_KINDS = [
  "BUILDING_CODE_ADOPTION",
  "ACI_STANDARD_PROFILE",
  "LOCAL_AMENDMENT",
  "PROJECT_REQUIREMENT",
  "CLIENT_REQUIREMENT",
  "ENGINEERING_DESIGN_CRITERIA",
  "VALIDATED_PROJECT_OVERRIDE",
] as const;
export type UsConcreteSourcePrecedenceKind = (typeof US_CONCRETE_SOURCE_PRECEDENCE_KINDS)[number];

export const US_CONCRETE_RESOLVER_FAIL_REASONS = [
  "ACI_EDITION_REQUIRED",
  "BUILDING_CODE_CONTEXT_REQUIRED",
  "BUILDING_CODE_EDITION_MISMATCH",
  "ACI_REFERENCED_EDITION_MISMATCH",
  "EFFECTIVE_DATE_CONFLICT",
  "LOCAL_AMENDMENT_REQUIRED",
  "LOCAL_AMENDMENT_CONFLICT",
  "LOAD_STANDARD_CONTEXT_REQUIRED",
  "PROJECT_OVERRIDE_CONFLICT",
  "STANDARD_VERSION_CONFLICT",
  "UNSUPPORTED_STANDARD_PROFILE",
  "STANDARD_CONTEXT_INCOMPLETE",
  "STANDARD_CONTEXT_CONFLICT",
  "USER_LOCATION_INFERENCE_DENIED",
  "AI_AUTHORITY_DENIED",
  "HUMAN_CONFIRMATION_REQUIRED",
  "RULE_AUTHORITY_DENIED",
  "MISSING_MATERIAL_PROPERTY_SOURCE",
  "STALE_STANDARD_CONTEXT",
] as const;
export type UsConcreteResolverFailReason = (typeof US_CONCRETE_RESOLVER_FAIL_REASONS)[number];

export type UsConcreteBuildingCodeAdoptionContext = BuildingCodeAdoptionContext & {
  referencedConcreteStandard: typeof US_CONCRETE_STANDARD_FAMILY | string;
  referencedConcreteStandardEdition: typeof US_CONCRETE_STANDARD_EDITION | string;
  version: string;
  provenanceRef: string;
};

export type UsConcreteLocalAmendment = UsLocalAmendment & {
  amendmentId: string;
  affectedStandardProfile: string;
  scope: string;
  version: string;
  provenanceRef: string;
};

export type UsConcreteSeismicDependency = {
  applicable: boolean;
  standardId: string;
  standardCode: string;
  edition: string;
  implemented: false;
};

export type UsConcreteProjectOverride = UsProjectOverride & {
  overrideId: string;
  baseStandardFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  edition: string;
  buildingCodeContextRef: string | null;
  localAmendmentContextRef: string | null;
  authorityRef: string;
  scope: string;
  reason: string;
  reviewContextRef: string;
  version: string;
  provenanceRef: string;
};

export type UsConcreteStandardContextConfirmation = {
  aciEditionConfirmed: boolean;
  amendmentErrataConfirmed: boolean;
  buildingCodeAdoptionConfirmed: boolean | "NOT_APPLICABLE";
  referencedStandardProfileConfirmed: boolean;
  localAmendmentsConfirmed: boolean;
  loadStandardConfirmed: boolean;
  materialStandardsConfirmed: boolean;
  projectOverridesConfirmed: boolean;
  confirmedAt: string;
  reviewerAuthorityRef: string;
  aiConfirmed: false;
  engineeringApprovalImplied: false;
};

export type UsConcreteProjectStandardContext = {
  projectRef: string;
  tenantId: string;
  workspaceId: string;
  jurisdictionProfileRef: string;
  buildingCodeContextRef: string | null;
  buildingCodeAdoption: UsConcreteBuildingCodeAdoptionContext | null;
  concreteStandardFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  concreteStandardEdition: typeof US_CONCRETE_STANDARD_EDITION | string;
  amendmentState: typeof US_CONCRETE_STANDARD_AMENDMENT_STATE | string;
  errataState: typeof US_CONCRETE_STANDARD_ERRATA_STATE | string;
  loadStandardContextRef: string | null;
  loadStandard: UsLoadStandardDependency | null;
  seismicStandardContextRef: string | null;
  seismicStandard: UsConcreteSeismicDependency | null;
  concreteMaterialStandardRefs: readonly string[];
  reinforcementMaterialStandardRefs: readonly string[];
  localAmendmentSetRef: string | null;
  localAmendmentSet: readonly UsConcreteLocalAmendment[];
  directContractProfileRef: string | null;
  durabilityContextRef: string | null;
  serviceabilityContextRef: string | null;
  projectOverrideRefs: readonly UsConcreteProjectOverride[];
  authorityRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  provenance: EosGlobalProvenanceContract;
  validationState: string;
  conformanceState: typeof US_CONCRETE_STANDARD_CONFORMANCE_STATE;
  workspaceGlobalCodeProfileId: null;
  statutoryUsComplianceClaimed: false;
  internationalContractualUse: boolean;
};

export type UsConcreteCalculationContext = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectRef: string;
  jurisdictionProfileRef: string;
  buildingCodeAdoption: UsConcreteBuildingCodeAdoptionContext | null;
  concreteStandardFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  concreteStandardCode: string;
  concreteStandardEdition: string;
  amendmentState: string;
  errataState: string;
  loadStandard: UsLoadStandardDependency | null;
  seismicStandard: UsConcreteSeismicDependency | null;
  concreteMaterialStandardRefs: readonly string[];
  reinforcementMaterialStandardRefs: readonly string[];
  localAmendmentSet: readonly UsConcreteLocalAmendment[];
  projectOverrideRefs: readonly UsConcreteProjectOverride[];
  sourcePrecedence: readonly UsConcreteSourcePrecedenceKind[];
  authorityRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  intendedStandardProfile: "ACI318";
  standardConformanceState: typeof US_CONCRETE_STANDARD_CONFORMANCE_STATE;
  validationState: string;
  provenanceRef: string;
  issued: boolean;
  humanConfirmation: UsConcreteStandardContextConfirmation | null;
  directContractProfile: boolean;
  statutoryUsComplianceClaimed: false;
  internationalContractualUse: boolean;
  unitSystemIndependent: true;
  piiPresent: false;
};

export type UsConcreteResolverInput = {
  projectContext: UsConcreteProjectStandardContext | null;
  explicitCalculationContext: UsConcreteCalculationContext | null;
  issuedContext: UsConcreteCalculationContext | null;
  adoptionRequired: boolean;
  localAmendmentRequired: boolean;
  loadStandardRequired: boolean;
  source: "explicit" | "project_default" | "locale" | "ip" | "browser_locale" | "physical_location" | "tenant_address" | "ai" | "ui_location";
  aiSelectedAciEdition: boolean;
  aiSelectedBuildingCode: boolean;
  aiInventedAmendment: boolean;
  aiSelectedLoadStandardEdition: boolean;
  aiClaimedConformance: boolean;
  aiClaimedBuildingCodeCompliance: boolean;
  humanConfirmed: boolean;
  ruleAuthorityType: EngineeringRuleAuthorityType | string;
  unresolvedSourceConflict: boolean;
  generativeAttemptedStandardContextChange?: boolean;
};

export type UsConcreteResolverResult =
  | { ok: true; context: UsConcreteCalculationContext; failReason: null }
  | { ok: false; context: null; failReason: UsConcreteResolverFailReason; detail: string; checkState: "CHECK_UNDETERMINED" };

export type UsConcreteMethodDependency = {
  methodId: string;
  methodType: string;
  aciFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  edition: typeof US_CONCRETE_STANDARD_EDITION | string;
  buildingCodeDependency: boolean;
  localAmendmentDependency: boolean;
  materialResponseRef: string | null;
  stressBlockRef: string | null;
  strainLimitRefs: readonly string[];
  strengthReductionFactorRefs: readonly string[];
  numericalImplemented: false;
  methodScope: "FRAMEWORK_ONLY" | "NOT_IMPLEMENTED";
};

export type UsConcreteEngineeringRule = {
  ruleId: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  aciFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  edition: typeof US_CONCRETE_STANDARD_EDITION | string;
  amendmentErrataState: string;
  buildingCodeDependency: boolean;
  localAmendmentDependency: boolean;
  applicability: string;
  requiredInputs: readonly string[];
  implementationVersion: typeof US_CONCRETE_IMPLEMENTATION_VERSION;
  validationState: string;
  conformanceState: typeof US_CONCRETE_STANDARD_CONFORMANCE_STATE;
};
