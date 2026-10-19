/**
 * EOS-D1J-R1 optimization problem, baseline, and variable foundation.
 * In-memory records only. No objective evaluation, candidate generation, or solver execution.
 */

import type { D1hR1CatalogObject } from "./inspection-evidence";
import { existingUnitPairCompatible, normalizeWithExistingUnitSystem } from "./inspection-temporal";
import { VARIABLE_TYPES } from "../optimization-intelligence/invariants";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D1J_R1_MATURITY_STATE = "STRUCTURAL_OPTIMIZATION_PROBLEM_BASELINE_VARIABLE_FOUNDATION_IMPLEMENTED" as const;
export const D1J_R1_PHASE_AUTHORIZED = true as const;
export const D1J_R1_PROBLEM_FOUNDATION_STATUS = "FOUNDATION_DEFINED" as const;
export const D1J_R1_PARAMETER_REGISTRY_VERSION = "d1j-r1-parameter-registry-1" as const;
export const D1J_R1_VARIABLE_DEFINITION_EQUALS_MODEL_MUTATION = false as const;
export const D1J_R1_PROBLEM_FOUNDATION_EQUALS_OPTIMIZATION_READY = false as const;
export const D1J_R1_PARAMETER_ALLOWLIST_REQUIRED = true as const;
export const D1J_R1_ARBITRARY_PROPERTY_PATH_ALLOWED = false as const;
export const D1J_R1_DYNAMIC_PARAMETER_MUTATION_API_CREATED = false as const;
export const D1J_R1_CANONICAL_BASELINE_RESOLUTION_REQUIRED = true as const;
export const D1J_R1_CALLER_FINGERPRINT_CAN_ESTABLISH_BASELINE_TRUTH = false as const;
export const D1J_R1_CALLER_AUTHORITY_CAN_ESTABLISH_BASELINE_TRUTH = false as const;
export const D1J_R1_PROBLEM_CAN_EXECUTE_WITHOUT_R2 = false as const;
export const D1J_R1_PROBLEM_CAN_BE_FEASIBILITY_EVALUATED_WITHOUT_R2 = false as const;
export const D1J_R1_PROBLEM_CAN_BE_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R1_PROBLEM_STATUS_IMPLIES_OPTIMIZATION_READY = false as const;
export const D1J_R1_MISSING_CONSTRAINT_SET_CAN_BE_OPTIMIZATION_READY = false as const;
export const D1J_R1_GOVERNED_STRUCTURAL_TARGET_REQUIRED = true as const;
export const D1J_R1_ORPHAN_OPTIMIZATION_PROBLEM_ALLOWED = false as const;
export const D1J_R1_STRUCTURAL_TARGET_RESOLUTION = "PASS" as const;
export const D1J_R1_CROSS_PROJECT_TARGET_ALLOWED = false as const;
export const D1J_R1_CROSS_TENANT_TARGET_ALLOWED = false as const;
export const D1J_R1_FULL_PROJECT_SCOPE_INFERRED = false as const;
export const D1J_R1_MEMBER_SCOPE_INFERRED_FROM_GEOMETRY = false as const;
export const D1J_R1_GENERIC_BASELINE_FETCH_API_CREATED = false as const;
export const D1J_R1_BASELINE_SOURCE_EXISTENCE_REQUIRED = true as const;
export const D1J_R1_BASELINE_VERSION_POLICY = "The baseline version and fingerprint are the D1F identity version and content fingerprint. R1 does not fabricate version 1, latest, or current." as const;
export const D1J_R1_BASELINE_FINGERPRINT_RESOLVED_FROM_SOURCE = true as const;
export const D1J_R1_EXPECTED_BASELINE_FINGERPRINT_MISMATCH_REJECTED = true as const;
export const D1J_R1_CALLER_FINGERPRINT_STORED_AS_CANONICAL = false as const;
export const D1J_R1_BASELINE_AUTHORITY_PRESERVED = true as const;
export const D1J_R1_PROBLEM_CREATION_PROMOTES_BASELINE_AUTHORITY = false as const;
export const D1J_R1_BASELINE_VALIDATION_STATE_PRESERVED = true as const;
export const D1J_R1_PROBLEM_CREATION_PROMOTES_BASELINE_VALIDATION = false as const;
export const D1J_R1_BASELINE_SCOPE_COMPATIBILITY_REQUIRED = true as const;
export const D1J_R1_BASELINE_FLOATS_TO_LATEST = false as const;
export const D1J_R1_BASELINE_REBINDS_IN_PLACE = false as const;
export const D1J_R1_BASELINE_CORRECTION_POLICY = "A changed source version or fingerprint is a new baseline reference and a successor problem. The previous pin stays reproducible." as const;
export const D1J_R1_BASELINE_SOURCE_BODY_COPIED = false as const;
export const D1J_R1_PARAMETER_REGISTRY_EQUALS_MODEL_SETTER_REGISTRY = false as const;
export const D1J_R1_VARIABLE_TARGET_RESOLUTION_REQUIRED = true as const;
export const D1J_R1_VARIABLE_TARGET_OUTSIDE_SCOPE_ALLOWED = false as const;
export const D1J_R1_ARBITRARY_PARAMETER_REF_ALLOWED = false as const;
export const D1J_R1_DESIGN_MUTATION_API_COUNT = 0 as const;
export const D1J_R1_VARIABLE_TYPE_RUNTIME_MAPPING = "GOVERNED_CATALOGUE_CHOICE maps to DISCRETE, GOVERNED_ENUMERATION maps to CATEGORICAL, GOVERNED_BOUNDED_QUANTITY maps to CONTINUOUS, GOVERNED_INTEGER_COUNT maps to INTEGER, and GOVERNED_BOOLEAN_CHOICE maps to BOOLEAN." as const;
export const D1J_R1_DIMENSIONAL_VARIABLE_UNIT_REQUIRED = true as const;
export const D1J_R1_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1J_R1_PARALLEL_UNIT_SYSTEM_CREATED = false as const;
export const D1J_R1_VARIABLE_UNIT_INFERRED_FROM_NAME = false as const;
export const D1J_R1_VARIABLE_UNIT_INFERRED_FROM_PARAMETER = false as const;
export const D1J_R1_VARIABLE_DOMAIN_AUTHORITY_CONTRACT = "Every domain cites a catalogued source id, source class, authority, version, and fingerprint. The actor authority does not replace that source authority." as const;
export const D1J_R1_VARIABLE_DOMAIN_SOURCE_TAXONOMY = "APPROVED_CATALOGUE, GOVERNED_ENGINEERING_RULE, PROJECT_CONSTRAINT, and HUMAN_APPROVED_SEARCH_CONFIGURATION. Search configuration may narrow a governing domain and is not an engineering limit." as const;
export const D1J_R1_ARBITRARY_DOMAIN_SOURCE_ALLOWED = false as const;
export const D1J_R1_CATALOGUE_DOMAIN_FLOATS_TO_LATEST = false as const;
export const D1J_R1_NUMERIC_BOUND_CONTRACT = "A numeric bound records value, unit when dimensional, source id, authority, and semantic type." as const;
export const D1J_R1_BOUND_SEMANTIC_TYPES = "ENGINEERING_MINIMUM, ENGINEERING_MAXIMUM, CATALOGUE_MINIMUM, CATALOGUE_MAXIMUM, PROJECT_MINIMUM, PROJECT_MAXIMUM, SEARCH_MINIMUM, SEARCH_MAXIMUM." as const;
export const D1J_R1_SEARCH_DOMAIN_CAN_EXCEED_GOVERNED_DOMAIN = false as const;
export const D1J_R1_SEARCH_BOUND_EQUALS_ENGINEERING_LIMIT = false as const;
export const D1J_R1_HUMAN_SEARCH_BOUND_REDEFINES_ENGINEERING_LIMIT = false as const;
export const D1J_R1_AI_GENERATED_DISCRETE_DOMAIN_ALLOWED = false as const;
export const D1J_R1_DEFAULT_SEARCH_STEP_CREATED = false as const;
export const D1J_R1_INTEGER_DOMAIN_POLICY = "Integer bounds must already be integers. R1 does not round a non-integer into an integer domain." as const;
export const D1J_R1_BOOLEAN_VARIABLE_POLICY = "A boolean variable cites exactly two governed meaning identifiers from its domain source. Raw true and false are not a generic feature toggle." as const;
export const D1J_R1_FREEFORM_CATEGORY_ALLOWED = false as const;
export const D1J_R1_UNKNOWN_VARIABLE_APPLICABILITY_AUTO_ACCEPTED = false as const;
export const D1J_R1_ARBITRARY_VARIABLE_EXPRESSION_ENGINE_CREATED = false as const;
export const D1J_R1_VARIABLE_CHANGE_AUTO_CHANGES_OTHER_VARIABLE = false as const;
export const D1J_R1_VARIABLE_SET_MUTATED_IN_PLACE = false as const;
export const D1J_R1_VARIABLE_SET_ORDER_INDEPENDENT = true as const;
export const D1J_R1_DUPLICATE_VARIABLE_POLICY = "The same problem, target, and parameter kind is one variable. An exact repeat returns that variable. A different domain is a conflict and is not merged." as const;
export const D1J_R1_CONFLICTING_VARIABLE_DOMAINS_AUTO_MERGED = false as const;
export const D1J_R1_EMPTY_VARIABLE_SET_POLICY = "A variable set with no variables is rejected. An empty set cannot make the problem optimization-ready." as const;
export const D1J_R1_EMPTY_VARIABLE_SET_EQUALS_OPTIMIZATION_READY = false as const;
export const D1J_R1_PROBLEM_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R1_R2_BINDING_WILL_REQUIRE_PROBLEM_SUCCESSOR_OR_VERSION = true as const;
export const D1J_R1_BASELINE_REFERENCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R1_VARIABLE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R1_VARIABLE_SET_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R1_FINGERPRINT_DETERMINISM = "PASS" as const;
export const D1J_R1_HISTORY_APPEND_ONLY = true as const;
export const D1J_R1_BASELINE_CHANGED_IN_PLACE = false as const;
export const D1J_R1_VARIABLE_DEFINITION_CHANGED_IN_PLACE = false as const;
export const D1J_R1_PROBLEM_SUCCESSION_POLICY = "A new baseline pin or variable set creates a successor problem. The prior problem and its pins remain in history." as const;
export const D1J_R1_BASELINE_STALENESS_PROPAGATES = true as const;
export const D1J_R1_TARGET_STALENESS_PROPAGATES = true as const;
export const D1J_R1_VARIABLE_DOMAIN_SOURCE_STALENESS_PROPAGATES = true as const;
export const D1J_R1_D1B_BINDING_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R1_PARAMETER_REGISTRY_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R1_INVALIDATION_MUTATES_BASELINE_SOURCE = false as const;
export const D1J_R1_INVALIDATION_MUTATES_STRUCTURAL_MODEL = false as const;
export const D1J_R1_INVALIDATION_DELETES_HISTORY = false as const;
export const D1J_R1_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1J_R1_PROBLEM_PROVENANCE_COMPLETE = true as const;
export const D1J_R1_BASELINE_PROVENANCE_COMPLETE = true as const;
export const D1J_R1_VARIABLE_PROVENANCE_COMPLETE = true as const;
export const D1J_R1_VARIABLE_SET_PROVENANCE_COMPLETE = true as const;
export const D1J_R1_AUTHORITY_LAYERS_DISTINCT = true as const;
export const D1J_R1_PROBLEM_CREATION_AUTHORITY_REQUIRED = true as const;
export const D1J_R1_VARIABLE_DEFINITION_AUTHORITY_REQUIRED = true as const;
export const D1J_R1_VARIABLE_DOMAIN_AUTHORITY_REQUIRED = true as const;
export const D1J_R1_PROBLEM_AUTHORITY_PROMOTES_BASELINE_AUTHORITY = false as const;
export const D1J_R1_VARIABLE_AUTHORITY_PROMOTES_DOMAIN_SOURCE_AUTHORITY = false as const;
export const D1J_R1_AI_GOVERNING_AUTHORITY_CREATED = false as const;
export const D1J_R1_AI_CAN_REGISTER_GOVERNING_VARIABLE = false as const;
export const D1J_R1_AI_CAN_DEFINE_GOVERNING_VARIABLE_DOMAIN = false as const;
export const D1J_R1_UNSOURCED_VARIABLE_DOMAIN_ALLOWED = false as const;
export const D1J_R1_CANDIDATE_VARIABLE_ASSIGNMENT_RUNTIME_COUNT = 0 as const;
export const D1J_R1_CANDIDATE_RUNTIME_COUNT = 0 as const;
export const D1J_R1_CANDIDATE_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1J_R1_OBJECTIVE_EVALUATION_RUNTIME_COUNT = 0 as const;
export const D1J_R1_CONSTRAINT_EVALUATION_RUNTIME_COUNT = 0 as const;
export const D1J_R1_FEASIBILITY_RUNTIME_COUNT = 0 as const;
export const D1J_R1_PARETO_RUNTIME_COUNT = 0 as const;
export const D1J_R1_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT = 0 as const;
export const D1J_R1_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1J_R1_STRUCTURAL_MODEL_MUTATION_COUNT = 0 as const;
export const D1J_R1_ANALYSIS_MODEL_MUTATION_COUNT = 0 as const;
export const D1J_R1_BIM_MODEL_MUTATION_COUNT = 0 as const;
export const D1J_R1_AUTOMATIC_DESIGN_SELECTION_COUNT = 0 as const;
export const D1J_R1_CERTIFICATION_EVIDENCE_RUNTIME_COUNT = 0 as const;
export const D1J_R1_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R1_DESIGN_MUTATION_RUNTIME_COUNT = 0 as const;
export const D1J_R1_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1J_R1_OPTIMIZATION_PROBLEM_RUNTIME_COUNT = 1 as const;
export const D1J_R1_BASELINE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R1_DESIGN_VARIABLE_RUNTIME_COUNT = 1 as const;
export const D1J_R1_VARIABLE_SET_RUNTIME_COUNT = 1 as const;
export const D1J_R1_PARAMETER_REGISTRY_RUNTIME_COUNT = 1 as const;
export const D1J_R1_GENERIC_MODEL_READ_WRITE_API_CREATED = false as const;
export const D1J_R1_CREATE_PROBLEM_FAIL_CLOSED = true as const;
export const D1J_R1_REGISTER_VARIABLE_FAIL_CLOSED = true as const;
export const D1J_R1_CREATE_VARIABLE_SET_FAIL_CLOSED = true as const;
export const D1J_R1_COMPLETE_FOUNDATION_EQUALS_OPTIMIZATION_READY = false as const;
export const D1J_R1_COMPLETE_FOUNDATION_EQUALS_FEASIBILITY_READY = false as const;
export const D1J_R1_COMPLETE_FOUNDATION_EQUALS_CERTIFICATION_READY = false as const;
export const D1J_R1_RUNTIME_DIAGNOSTIC_EQUALS_ENGINEERING_CHECK_RESULT = false as const;
export const D1J_R1_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1J_R1_EVENT_MUTATES_DESIGN = false as const;
export const D1J_R1_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1J_R1_DUPLICATE_REGISTRATION_COUNTS_AS_NEW_ENGINEERING_VARIABLE = false as const;
export const D1J_R1_CROSS_PROJECT_OPERATION_ALLOWED = false as const;
export const D1J_R1_CROSS_TENANT_OPERATION_ALLOWED = false as const;
export const D1J_R1_BASELINE_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R1_VARIABLE_DOMAIN_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R1_PARAMETER_INJECTION_SURFACE_CREATED = false as const;
export const D1J_R1_ARBITRARY_EXTERNAL_SELECTOR_ALLOWED = false as const;
export const D1J_R1_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1J_R1_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1J_R1_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1J_R1_OPTIMIZATION_INTELLIGENCE_REUSED = true as const;
export const D1J_R1_PARALLEL_GENERIC_OPTIMIZATION_PLATFORM_CREATED = false as const;
export const D1J_R1_DIGITAL_THREAD_REUSED = true as const;
export const D1J_R1_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1J_R1_REAUTHORS_D1B_BINDING = false as const;
export const D1J_R1_REAUTHORS_D1D_CHECKS = false as const;
export const D1J_R1_REAUTHORS_D1E_CHECKS = false as const;
export const D1J_R1_REAUTHORS_D1F_IDENTITY = false as const;
export const D1J_R1_REAUTHORS_D1G_RESULTS = false as const;
export const D1J_R1_REAUTHORS_D1I_HISTORY = false as const;
export const D1J_R1_D1I_MATURITY_PROMOTION = false as const;
export const D1J_R1_D1G_MATURITY_PROMOTION = false as const;
export const D1J_R1_D1G_CERTIFICATION_PROMOTION = false as const;
export const D1J_R1_D1D_MATURITY_PROMOTION = false as const;
export const D1J_R1_D1E_MATURITY_PROMOTION = false as const;
export const D1J_R1_D1F_MATURITY_PROMOTION = false as const;
export const D1J_R1_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1J_R1_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1J_R2_HANDOFF_READY = true as const;
export const D1J_R2_CANONICAL_PHASE = "EOS-D1J-R2-OBJECTIVE-CONSTRAINT-FEASIBILITY-REFERENCE-FOUNDATION" as const;
export const D1J_R2_PHASE_TYPE = "STRUCTURAL_OPTIMIZATION_OBJECTIVE_CONSTRAINT_FEASIBILITY_REFERENCE_FOUNDATION" as const;
export const D1J_R2_CANONICAL_SCOPE = "RECORD GOVERNED OBJECTIVE DEFINITIONS AND SETS, CONSTRAINT DEFINITIONS AND REQUIRED-CHECK SETS, EXACT ANALYSIS / DESIGN-CHECK REFERENCES, OBJECTIVE-VALUE REFERENCES, EVALUATION COMPLETENESS, AND FEASIBILITY REFERENCE SEMANTICS, USING THE D1J-R1 PROBLEM / BASELINE / VARIABLE FOUNDATION, WITHOUT CANDIDATE GENERATION, WITHOUT OPTIMIZATION ALGORITHM RUNTIME, WITHOUT SOLVER EXECUTION, WITHOUT AUTOMATIC DESIGN SELECTION, AND WITHOUT CERTIFICATION CLAIMS" as const;
export const D1J_R1_OBJECTIVE_SET_DEFERRED_BINDING_POLICY = "objectiveSetRef stays unbound in R1. The problem remains FOUNDATION_DEFINED and is not optimization-ready." as const;
export const D1J_R1_OPTIMIZATION_PROBLEM_RUNTIME_CONTRACT = "An R1 problem pins tenant, workspace, project, structural system, explicit scope, baseline reference, D1B binding, unbound objective and constraint refs, human authority, FOUNDATION_DEFINED status, provenance, and fingerprint." as const;
export const D1J_R1_OPTIMIZATION_SCOPE_RUNTIME_CONTRACT = "Scope declares system or an explicit member set, optional material family, structural discipline, check family label, project stage, purpose, and limitations." as const;
export const D1J_R1_BASELINE_RESOLVER_REGISTRY = "D1F_STRUCTURAL_SYSTEM and D1F_MEMBER resolve only catalogued structural identities. No generic object fetch is registered." as const;
export const D1J_R1_SUPPORTED_BASELINE_SOURCE_DOMAINS = "D1F_STRUCTURAL_SYSTEM, D1F_MEMBER" as const;
export const D1J_R1_DESIGN_VARIABLE_RUNTIME_CONTRACT = "A variable pins semantic key, target, allowlisted parameter, type, quantity and unit, governed domain, separate search bounds, applicability, authority, and fingerprint. It does not assign a candidate value or change the target." as const;
export const D1J_R1_PARAMETER_REGISTRY = [
  { parameterKind: "GOVERNED_CATALOGUE_CHOICE", variableType: "DISCRETE_CATALOGUE", optimizationType: "DISCRETE", dimensional: false, mutatesModel: false },
  { parameterKind: "GOVERNED_ENUMERATION", variableType: "ENUMERATION", optimizationType: "CATEGORICAL", dimensional: false, mutatesModel: false },
  { parameterKind: "GOVERNED_BOUNDED_QUANTITY", variableType: "BOUNDED_CONTINUOUS", optimizationType: "CONTINUOUS", dimensional: true, mutatesModel: false },
  { parameterKind: "GOVERNED_INTEGER_COUNT", variableType: "INTEGER", optimizationType: "INTEGER", dimensional: false, mutatesModel: false },
  { parameterKind: "GOVERNED_BOOLEAN_CHOICE", variableType: "BOOLEAN", optimizationType: "BOOLEAN", dimensional: false, mutatesModel: false },
] as const;
export const D1J_R1_SUPPORTED_PARAMETER_KINDS = "GOVERNED_CATALOGUE_CHOICE, GOVERNED_ENUMERATION, GOVERNED_BOUNDED_QUANTITY, GOVERNED_INTEGER_COUNT, GOVERNED_BOOLEAN_CHOICE" as const;
export const D1J_R1_VARIABLE_SET_RUNTIME_CONTRACT = "A variable set pins the problem, the sorted variable fingerprints, authority, and its own fingerprint. Membership changes are a new set and a successor problem." as const;
export const D1J_R1_RUNTIME_API = "createOptimizationProblemFoundation, inspectOptimizationProblem, registerBaselineDesignReference, inspectBaselineDesignReference, registerDesignVariableDefinition, inspectDesignVariableDefinition, createVariableSet, inspectVariableSet, supersedeOptimizationProblemFoundation, evaluateOptimizationProblemFoundationStatus, produceOptimizationProblemFoundationResult, propagateFoundationStaleness, retireParameterRegistryVersion" as const;
export const D1J_R1_REQUEST_TRUST_BOUNDARY = "The caller may name scope, a baseline selector, an expected version or fingerprint, an allowlisted parameter, a domain source id, and a search subset. The caller does not establish the canonical fingerprint, authority, validation, engineering limit, domain authority, or recorded time." as const;
export const D1J_R1_ERROR_TAXONOMY = "OPTIMIZATION_PROBLEM_NOT_FOUND, STRUCTURAL_TARGET_NOT_FOUND, STRUCTURAL_TARGET_OUT_OF_SCOPE, BASELINE_SOURCE_UNSUPPORTED, BASELINE_SOURCE_NOT_FOUND, BASELINE_VERSION_MISMATCH, BASELINE_FINGERPRINT_MISMATCH, BASELINE_SCOPE_MISMATCH, BASELINE_STALE, STANDARD_BINDING_REQUIRED, PARAMETER_KIND_UNSUPPORTED, PARAMETER_TARGET_OUT_OF_SCOPE, VARIABLE_TYPE_INCOMPATIBLE, VARIABLE_UNIT_REQUIRED, VARIABLE_UNIT_INCOMPATIBLE, VARIABLE_DOMAIN_SOURCE_UNRESOLVED, VARIABLE_DOMAIN_UNAUTHORIZED, SEARCH_DOMAIN_OUTSIDE_GOVERNED_DOMAIN, VARIABLE_APPLICABILITY_UNRESOLVED, DUPLICATE_VARIABLE, CONFLICTING_VARIABLE_DOMAIN, EMPTY_VARIABLE_SET, CROSS_PROJECT_OPERATION, CROSS_TENANT_OPERATION, UNAUTHORIZED" as const;
export const D1J_R1_RUNTIME_RESULT_CONTRACT = "The result pins the problem, baseline, variable ids, variable set, FOUNDATION_DEFINED or stale status, scope, R1 completeness, diagnostics, provenance, and fingerprint. Diagnostics are not engineering check results." as const;
export const D1J_R1_COMPLETENESS_STATES = "COMPLETE_FOR_R1_FOUNDATION_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED" as const;
export const D1J_R1_IDEMPOTENCY_POLICY = "Repeating the same problem, baseline selector, variable, or variable-set content returns the existing record and does not append a second history row." as const;
export const D1J_R1_EVENTS = [
  "OPTIMIZATION_PROBLEM_FOUNDATION_CREATED",
  "OPTIMIZATION_BASELINE_REFERENCE_REGISTERED",
  "OPTIMIZATION_VARIABLE_DEFINED",
  "OPTIMIZATION_VARIABLE_SUPERSEDED",
  "OPTIMIZATION_VARIABLE_SET_CREATED",
  "OPTIMIZATION_PROBLEM_FOUNDATION_STALE",
] as const;
export const D1J_R2_REQUIRED_R1_CONTRACTS = "optimizationProblemId, optimizationProblemFingerprint, optimizationScope, structuralSystemRef, baselineRef, baselineFingerprint, jurisdictionBindingRef, standardBindingRefs, variableDefinitions, variableDefinitionFingerprints, variableSet, variableSetFingerprint, parameterRegistrySemantics, variableDomainAuthority, search-bound semantics, foundation status, provenance, history, and staleness." as const;

