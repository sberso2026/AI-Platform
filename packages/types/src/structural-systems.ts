/**
 * EOS-D1F-0 — Structural systems architecture contracts.
 * Topology, connectivity, analysis identity, and member-binding contracts only.
 * No finite-element, frame, stiffness, dynamic, connection, or foundation solver.
 */

export const EOS_D1F_0_PHASE = "EOS-D1F-0-STRUCTURAL-SYSTEMS-ARCHITECTURE" as const;
export const D1F_PERMITTED_CLAIM = "STRUCTURAL_SYSTEMS_FOUNDATION" as const;
export const D1F_MATURITY_STATE = "ARCHITECTURE_DEFINED" as const;
export const D1F_RELEASE_CLASSIFICATION = "INTERNAL_ENGINEERING_REFERENCE" as const;

export const RUNTIME_STRUCTURAL_SYSTEM_ANALYSIS_COUNT = 0 as const;
export const RUNTIME_STRUCTURAL_SYSTEM_ORCHESTRATOR_COUNT = 0 as const;
export const D1F_NUMERICALLY_VALIDATED_METHOD_COUNT = 0 as const;
export const D1F_ENGINEER_VALIDATED_METHOD_COUNT = 0 as const;
export const D1F_CONFORMANCE_VALIDATED = false as const;
export const SCHEMA_CHANGE_REQUIRED = false as const;
export const D1F_MIGRATION_LEDGER_ENTRY = "NO_SCHEMA_MIGRATION" as const;
export const D1F_PRODUCT_FEATURE_FLAG = "NOT_EXPOSED" as const;
export const D1F_DEPLOYMENT_PROFILE_CHANGED = false as const;

export const PHYSICAL_STRUCTURE_EQUALS_ANALYSIS_MODEL = false as const;
export const ANALYSIS_ELEMENT_EQUALS_DESIGN_MEMBER = false as const;
export const SOLVER_RESULT_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const MEMBER_CHECK_EQUALS_SYSTEM_ADEQUACY = false as const;
export const SYSTEM_TOPOLOGY_EQUALS_STRUCTURAL_ANALYSIS = false as const;
export const STRUCTURAL_SYSTEM_OBJECT_IMPLIES_ANALYSIS_COMPLETE = false as const;

export const D1A_REUSED = true as const;
export const D1B_REUSED = true as const;
export const D1C_REUSED = true as const;
export const D1D_STEEL_REUSED = true as const;
export const D1E_CONCRETE_REUSED = true as const;
export const PARALLEL_STRUCTURAL_DOMAIN_CREATED = false as const;
export const PARALLEL_MEMBER_MODEL_CREATED = false as const;
export const PARALLEL_LOAD_MODEL_CREATED = false as const;
export const PARALLEL_COMBINATION_ENGINE_CREATED = false as const;
export const PARALLEL_MATERIAL_ENGINE_CREATED = false as const;
export const PARALLEL_RULE_REGISTRY_CREATED = false as const;
export const PARALLEL_D1F_COMBINATION_ENGINE_CREATED = false as const;
export const D1C_COMBINATION_ENGINE_REUSED = true as const;

export const AI_STRUCTURAL_ANALYSIS_AUTHORITY = false as const;
export const AI_LOAD_PATH_AUTHORITY = false as const;
export const AI_SUPPORT_CONDITION_AUTHORITY = false as const;
export const AI_MEMBER_CONNECTIVITY_AUTHORITY = false as const;
export const AI_ANALYSIS_IDEALIZATION_AUTHORITY = false as const;
export const AI_ENGINEERING_ACCEPTANCE_AUTHORITY = false as const;
export const AI_COORDINATE_TRANSFORM_AUTHORITY = false as const;
export const AI_ANALYSIS_ASSUMPTION_APPROVAL_AUTHORITY = false as const;
export const UI_ORIENTATION_DEFINES_ENGINEERING_AXIS = false as const;

