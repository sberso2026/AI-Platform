/**
 * EOS-D1E-0 — common Structural concrete design foundation.
 * Architecture / domain / contracts only. Not AS 3600 / EN 1992 / ACI 318 formula engines.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { StructuralDemandResult } from "./structural-demand";
import type { StructuralEvidenceBinding } from "./structural-domain";
import type { StructuralStandardContext } from "./structural-standard-binding";
import type { EngineeringRuleAuthorityType, SteelSourceAuthorityType } from "./structural-steel";

export const EOS_D1E0_PHASE = "EOS-D1E-0" as const;
export const D1E_CANONICAL_SCOPE = "Concrete Design Capability" as const;
export const D1E_CANONICAL_SCOPE_CONFIRMED = true as const;
export const D1D_FROZEN_ARCHITECTURE_PRESERVED = true as const;
export const GLOBAL_CONCRETE_ARCHITECTURE = true as const;
export const PARALLEL_AU_CONCRETE_CORE_CREATED = false as const;
export const PARALLEL_EU_CONCRETE_CORE_CREATED = false as const;
export const PARALLEL_US_CONCRETE_CORE_CREATED = false as const;
export const CONCRETE_DOMAIN_MODEL = true as const;
export const CONCRETE_ELEMENT_TYPE_MODEL = true as const;
export const CONCRETE_ELEMENT_DIMENSIONALITY_MODEL = true as const;
export const GENERAL_CONCRETE_FEA_CLAIMED = false as const;
export const CONCRETE_MATERIAL_MODEL = true as const;
export const CONCRETE_MATERIAL_PROPERTIES_GOVERNED = true as const;
export const CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES = false as const;
export const REINFORCEMENT_MATERIAL_MODEL = true as const;
export const REINFORCEMENT_PROPERTIES_GOVERNED = true as const;
export const REINFORCEMENT_LAYOUT_MODEL = true as const;
export const UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA = false as const;
export const COMMON_REINFORCEMENT_GEOMETRY_MECHANICS = true as const;
export const CODE_REINFORCEMENT_RATIO_RULE_IMPLEMENTED = false as const;
export const CONCRETE_SECTION_GEOMETRY_MODEL = true as const;
export const CONCRETE_SECTION_VOID_MODEL = true as const;
export const CONCRETE_COVER_MODEL = true as const;
export const DEFAULT_MINIMUM_CONCRETE_COVER = false as const;
export const CONCRETE_DURABILITY_CONTEXT = true as const;
export const GLOBAL_CORE_CONTAINS_JURISDICTION_EXPOSURE_CLASS = false as const;
export const CONCRETE_DESIGN_LIFE_CONTEXT = true as const;
export const D1C_ACTION_MODEL_REUSED = true as const;
export const PARALLEL_CONCRETE_DEMAND_ENGINE_CREATED = false as const;
export const CONCRETE_DEMAND_PROVENANCE = true as const;
export const CONCRETE_LIMIT_STATE_TAXONOMY = true as const;
export const CONCRETE_STRENGTH_RESULT_SEMANTICS = true as const;
export const GLOBAL_CONCRETE_SAFETY_FACTOR_MODEL_NEUTRAL = true as const;
export const CONCRETE_MATERIAL_RESPONSE_INTERFACE = true as const;
export const GLOBAL_CODE_STRESS_BLOCK_IMPLEMENTED = false as const;
export const CONCRETE_SECTION_COMPATIBILITY_INTERFACE = true as const;
export const CONCRETE_SECTION_EQUILIBRIUM_CONTRACT = true as const;
export const CONCRETE_SECTION_INTEGRATION_EXTENSIBILITY = true as const;
export const CONCRETE_FLEXURE_FRAMEWORK = true as const;
export const NUMERICAL_CONCRETE_CODE_FLEXURE_IMPLEMENTED = false as const;
export const CONCRETE_AXIAL_FLEXURE_FRAMEWORK = true as const;
export const UNIVERSAL_CONCRETE_INTERACTION_EQUATION = false as const;
export const CONCRETE_INTERACTION_SURFACE_INTERFACE = true as const;
export const CONCRETE_SHEAR_FRAMEWORK = true as const;
export const NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED = false as const;
export const CONCRETE_TRANSVERSE_REINFORCEMENT_MODEL = true as const;
export const CONCRETE_PUNCHING_SHEAR_FRAMEWORK = true as const;
export const NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED = false as const;
export const CONCRETE_TORSION_FRAMEWORK = true as const;
export const NUMERICAL_CONCRETE_TORSION_IMPLEMENTED = false as const;
export const CONCRETE_SERVICEABILITY_FRAMEWORK = true as const;
export const D1C_DEFLECTION_REUSED_WHERE_VALID = true as const;
export const ELASTIC_DEFLECTION_EQUALS_LONG_TERM_RC_DEFLECTION = false as const;
export const CONCRETE_CRACK_CONTROL_FRAMEWORK = true as const;
export const NUMERICAL_CODE_CRACK_WIDTH_IMPLEMENTED = false as const;
export const CONCRETE_TIME_DEPENDENT_BEHAVIOR_FRAMEWORK = true as const;
export const DEFAULT_CREEP_MODEL = false as const;
export const DEFAULT_SHRINKAGE_MODEL = false as const;
export const CONCRETE_SECOND_ORDER_STABILITY_FRAMEWORK = true as const;
export const STEEL_STABILITY_RULE_REUSED_FOR_CONCRETE = false as const;
export const CONCRETE_DEVELOPMENT_ANCHORAGE_FRAMEWORK = true as const;
export const NUMERICAL_DEVELOPMENT_LENGTH_IMPLEMENTED = false as const;
export const CONCRETE_LAP_SPLICE_FRAMEWORK = true as const;
export const DEFAULT_LAP_LENGTH = false as const;
export const CONCRETE_DETAILING_FRAMEWORK = true as const;
export const CONCRETE_CAPACITY_EQUALS_DETAILING_COMPLIANCE = false as const;
export const CONCRETE_REINFORCEMENT_CONSTRUCTABILITY_CONTEXT = true as const;
export const CONCRETE_MTO_HANDOFF_READY = true as const;
export const CONCRETE_CARBON_HANDOFF_READY = true as const;
export const DEFAULT_CONCRETE_CARBON_FACTOR = false as const;
export const PRESTRESSED_CONCRETE_EXTENSION_READY = true as const;
export const PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED = false as const;
export const COMPOSITE_CONCRETE_DESIGN_IMPLEMENTED = false as const;
export const CONCRETE_CONSTRUCTION_TYPE_CONTEXT = true as const;
export const PRECAST_LIFTING_DESIGN_IMPLEMENTED = false as const;
export const CONCRETE_CONSTRUCTION_STAGE_CONTEXT = true as const;
export const CONSTRUCTION_STAGE_ANALYSIS_IMPLEMENTED = false as const;
export const AU_CONCRETE_ADAPTER_READY = true as const;
export const AU_CONCRETE_STANDARD_FAMILY_READY = true as const;
export const AU_CONCRETE_STANDARD_EDITION = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const EU_CONCRETE_ADAPTER_READY = true as const;
export const EU_CONCRETE_STANDARD_FAMILY_READY = true as const;
export const EU_CONCRETE_STANDARD_EDITION = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const DEFAULT_EU_CONCRETE_NATIONAL_ANNEX = false as const;
export const US_CONCRETE_ADAPTER_READY = true as const;
export const US_CONCRETE_STANDARD_FAMILY_READY = true as const;
export const US_CONCRETE_STANDARD_EDITION = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const CONCRETE_DESIGN_STANDARD_AND_MATERIAL_STANDARD_SEPARATE = true as const;
export const CONCRETE_ENGINEERING_RULE_AUTHORITY_REUSED = true as const;
export const PARALLEL_CONCRETE_RULE_AUTHORITY_CREATED = false as const;
export const CONCRETE_VALIDATION_DIMENSIONS_REUSED = true as const;
export const PARALLEL_CONCRETE_VALIDATION_MODEL_CREATED = false as const;
export const CONCRETE_STANDARD_PROFILE_AND_CONFORMANCE_SEPARATE = true as const;
export const CONCRETE_RESULT_PROVENANCE_MODEL = true as const;
export const CONCRETE_RESULT_VERSIONING_MODEL = true as const;
export const STALE_CONCRETE_RESULT_REUSE_ALLOWED = false as const;
export const CONCRETE_DESIGN_ORCHESTRATION_FRAMEWORK = true as const;
export const CONCRETE_DESIGN_COMPLETENESS_MODEL = true as const;
export const CONCRETE_FAIL_CLOSED_MODEL = true as const;
export const AI_CONCRETE_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_CONCRETE_NUMERICAL_AUTHORITY = false as const;
export const AI_CONCRETE_CODE_CONFORMANCE_AUTHORITY = false as const;
export const CONCRETE_OPTIMIZATION_HANDOFF_READY = true as const;
export const CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const CONCRETE_INVERSE_DESIGN_COMPATIBILITY = true as const;
export const GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const CONCRETE_HUMAN_REVIEW_MODEL = true as const;
export const CONCRETE_APPROVAL_STATE_SEPARATE = true as const;
export const AUTOMATIC_CONCRETE_ENGINEERING_APPROVAL = false as const;
export const CONCRETE_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const CONCRETE_MEMBER_DESIGN_IMPLIES_GEOTECHNICAL_VALIDATION = false as const;
export const CONCRETE_FIRE_DESIGN_IMPLEMENTED = false as const;
export const CONCRETE_SEISMIC_DESIGN_IMPLEMENTED = false as const;
export const COPYRIGHTED_CONCRETE_STANDARD_TEXT_COMMITTED = false as const;
export const CONCRETE_GLOBAL_GOVERNANCE_REUSED = true as const;
export const PARALLEL_CONCRETE_SECURITY_MODEL_CREATED = false as const;
export const CONCRETE_CONTEXT_PII_REQUIRED = false as const;
export const D1D_CAPABILITY_MANIFEST_REUSED = true as const;
export const CONCRETE_CAPABILITY_MANIFEST_REGISTERED = true as const;
export const CONCRETE_PRODUCT_CAPABILITY_GATING = true as const;
export const CONCRETE_IMPLEMENTATION_MATURITY = "FRAMEWORK_ONLY" as const;
export const CONCRETE_STANDARD_CONFORMANCE_STATE = "INTENDED_PROFILE" as const;
export const CONCRETE_CONFORMANCE_VALIDATED = false as const;
export const D1E_VALIDATION_DEBT_REGISTER_DEFINED = true as const;
export const D1E_INTERNAL_ROADMAP_DEFINED = true as const;
export const RECOMMENDED_D1E_NEXT_PHASE = "D1E-EU" as const;
export const RECOMMENDED_D1E_NEXT_PHASE_SCOPE = "bounded Eurocode RC uniaxial flexure using D1E-1 kernel and governed EN 1992 context" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E0 = false as const;
export const D1E0_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const EOS_D1E0_CLOSED = true as const;
export const CONCRETE_DESIGN_AVAILABLE = false as const;
export const CONCRETE_VALIDATION_PILOT_EXPOSURE = false as const;
export const SILENT_CONCRETE_STANDARD_EDITION_INFERENCE = false as const;
export const CONCRETE_CODE_PROFILE_INFERRED_FROM_USER_LOCATION = false as const;
export const AU_ONLY_CONCRETE_CORE = false as const;
export const EU_ONLY_CONCRETE_CORE = false as const;
export const US_ONLY_CONCRETE_CORE = false as const;

export const CONCRETE_UNKNOWN_STANDARD_TOKEN = "UNKNOWN_PENDING_CONFIRMATION" as const;

export const CONCRETE_ADAPTER_IDS = ["AU_CONCRETE", "EU_CONCRETE", "US_CONCRETE"] as const;
export type ConcreteAdapterId = (typeof CONCRETE_ADAPTER_IDS)[number];

export const CONCRETE_ELEMENT_TYPES = [
  "BEAM",
  "COLUMN",
  "SLAB",
  "WALL",
  "PEDESTAL",
  "PILE",
  "FOOTING",
  "MAT_RAFT",
  "OTHER_CONCRETE_ELEMENT",
] as const;
export type ConcreteElementType = (typeof CONCRETE_ELEMENT_TYPES)[number];

export const CONCRETE_ELEMENT_DIMENSIONALITIES = [
  "MEMBER_1D",
  "AREA_2D",
  "SOLID_3D",
] as const;
export type ConcreteElementDimensionality = (typeof CONCRETE_ELEMENT_DIMENSIONALITIES)[number];

export const CONCRETE_SECTION_SHAPES = [
  "RECTANGULAR",
  "CIRCULAR",
  "T_SECTION",
  "L_SECTION",
  "FLANGED",
  "POLYGONAL",
  "GENERIC_PROFILE",
] as const;
export type ConcreteSectionShape = (typeof CONCRETE_SECTION_SHAPES)[number];

export const CONCRETE_LIMIT_STATES = [
  "FLEXURE",
  "AXIAL_COMPRESSION",
  "AXIAL_TENSION",
  "AXIAL_FLEXURE",
  "BIAXIAL_AXIAL_FLEXURE",
  "SHEAR",
  "TORSION",
  "PUNCHING_SHEAR",
  "BEARING",
  "CRACK_CONTROL",
  "DEFLECTION",
  "SECOND_ORDER_STABILITY",
  "DURABILITY",
  "ANCHORAGE",
  "DEVELOPMENT",
  "LAP_SPLICE",
  "DETAILING",
  "OTHER_SERVICEABILITY",
] as const;
export type ConcreteLimitState = (typeof CONCRETE_LIMIT_STATES)[number];

export const CONCRETE_STRENGTH_RESULT_CLASSES = [
  "MECHANICS_REFERENCE",
  "NOMINAL_CAPACITY",
  "CODE_DESIGN_CAPACITY",
  "CODE_ALLOWABLE_CAPACITY",
  "SERVICEABILITY_RESULT",
] as const;
export type ConcreteStrengthResultClass = (typeof CONCRETE_STRENGTH_RESULT_CLASSES)[number];

export const CONCRETE_COMPLETENESS_STATES = [
  "NOT_APPLICABLE",
  "MISSING_INPUT",
  "METHOD_NOT_IMPLEMENTED",
  "VALIDATION_REQUIRED",
  "STANDARD_CONTEXT_INCOMPLETE",
  "DETAILING_REQUIRED",
  "SERVICEABILITY_REQUIRED",
  "DURABILITY_REQUIRED",
  "STALE_RESULT",
  "UNSUPPORTED_SCOPE",
] as const;
export type ConcreteCompletenessState = (typeof CONCRETE_COMPLETENESS_STATES)[number];

export const CONCRETE_PRODUCT_GATING_LEVELS = [
  "FRAMEWORK",
  "MECHANICS_REFERENCE",
  "CODE_PROFILE_IMPLEMENTED",
  "VALIDATED",
  "CONFORMANCE_VALIDATED",
  "CERTIFIED",
] as const;
export type ConcreteProductGatingLevel = (typeof CONCRETE_PRODUCT_GATING_LEVELS)[number];

export const CONCRETE_CONSTRUCTION_TYPES = ["CAST_IN_SITU", "PRECAST"] as const;
export type ConcreteConstructionType = (typeof CONCRETE_CONSTRUCTION_TYPES)[number];

export const CONCRETE_PRESTRESS_MODES = ["PRETENSIONED", "POST_TENSIONED", "UNBONDED", "BONDED"] as const;
export type ConcretePrestressMode = (typeof CONCRETE_PRESTRESS_MODES)[number];

export const CONCRETE_SECTION_INTEGRATION_KINDS = ["LAYERED", "FIBER", "DISCRETE"] as const;
export type ConcreteSectionIntegrationKind = (typeof CONCRETE_SECTION_INTEGRATION_KINDS)[number];

export const CONCRETE_SAFETY_FACTOR_FAMILIES = ["JURISDICTION_DEFINED", "PHI", "GAMMA", "LRFD", "ASD"] as const;
export type ConcreteSafetyFactorFamily = (typeof CONCRETE_SAFETY_FACTOR_FAMILIES)[number];

export type ConcreteGovernedProperty = {
  name: string;
  value: number | string | null;
  unit: string | null;
  provenanceRef: string;
  sourceAuthority: SteelSourceAuthorityType;
};

export type ConcreteMaterial = {
  materialRef: string;
  designation: string;
  compressiveStrength: ConcreteGovernedProperty | null;
  tensileStrength: ConcreteGovernedProperty | null;
  elasticModulus: ConcreteGovernedProperty | null;
  density: ConcreteGovernedProperty | null;
  poissonRatio: ConcreteGovernedProperty | null;
  age: ConcreteGovernedProperty | null;
  strengthReferenceAge: ConcreteGovernedProperty | null;
  materialClass: string | null;
  materialStandardRef: string | null;
  sourceAuthority: SteelSourceAuthorityType;
  testCertificateRef: string | null;
  environmentalMetadata: string | null;
  version: string;
  provenance: EosGlobalProvenanceContract;
};

export type ReinforcementMaterial = {
  materialRef: string;
  designation: string;
  yieldStrength: ConcreteGovernedProperty | null;
  ultimateStrength: ConcreteGovernedProperty | null;
  elasticModulus: ConcreteGovernedProperty | null;
  ductilityClass: string | null;
  productStandardRef: string | null;
  sourceAuthority: SteelSourceAuthorityType;
  version: string;
  provenance: EosGlobalProvenanceContract;
};

export type ReinforcementBar = {
  barId: string;
  designation: string | null;
  diameterMm: ConcreteGovernedProperty | null;
  areaMm2: ConcreteGovernedProperty | null;
  count: number;
  xMm: number | null;
  yMm: number | null;
  layerId: string | null;
  face: string | null;
  direction: string | null;
  spacingMm: number | null;
  groupId: string | null;
  materialRef: string;
  anchorageMetadata: string | null;
  lapMetadata: string | null;
  provenanceRef: string;
};

export type ReinforcementGroup = {
  groupId: string;
  barIds: readonly string[];
  face: string | null;
  materialRef: string;
  provenanceRef: string;
};

export type ReinforcementLayer = {
  layerId: string;
  groupIds: readonly string[];
  face: string | null;
  provenanceRef: string;
};

export type ReinforcementLayout = {
  layoutId: string;
  bars: readonly ReinforcementBar[];
  groups: readonly ReinforcementGroup[];
  layers: readonly ReinforcementLayer[];
  transverse: readonly TransverseReinforcement[];
  provenanceRef: string;
};

export type TransverseReinforcement = {
  linkId: string;
  linkType: string;
  legs: number | null;
  diameterMm: ConcreteGovernedProperty | null;
  areaMm2: ConcreteGovernedProperty | null;
  spacingMm: number | null;
  orientation: string | null;
  zone: string | null;
  materialRef: string;
  provenanceRef: string;
};

export type ConcreteCover = {
  coverId: string;
  nominalCoverMm: number | null;
  modelledCoverMm: number | null;
  face: string;
  reinforcementGroupRef: string | null;
  source: string;
  governingContextRef: string | null;
  provenanceRef: string;
};

export type ConcreteSectionVoid = {
  voidId: string;
  kind: "VOID" | "OPENING" | "DUCT" | "EMBEDDED_REGION";
  geometryRef: string;
  numericalDesignSupported: false;
};

export type ConcreteSection = {
  sectionId: string;
  shape: ConcreteSectionShape;
  explicitGeometryRef: string;
  widthMm: number | null;
  depthMm: number | null;
  diameterMm: number | null;
  voids: readonly ConcreteSectionVoid[];
  provenanceRef: string;
};

export type ConcreteDurabilityContext = {
  durabilityContextId: string;
  environmentContext: string | null;
  designLifeYears: number | null;
  concreteMaterialRequirements: string | null;
  coverDependencies: string | null;
  crackControlDependencies: string | null;
  sourceAuthority: SteelSourceAuthorityType | null;
  standardContextRef: string | null;
  projectRequirementRef: string | null;
  jurisdictionExposureClass: null;
  provenanceRef: string;
};

export type ConcreteElement = {
  elementId: string;
  structuralObjectRef: string;
  elementType: ConcreteElementType;
  dimensionality: ConcreteElementDimensionality;
  constructionType: ConcreteConstructionType;
  numericallySupported: false;
  memberRef: string | null;
  sectionRef: string;
  concreteMaterialRef: string;
  reinforcementLayoutRef: string;
  coverRefs: readonly string[];
  durabilityContextRef: string | null;
  prestressMode: ConcretePrestressMode | null;
  compositeAction: false;
  provenance: EosGlobalProvenanceContract;
};

export type ConcreteMember = ConcreteElement & {
  dimensionality: "MEMBER_1D";
};

export type ConcreteDesignContext = {
  designContextId: string;
  elementRef: string;
  memberRef: string;
  sectionRef: string;
  concreteMaterialRef: string;
  reinforcementMaterialRef: string;
  reinforcementLayoutRef: string;
  demandRefs: string[];
  standardContextRef: string;
  designStandardRef: string;
  materialStandardRef: string | null;
  reinforcementProductStandardRef: string | null;
  durabilityContextRef: string | null;
  constructionStageRef: string | null;
  evidenceRefs: StructuralEvidenceBinding[];
  toolRef: string;
  methodRef: string;
  provenanceRef: EosGlobalProvenanceContract;
  validationState: string;
  reviewState: string;
  approvalState: string;
};

export type ConcreteActionSet = {
  actionSetId: string;
  demand: Pick<
    StructuralDemandResult,
    "resultId" | "memberId" | "combinationId" | "axial" | "moment" | "shear" | "deflection" | "capacityPresent" | "standardContext" | "inputEvidenceRefs"
  >;
  analysisRevision: string | null;
  signConvention: string;
  sourceProvenanceRef: string;
};

export type ConcreteMaterialResponseInterface = {
  concreteCompressionResponseRef: string | null;
  concreteTensionResponseRef: string | null;
  reinforcementStressStrainRef: string | null;
  prestressingResponseRef: string | null;
  codeStressBlockRef: null;
  governed: boolean;
};

export type ConcreteSectionCompatibilityInterface = {
  strainCompatibilityRequired: true;
  forceEquilibriumRequired: true;
  momentEquilibriumRequired: true;
  constitutiveRuleGoverned: false;
};

export type ConcreteSectionEquilibriumContract = {
  solverKind: "DETERMINISTIC_SECTION_EQUILIBRIUM";
  unknown: "NEUTRAL_AXIS";
  residual: "FORCE_AND_MOMENT_EQUILIBRIUM";
  outputs: readonly ["sectionForceResultants", "sectionMoments"];
  labelledCodeDesign: false;
};

export type ConcreteInteractionSurfaceInterface = {
  pmSurfaceSupported: true;
  biaxialPmmSurfaceSupported: true;
  universalLinearRelationshipForbidden: true;
  generationRequiresGovernedSectionAnalysis: true;
};

export type ConcreteDesignCheck = {
  checkId: string;
  elementRef: string;
  limitState: ConcreteLimitState;
  completeness: ConcreteCompletenessState;
  checkState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  resultClass: ConcreteStrengthResultClass | null;
  methodRef: string | null;
  standardContextRef: string;
  approvalImplied: false;
};

export type ConcreteCapacityResult = {
  resultId: string;
  checkId: string;
  resultClass: ConcreteStrengthResultClass;
  value: number | null;
  unit: string | null;
  implemented: false;
  reason: string;
};

export type ConcreteServiceabilityResult = {
  resultId: string;
  checkId: string;
  criterionRef: string | null;
  d1cDeflectionReused: boolean;
  longTermRcDeflectionClaimed: false;
  checkState: "CHECK_UNDETERMINED";
};

export type ConcreteDetailingRequirement = {
  requirementId: string;
  kind: string;
  numericLimit: null;
  completeness: ConcreteCompletenessState;
};

export type ConcreteValidationState = {
  implementationMaturity: typeof CONCRETE_IMPLEMENTATION_MATURITY;
  numericalValidation: "NOT_VALIDATED";
  engineeringValidation: "NOT_VALIDATED";
  standardConformance: typeof CONCRETE_STANDARD_CONFORMANCE_STATE;
  productReleaseState: "INTERNAL_ENGINEERING_REFERENCE";
  softwareCertification: false;
  projectEngineeringApproval: false;
};

export type ConcreteOptimizationCandidate = {
  candidateSectionRef: string;
  proposedBy: "AI" | "OPTIMIZER" | "HUMAN";
  deterministicRecheckRequired: true;
  rechecked: boolean;
  memberCheckState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED" | null;
  interactionCheckState?: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED" | null;
};

export type ConcreteResultFingerprint = {
  elementRef: string;
  sectionRef: string;
  concreteMaterialRef: string;
  reinforcementMaterialRef: string;
  reinforcementLayoutRef: string;
  coverFingerprint: string;
  demandResultId: string;
  combinationId: string | null;
  standardContextId: string;
  engineeringRuleRef: string | null;
  methodVersion: string;
  durabilityContextRef: string | null;
  serviceabilityCriterionRef: string | null;
};

export type ConcreteInvalidationTag =
  | "GEOMETRY_CHANGED"
  | "CONCRETE_MATERIAL_CHANGED"
  | "REINFORCEMENT_CHANGED"
  | "COVER_CHANGED"
  | "DEMAND_CHANGED"
  | "STANDARD_CONTEXT_CHANGED"
  | "ENGINEERING_RULE_CHANGED"
  | "METHOD_VERSION_CHANGED"
  | "DURABILITY_CONTEXT_CHANGED"
  | "SERVICEABILITY_CRITERION_CHANGED";

export type ConcreteEngineeringRule = {
  ruleId: string;
  methodId: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  intendedStandardProfile: "AS3600" | "EN1992" | "ACI318";
  standardConformanceState: typeof CONCRETE_STANDARD_CONFORMANCE_STATE;
  bindingState: typeof CONCRETE_IMPLEMENTATION_MATURITY;
};

export type ConcreteMtoHandoff = {
  concreteVolumeM3: number | null;
  reinforcementMassKg: number | null;
  reinforcementLengthM: number | null;
  barCount: number | null;
  formworkAreaM2: number | null;
  ratesEmbedded: false;
  emissionFactorEmbedded: false;
  provenanceRef: string;
};

export type ConcreteInverseDesignContract = {
  stages: readonly [
    "requirements",
    "candidate geometry/reinforcement",
    "deterministic concrete engine",
    "code checks",
    "MTO/cost/carbon",
    "Pareto optimisation",
    "engineer selection",
  ];
  generativeModelHasEngineeringAuthority: false;
  generativeModelImplemented: false;
};

export type ConcreteCapacityEngineInput = {
  adapterId: ConcreteAdapterId;
  designContext: ConcreteDesignContext;
  standardContext: StructuralStandardContext;
  demand: StructuralDemandResult;
  material: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  layout: ReinforcementLayout;
  section: ConcreteSection;
  covers: readonly ConcreteCover[];
  limitState: ConcreteLimitState;
  requiredProperties: readonly string[];
};

export type ConcreteCapacityEngineOutput = {
  adapterId: ConcreteAdapterId;
  maturity: typeof CONCRETE_IMPLEMENTATION_MATURITY;
  implemented: false;
  capacity: null;
  reason: string;
};

export type D1eValidationDebtItem = {
  debtId: string;
  category: string;
  jurisdiction: "GLOBAL" | "AU" | "EU" | "US";
  capability: string;
  description: string;
  priority: "SAFETY_CRITICAL" | "CONFORMANCE_CRITICAL" | "COMMERCIAL_RELEASE_CRITICAL" | "ENHANCEMENT";
  blockingState: string;
  requiredEvidence: string;
  ownerWorkstream: string;
  recommendedFuturePhase: string;
};