export type D1jR1ParameterKind = (typeof D1J_R1_PARAMETER_REGISTRY)[number]["parameterKind"];
export type D1jR1BaselineDomain = "D1F_STRUCTURAL_SYSTEM" | "D1F_MEMBER";
export type D1jR1FoundationStatus = "FOUNDATION_DEFINED" | "STALE" | "INVALID" | "SUPERSEDED";
export type D1jR1Completeness = "COMPLETE_FOR_R1_FOUNDATION_SCOPE" | "PARTIAL" | "INCOMPLETE" | "STALE" | "INVALID" | "UNDETERMINED";
export type D1jR1BoundSemantic = "ENGINEERING_MINIMUM" | "ENGINEERING_MAXIMUM" | "CATALOGUE_MINIMUM" | "CATALOGUE_MAXIMUM" | "PROJECT_MINIMUM" | "PROJECT_MAXIMUM" | "SEARCH_MINIMUM" | "SEARCH_MAXIMUM";
export type D1jR1DomainClass = "APPROVED_CATALOGUE" | "GOVERNED_ENGINEERING_RULE" | "PROJECT_CONSTRAINT" | "HUMAN_APPROVED_SEARCH_CONFIGURATION";

export type D1jR1StructuralIdentity = D1hR1CatalogObject & {
  authority: string;
  validationState: string;
  contentFingerprint: string;
  status: "CURRENT" | "STALE" | "INVALID";
};