export const D1F_CONNECTIVITY_INFERRED_BY_LLM = false as const;
export const D1F_CONNECTIVITY_INFERRED_FROM_PROXIMITY_ONLY = false as const;
export const D1F_SUPPORT_CONDITION_GUESSED = false as const;
export const D1F_MEMBER_RELEASE_CONTRACT_DEFINED = true as const;
export const D1F_MEMBER_RELEASES_INFERRED = false as const;
export const D1F_COORDINATE_TRANSFORM_CONTRACT_DEFINED = true as const;
export const D1F_SIGN_CONVENTION_ASSUMED_FROM_SOLVER_NAME = false as const;
export const D1F_UNIT_CONTRACT_DEFINED = true as const;
export const UNITLESS_ANALYSIS_RESULT_ALLOWED = false as const;
export const IMPLICIT_SOLVER_UNIT_ASSUMPTION_ALLOWED = false as const;
export const D1F_LOAD_PATH_REPRESENTATION_SUPPORTED = true as const;
export const D1F_AUTOMATIC_LOAD_PATH_ANALYSIS_IMPLEMENTED = false as const;
export const AI_LOAD_PATH_INFERENCE_GOVERNING = false as const;
export const D1F_EXTERNAL_SOLVER_CONNECTOR_IMPLEMENTED = false as const;
export const D1F_SOLVER_API_INTEGRATION_IMPLEMENTED = false as const;
export const D1F_SOLVER_FILE_IMPORT_IMPLEMENTED = false as const;
export const D1F_SOLVER_EXECUTION_IMPLEMENTED = false as const;
export const SOLVER_CONVERGED_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const SOLVER_RESULT_AVAILABLE_EQUALS_DESIGN_PASS = false as const;
export const ANALYSIS_COMPLETED_EQUALS_MODEL_VALIDATED = false as const;
export const D1F_MEMBER_ACTION_EFFECT_CONTRACT_DEFINED = true as const;
export const D1F_ACTION_EFFECT_VALUES_INVENTED = false as const;
export const D1F_ACTION_EFFECT_LOCATION_REQUIRED = true as const;
export const D1F_AUTOMATIC_ENVELOPE_ENGINE_IMPLEMENTED = false as const;
export const D1F_ENVELOPE_PROVENANCE_CONTRACT_DEFINED = true as const;
export const D1F_GENERIC_MAX_ABSOLUTE_EQUALS_GOVERNING_ENGINEERING_CASE = false as const;
export const D1F_SYSTEM_TO_MEMBER_FLOW_DEFINED = true as const;
export const D1F_MEMBER_FAILURE_FINDINGS_PRESERVED = true as const;
export const D1F_UNCHECKED_REQUIRED_MEMBER_CAN_PASS = false as const;
export const D1F_EMPTY_REQUIRED_MEMBER_SET_CAN_PASS = false as const;
export const D1F_MISSING_REQUIRED_ACTION_EFFECT_CAN_PASS = false as const;
export const D1F_CONNECTION_INTERFACE_CONTRACT_DEFINED = true as const;
export const D1F_STEEL_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const D1F_CONCRETE_JOINT_DESIGN_IMPLEMENTED = false as const;
export const D1F_BASE_PLATE_DESIGN_IMPLEMENTED = false as const;
export const D1F_BOLT_DESIGN_IMPLEMENTED = false as const;
export const D1F_WELD_DESIGN_IMPLEMENTED = false as const;
export const D1F_FOUNDATION_CAPACITY_DESIGN_IMPLEMENTED = false as const;
export const D1F_BEARING_CAPACITY_IMPLEMENTED = false as const;
export const D1F_SETTLEMENT_IMPLEMENTED = false as const;
export const D1F_PILE_DESIGN_IMPLEMENTED = false as const;
export const D1F_FOOTING_DESIGN_IMPLEMENTED = false as const;
export const D1F_CROSS_DISCIPLINE_RUNTIME_IMPLEMENTED = false as const;
export const D1F_STRUCTURAL_SYSTEM_PROVENANCE_CONTRACT_DEFINED = true as const;
export const D1F_DEPENDENCY_INVALIDATION_CONTRACT_DEFINED = true as const;
export const STALE_ANALYSIS_RESULT_REUSE_ALLOWED = false as const;
export const STALE_MEMBER_BINDING_REUSE_ALLOWED = false as const;
export const D1F_HISTORICAL_ANALYSIS_RESULT_IMMUTABLE = true as const;
export const NEW_RUN_REPLACES_OLD_RESULT_IN_PLACE = false as const;
export const D1F_MODEL_CHANGE_ACCEPTANCE_BY_AI = false as const;
export const GENERATIVE_MODEL_CAN_CREATE_GOVERNED_ANALYSIS_RESULTS = false as const;
export const GENERATIVE_MODEL_CAN_BYPASS_STRUCTURAL_CHECKS = false as const;
export const D1F_OPTIMIZATION_ENGINE_IMPLEMENTED = false as const;
export const D1H_CONDITION_ASSESSMENT_IMPLEMENTED = false as const;
export const D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED = false as const;
export const D1M_CAD_BIM_INTELLIGENCE_IMPLEMENTED = false as const;
export const D1N_CONCEPT_TO_DETAILED_ORCHESTRATOR_IMPLEMENTED = false as const;
export const D1F_PHYSICAL_ANALYTICAL_DESIGN_SEPARATION = true as const;
export const D1F_ONE_TO_ONE_MEMBER_MAPPING_ASSUMED = false as const;
export const D1F_TENANT_ISOLATION_ARCHITECTURE_PRESERVED = true as const;
export const D1F_D1D_STEEL_MEMBER_BINDING_FEASIBLE = true as const;
export const D1F_D1E_CONCRETE_MEMBER_BINDING_FEASIBLE = true as const;
export const D1F_CONCRETE_VALIDATION_MATURITY_UNCHANGED = true as const;

