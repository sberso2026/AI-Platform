/**
 * EOS-D1G validation route canonicalization.
 * Defines the evidence contract. Does not execute it.
 */
import { C10_VALIDATION_LANE_STATUS, D1F_R3_ENGINEER_REVIEW_PENDING, D6_REOPENED, D7_REOPENED, D8_REOPENED } from "@rtb/types";
import { D9_STATUS, D9_TRACK_COMPLETE } from "../cross-discipline/cross-discipline-bounded-closeout";
import {
  D2_TRACK_COMPLETE,
  D3_TRACK_COMPLETE,
  D4_TRACK_COMPLETE,
  D5_TRACK_COMPLETE,
  D6_TRACK_COMPLETE,
  D7_TRACK_COMPLETE,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import { D1N_REOPENED as D1N_TRACK_REOPENED, D2_REOPENED, D3_REOPENED, D4_REOPENED, D5_REOPENED } from "../process/process-bounded-closeout";
import {
  D1_CANONICAL_PHASE_LIST as D1_PHASE_LIST_AT_DEBT_INSPECTION,
  D1_CANONICAL_TOTAL_MILESTONE_COUNT as D1_TOTAL_AT_DEBT_INSPECTION,
  D1_CLOSEOUT_TARGET as D1_CLOSEOUT_TARGET_AT_DEBT_INSPECTION,
  D1_COMPLETED_MILESTONE_COUNT as D1_COMPLETED_AT_DEBT_INSPECTION,
  D1_REMAINING_MILESTONE_COUNT as D1_REMAINING_AT_DEBT_INSPECTION,
  D1_REMAINING_PHASES,
} from "./d1-structural-debt-canonicalization";
import { D1K_R5_TRACK_COMPLETE } from "./interface-closeout";
import { D1L_R6_TRACK_COMPLETE } from "./certification-gate-closeout";
import { D1N_TRACK_COMPLETE } from "./orchestration-closeout";
import { D1G_CERTIFIED_SOLVER_STATUS, D1G_CONFORMANCE_VALIDATED, D1G_ENGINEER_VALIDATED, D1G_LIVE_VALIDATED, D1G_VALIDATION_ROUTE_PHASE } from "./roadmap-after-twin-closeout";
import {
  C10_QUALIFIED_REVIEW_SATISFIED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1F_ENGINEER_REVIEW_SATISFIED,
  D1G_CERTIFIED_SOLVER,
  D1G_VALIDATION_ROUTE_COMPLETED,
  D1G_VALIDATION_ROUTE_REMAINS_UNDEFINED,
  D1H_VALIDATION_SATISFIED,
  D1I_VALIDATION_SATISFIED,
  D1J_VALIDATION_SATISFIED,
  D1K_INTERNAL_INTEGRATION_SATISFIED,
  PROJECT_CERTIFICATION_ELIGIBILITY_REQUIRED_FOR_D1_PACK_COMPLETION,
} from "./structural-pack-sequencing";

export const D1G_ROUTE_STATUS = "COMPLETE" as const;
export const D1G_ROUTE_MATURITY = "VALIDATION_ROUTE_DEFINED_NOT_EXECUTED" as const;
export const D1G_ROUTE_CANONICALIZATION_PATH = "docs/architecture/engineering-os/EOS_D1G_VALIDATION_ROUTE_CANONICALIZATION.md" as const;
export const NEW_SUBSTANTIVE_RUNTIME_COUNT = 0 as const;
export const D1G_VALIDATION_ROUTE_DEFINED = true as const;
export const D1G_VALIDATION_ROUTE_EXECUTED = false as const;
export const D1G_VALIDATION_PURPOSE_DEFINED = true as const;
export const D1G_VALIDATION_SCOPE_DEFINED = true as const;
export const D1G_HISTORICAL_ROUTE_PHASE_PRESERVED = D1G_VALIDATION_ROUTE_PHASE;
export const D1G_DEFAULT_TOLERANCE_CREATED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D1_CURRENT_MATURITY = "STRUCTURAL_PACK_INCOMPLETE" as const;
export const D1_CLOSEOUT_TARGET = D1_CLOSEOUT_TARGET_AT_DEBT_INSPECTION;
export const D1K_REOPENED = false as const;
export const D1L_REOPENED = false as const;
export const D1N_REOPENED = false as const;
export const D9_REOPENED = false as const;

export const D1G_VALIDATION_PURPOSE = "D1G validation establishes that an external solver result was ingested into D1F inputs with governed units, signs, axes, identities, and fingerprints, for a declared applicability. It separates numerical comparison, method-implementation match, reproducibility, engineer review, applicability, and limitations. It does not solve a structure, certify a solver, or establish code conformance." as const;

export const D1G_VALIDATION_EVIDENCE_CLASSES = [
  "CLOSED_FORM_ANALYTICAL_BENCHMARK",
  "INDEPENDENT_CALCULATION",
  "THIRD_PARTY_REFERENCE_OUTPUT",
  "METHOD_IMPLEMENTATION_EVIDENCE",
  "REPRODUCIBILITY_RECORD",
  "QUALIFIED_STRUCTURAL_ENGINEER_REVIEW",
  "LIVE_PROVIDER_SESSION",
  "CONNECTOR_REGRESSION_REPLAY",
] as const;

export const D1G_REQUIRED_EVIDENCE_CLASSES = [
  "INDEPENDENT_REFERENCE_COMPARISON",
  "METHOD_IMPLEMENTATION_EVIDENCE",
  "REPRODUCIBILITY_RECORD",
  "QUALIFIED_STRUCTURAL_ENGINEER_REVIEW",
] as const;

export const D1G_OPTIONAL_EVIDENCE_CLASSES = [
  "LIVE_PROVIDER_SESSION",
  "SECOND_PROVIDER_COMPARISON",
  "CONNECTOR_REGRESSION_REPLAY",
] as const;

export const D1G_INDEPENDENT_REFERENCE_COMPARISON_ACCEPTED_FORMS = [
  "CLOSED_FORM_ANALYTICAL_BENCHMARK",
  "INDEPENDENT_CALCULATION",
  "THIRD_PARTY_REFERENCE_OUTPUT",
] as const;

export const D1G_ANALYTICAL_BENCHMARK_ROUTE_DEFINED = true as const;
export const D1G_ANALYTICAL_BENCHMARK_EXECUTED = false as const;
export const D1G_ANALYTICAL_BENCHMARK_CONTRACT = "A closed-form benchmark names its identity, governing solution, inputs, units, expected result, tolerance, applicability, limitations, provenance, and exact revision. The expected result is the analytical statement. The EOS result is the ingested output. This phase does not supply those numbers and does not treat an EOS synthetic fixture compared with itself as the benchmark." as const;

export const D1G_REFERENCE_COMPARISON_ROUTE_DEFINED = true as const;
export const D1G_REFERENCE_COMPARISON_CONTRACT = "A reference comparison names the provider or reference source, provider version, model identity, model revision, inputs, boundary conditions, material definition, load definition, analysis assumptions, units, reference outputs, EOS outputs, comparison method, difference, tolerance, result, limitations, and provenance. No commercial product is mandatory. SPACE GASS may be one provider because the read-only connector exists. It is not required." as const;

export const D1G_PROVIDER_BOUNDARY_DEFINED = true as const;
export const D1G_SELF_REFERENCE_EQUALS_INDEPENDENT_VALIDATION = false as const;
export const D1G_ACCEPTABLE_PROVIDERS = [
  "ANALYTICAL_REFERENCE",
  "INDEPENDENT_CALCULATION",
  "THIRD_PARTY_SOLVER_OR_REFERENCE",
  "QUALIFIED_STRUCTURAL_ENGINEER",
] as const;
export const D1G_REJECTED_AS_INDEPENDENT = [
  "EOS_OFFLINE_REPLAY_OF_THE_SAME_MAPPER",
  "EOS_OUTPUT_COMPARED_ONLY_WITH_EOS_OUTPUT",
] as const;

export const D1G_TOLERANCE_REQUIRED = true as const;
export const D1G_TOLERANCE_JUSTIFICATION_REQUIRED = true as const;
export const D1G_TOLERANCE_POLICY = "Every numeric comparison names the quantity, unit, absolute or relative rule, tolerance value, justification, numerical precision, applicability range, exceptions, and source. Identity, sign, axis, and fingerprint checks are exact. This phase creates no default tolerance value." as const;
export const RESULT_WITHIN_TOLERANCE_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const RESULT_WITHIN_TOLERANCE_EQUALS_CERTIFIED = false as const;
export const RESULT_WITHIN_TOLERANCE_EQUALS_APPROVED = false as const;
export const REFERENCE_SOLVER_MATCH_EQUALS_EOS_CERTIFICATION = false as const;
export const REFERENCE_SOLVER_MATCH_EQUALS_ENGINEERING_APPROVAL = false as const;
export const REFERENCE_SOLVER_MATCH_EQUALS_REGULATORY_APPROVAL = false as const;

export const D1G_APPLICABILITY_REQUIRED = true as const;
export const D1G_LIMITATIONS_REQUIRED = true as const;
export const D1G_CAN_SILENTLY_DROP_LIMITATIONS = false as const;
export const D1G_APPLICABILITY_FIELDS = [
  "ELEMENT_OR_RESULT_TYPE",
  "ANALYSIS_TYPE",
  "MATERIAL_MODEL",
  "GEOMETRY_RANGE",
  "LOAD_CONDITION",
  "BOUNDARY_CONDITION",
  "LINEAR_OR_NONLINEAR",
  "STATIC_OR_DYNAMIC",
  "UNITS",
  "PROVIDER_AND_MODEL_VERSION",
] as const;

export const D1G_VALIDATION_SCOPE_MATRIX = [
  { capability: "D1G.R1.EXTERNAL_SOLVER_ADAPTER_FOUNDATION", validationScope: "Provider records become D1F inputs for the declared fixture.", evidenceRequired: "INDEPENDENT_REFERENCE_COMPARISON", evidenceProvider: "ANALYTICAL_REFERENCE_OR_INDEPENDENT_CALCULATION_OR_THIRD_PARTY", toleranceRequired: true, applicability: "DECLARED_FIXTURE_ONLY", limitations: "Adapter translation is not structural analysis.", humanReviewRequired: true, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.R2.EXTERNAL_RESULT_PACKAGE_INGESTION", validationScope: "Package ingestion preserves units, identity, and provenance.", evidenceRequired: "METHOD_IMPLEMENTATION_EVIDENCE", evidenceProvider: "DOCUMENTED_PACKAGE_CONTRACT", toleranceRequired: false, applicability: "VERSION_1_PACKAGE", limitations: "Ingestion is not engineering acceptance.", humanReviewRequired: true, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.R4.SPACE_GASS_MEMBER_STATION_FORCE_IMPORT", validationScope: "Station forces keep native components, station distance, and node A as origin.", evidenceRequired: "INDEPENDENT_REFERENCE_COMPARISON", evidenceProvider: "PROVIDER_NEUTRAL_REFERENCE", toleranceRequired: true, applicability: "BOUNDED_FILTERED_PILOT", limitations: "Major and minor design axes are not implied.", humanReviewRequired: true, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.R4.SPACE_GASS_SUPPORT_REACTION_FORCE_IMPORT", validationScope: "Support reactions Fx, Fy, and Fz at the provider node.", evidenceRequired: "INDEPENDENT_REFERENCE_COMPARISON", evidenceProvider: "PROVIDER_NEUTRAL_REFERENCE", toleranceRequired: true, applicability: "FORCE_COMPONENTS_ONLY", limitations: "Reaction moments are outside this capability.", humanReviewRequired: true, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.R5.SPACE_GASS_CONNECTOR_CLOSEOUT", validationScope: "Same snapshot and mapping reproduce the same fingerprints.", evidenceRequired: "REPRODUCIBILITY_RECORD", evidenceProvider: "EOS_FINGERPRINT", toleranceRequired: false, applicability: "EXACT_REVISION", limitations: "Offline replay is not independent validation and is not live connectivity.", humanReviewRequired: true, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.LIVE_CONNECTIVITY", validationScope: "A governed live read of an exact provider job.", evidenceRequired: "LIVE_PROVIDER_SESSION", evidenceProvider: "EXTERNAL_PROVIDER", toleranceRequired: true, applicability: "ONE_DECLARED_JOB", limitations: "Optional for pack route completion. Required only for the live-validation flag.", humanReviewRequired: true, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.R4.SPACE_GASS_REACTION_MOMENT_IMPORT", validationScope: "OUT_OF_SCOPE", evidenceRequired: "NONE", evidenceProvider: "NONE", toleranceRequired: false, applicability: "NOT_IMPLEMENTED", limitations: "Reaction moments are not imported.", humanReviewRequired: false, executionStatus: "NOT_EXECUTED" },
  { capability: "D1G.R4.SPACE_GASS_SOLVER_EXECUTION", validationScope: "OUT_OF_SCOPE", evidenceRequired: "NONE", evidenceProvider: "NONE", toleranceRequired: false, applicability: "NOT_IMPLEMENTED", limitations: "The connector does not run the solver.", humanReviewRequired: false, executionStatus: "NOT_EXECUTED" },
] as const;

export const D1G_VALIDATION_SCOPE_MATRIX_DEFINED = true as const;
export const D1G_LIVE_VALIDATION_ROUTE_DEFINED = true as const;
export const D1G_LIVE_VALIDATION_EXECUTED = false as const;
export const D1G_LIVE_VALIDATION_UNBLOCK_RULE = "A live-validation record binds one provider, provider version, model revision, governed read, comparison, tolerance, applicability, and limitations. Absence of that record leaves D1G_LIVE_VALIDATED false. It does not by itself fail the pack route when the mandatory independent comparison is present." as const;
export const D1G_ENGINEER_VALIDATION_ROUTE_DEFINED = true as const;
export const D1G_ENGINEER_VALIDATION_SATISFIED = false as const;
export const D1G_ENGINEER_VALIDATION_RULE = "A qualified structural engineer is named, with authority, exact subject revision, review scope limited to the D1G evidence, an accepted or rejected outcome, and retained limitations. C10 and D1F reviews do not satisfy this review." as const;
export const D1G_CONFORMANCE_VALIDATION_ROUTE_DEFINED = true as const;
export const D1G_CONFORMANCE_VALIDATION_SATISFIED = false as const;
export const D1G_CONFORMANCE_VALIDATION_MEANING = "Bounded acceptance that the ingested result matches the documented mapping and stated applicability. It is not code conformance, regulatory approval, or certification." as const;
export const IMPLEMENTATION_MATCHES_DOCUMENTED_METHOD_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const STANDARD_SELECTED_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const VALIDATION_PASS_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const METHOD_MATCH_EQUALS_CONFORMANCE = false as const;

export const D1G_VALIDATION_RECORD_FIELDS = [
  "validationEvidenceId",
  "d1gCapability",
  "subjectRevision",
  "evidenceType",
  "evidenceProvider",
  "providerVersion",
  "inputModelRevision",
  "referenceResult",
  "eosResult",
  "units",
  "comparisonRule",
  "tolerance",
  "toleranceBasis",
  "result",
  "applicability",
  "limitations",
  "sourceBasis",
  "provenance",
  "reviewer",
  "reviewAuthority",
  "reviewStatus",
  "currentness",
  "lineage",
  "fingerprint",
] as const;
export const D1G_VALIDATION_RECORD_SEMANTICS_DEFINED = true as const;
export const D1G_VALIDATION_EXACT_REVISION_REQUIRED = true as const;
export const D1G_VALIDATION_FLOATING_REFERENCE_ALLOWED = false as const;
export const D1G_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const NEW_D1G_REVISION_INHERITS_VALIDATION = false as const;
export const NEW_D1G_REVISION_INHERITS_ENGINEER_REVIEW = false as const;
export const NEW_D1G_REVISION_INHERITS_CONFORMANCE = false as const;
export const AI_EQUALS_STRUCTURAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_STRUCTURAL_ENGINEERING_AUTHORITY = false as const;

export const D1G_EXECUTION_PASS_RULE = "PASS requires one independent reference form, method-implementation evidence, a reproducibility record, and a qualified structural engineer review, each bound to the exact revision, with justified tolerances on numeric comparisons, applicability, and limitations. PASS does not certify the solver or complete the structural pack." as const;
export const D1G_EXECUTION_FAIL_RULE = "FAIL when a numeric comparison is outside its justified tolerance, a mandatory field is missing, self-reference is offered as independent evidence, a limitation is dropped, the revision does not match, or an AI or admin identity is recorded as the structural engineer." as const;
export const D1G_EXECUTION_BLOCKED_RULE = "BLOCKED when the independent reference, the tolerance basis, or the qualified structural engineer is not available. Current execution status is NOT_EXECUTED." as const;
export const D1G_EXECUTION_STATUS = "NOT_EXECUTED" as const;

/** Snapshot at route canonicalization. The live remaining order is the development-first resequencing module. */
export const D1_CANONICAL_PHASE_LIST = D1_PHASE_LIST_AT_DEBT_INSPECTION;
export const D1_CANONICAL_TOTAL_MILESTONE_COUNT = D1_TOTAL_AT_DEBT_INSPECTION;
export const D1_COMPLETED_MILESTONE_COUNT = D1_COMPLETED_AT_DEBT_INSPECTION + 1;
export const D1_REMAINING_MILESTONE_COUNT = D1_REMAINING_AT_DEBT_INSPECTION - 1;
export const D1_CANONICAL_NEXT_PHASE = D1_REMAINING_PHASES[1].phase;
export const D1_CANONICAL_NEXT_PHASE_TYPE = D1_REMAINING_PHASES[1].type;
export const D1_CANONICAL_NEXT_PHASE_SCOPE = `${D1_REMAINING_PHASES[1].purpose} ${D1_REMAINING_PHASES[1].closeoutCriteria}` as const;
export const D1_READY_FOR_NEXT_PHASE = true as const;
export const D1G_ROUTE_BLOCKER = "NONE" as const;

export function verifyD1gValidationRoute(): { completed: number; remaining: number; total: number } {
  if (D1_TOTAL_AT_DEBT_INSPECTION !== 15 || D1_COMPLETED_AT_DEBT_INSPECTION !== 7 || D1_REMAINING_AT_DEBT_INSPECTION !== 8) throw new Error("D1_STARTING_DENOMINATOR");
  if (D1_CANONICAL_TOTAL_MILESTONE_COUNT !== 15 || D1_COMPLETED_MILESTONE_COUNT !== 8 || D1_REMAINING_MILESTONE_COUNT !== 7) throw new Error("D1_UPDATED_DENOMINATOR");
  if (D1_CANONICAL_PHASE_LIST.length !== 15 || D1_PHASE_LIST_AT_DEBT_INSPECTION[7] !== "EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION") throw new Error("D1_PHASE_LIST");
  if (D1_REMAINING_PHASES[0].phase !== "EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION" || D1_CANONICAL_NEXT_PHASE !== "EOS-D1-QUALIFIED-STRUCTURAL-REVIEW") throw new Error("D1_NEXT_PHASE");
  if (D1G_VALIDATION_ROUTE_PHASE !== "NOT_DEFINED" || D1G_VALIDATION_ROUTE_REMAINS_UNDEFINED !== true || D1G_VALIDATION_ROUTE_COMPLETED !== false) throw new Error("D1G_HISTORICAL_ROUTE");
  if (!D1G_VALIDATION_ROUTE_DEFINED || D1G_VALIDATION_ROUTE_EXECUTED || D1G_EXECUTION_STATUS !== "NOT_EXECUTED") throw new Error("D1G_EXECUTION_BOUNDARY");
  if (D1G_SELF_REFERENCE_EQUALS_INDEPENDENT_VALIDATION || D1G_DEFAULT_TOLERANCE_CREATED || !D1G_TOLERANCE_REQUIRED || !D1G_TOLERANCE_JUSTIFICATION_REQUIRED) throw new Error("D1G_TOLERANCE_BOUNDARY");
  if (D1G_VALIDATION_SCOPE_MATRIX.some((row) => row.executionStatus !== "NOT_EXECUTED")) throw new Error("D1G_MATRIX_EXECUTED");
  if (D1G_LIVE_VALIDATED || D1G_ENGINEER_VALIDATED || D1G_CONFORMANCE_VALIDATED || D1G_CERTIFIED_SOLVER_STATUS !== "NOT_CERTIFIED" || D1G_CERTIFIED_SOLVER) throw new Error("D1G_PROMOTION");
  if (C10_QUALIFIED_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED || C10_VALIDATION_LANE_STATUS !== "PENDING_QUALIFIED_HUMAN_REVIEW" || D1F_R3_ENGINEER_REVIEW_PENDING !== true) throw new Error("REVIEW_PROMOTION");
  if (D1H_VALIDATION_SATISFIED || D1I_VALIDATION_SATISFIED || D1J_VALIDATION_SATISFIED || D1K_INTERNAL_INTEGRATION_SATISFIED) throw new Error("LATER_PHASE_PROMOTION");
  if (D1_STRUCTURAL_PACK_COMPLETE || D1_CLOSEOUT_TARGET !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || PROJECT_CERTIFICATION_ELIGIBILITY_REQUIRED_FOR_D1_PACK_COMPLETION) throw new Error("D1_PACK_BOUNDARY");
  if (!D1K_R5_TRACK_COMPLETE || D1K_REOPENED || !D1L_R6_TRACK_COMPLETE || D1L_REOPENED || !D1N_TRACK_COMPLETE || D1N_TRACK_REOPENED || D1N_REOPENED) throw new Error("D1_CLOSED_TRACK");
  if (!D2_TRACK_COMPLETE || D2_REOPENED || !D3_TRACK_COMPLETE || D3_REOPENED || !D4_TRACK_COMPLETE || D4_REOPENED || !D5_TRACK_COMPLETE || D5_REOPENED || !D6_TRACK_COMPLETE || D6_REOPENED || !D7_TRACK_COMPLETE || D7_REOPENED || !D8_TRACK_COMPLETE || D8_REOPENED || !D9_TRACK_COMPLETE || D9_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D9_REOPENED) throw new Error("DISCIPLINE_REOPEN");
  if (D1G_VALIDATION_FLOATING_REFERENCE_ALLOWED || D1G_HISTORICAL_REFERENCE_AUTO_REPOINTED || NEW_D1G_REVISION_INHERITS_VALIDATION || AI_EQUALS_STRUCTURAL_ENGINEERING_AUTHORITY || ADMIN_EQUALS_STRUCTURAL_ENGINEERING_AUTHORITY) throw new Error("AUTHORITY_OR_REVISION");
  if (NEW_SUBSTANTIVE_RUNTIME_COUNT !== 0 || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED || EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY) throw new Error("INSPECTION_BOUNDARY");
  const requiredCovered = D1G_REQUIRED_EVIDENCE_CLASSES.every((name) => name === "INDEPENDENT_REFERENCE_COMPARISON" || D1G_VALIDATION_EVIDENCE_CLASSES.some((item) => item === name));
  if (!requiredCovered || D1G_INDEPENDENT_REFERENCE_COMPARISON_ACCEPTED_FORMS.length !== 3) throw new Error("EVIDENCE_CONTRACT");
  return { completed: D1_COMPLETED_MILESTONE_COUNT, remaining: D1_REMAINING_MILESTONE_COUNT, total: D1_CANONICAL_TOTAL_MILESTONE_COUNT };
}