export type D1jR1Binding = {
  bindingId: string;
  jurisdictionBindingRef: string;
  standardBindingRefs: readonly string[];
  fingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  status: "CURRENT" | "STALE" | "INVALID";
};

export type D1jR1DomainSource = {
  domainSourceId: string;
  sourceClass: D1jR1DomainClass;
  authority: string;
  fingerprint: string;
  version: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  status: "CURRENT" | "STALE" | "INVALID";
  catalogueEntries: readonly string[] | null;
  enumerationIds: readonly string[] | null;
  booleanMeanings: readonly [string, string] | null;
  quantity: string | null;
  unit: string | null;
  engineeringMinimum: number | null;
  engineeringMaximum: number | null;
  integerMinimum: number | null;
  integerMaximum: number | null;
};

export type D1jR1Catalog = {
  identities: D1jR1StructuralIdentity[];
  bindings: D1jR1Binding[];
  domainSources: D1jR1DomainSource[];
};

export type D1jR1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1jR1Provenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralScope: string;
  actorOrSystem: string;
  registrationAuthority: string;
  sourceAuthority: string;
  sourceRefs: readonly string[];
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR1Scope = {
  scopeKind: "STRUCTURAL_SYSTEM" | "MEMBER_SET";
  structuralSystemId: string;
  memberIds: readonly string[];
  materialFamily: string | null;
  designDiscipline: "STRUCTURAL";
  checkFamily: string | null;
  projectStage: string;
  purpose: string;
  limitations: string;
};