export const C10_VALIDATION_LANE_STATUS = "PENDING_QUALIFIED_HUMAN_REVIEW" as const;
export const C10_REVIEW_PACK_CONTENT_MODIFIED = false as const;
export const C10_REVIEW_PACK_FINGERPRINTS_CHANGED = false as const;
export const C10_ENGINEER_VALIDATION_PROMOTION = false as const;
export const C10_CONFORMANCE_PROMOTION = false as const;
export const C10_CERTIFICATION_PROMOTION = false as const;

export const D1F_STRUCTURAL_SYSTEM_DEFINITION =
  "A structural system is a governed collection of physical structural entities, relationships, connectivity, structural context, analysis representations, design-member mappings, result mappings, and engineering decisions. Registering the system does not mean EOS has analysed it." as const;

export const D1F_FORBIDDEN_CLAIMS = [
  "GENERAL_STRUCTURAL_ANALYSIS",
  "FRAME_ANALYSIS",
  "FEA",
  "AUTOMATED_STRUCTURAL_DESIGN",
  "COMPLETE_BUILDING_DESIGN",
  "STRUCTURAL_DIGITAL_TWIN",
  "AUTONOMOUS_STRUCTURAL_ENGINEER",
] as const;

export const D1F_EXISTING_STRUCTURAL_ARCHITECTURE_INVENTORY = [
  { concept: "PROJECT", source: "Engineering Core project", d1fAction: "REFERENCE" },
  { concept: "DISCIPLINE", source: "D0 discipline capability; StructuralSystem.discipline", d1fAction: "REFERENCE" },
  { concept: "STRUCTURAL_MEMBER", source: "D1A StructuralMember", d1fAction: "REUSE_AS_PHYSICAL_MEMBER" },
  { concept: "NODE", source: "D1A StructuralNode", d1fAction: "REUSE" },
  { concept: "GEOMETRY", source: "D1A section geometry ref; D1E section kernel", d1fAction: "REUSE" },
  { concept: "MATERIAL", source: "D1A StructuralMaterial; D1D/D1E material properties", d1fAction: "REUSE" },
  { concept: "LOAD", source: "D1C StructuralLoadApplication", d1fAction: "REUSE" },
  { concept: "LOAD_CASE", source: "D1A StructuralLoadCase", d1fAction: "REUSE" },
  { concept: "LOAD_COMBINATION", source: "D1A StructuralLoadCombination; D1C combination engine", d1fAction: "REUSE" },
  { concept: "ACTION_EFFECT", source: "D1C StructuralDemandResult axial/shear/moment/torsion transport", d1fAction: "EXTEND_HANDOFF_CONTRACT" },
  { concept: "SUPPORT", source: "D1A StructuralSupport", d1fAction: "EXTEND_RESTRAINT_SEMANTICS" },
  { concept: "DESIGN_CONTEXT", source: "D1B StructuralStandardContext", d1fAction: "REUSE" },
  { concept: "ANALYSIS", source: "D1A StructuralAnalysisModel; D1C bounded demand", d1fAction: "SEPARATE_IDENTITY" },
  { concept: "ANALYSIS_RESULT", source: "D1A StructuralAnalysisResult", d1fAction: "AUTHORITY_STATES" },
  { concept: "CONNECTION", source: "D1A StructuralConnection representation", d1fAction: "INTERFACE_ONLY" },
  { concept: "FOUNDATION", source: "D1A StructuralFoundationInterface", d1fAction: "INTERFACE_ONLY" },
  { concept: "DESIGN_CHECK", source: "D1A StructuralDesignCheck; D1D/D1E methods", d1fAction: "REUSE" },
  { concept: "ENGINEERING_RESULT", source: "D1A capacity and utilization results", d1fAction: "REUSE" },
  { concept: "PROVENANCE", source: "EosGlobalProvenanceContract", d1fAction: "CHAIN" },
  { concept: "FINGERPRINT", source: "existing canonical fingerprint helper", d1fAction: "SYSTEM_FINGERPRINTS" },
  { concept: "DIGITAL_THREAD", source: "EOS-A8A digital thread", d1fAction: "EVENT_NAMES_ONLY" },
] as const;

export const D1F_CANONICAL_SYSTEM_HIERARCHY = [
  { level: "PROJECT", source: "ENGINEERING_CORE" },
  { level: "STRUCTURAL_DISCIPLINE_CONTEXT", source: "D1B_STRUCTURAL_STANDARD_CONTEXT" },
  { level: "STRUCTURAL_SYSTEM", source: "D1A_STRUCTURAL_SYSTEM" },
  { level: "PHYSICAL_STRUCTURAL_ENTITIES", source: "D1A_MEMBER_NODE_SUPPORT_FRAME_CONNECTION" },
  { level: "ANALYSIS_REPRESENTATIONS", source: "D1A_ANALYSIS_MODEL_PLUS_D1F_RUN_IDENTITY" },
  { level: "DESIGN_MEMBERS", source: "D1D_STEEL_AND_D1E_CONCRETE_MEMBER_IDENTITIES" },
  { level: "DESIGN_CHECKS", source: "D1A_DESIGN_CHECK" },
] as const;