export type D1jR1Bound = {
  semanticType: D1jR1BoundSemantic;
  value: number;
  unit: string | null;
  sourceId: string;
  authority: string;
};

export type D1jR1Baseline = {
  recordKind: "BASELINE_DESIGN_REFERENCE";
  baselineRefId: string;
  sourceDomain: D1jR1BaselineDomain;
  sourceObjectId: string;
  sourceVersion: string;
  sourceFingerprint: string;
  authority: string;
  validationState: string;
  structuralSystemId: string;
  status: D1jR1FoundationStatus;
  copiesSourceBody: false;
  floatsToLatest: false;
  promotesAuthority: false;
  provenance: D1jR1Provenance;
  fingerprint: string;
};

export type D1jR1Problem = {
  recordKind: "OPTIMIZATION_PROBLEM";
  optimizationProblemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralSystemRef: string;
  scope: D1jR1Scope;
  baselineRefId: string;
  jurisdictionBindingRef: string;
  standardBindingRefs: readonly string[];
  bindingFingerprint: string;
  variableSetRef: string | null;
  objectiveSetRef: null;
  constraintSetRef: null;
  evaluationProfileRef: null;
  methodPolicyRef: null;
  humanAuthority: string;
  limitations: string;
  status: D1jR1FoundationStatus;
  optimizationReady: false;
  feasibilityReady: false;
  certificationReady: false;
  version: string;
  createdAt: string;
  predecessorId: string | null;
  provenance: D1jR1Provenance;
  fingerprint: string;
};

export type D1jR1Variable = {
  recordKind: "DESIGN_VARIABLE_DEFINITION";
  variableId: string;
  optimizationProblemId: string;
  semanticKey: string;
  targetKind: "STRUCTURAL_SYSTEM" | "MEMBER";
  targetId: string;
  parameterKind: D1jR1ParameterKind;
  variableType: (typeof D1J_R1_PARAMETER_REGISTRY)[number]["variableType"];
  optimizationType: (typeof VARIABLE_TYPES)[number];
  quantity: string | null;
  unit: string | null;
  domainSourceId: string;
  domainSourceClass: D1jR1DomainClass;
  domainAuthority: string;
  domainFingerprint: string;
  discreteValues: readonly string[] | null;
  bounds: readonly D1jR1Bound[];
  applicability: "APPLICABLE" | "CONDITIONAL" | "NOT_APPLICABLE";
  searchBoundEqualsEngineeringLimit: false;
  defaultSearchStep: null;
  status: D1jR1FoundationStatus;
  parameterRegistryVersion: typeof D1J_R1_PARAMETER_REGISTRY_VERSION;
  limitations: string;
  version: string;
  mutatesTarget: false;
  provenance: D1jR1Provenance;
  fingerprint: string;
};

export type D1jR1VariableSet = {
  recordKind: "VARIABLE_SET";
  variableSetId: string;
  optimizationProblemId: string;
  variableIds: readonly string[];
  variableFingerprints: readonly string[];
  status: D1jR1FoundationStatus;
  version: string;
  immutable: true;
  provenance: D1jR1Provenance;
  fingerprint: string;
};

export type D1jR1History = {
  historyId: string;
  subjectKind: "PROBLEM" | "BASELINE" | "VARIABLE" | "VARIABLE_SET";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED" | "STALE";
  version: string;
  fingerprint: string;
  recordedAt: string;
  predecessorId: string | null;
};

export type D1jR1Event = {
  eventId: string;
  eventType: (typeof D1J_R1_EVENTS)[number];
  subjectId: string;
  recordedAt: string;
  engineeringApproval: false;
  mutatesDesign: false;
};

export type D1jR1Store = {
  catalog: D1jR1Catalog;
  now: () => string;
  problems: D1jR1Problem[];
  baselines: D1jR1Baseline[];
  variables: D1jR1Variable[];
  variableSets: D1jR1VariableSet[];
  history: D1jR1History[];
  events: D1jR1Event[];
  retiredRegistryVersions: string[];
};

export type D1jR1ProblemInput = {
  optimizationProblemId: string;
  baselineRefId: string;
  sourceDomain: string;
  sourceObjectId: string;
  expectedBaselineVersion?: string | null;
  expectedBaselineFingerprint?: string | null;
  baselineAuthority?: string | null;
  baselineValidationState?: string | null;
  sourceFingerprint?: string | null;
  bindingId: string;
  scope: {
    scopeKind: string;
    structuralSystemId: string;
    memberIds?: readonly string[] | null;
    materialFamily?: string | null;
    designDiscipline?: string | null;
    checkFamily?: string | null;
    projectStage: string;
    purpose: string;
    limitations: string;
  };
  limitations: string;
  version: string;
  governanceProfileRef: string;
};

export type D1jR1VariableInput = {
  variableId: string;
  optimizationProblemId: string;
  semanticKey: string;
  targetKind: "STRUCTURAL_SYSTEM" | "MEMBER";
  targetId: string;
  parameterKind: string;
  quantity?: string | null;
  unit?: string | null;
  domainSourceId?: string | null;
  applicability?: string | null;
  searchMinimum?: number | null;
  searchMaximum?: number | null;
  searchUnit?: string | null;
  discreteSubset?: readonly string[] | null;
  lowerBound?: number | null;
  upperBound?: number | null;
  limitations: string;
  version: string;
  successorOfVariableId?: string | null;
};

export type D1jR1Result = {
  resultId: string;
  problemId: string;
  baselineRefId: string;
  variableIds: readonly string[];
  variableSetId: string | null;
  foundationStatus: D1jR1FoundationStatus;
  scope: D1jR1Scope;
  completeness: D1jR1Completeness;
  runtimeDiagnostics: readonly string[];
  blockingRuntimeDiagnostics: readonly string[];
  warnings: readonly string[];
  optimizationReady: false;
  diagnosticEqualsEngineeringCheck: false;
  provenance: D1jR1Provenance;
  fingerprint: string;
};

function fail(code: string): never {
  throw new Error(code);
}

function assertHuman(actor: D1jR1Actor): void {
  const authority = actor.authority.trim();
  if (!authority || /^AI\b/i.test(authority) || /LLM/i.test(authority)) fail("UNAUTHORIZED");
}