export const D1F_ENTITY_ROLES = ["PHYSICAL_MEMBER", "ANALYTICAL_ELEMENT", "DESIGN_MEMBER"] as const;
export type D1fEntityRole = (typeof D1F_ENTITY_ROLES)[number];

export const D1F_MAPPING_CARDINALITIES = ["ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE"] as const;
export type D1fMappingCardinality = (typeof D1F_MAPPING_CARDINALITIES)[number];

export const D1F_MAPPING_AUTHORITIES = ["EXPLICIT_GOVERNED_MODEL", "HUMAN_CONFIRMED"] as const;
export const D1F_UNCONFIRMED_CANDIDATE = "UNCONFIRMED_CANDIDATE" as const;
export type D1fMappingAuthority = (typeof D1F_MAPPING_AUTHORITIES)[number] | typeof D1F_UNCONFIRMED_CANDIDATE;

export const D1F_PHYSICAL_TO_ANALYTICAL_MAPPING_CONTRACT =
  "A physical member may map to one analytical element, to many analytical elements, or several physical components may map to one simplified analytical member. One-to-one is permitted. It is not assumed." as const;

export const D1F_ANALYTICAL_TO_DESIGN_MEMBER_MAPPING_CONTRACT =
  "One analytical element may map to one or more design evaluation segments. A design member is a D1D steel or D1E concrete evaluation identity, not the analytical element." as const;

export const D1F_TOPOLOGY_CONTRACT =
  "Topology records members, nodes, connections, supports, member-to-member relationships, member-to-support relationships, and system grouping. Topology is not structural analysis." as const;

export const D1F_SUPPORT_RESTRAINT_CLASSES = [
  "TRANSLATION_RESTRAINT",
  "ROTATION_RESTRAINT",
  "RELEASE",
  "SPRING",
  "SUPPORT_REFERENCE",
] as const;
export type D1fSupportRestraintClass = (typeof D1F_SUPPORT_RESTRAINT_CLASSES)[number];

export const D1F_SUPPORT_RESTRAINT_CONTRACT =
  "Supports and restraints are explicit governed records. Translation restraints, rotation restraints, releases, springs, and support references are distinguishable. Their stiffness is not calculated in D1F-0." as const;

export const D1F_MEMBER_END_RELEASE_AXES = ["UX", "UY", "UZ", "RX", "RY", "RZ"] as const;

export const D1F_COORDINATE_SYSTEMS = [
  "GLOBAL",
  "SYSTEM",
  "MEMBER_LOCAL",
  "SECTION_LOCAL",
  "ANALYSIS_PROVIDER_LOCAL",
] as const;
export type D1fCoordinateSystem = (typeof D1F_COORDINATE_SYSTEMS)[number];

export const D1F_COORDINATE_SYSTEM_CONTRACT =
  "GLOBAL, SYSTEM, MEMBER_LOCAL, SECTION_LOCAL, and ANALYSIS_PROVIDER_LOCAL are distinct governed frames. A transform between them is an explicit, versioned, deterministic record. UI orientation does not define an engineering axis." as const;

export const D1F_SIGN_CONVENTION_FIELDS = [
  "FORCE_SIGN",
  "MOMENT_SIGN",
  "LOCAL_AXIS_ORIENTATION",
  "MEMBER_END_CONVENTION",
  "SOLVER_CONVENTION",
  "DESIGN_METHOD_CONVENTION",
] as const;

export const D1F_SIGN_CONVENTION_CONTRACT =
  "Force sign, moment sign, local axis orientation, member-end convention, solver convention, and design-method convention are separate metadata. A solver product name does not imply a sign convention." as const;

export const D1F_ANALYSIS_PROVIDER_CLASSES = [
  "GOVERNED_EXTERNAL_SOLVER",
  "GOVERNED_INTERNAL_DETERMINISTIC_ENGINE",
  "HUMAN_AUTHORED_GOVERNED_ANALYSIS",
  "IMPORTED_UNVERIFIED_RESULT",
] as const;
export type D1fAnalysisProviderClass = (typeof D1F_ANALYSIS_PROVIDER_CLASSES)[number];

export const D1F_ANALYSIS_PROVIDER_AUTHORITY_MODEL =
  "Provider classes are GOVERNED_EXTERNAL_SOLVER, GOVERNED_INTERNAL_DETERMINISTIC_ENGINE, HUMAN_AUTHORED_GOVERNED_ANALYSIS, and IMPORTED_UNVERIFIED_RESULT. D1F-0 defines the classes. D1G implements external connectors." as const;