function assertIsolation(actor: D1jR1Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertParameter(value: string): (typeof D1J_R1_PARAMETER_REGISTRY)[number] {
  const blocked = ["[", "]", ".", "__proto__", "constructor", "prototype", "/", "\\", "$", " "];
  if (!value || value !== value.trim() || blocked.some((token) => value.includes(token))) fail("PARAMETER_KIND_UNSUPPORTED");
  const row = D1J_R1_PARAMETER_REGISTRY.find((item) => item.parameterKind === value);
  if (!row || !(VARIABLE_TYPES as readonly string[]).includes(row.optimizationType)) fail("PARAMETER_KIND_UNSUPPORTED");
  return row;
}

function provenance(input: {
  actor: D1jR1Actor;
  scope: string;
  sourceAuthority: string;
  sourceRefs: readonly string[];
  version: string;
  fingerprint: string;
  recordedAt: string;
}): D1jR1Provenance {
  return {
    tenantId: input.actor.tenantId,
    workspaceId: input.actor.workspaceId,
    projectId: input.actor.projectId,
    structuralScope: input.scope,
    actorOrSystem: input.actor.actorId,
    registrationAuthority: input.actor.authority,
    sourceAuthority: input.sourceAuthority,
    sourceRefs: input.sourceRefs,
    version: input.version,
    fingerprint: input.fingerprint,
    recordedAt: input.recordedAt,
    callerBackdated: false,
  };
}

function remember(store: D1jR1Store, subjectKind: D1jR1History["subjectKind"], subjectId: string, action: D1jR1History["action"], version: string, fingerprint: string, predecessorId: string | null): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    version,
    fingerprint,
    recordedAt: store.now(),
    predecessorId,
  });
}

function emit(store: D1jR1Store, eventType: D1jR1Event["eventType"], subjectId: string): void {
  store.events.push({
    eventId: `evt-${store.events.length + 1}`,
    eventType,
    subjectId,
    recordedAt: store.now(),
    engineeringApproval: false,
    mutatesDesign: false,
  });
}

function identityOf(catalog: D1jR1Catalog, kind: D1jR1StructuralIdentity["kind"], id: string): D1jR1StructuralIdentity {
  const row = catalog.identities.find((item) => item.kind === kind && item.id === id);
  if (!row) fail(kind === "STRUCTURAL_SYSTEM" || kind === "MEMBER" ? "STRUCTURAL_TARGET_NOT_FOUND" : "STRUCTURAL_TARGET_NOT_FOUND");
  return row;
}

function resolveBaseline(catalog: D1jR1Catalog, domain: string, objectId: string): { domain: D1jR1BaselineDomain; row: D1jR1StructuralIdentity } {
  if (domain !== "D1F_STRUCTURAL_SYSTEM" && domain !== "D1F_MEMBER") fail("BASELINE_SOURCE_UNSUPPORTED");
  const kind = domain === "D1F_STRUCTURAL_SYSTEM" ? "STRUCTURAL_SYSTEM" : "MEMBER";
  const row = catalog.identities.find((item) => item.kind === kind && item.id === objectId);
  if (!row) fail("BASELINE_SOURCE_NOT_FOUND");
  if (!row.version || row.version === "latest" || row.version === "current") fail("BASELINE_VERSION_MISMATCH");
  if (!row.contentFingerprint) fail("BASELINE_FINGERPRINT_MISMATCH");
  if (row.status !== "CURRENT" || row.lifecycle !== "CURRENT") fail("BASELINE_STALE");
  return { domain, row };
}

function scopeFrom(actor: D1jR1Actor, catalog: D1jR1Catalog, input: D1jR1ProblemInput["scope"]): D1jR1Scope {
  if (input.scopeKind !== "STRUCTURAL_SYSTEM" && input.scopeKind !== "MEMBER_SET") fail("STRUCTURAL_TARGET_OUT_OF_SCOPE");
  if (input.designDiscipline != null && input.designDiscipline !== "STRUCTURAL") fail("STRUCTURAL_TARGET_OUT_OF_SCOPE");
  const system = identityOf(catalog, "STRUCTURAL_SYSTEM", input.structuralSystemId);
  assertIsolation(actor, system);
  if (system.status !== "CURRENT" || system.lifecycle !== "CURRENT") fail("BASELINE_STALE");
  const memberIds = [...(input.memberIds ?? [])];
  if (input.scopeKind === "STRUCTURAL_SYSTEM" && memberIds.length > 0) fail("STRUCTURAL_TARGET_OUT_OF_SCOPE");
  if (input.scopeKind === "MEMBER_SET" && memberIds.length === 0) fail("STRUCTURAL_TARGET_OUT_OF_SCOPE");
  for (const memberId of memberIds) {
    const member = identityOf(catalog, "MEMBER", memberId);
    assertIsolation(actor, member);
    if (member.structuralSystemId !== system.id) fail("STRUCTURAL_TARGET_OUT_OF_SCOPE");
  }
  return {
    scopeKind: input.scopeKind,
    structuralSystemId: system.id,
    memberIds: [...memberIds].sort(),
    materialFamily: input.materialFamily ?? null,
    designDiscipline: "STRUCTURAL",
    checkFamily: input.checkFamily ?? null,
    projectStage: input.projectStage,
    purpose: input.purpose,
    limitations: input.limitations,
  };
}

function assertBaselineCovers(scope: D1jR1Scope, domain: D1jR1BaselineDomain, row: D1jR1StructuralIdentity): void {
  if (row.structuralSystemId !== scope.structuralSystemId && row.id !== scope.structuralSystemId) fail("BASELINE_SCOPE_MISMATCH");
  if (domain === "D1F_STRUCTURAL_SYSTEM" && row.id !== scope.structuralSystemId) fail("BASELINE_SCOPE_MISMATCH");
  if (domain === "D1F_MEMBER") {
    if (scope.scopeKind !== "MEMBER_SET" || scope.memberIds.length !== 1 || scope.memberIds[0] !== row.id) fail("BASELINE_SCOPE_MISMATCH");
  }
}

function problemFingerprint(problem: Omit<D1jR1Problem, "fingerprint" | "provenance">, baselineFingerprint: string, variableSetFingerprint: string | null): string {
  return fingerprintCanonical({
    tenantId: problem.tenantId,
    workspaceId: problem.workspaceId,
    projectId: problem.projectId,
    structuralSystemRef: problem.structuralSystemRef,
    scope: problem.scope,
    baselineFingerprint,
    bindingFingerprint: problem.bindingFingerprint,
    variableSetFingerprint,
    humanAuthority: problem.humanAuthority,
    status: problem.status,
    version: problem.version,
  });
}

function pinBaseline(store: D1jR1Store, actor: D1jR1Actor, input: D1jR1ProblemInput, scope: D1jR1Scope): D1jR1Baseline {
  const resolved = resolveBaseline(store.catalog, input.sourceDomain, input.sourceObjectId);
  assertIsolation(actor, resolved.row);
  assertBaselineCovers(scope, resolved.domain, resolved.row);
  if (input.expectedBaselineVersion != null && input.expectedBaselineVersion !== resolved.row.version) fail("BASELINE_VERSION_MISMATCH");
  if (input.expectedBaselineFingerprint != null && input.expectedBaselineFingerprint !== resolved.row.contentFingerprint) fail("BASELINE_FINGERPRINT_MISMATCH");
  const existing = store.baselines.find((row) => row.baselineRefId === input.baselineRefId);
  if (existing) {
    if (existing.sourceFingerprint === resolved.row.contentFingerprint && existing.sourceVersion === resolved.row.version) return existing;
    fail("BASELINE_FINGERPRINT_MISMATCH");
  }
  const recordedAt = store.now();
  const draft = {
    sourceDomain: resolved.domain,
    sourceObjectId: resolved.row.id,
    sourceVersion: resolved.row.version,
    sourceFingerprint: resolved.row.contentFingerprint,
    authority: resolved.row.authority,
    validationState: resolved.row.validationState,
  };
  const fingerprint = fingerprintCanonical(draft);
  const record: D1jR1Baseline = {
    recordKind: "BASELINE_DESIGN_REFERENCE",
    baselineRefId: input.baselineRefId,
    ...draft,
    structuralSystemId: resolved.row.structuralSystemId,
    status: "FOUNDATION_DEFINED",
    copiesSourceBody: false,
    floatsToLatest: false,
    promotesAuthority: false,
    fingerprint,
    provenance: provenance({
      actor,
      scope: scope.structuralSystemId,
      sourceAuthority: resolved.row.authority,
      sourceRefs: [resolved.row.id],
      version: resolved.row.version,
      fingerprint,
      recordedAt,
    }),
  };
  store.baselines.push(record);
  remember(store, "BASELINE", record.baselineRefId, "CREATED", record.sourceVersion, record.fingerprint, null);
  emit(store, "OPTIMIZATION_BASELINE_REFERENCE_REGISTERED", record.baselineRefId);
  return record;
}