export const D1F_ANALYSIS_RESULT_AUTHORITY_STATES = [
  "VERIFIED_GOVERNED",
  "IMPORTED_PENDING_VERIFICATION",
  "STALE",
  "INVALID",
  "INCOMPLETE",
  "FAILED_ANALYSIS",
] as const;
export type D1fAnalysisResultAuthorityState = (typeof D1F_ANALYSIS_RESULT_AUTHORITY_STATES)[number];

export const D1F_RESULT_CATEGORIES = [
  "NODAL_DISPLACEMENT",
  "NODAL_REACTION",
  "MEMBER_FORCE_ACTION_EFFECT",
  "ELEMENT_STRESS_RESULT",
  "SUPPORT_REACTION",
  "MODAL_RESULT",
  "BUCKLING_FACTOR",
  "ANALYSIS_WARNING",
  "ANALYSIS_CONVERGENCE_STATE",
] as const;
export type D1fResultCategory = (typeof D1F_RESULT_CATEGORIES)[number];

export const D1F_ANALYSIS_RESULT_CONTRACT =
  "Provider-neutral result categories may later be populated by D1G or by an already governed internal deterministic engine. A provider is not required to supply every category. Availability is not governance, convergence is not acceptance, and a result is not a design pass." as const;

export const D1F_ACTION_EFFECT_QUANTITIES = ["N", "V_MAJOR", "V_MINOR", "M_MAJOR", "M_MINOR", "T"] as const;
export type D1fActionEffectQuantity = (typeof D1F_ACTION_EFFECT_QUANTITIES)[number];

export const D1F_ACTION_EFFECT_LOCATIONS = [
  "MEMBER_START",
  "MEMBER_END",
  "STATION",
  "SECTION",
  "CRITICAL_LOCATION",
  "GOVERNING_ENVELOPE_LOCATION",
] as const;
export type D1fActionEffectLocationKind = (typeof D1F_ACTION_EFFECT_LOCATIONS)[number];

export const D1F_SYSTEM_AGGREGATION_STATES = [
  "SYSTEM_EVALUATION_COMPLETE_FOR_DECLARED_SCOPE",
  "SYSTEM_EVALUATION_INCOMPLETE",
  "SYSTEM_NOT_SATISFIED",
  "SYSTEM_UNDETERMINED",
] as const;
export type D1fSystemAggregationState = (typeof D1F_SYSTEM_AGGREGATION_STATES)[number];

export const D1F_SYSTEM_AGGREGATION_CONTRACT =
  "Aggregation reports declared-scope completeness only. A complete declared scope is not system adequacy. An empty required set, an unchecked required member, or a missing required action effect cannot pass. A failed required member check becomes SYSTEM_NOT_SATISFIED and keeps the member findings." as const;

export const D1F_REVISION_STATES = ["CURRENT", "SUPERSEDED", "STALE", "INVALIDATED", "ARCHIVED"] as const;
export type D1fRevisionState = (typeof D1F_REVISION_STATES)[number];

export const D1F_VALIDATION_EVIDENCE_CLASSES = [
  "CONNECTIVITY_REVIEW",
  "SUPPORT_REVIEW",
  "LOAD_REVIEW",
  "MASS_REVIEW",
  "MEMBER_PROPERTY_REVIEW",
  "RELEASE_REVIEW",
  "UNITS_REVIEW",
  "COORDINATE_SYSTEM_REVIEW",
  "SOLVER_WARNING_REVIEW",
] as const;

export const D1F_ANALYSIS_MODEL_VALIDATION_EVIDENCE_CLASSES = D1F_VALIDATION_EVIDENCE_CLASSES;

export const D1F_PROVENANCE_CHAIN = [
  "PROJECT_REQUIREMENT",
  "STRUCTURAL_CONTEXT",
  "PHYSICAL_STRUCTURAL_ENTITY",
  "ANALYSIS_REPRESENTATION",
  "ANALYSIS_RUN",
  "RESULT",
  "MAPPED_ACTION_EFFECT",
  "DESIGN_CHECK",
  "ENGINEERING_RESULT",
  "HUMAN_DECISION",
] as const;

export const D1F_STRUCTURAL_SYSTEM_EVENTS = [
  "MODEL_CREATED",
  "TOPOLOGY_CHANGED",
  "SUPPORT_CHANGED",
  "ANALYSIS_RERUN",
  "RESULT_SUPERSEDED",
  "MEMBER_CHECK_RERUN",
  "DESIGN_DECISION_CHANGED",
] as const;

export const D1F_STRUCTURAL_SYSTEM_EVENT_MODEL =
  "Structural-system events are names that can later join the existing EOS digital thread. D1F-0 does not claim a structural digital twin." as const;