export function createD1jR1Store(catalog: D1jR1Catalog, now: () => string): D1jR1Store {
  return {
    catalog,
    now,
    problems: [],
    baselines: [],
    variables: [],
    variableSets: [],
    history: [],
    events: [],
    retiredRegistryVersions: [],
  };
}

export function createOptimizationProblemFoundation(store: D1jR1Store, actor: D1jR1Actor, input: D1jR1ProblemInput): D1jR1Problem {
  assertHuman(actor);
  const prior = store.problems.find((row) => row.optimizationProblemId === input.optimizationProblemId);
  const scope = scopeFrom(actor, store.catalog, input.scope);
  const binding = store.catalog.bindings.find((row) => row.bindingId === input.bindingId);
  if (!binding) fail("STANDARD_BINDING_REQUIRED");
  assertIsolation(actor, binding);
  if (binding.status !== "CURRENT") fail("BASELINE_STALE");
  const baseline = pinBaseline(store, actor, input, scope);
  const draft = {
    recordKind: "OPTIMIZATION_PROBLEM" as const,
    optimizationProblemId: input.optimizationProblemId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    structuralSystemRef: scope.structuralSystemId,
    scope,
    baselineRefId: baseline.baselineRefId,
    jurisdictionBindingRef: binding.jurisdictionBindingRef,
    standardBindingRefs: [...binding.standardBindingRefs],
    bindingFingerprint: binding.fingerprint,
    variableSetRef: null,
    objectiveSetRef: null as null,
    constraintSetRef: null as null,
    evaluationProfileRef: null as null,
    methodPolicyRef: null as null,
    humanAuthority: actor.authority,
    limitations: input.limitations,
    status: "FOUNDATION_DEFINED" as const,
    optimizationReady: false as const,
    feasibilityReady: false as const,
    certificationReady: false as const,
    version: input.version,
    createdAt: prior?.createdAt ?? store.now(),
    predecessorId: null,
  };
  const fingerprint = problemFingerprint(draft, baseline.sourceFingerprint, null);
  if (prior) {
    if (prior.fingerprint === fingerprint) return prior;
    fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  }
  const problem: D1jR1Problem = {
    ...draft,
    fingerprint,
    provenance: provenance({
      actor,
      scope: scope.structuralSystemId,
      sourceAuthority: baseline.authority,
      sourceRefs: [baseline.baselineRefId, binding.bindingId],
      version: input.version,
      fingerprint,
      recordedAt: draft.createdAt,
    }),
  };
  store.problems.push(problem);
  remember(store, "PROBLEM", problem.optimizationProblemId, "CREATED", problem.version, problem.fingerprint, null);
  emit(store, "OPTIMIZATION_PROBLEM_FOUNDATION_CREATED", problem.optimizationProblemId);
  return problem;
}

export function inspectOptimizationProblem(store: D1jR1Store, problemId: string): D1jR1Problem {
  return store.problems.find((row) => row.optimizationProblemId === problemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
}

export function inspectBaselineDesignReference(store: D1jR1Store, baselineRefId: string): D1jR1Baseline {
  return store.baselines.find((row) => row.baselineRefId === baselineRefId) ?? fail("BASELINE_SOURCE_NOT_FOUND");
}

export function registerBaselineDesignReference(store: D1jR1Store, actor: D1jR1Actor, input: D1jR1ProblemInput & { successorProblemId: string }): D1jR1Problem {
  const current = inspectOptimizationProblem(store, input.optimizationProblemId);
  if (current.status === "SUPERSEDED") fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const successorInput = { ...input, optimizationProblemId: input.successorProblemId };
  const successor = createOptimizationProblemFoundation(store, actor, successorInput);
  if (current.status === "FOUNDATION_DEFINED") {
    current.status = "SUPERSEDED";
    remember(store, "PROBLEM", current.optimizationProblemId, "SUPERSEDED", current.version, current.fingerprint, successor.optimizationProblemId);
  }
  return successor;
}

function governingBounds(source: D1jR1DomainSource, parameter: (typeof D1J_R1_PARAMETER_REGISTRY)[number]): D1jR1Bound[] {
  if (parameter.parameterKind === "GOVERNED_BOUNDED_QUANTITY") {
    if (source.engineeringMinimum == null || source.engineeringMaximum == null || !source.quantity || !source.unit) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
    const semantic = source.sourceClass === "PROJECT_CONSTRAINT" ? "PROJECT" : source.sourceClass === "APPROVED_CATALOGUE" ? "CATALOGUE" : "ENGINEERING";
    return [
      { semanticType: `${semantic}_MINIMUM` as D1jR1BoundSemantic, value: source.engineeringMinimum, unit: source.unit, sourceId: source.domainSourceId, authority: source.authority },
      { semanticType: `${semantic}_MAXIMUM` as D1jR1BoundSemantic, value: source.engineeringMaximum, unit: source.unit, sourceId: source.domainSourceId, authority: source.authority },
    ];
  }
  if (parameter.parameterKind === "GOVERNED_INTEGER_COUNT") {
    if (source.integerMinimum == null || source.integerMaximum == null || !Number.isInteger(source.integerMinimum) || !Number.isInteger(source.integerMaximum)) fail("VARIABLE_TYPE_INCOMPATIBLE");
    return [
      { semanticType: "ENGINEERING_MINIMUM", value: source.integerMinimum, unit: null, sourceId: source.domainSourceId, authority: source.authority },
      { semanticType: "ENGINEERING_MAXIMUM", value: source.integerMaximum, unit: null, sourceId: source.domainSourceId, authority: source.authority },
    ];
  }
  return [];
}

function assertSearchInside(source: D1jR1DomainSource, input: D1jR1VariableInput, bounds: readonly D1jR1Bound[]): D1jR1Bound[] {
  if (input.searchMinimum == null && input.searchMaximum == null) return [];
  if (input.searchMinimum == null || input.searchMaximum == null) fail("SEARCH_DOMAIN_OUTSIDE_GOVERNED_DOMAIN");
  const minimum = bounds.find((row) => row.semanticType.endsWith("MINIMUM"));
  const maximum = bounds.find((row) => row.semanticType.endsWith("MAXIMUM"));
  if (!minimum || !maximum) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
  if (source.quantity && source.unit) {
    const unit = input.searchUnit ?? input.unit;
    if (!unit) fail("VARIABLE_UNIT_REQUIRED");
    if (!existingUnitPairCompatible(source.quantity, unit, source.unit)) fail("VARIABLE_UNIT_INCOMPATIBLE");
    const low = normalizeWithExistingUnitSystem(source.quantity, input.searchMinimum, unit);
    const high = normalizeWithExistingUnitSystem(source.quantity, input.searchMaximum, unit);
    const governedLow = normalizeWithExistingUnitSystem(source.quantity, minimum.value, source.unit);
    const governedHigh = normalizeWithExistingUnitSystem(source.quantity, maximum.value, source.unit);
    if (low < governedLow || high > governedHigh || low > high) fail("SEARCH_DOMAIN_OUTSIDE_GOVERNED_DOMAIN");
    return [
      { semanticType: "SEARCH_MINIMUM", value: input.searchMinimum, unit, sourceId: source.domainSourceId, authority: source.authority },
      { semanticType: "SEARCH_MAXIMUM", value: input.searchMaximum, unit, sourceId: source.domainSourceId, authority: source.authority },
    ];
  }
  if (!Number.isInteger(input.searchMinimum) || !Number.isInteger(input.searchMaximum)) fail("VARIABLE_TYPE_INCOMPATIBLE");
  if (input.searchMinimum < minimum.value || input.searchMaximum > maximum.value || input.searchMinimum > input.searchMaximum) fail("SEARCH_DOMAIN_OUTSIDE_GOVERNED_DOMAIN");
  return [
    { semanticType: "SEARCH_MINIMUM", value: input.searchMinimum, unit: null, sourceId: source.domainSourceId, authority: source.authority },
    { semanticType: "SEARCH_MAXIMUM", value: input.searchMaximum, unit: null, sourceId: source.domainSourceId, authority: source.authority },
  ];
}

export function registerDesignVariableDefinition(store: D1jR1Store, actor: D1jR1Actor, input: D1jR1VariableInput): D1jR1Variable {
  assertHuman(actor);
  const problem = inspectOptimizationProblem(store, input.optimizationProblemId);
  if (problem.status !== "FOUNDATION_DEFINED") fail("BASELINE_STALE");
  assertIsolation(actor, problem);
  const parameter = assertParameter(input.parameterKind);
  if (input.semanticKey !== input.parameterKind) fail("PARAMETER_KIND_UNSUPPORTED");
  const target = identityOf(store.catalog, input.targetKind, input.targetId);
  assertIsolation(actor, target);
  const inSystem = target.id === problem.scope.structuralSystemId || target.structuralSystemId === problem.scope.structuralSystemId;
  const inMemberSet = problem.scope.scopeKind === "MEMBER_SET" && problem.scope.memberIds.includes(target.id);
  const inSystemScope = problem.scope.scopeKind === "STRUCTURAL_SYSTEM" && inSystem;
  if (!inSystemScope && !inMemberSet) fail("PARAMETER_TARGET_OUT_OF_SCOPE");
  if (!input.domainSourceId) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
  const source = store.catalog.domainSources.find((row) => row.domainSourceId === input.domainSourceId);
  if (!source) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
  assertIsolation(actor, source);
  if (source.status !== "CURRENT") fail("VARIABLE_DOMAIN_UNAUTHORIZED");
  if (/^AI\b/i.test(source.authority) || /LLM/i.test(source.authority)) fail("VARIABLE_DOMAIN_UNAUTHORIZED");
  if (source.sourceClass === "HUMAN_APPROVED_SEARCH_CONFIGURATION") fail("VARIABLE_DOMAIN_UNAUTHORIZED");
  if (input.applicability !== "APPLICABLE" && input.applicability !== "CONDITIONAL" && input.applicability !== "NOT_APPLICABLE") fail("VARIABLE_APPLICABILITY_UNRESOLVED");
  let discreteValues: string[] | null = null;
  if (parameter.parameterKind === "GOVERNED_BOUNDED_QUANTITY") {
    if (!input.quantity || !input.unit) fail("VARIABLE_UNIT_REQUIRED");
    if (input.quantity !== source.quantity) fail("VARIABLE_UNIT_INCOMPATIBLE");
    if (!source.unit || !existingUnitPairCompatible(input.quantity, input.unit, source.unit)) fail("VARIABLE_UNIT_INCOMPATIBLE");
  } else if (input.unit) {
    fail("VARIABLE_UNIT_INCOMPATIBLE");
  }
  if (parameter.parameterKind === "GOVERNED_CATALOGUE_CHOICE") {
    if (!source.catalogueEntries?.length) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
    const requested = input.discreteSubset ? [...input.discreteSubset] : [...source.catalogueEntries];
    if (requested.some((entry) => !source.catalogueEntries?.includes(entry))) fail("VARIABLE_DOMAIN_UNAUTHORIZED");
    discreteValues = [...requested].sort();
  }
  if (parameter.parameterKind === "GOVERNED_ENUMERATION") {
    if (!source.enumerationIds?.length) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
    const requested = input.discreteSubset ? [...input.discreteSubset] : [...source.enumerationIds];
    if (requested.length === 0 || requested.some((entry) => !source.enumerationIds?.includes(entry))) fail("VARIABLE_DOMAIN_UNAUTHORIZED");
    discreteValues = [...requested].sort();
  }
  if (parameter.parameterKind === "GOVERNED_BOOLEAN_CHOICE") {
    if (!source.booleanMeanings || source.booleanMeanings.length !== 2) fail("VARIABLE_DOMAIN_SOURCE_UNRESOLVED");
    if (input.discreteSubset?.some((entry) => !source.booleanMeanings?.includes(entry))) fail("VARIABLE_DOMAIN_UNAUTHORIZED");
    discreteValues = [...source.booleanMeanings];
  }
  const bounds = [...governingBounds(source, parameter), ...assertSearchInside(source, input, governingBounds(source, parameter))];
  const fingerprint = fingerprintCanonical({
    problemId: problem.optimizationProblemId,
    targetId: target.id,
    parameterKind: parameter.parameterKind,
    quantity: input.quantity ?? null,
    unit: input.unit ?? null,
    domainFingerprint: source.fingerprint,
    discreteValues,
    bounds,
    applicability: input.applicability,
    version: input.version,
    registryVersion: D1J_R1_PARAMETER_REGISTRY_VERSION,
  });
  const duplicate = store.variables.find((row) => row.optimizationProblemId === problem.optimizationProblemId && row.targetId === target.id && row.parameterKind === parameter.parameterKind && row.status !== "SUPERSEDED");
  if (duplicate && input.successorOfVariableId !== duplicate.variableId) {
    if (duplicate.fingerprint === fingerprint) return duplicate;
    fail("CONFLICTING_VARIABLE_DOMAIN");
  }
  const sameId = store.variables.find((row) => row.variableId === input.variableId);
  if (sameId) return sameId.fingerprint === fingerprint ? sameId : fail("DUPLICATE_VARIABLE");
  if (input.successorOfVariableId) {
    const previous = store.variables.find((row) => row.variableId === input.successorOfVariableId && row.status !== "SUPERSEDED");
    if (!previous) fail("DUPLICATE_VARIABLE");
    previous.status = "SUPERSEDED";
    remember(store, "VARIABLE", previous.variableId, "SUPERSEDED", previous.version, previous.fingerprint, input.variableId);
    emit(store, "OPTIMIZATION_VARIABLE_SUPERSEDED", previous.variableId);
  }
  const recordedAt = store.now();
  const variable: D1jR1Variable = {
    recordKind: "DESIGN_VARIABLE_DEFINITION",
    variableId: input.variableId,
    optimizationProblemId: problem.optimizationProblemId,
    semanticKey: parameter.parameterKind,
    targetKind: input.targetKind,
    targetId: target.id,
    parameterKind: parameter.parameterKind,
    variableType: parameter.variableType,
    optimizationType: parameter.optimizationType,
    quantity: input.quantity ?? null,
    unit: input.unit ?? null,
    domainSourceId: source.domainSourceId,
    domainSourceClass: source.sourceClass,
    domainAuthority: source.authority,
    domainFingerprint: source.fingerprint,
    discreteValues,
    bounds,
    applicability: input.applicability,
    searchBoundEqualsEngineeringLimit: false,
    defaultSearchStep: null,
    status: "FOUNDATION_DEFINED",
    parameterRegistryVersion: D1J_R1_PARAMETER_REGISTRY_VERSION,
    limitations: input.limitations,
    version: input.version,
    mutatesTarget: false,
    fingerprint,
    provenance: provenance({
      actor,
      scope: problem.structuralSystemRef,
      sourceAuthority: source.authority,
      sourceRefs: [source.domainSourceId, target.id],
      version: input.version,
      fingerprint,
      recordedAt,
    }),
  };
  store.variables.push(variable);
  remember(store, "VARIABLE", variable.variableId, "CREATED", variable.version, variable.fingerprint, null);
  emit(store, "OPTIMIZATION_VARIABLE_DEFINED", variable.variableId);
  return variable;
}

export function inspectDesignVariableDefinition(store: D1jR1Store, variableId: string): D1jR1Variable {
  return store.variables.find((row) => row.variableId === variableId) ?? fail("DUPLICATE_VARIABLE");
}

export function createVariableSet(store: D1jR1Store, actor: D1jR1Actor, input: { variableSetId: string; optimizationProblemId: string; variableIds: readonly string[]; version: string }): { variableSet: D1jR1VariableSet; problem: D1jR1Problem } {
  assertHuman(actor);
  if (input.variableIds.length === 0) fail("EMPTY_VARIABLE_SET");
  let problem = inspectOptimizationProblem(store, input.optimizationProblemId);
  if (problem.status === "SUPERSEDED") {
    problem = store.problems.find((row) => row.predecessorId === input.optimizationProblemId && row.status === "FOUNDATION_DEFINED") ?? fail("BASELINE_STALE");
  }
  if (problem.status !== "FOUNDATION_DEFINED") fail("BASELINE_STALE");
  assertIsolation(actor, problem);
  const ownerId = problem.predecessorId ?? problem.optimizationProblemId;
  const chosen = input.variableIds.map((variableId) => inspectDesignVariableDefinition(store, variableId));
  if (chosen.some((row) => (row.optimizationProblemId !== ownerId && row.optimizationProblemId !== problem.optimizationProblemId) || row.status !== "FOUNDATION_DEFINED")) fail("BASELINE_STALE");
  const keys = chosen.map((row) => `${row.targetId}|${row.parameterKind}`);
  if (new Set(keys).size !== keys.length) fail("DUPLICATE_VARIABLE");
  const ordered = [...chosen].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
  const variableFingerprints = ordered.map((row) => row.fingerprint);
  const fingerprint = fingerprintCanonical({ problemFingerprint: problem.fingerprint, variableFingerprints });
  const existing = store.variableSets.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) {
    const bound = store.problems.find((row) => row.variableSetRef === existing.variableSetId && row.status === "FOUNDATION_DEFINED");
    if (bound) return { variableSet: existing, problem: bound };
  }
  const recordedAt = store.now();
  const variableSet: D1jR1VariableSet = existing ?? {
    recordKind: "VARIABLE_SET",
    variableSetId: input.variableSetId,
    optimizationProblemId: problem.optimizationProblemId,
    variableIds: ordered.map((row) => row.variableId),
    variableFingerprints,
    status: "FOUNDATION_DEFINED",
    version: input.version,
    immutable: true,
    fingerprint,
    provenance: provenance({
      actor,
      scope: problem.structuralSystemRef,
      sourceAuthority: actor.authority,
      sourceRefs: ordered.map((row) => row.variableId),
      version: input.version,
      fingerprint,
      recordedAt,
    }),
  };
  if (!existing) {
    store.variableSets.push(variableSet);
    remember(store, "VARIABLE_SET", variableSet.variableSetId, "CREATED", variableSet.version, variableSet.fingerprint, null);
    emit(store, "OPTIMIZATION_VARIABLE_SET_CREATED", variableSet.variableSetId);
  }
  const successorId = `${problem.optimizationProblemId}::${variableSet.variableSetId}`;
  const already = store.problems.find((row) => row.optimizationProblemId === successorId);
  if (already) return { variableSet, problem: already };
  const baseline = inspectBaselineDesignReference(store, problem.baselineRefId);
  const draft = {
    ...problem,
    optimizationProblemId: successorId,
    variableSetRef: variableSet.variableSetId,
    version: input.version,
    createdAt: recordedAt,
    predecessorId: problem.optimizationProblemId,
    status: "FOUNDATION_DEFINED" as const,
  };
  const successorFingerprint = problemFingerprint(draft, baseline.sourceFingerprint, variableSet.fingerprint);
  const successor: D1jR1Problem = {
    ...draft,
    fingerprint: successorFingerprint,
    provenance: provenance({
      actor,
      scope: problem.structuralSystemRef,
      sourceAuthority: baseline.authority,
      sourceRefs: [baseline.baselineRefId, variableSet.variableSetId],
      version: input.version,
      fingerprint: successorFingerprint,
      recordedAt,
    }),
  };
  problem.status = "SUPERSEDED";
  remember(store, "PROBLEM", problem.optimizationProblemId, "SUPERSEDED", problem.version, problem.fingerprint, successor.optimizationProblemId);
  store.problems.push(successor);
  remember(store, "PROBLEM", successor.optimizationProblemId, "CREATED", successor.version, successor.fingerprint, problem.optimizationProblemId);
  emit(store, "OPTIMIZATION_PROBLEM_FOUNDATION_CREATED", successor.optimizationProblemId);
  return { variableSet, problem: successor };
}