export const D1F_FINGERPRINT_SUBJECTS = [
  "STRUCTURAL_SYSTEM",
  "PHYSICAL_TOPOLOGY",
  "ANALYSIS_MODEL",
  "ANALYSIS_RUN",
  "RESULT_SET",
  "MEMBER_BINDING",
  "SYSTEM_EVALUATION",
] as const;

export const D1F_FINGERPRINT_ARCHITECTURE =
  "Each subject is hashed from its governed identity fields with the existing canonical fingerprint helper. A new run stores a new fingerprint. It does not overwrite the prior result-set fingerprint." as const;

export const D1F_INVALIDATION_RULES = [
  { upstream: "SUPPORT_CHANGED", downstream: "ANALYSIS_STALE" },
  { upstream: "RELEASE_CHANGED", downstream: "ANALYSIS_STALE" },
  { upstream: "MEMBER_GEOMETRY_CHANGED", downstream: "ANALYSIS_AND_DESIGN_STALE" },
  { upstream: "LOAD_COMBINATION_CHANGED", downstream: "ACTION_RESULT_MAPPING_STALE" },
  { upstream: "PROFILE_OR_METHOD_VERSION_CHANGED", downstream: "DESIGN_RESULT_STALE" },
] as const;

export const D1F_ASSUMPTION_CLASSES = [
  "MEMBER_IDEALIZATION",
  "RESTRAINT_ASSUMPTION",
  "RELEASE_ASSUMPTION",
  "EFFECTIVE_STIFFNESS_ASSUMPTION",
  "RIGID_ZONE",
  "DIAPHRAGM_ASSUMPTION",
] as const;

export const D1F_ANALYSIS_ASSUMPTION_CONTRACT =
  "Idealization, restraint, release, effective stiffness, rigid zone, and diaphragm assumptions are records. Values are human-authored, governed-imported, or explicitly approved. AI cannot approve them, and D1F-0 does not invent the values." as const;

export const D1F_ASSUMPTION_AUTHORITIES = ["HUMAN_AUTHORED", "GOVERNED_IMPORTED", "EXPLICITLY_APPROVED"] as const;

export const D1F_SUPPORTED_DESIGN_BINDINGS = ["D1D_STEEL_MEMBER", "D1E_CONCRETE_MEMBER"] as const;
export type D1fDesignBindingTarget = (typeof D1F_SUPPORTED_DESIGN_BINDINGS)[number];

export const D1F_MEMBER_ACTION_BINDING_CONTRACT =
  "Governed action effects bind onto existing D1D SteelCapacityEngineInput.demand slots and existing D1E EuC9 section-action slots. Missing quantity, unit, location, sign convention, coordinate transform, or provenance fails closed. No new steel or concrete formula is introduced, and current concrete validation maturity stays unchanged." as const;

export const D1F_STEEL_BINDING_SLOTS = ["axial", "shear", "moment", "deflection", "memberId", "combinationId"] as const;
export const D1F_CONCRETE_BINDING_SLOTS = ["axial", "majorMoment", "minorMoment"] as const;

export const D1F_SYSTEM_TO_MEMBER_FLOW = [
  "GOVERNED_SYSTEM_CONTEXT",
  "GOVERNED_ANALYSIS_RESULT",
  "GOVERNED_ACTION_EFFECT_MAPPING",
  "EXISTING_MEMBER_CHECK",
  "MEMBER_RESULT",
  "SYSTEM_LEVEL_RESULT_INDEX",
] as const;

export const D1F_CONNECTION_ROLES = [
  "PHYSICAL_JOINT",
  "ANALYTICAL_JOINT",
  "CONNECTION_DESIGN_OBJECT",
  "MEMBER_END_FORCE_TRANSFER",
  "CONNECTION_RESULT",
] as const;

export const D1F_FOUNDATION_INTERFACE_CONTRACT =
  "The foundation interface can carry support reactions, support coordinates, foundation or support identity, load-combination references, and interface assumptions. It does not calculate bearing, settlement, pile, or footing capacity." as const;

export const D1F_CROSS_DISCIPLINE_ARCHITECTURE_DEPENDENCIES = [
  { discipline: "CIVIL", seam: "support coordinates and declared interface assumptions", owner: "D1K" },
  { discipline: "GEOTECHNICAL", seam: "support reactions and ground-context reference only", owner: "D1K" },
  { discipline: "MECHANICAL", seam: "declared load and support interface references", owner: "D1K" },
  { discipline: "PIPING", seam: "declared load and support interface references", owner: "D1K" },
  { discipline: "ELECTRICAL", seam: "declared support and clearance interface references", owner: "D1K" },
  { discipline: "I_AND_C", seam: "declared interface references only", owner: "D1K" },
] as const;

export const D1F_SYSTEM_MEMBER_MTO_LINKAGE_CONTRACT =
  "A structural system id and a physical or design member id may retain a reference to an existing deterministic MTO object. D1F-0 does not calculate cost or carbon." as const;

export const D1G_MINIMUM_CONTRACT_FIELDS = [
  "providerIdentity",
  "providerVersion",
  "modelIdentity",
  "modelFingerprint",
  "analysisRunIdentity",
  "analysisType",
  "unitSystem",
  "coordinateSystems",
  "loadCases",
  "loadCombinations",
  "runState",
  "convergenceState",
  "warnings",
  "resultSetFingerprint",
  "actionEffects",
  "resultLocations",
  "provenance",
] as const;

export const D1G_EXTERNAL_SOLVER_MINIMUM_CONTRACT =
  "A future D1G connector must supply provider identity and version, model identity and fingerprint, analysis-run identity, analysis type, unit system, coordinate systems, load cases and combinations, run and convergence state, warnings, result-set fingerprint, action effects, result locations, and provenance. D1F-0 does not implement that connector." as const;

export const D1F_PROPOSED_PHASE_SEQUENCE = [
  "EOS-D1F-R1-STRUCTURAL-SYSTEM-CONTEXT-TOPOLOGY",
  "EOS-D1F-R2-ANALYSIS-RESULT-CONTRACT-MEMBER-ACTION-BINDING",
  "EOS-D1F-R3-SYSTEM-TO-MEMBER-EVALUATION-ORCHESTRATION",
  "EOS-D1F-R4-CONNECTION-JOINT-INTERFACE-FOUNDATION",
  "EOS-D1F-R5-FOUNDATION-SUPPORT-INTERFACE-FOUNDATION",
  "EOS-D1F-R6-STRUCTURAL-SYSTEMS-CLOSEOUT",
  "EOS-D1G-EXTERNAL-STRUCTURAL-SOLVER-INTEGRATION",
] as const;

export const D1F_CANONICAL_NEXT_PHASE = "EOS-D1F-R1-STRUCTURAL-SYSTEM-CONTEXT-TOPOLOGY" as const;
export const D1F_NEXT_PHASE_TYPE = "STRUCTURAL_SYSTEM_RUNTIME_FOUNDATION" as const;
export const D1F_CANONICAL_NEXT_PHASE_SCOPE =
  "IMPLEMENT THE BOUNDED CANONICAL STRUCTURAL-SYSTEM CONTEXT, PHYSICAL TOPOLOGY, CONNECTIVITY, SUPPORT/RESTRAINT, COORDINATE, SIGN, UNIT, PROVENANCE, FINGERPRINT AND INVALIDATION FOUNDATION WITHOUT STRUCTURAL ANALYSIS" as const;

export const D1F_ANALYSIS_MODEL_IDENTITY_FIELDS = [
  "analysisModelId",
  "analysisModelVersion",
  "provider",
  "modelType",
  "coordinateSystemRef",
  "unitSystemRef",
  "sourceModelRef",
  "createdAt",
  "importedAt",
  "modelFingerprint",
  "assumptionsRef",
] as const;

export const D1F_ANALYSIS_MODEL_IDENTITY_CONTRACT =
  "Analysis-model identity is separate from the physical structural-system identity. It records model id, version, provider, model type, coordinate-system reference, unit-system reference, source model, timestamps, fingerprint, and assumptions reference." as const;

export const D1F_ANALYSIS_RUN_FIELDS = [
  "analysisRunId",
  "analysisModelFingerprint",
  "providerIdentity",
  "providerVersion",
  "analysisType",
  "inputFingerprint",
  "loadCaseIds",
  "combinationIds",
  "runStatus",
  "convergenceStatus",
  "resultSetFingerprint",
  "timestamp",
  "version",
] as const;

export const D1F_ANALYSIS_RUN_CONTRACT =
  "An analysis run identifies the model fingerprint, provider and version, analysis type, input fingerprint, load-case and combination set, run status, convergence metadata, result-set fingerprint, and timestamp. A new run does not replace a historical result set in place." as const;

export type D1fTenancy = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D1fEntityRef = D1fTenancy & {
  entityId: string;
  role: D1fEntityRole;
  structuralSystemId: string;
};

export type D1fMemberMapping = {
  mappingId: string;
  physicalMemberIds: readonly string[];
  analyticalElementIds: readonly string[];
  designMemberIds: readonly string[];
  cardinality: D1fMappingCardinality;
  authority: D1fMappingAuthority;
  exclusiveOneToOneAssumed: false;
  designBindingTarget: D1fDesignBindingTarget | null;
};

export type D1fSupportRestraint = D1fTenancy & {
  supportId: string;
  nodeRef: string;
  restraintClass: D1fSupportRestraintClass;
  axis: (typeof D1F_MEMBER_END_RELEASE_AXES)[number];
  authority: "EXPLICIT_GOVERNED_MODEL" | "HUMAN_CONFIRMED";
  stiffnessCalculated: false;
};