export function inspectVariableSet(store: D1jR1Store, variableSetId: string): D1jR1VariableSet {
  return store.variableSets.find((row) => row.variableSetId === variableSetId) ?? fail("EMPTY_VARIABLE_SET");
}

export function supersedeOptimizationProblemFoundation(store: D1jR1Store, actor: D1jR1Actor, input: D1jR1ProblemInput & { predecessorProblemId: string }): D1jR1Problem {
  return registerBaselineDesignReference(store, actor, { ...input, optimizationProblemId: input.predecessorProblemId, successorProblemId: input.optimizationProblemId });
}

function markStale(store: D1jR1Store, kind: D1jR1History["subjectKind"], row: { status: D1jR1FoundationStatus; fingerprint: string; version?: string; sourceVersion?: string }, id: string): void {
  if (row.status === "SUPERSEDED" || row.status === "STALE") return;
  row.status = "STALE";
  remember(store, kind, id, "STALE", row.version ?? row.sourceVersion ?? "unversioned", row.fingerprint, null);
  if (kind === "PROBLEM") emit(store, "OPTIMIZATION_PROBLEM_FOUNDATION_STALE", id);
}

export function propagateFoundationStaleness(store: D1jR1Store): void {
  const before = store.history.length;
  for (const baseline of store.baselines) {
    const kind = baseline.sourceDomain === "D1F_STRUCTURAL_SYSTEM" ? "STRUCTURAL_SYSTEM" : "MEMBER";
    const source = store.catalog.identities.find((row) => row.kind === kind && row.id === baseline.sourceObjectId);
    if (!source || source.status !== "CURRENT" || source.contentFingerprint !== baseline.sourceFingerprint || source.version !== baseline.sourceVersion) {
      markStale(store, "BASELINE", baseline, baseline.baselineRefId);
    }
  }
  for (const variable of store.variables) {
    const source = store.catalog.domainSources.find((row) => row.domainSourceId === variable.domainSourceId);
    const target = store.catalog.identities.find((row) => row.id === variable.targetId);
    if (!source || source.status !== "CURRENT" || source.fingerprint !== variable.domainFingerprint || store.retiredRegistryVersions.includes(variable.parameterRegistryVersion) || !target || target.status !== "CURRENT") {
      markStale(store, "VARIABLE", variable, variable.variableId);
    }
  }
  for (const variableSet of store.variableSets) {
    if (variableSet.variableIds.some((variableId) => store.variables.find((row) => row.variableId === variableId)?.status === "STALE")) {
      markStale(store, "VARIABLE_SET", variableSet, variableSet.variableSetId);
    }
  }
  for (const problem of store.problems) {
    const baseline = store.baselines.find((row) => row.baselineRefId === problem.baselineRefId);
    const binding = store.catalog.bindings.find((row) => row.fingerprint === problem.bindingFingerprint && row.jurisdictionBindingRef === problem.jurisdictionBindingRef);
    const target = store.catalog.identities.find((row) => row.kind === "STRUCTURAL_SYSTEM" && row.id === problem.structuralSystemRef);
    const variableSet = problem.variableSetRef ? store.variableSets.find((row) => row.variableSetId === problem.variableSetRef) : null;
    const relatedVariables = store.variables.filter((row) => row.optimizationProblemId === problem.optimizationProblemId || row.optimizationProblemId === problem.predecessorId);
    if (!baseline || baseline.status === "STALE" || !binding || binding.status !== "CURRENT" || !target || target.status !== "CURRENT" || (variableSet && variableSet.status === "STALE") || relatedVariables.some((row) => row.status === "STALE")) {
      markStale(store, "PROBLEM", problem, problem.optimizationProblemId);
    }
  }
  if (store.history.length < before) fail("INVALIDATION_DELETES_HISTORY");
}

export function retireParameterRegistryVersion(store: D1jR1Store, version: string): void {
  if (!store.retiredRegistryVersions.includes(version)) store.retiredRegistryVersions.push(version);
  propagateFoundationStaleness(store);
}

export function evaluateOptimizationProblemFoundationStatus(store: D1jR1Store, problemId: string): { status: D1jR1FoundationStatus; optimizationReady: false; feasibilityReady: false; certificationReady: false } {
  const problem = inspectOptimizationProblem(store, problemId);
  return { status: problem.status, optimizationReady: false, feasibilityReady: false, certificationReady: false };
}

export function produceOptimizationProblemFoundationResult(store: D1jR1Store, problemId: string): D1jR1Result {
  const problem = inspectOptimizationProblem(store, problemId);
  const variables = store.variables.filter((row) => row.optimizationProblemId === problem.predecessorId || row.optimizationProblemId === problem.optimizationProblemId);
  const activeVariables = variables.filter((row) => row.status !== "SUPERSEDED");
  let completeness: D1jR1Completeness = "UNDETERMINED";
  if (problem.status === "STALE" || problem.status === "INVALID") completeness = problem.status;
  else if (!problem.baselineRefId || !problem.jurisdictionBindingRef) completeness = "INCOMPLETE";
  else if (!problem.variableSetRef) completeness = activeVariables.length > 0 ? "PARTIAL" : "INCOMPLETE";
  else completeness = "COMPLETE_FOR_R1_FOUNDATION_SCOPE";
  const blocking = problem.objectiveSetRef === null || problem.constraintSetRef === null ? ["OBJECTIVES_AND_CONSTRAINTS_UNBOUND"] : [];
  return {
    resultId: `result-${problem.optimizationProblemId}`,
    problemId: problem.optimizationProblemId,
    baselineRefId: problem.baselineRefId,
    variableIds: activeVariables.map((row) => row.variableId),
    variableSetId: problem.variableSetRef,
    foundationStatus: problem.status,
    scope: problem.scope,
    completeness,
    runtimeDiagnostics: ["R1_FOUNDATION_ONLY"],
    blockingRuntimeDiagnostics: blocking,
    warnings: [],
    optimizationReady: false,
    diagnosticEqualsEngineeringCheck: false,
    provenance: problem.provenance,
    fingerprint: problem.fingerprint,
  };
}