export type D1fMemberEndRelease = {
  releaseId: string;
  memberId: string;
  end: "START" | "END";
  axis: (typeof D1F_MEMBER_END_RELEASE_AXES)[number];
  released: boolean;
  authority: "EXPLICIT_GOVERNED_MODEL" | "HUMAN_CONFIRMED";
  inferred: false;
};

export type D1fCoordinateTransform = {
  transformId: string;
  fromSystem: D1fCoordinateSystem;
  toSystem: D1fCoordinateSystem;
  methodRef: string;
  version: string;
  provenanceRef: string;
  authority: "EXPLICIT_DETERMINISTIC";
};

export type D1fSignConvention = {
  signConventionId: string;
  forceSign: string;
  momentSign: string;
  localAxisOrientation: string;
  memberEndConvention: string;
  solverConvention: string;
  designMethodConvention: string;
  solverNameAssumed: false;
};

export type D1fAnalysisModelIdentity = D1fTenancy & {
  analysisModelId: string;
  structuralSystemId: string;
  analysisModelVersion: string;
  provider: string;
  providerClass: D1fAnalysisProviderClass;
  modelType: string;
  coordinateSystemRef: string;
  unitSystemRef: string;
  sourceModelRef: string;
  createdAt: string;
  importedAt: string | null;
  modelFingerprint: string;
  assumptionsRef: string;
};

export type D1fAnalysisRunIdentity = {
  analysisRunId: string;
  analysisModelId: string;
  analysisModelFingerprint: string;
  providerIdentity: string;
  providerVersion: string;
  analysisType: string;
  inputFingerprint: string;
  loadCaseIds: readonly string[];
  combinationIds: readonly string[];
  runStatus: string;
  convergenceStatus: string | null;
  resultSetFingerprint: string;
  timestamp: string;
  version: string;
  revisionState: D1fRevisionState;
  engineeringAcceptance: false;
  designPass: false;
  modelValidated: false;
};

export type D1fActionEffectLocation = {
  kind: D1fActionEffectLocationKind;
  stationRef: string | null;
};

export type D1fMemberActionEffect = {
  actionEffectId: string;
  memberId: string;
  quantity: D1fActionEffectQuantity;
  value: number | null;
  unit: string | null;
  location: D1fActionEffectLocation | null;
  signConventionRef: string | null;
  coordinateTransformRef: string | null;
  provenanceRef: string | null;
  sourceResultId: string | null;
  sourceAuthorityState: D1fAnalysisResultAuthorityState;
  invented: false;
};

export type D1fEnvelopeProvenance = {
  envelopeId: string;
  sourceCaseIds: readonly string[];
  quantity: D1fActionEffectQuantity;
  location: D1fActionEffectLocation;
  selectionRuleRef: string;
  governingValue: number;
  governingCaseId: string;
  unit: string;
  signTreatmentRef: string;
  automaticMaxAbsolute: false;
};

export type D1fLoadPathAnnotation = {
  annotationId: string;
  structuralSystemId: string;
  relationshipRefs: readonly string[];
  declaredBy: "HUMAN" | "GOVERNED_IMPORT";
  automaticAnalysis: false;
  aiGoverning: false;
};

export type D1fAnalysisAssumption = {
  assumptionId: string;
  assumptionClass: (typeof D1F_ASSUMPTION_CLASSES)[number];
  statementRef: string;
  authority: (typeof D1F_ASSUMPTION_AUTHORITIES)[number];
  valueInvented: false;
};

export type D1fMemberScopeDisposition = "CHECKED_PASS" | "CHECKED_FAIL" | "UNCHECKED" | "MISSING_REQUIRED_ACTION";

export type D1fMemberScopeResult = {
  memberId: string;
  disposition: D1fMemberScopeDisposition;
  findings: readonly string[];
};

export type D1fSystemAggregation = {
  state: D1fSystemAggregationState;
  systemAdequacyClaimed: false;
  findings: readonly string[];
};

export type D1fConnectionInterface = {
  connectionId: string;
  physicalJointRef: string | null;
  analyticalJointRef: string | null;
  connectionDesignObjectRef: string | null;
  memberEndForceTransferRefs: readonly string[];
  connectionResultRef: string | null;
  designImplemented: false;
};

export type D1fFoundationInterfaceHandoff = {
  interfaceId: string;
  supportId: string;
  reactionRefs: readonly string[];
  coordinateRef: string | null;
  loadCombinationRefs: readonly string[];
  assumptionRefs: readonly string[];
  capacityDesignImplemented: false;
};

export type D1fMtoLinkage = {
  structuralSystemId: string;
  memberId: string;
  mtoObjectRef: string | null;
  costCalculated: false;
  carbonCalculated: false;
};

export type D1fBindingCurrency = {
  revisionState: D1fRevisionState;
  analysisFingerprint: string;
  boundFingerprint: string;
};
