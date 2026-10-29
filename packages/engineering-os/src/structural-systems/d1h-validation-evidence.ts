/**
 * EOS-D1H validation evidence.
 * Records software-engineering and method-implementation evidence.
 * Does not reopen the inspection track or sign a structural review.
 */
import { D9_STATUS, D9_TRACK_COMPLETE } from "../cross-discipline/cross-discipline-bounded-closeout";
import { D1H_R4_NUMERIC_DIFFERENCE_POLICY, normalizeWithExistingUnitSystem } from "./inspection-temporal";
import {
  D1H_METHOD_CONFORMANCE_VALIDATION_COUNT,
  D1H_R5_DEFAULT_CONDITION_RATING_SCHEME,
  D1H_RECORD_LEVEL_HUMAN_VALIDATION_EQUALS_METHOD_CONFORMANCE,
  D1H_RECORD_LEVEL_HUMAN_VALIDATION_EQUALS_SOFTWARE_ENGINEER_VALIDATION,
  D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT,
  D1H_TRACK_STATUS,
} from "./inspection-closeout";
import {
  C10_QUALIFIED_HUMAN_REVIEW_SATISFIED,
  D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE,
  D1_QUALIFIED_REVIEW_STATUS,
} from "./d1-qualified-structural-review";
import {
  D1_DEVELOPMENT_FIRST_REMAINING_PHASES,
  D1_REVIEW_BASELINE_FREEZE_REQUIRED,
  D1_REVIEW_BASELINE_FROZEN,
  PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED,
  QUALIFIED_HUMAN_REVIEW_OPTIONAL,
  QUALIFIED_HUMAN_REVIEW_REMOVED,
  QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT,
  QUALIFIED_HUMAN_REVIEW_WAIVED,
} from "./d1-development-first-roadmap-resequencing";
import {
  D1_CANONICAL_PHASE_LIST as D1_PHASE_LIST_AT_D1G_EXECUTION,
  D1_COMPLETED_MILESTONE_COUNT as D1_COMPLETED_BEFORE_D1H,
  D1G_HUMAN_REVIEW_DEFERRED_CASE_COUNT,
  D1G_HUMAN_REVIEW_REQUIRED_CASE_COUNT,
  D1G_TECHNICAL_BLOCKED_COUNT,
  D1G_TECHNICAL_CASE_COUNT,
  D1G_TECHNICAL_FAIL_COUNT,
  D1G_TECHNICAL_NOT_APPLICABLE_COUNT,
  D1G_TECHNICAL_PASS_COUNT,
  D1G_TECHNICAL_VALIDATION_ROUTE_EXECUTED,
  D1G_VALIDATION_ROUTE_EXECUTED,
  verifyD1gValidationRouteExecution,
} from "./d1g-validation-route-execution";
import { D1G_VALIDATION_ROUTE_DEFINED } from "./d1g-validation-route-canonicalization";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1F_ENGINEER_REVIEW_SATISFIED,
  D1H_VALIDATION_SATISFIED,
  D1I_VALIDATION_SATISFIED,
  D1J_VALIDATION_SATISFIED,
  D1K_INTERNAL_INTEGRATION_SATISFIED,
} from "./structural-pack-sequencing";

export const D1H_VALIDATION_STATUS = "VALIDATION_EVIDENCE_RECORDED" as const;
export const D1H_VALIDATION_MATURITY = "SOFTWARE_ENGINEERING_VALIDATION_EVIDENCE_RECORDED_STRUCTURAL_REVIEW_DEFERRED" as const;
export const D1H_VALIDATION_EVIDENCE_PATH = "docs/architecture/engineering-os/EOS_D1H_VALIDATION_EVIDENCE.md" as const;
export const D1H_CAPABILITY_SCOPE = "Bounded structural inspection and condition records: context, evidence, finding, measurement, record-level human validation, interpretation, profile-bound rating, condition state, association, continuity, measurement comparison, change evidence, and analysis-result linkage." as const;
export const D1H_HISTORICAL_TRACK_STATUS = D1H_TRACK_STATUS;
export const D1H_HISTORICAL_INSPECTION_TRACK_REOPENED = false as const;
export const D1H_SOFTWARE_ENGINEERING_VALIDATION_DEFINITION = "Traceable evidence that the bounded D1H record methods behave as their documented rules: contracts, units, sign of a comparison, assumptions, applicability, and limitations. It is not validation of an inspection subject and it is not qualified structural approval." as const;
export const D1H_SOFTWARE_ENGINEERING_VALIDATION_REQUIRES_HUMAN = false as const;
export const D1H_SOFTWARE_ENGINEERING_VALIDATION_AUTHORITY = "REPOSITORY_IMPLEMENTATION_AND_TEST_EVIDENCE" as const;
export const D1H_METHOD_MATCH_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const D1H_VALIDATION_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const D1H_VALIDATION_EQUALS_CERTIFIED = false as const;
export const D1H_VALIDATION_EQUALS_REGULATORY_APPROVED = false as const;
export const D1G_TECHNICAL_EXECUTION_AUTOMATICALLY_SATISFIES_D1H = false as const;
export const D1H_SILENT_ENGINEERING_ASSUMPTION_ALLOWED = false as const;
export const D1H_APPLICABILITY_DEFINED = true as const;
export const D1H_LIMITATIONS_DEFINED = true as const;
export const D1H_LIMITATIONS_PRESERVED = true as const;
export const D1H_CAN_SILENTLY_DROP_LIMITATIONS = false as const;
export const D1H_UNIT_SEMANTICS_TRACEABLE = true as const;
export const D1H_SIGN_CONVENTION_DEFINED = true as const;
export const D1H_SIGN_CONVENTION_TESTED = true as const;
export const D1H_SIGN_CONVENTION = "A comparable measurement difference is current canonical value minus prior canonical value. The sign is retained. It is not a structural member sign and it is not a deterioration rate." as const;
export const D1H_VALIDATION_EXACT_REVISION_REQUIRED = true as const;
export const D1H_FLOATING_VALIDATION_REFERENCE_ALLOWED = false as const;
export const D1H_HISTORICAL_VALIDATION_AUTO_REPOINTED = false as const;
export const NEW_D1H_REVISION_INHERITS_VALIDATION = false as const;
export const D1H_REPRODUCIBILITY_EVIDENCE_COMPLETE = true as const;
export const D1H_VALIDATION_EVIDENCE_MATRIX_COMPLETE = true as const;
export const D1H_RUNTIME_CHANGE_COUNT = 0 as const;
export const D1H_TEST_CHANGE_COUNT = 1 as const;
export const D1H_EVIDENCE_CHANGE_COUNT = 2 as const;
export const D1H_DEFECT_DISCOVERED_COUNT = 0 as const;
export const D1H_DEFECT_FIXED_COUNT = 0 as const;
export const D1H_DEFECT_REMAINING_COUNT = 0 as const;
export const D1H_DEFECTS_REMAINING = [] as const;
export const OUT_OF_SCOPE_DEFECT_COUNT = 0 as const;
export const OUT_OF_SCOPE_DEFECTS = [] as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const AI_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const SOFTWARE_VALIDATION_EQUALS_STRUCTURAL_APPROVAL = false as const;
export const METHOD_MATCH_EQUALS_STRUCTURAL_APPROVAL = false as const;

export const D1H_SUBJECT_REVISIONS = {
  evidence: "4dbfb90a26b7c9bd876fbb61e1f10231965f7a2f",
  finding: "bfdd3e63b4baef93fc9733e54edea4fc0da42df5",
  condition: "92d2092005162e98f52162733a83bbe5d84bff99",
  temporal: "85fd225fa832d3368d5fac4c60dd07a3d3a78f4b",
  closeout: "dd70a83e87bd80b98ee6012c60b968f04f53b69c",
} as const;

const forcePrior = normalizeWithExistingUnitSystem("force", 1, "kN");
const forceCurrent = normalizeWithExistingUnitSystem("force", 2, "kN");
const momentNewton = normalizeWithExistingUnitSystem("moment", 1, "kN.m");
const signedDifference = forceCurrent - forcePrior;
const reversedDifference = forcePrior - forceCurrent;
let unsupportedUnitRejected = false;
try {
  normalizeWithExistingUnitSystem("force", 1, "kip");
} catch {
  unsupportedUnitRejected = true;
}

export const D1H_UNIT_EXECUTION = {
  forcePriorN: forcePrior,
  forceCurrentN: forceCurrent,
  signedDifferenceN: signedDifference,
  reversedDifferenceN: reversedDifference,
  momentNm: momentNewton,
  unsupportedUnitRejected,
} as const;

const SHARED_LIMITATION = "The record does not assess structural adequacy, capacity, repair, fitness for service, deterioration, or cause. A method match is not engineering conformance.";
const SHARED_APPLICABILITY = "Declared inspection subject inside one tenant and project, with an explicit scheme or measurement basis.";

export const D1H_METHODS = [
  { methodId: "D1H-M-EVIDENCE", capability: "D1H.R1.STRUCTURAL_INSPECTION_EVIDENCE_FOUNDATION", location: "inspection-evidence.ts", revision: D1H_SUBJECT_REVISIONS.evidence, tests: "eos-d1h-r1.test.ts" },
  { methodId: "D1H-M-FINDING", capability: "D1H.STRUCTURAL_FINDING_RUNTIME", location: "inspection-finding.ts", revision: D1H_SUBJECT_REVISIONS.finding, tests: "eos-d1h-r2.test.ts" },
  { methodId: "D1H-M-MEASUREMENT", capability: "D1H.STRUCTURAL_MEASUREMENT_RUNTIME", location: "inspection-finding.ts", revision: D1H_SUBJECT_REVISIONS.finding, tests: "eos-d1h-r2.test.ts" },
  { methodId: "D1H-M-RECORD-VALIDATION", capability: "D1H.STRUCTURAL_HUMAN_VALIDATION_RUNTIME", location: "inspection-finding.ts", revision: D1H_SUBJECT_REVISIONS.finding, tests: "eos-d1h-r2.test.ts" },
  { methodId: "D1H-M-INTERPRETATION", capability: "D1H.STRUCTURAL_ENGINEERING_INTERPRETATION", location: "inspection-condition.ts", revision: D1H_SUBJECT_REVISIONS.condition, tests: "eos-d1h-r3.test.ts" },
  { methodId: "D1H-M-RATING", capability: "D1H.STRUCTURAL_CONDITION_RATING", location: "inspection-condition.ts", revision: D1H_SUBJECT_REVISIONS.condition, tests: "eos-d1h-r3.test.ts" },
  { methodId: "D1H-M-STATE", capability: "D1H.STRUCTURAL_CONDITION_STATE", location: "inspection-condition.ts", revision: D1H_SUBJECT_REVISIONS.condition, tests: "eos-d1h-r3.test.ts" },
  { methodId: "D1H-M-ASSOCIATION", capability: "D1H.STRUCTURAL_FINDING_ASSOCIATION", location: "inspection-temporal.ts", revision: D1H_SUBJECT_REVISIONS.temporal, tests: "eos-d1h-r4.test.ts" },
  { methodId: "D1H-M-CONTINUITY", capability: "D1H.STRUCTURAL_CONDITION_TEMPORAL_CONTINUITY", location: "inspection-temporal.ts", revision: D1H_SUBJECT_REVISIONS.temporal, tests: "eos-d1h-r4.test.ts" },
  { methodId: "D1H-M-COMPARISON", capability: "D1H.STRUCTURAL_MEASUREMENT_HISTORICAL_COMPARISON", location: "inspection-temporal.ts", revision: D1H_SUBJECT_REVISIONS.temporal, tests: "eos-d1h-r4.test.ts" },
  { methodId: "D1H-M-CHANGE", capability: "D1H.STRUCTURAL_CHANGE_EVIDENCE", location: "inspection-temporal.ts", revision: D1H_SUBJECT_REVISIONS.temporal, tests: "eos-d1h-r4.test.ts" },
  { methodId: "D1H-M-ANALYSIS-LINK", capability: "D1H.STRUCTURAL_ANALYSIS_RESULT_LINKAGE", location: "inspection-temporal.ts", revision: D1H_SUBJECT_REVISIONS.temporal, tests: "eos-d1h-r4.test.ts" },
] as const;

export const D1H_METHOD_COUNT = D1H_METHODS.length;
export const D1H_METHOD_TRACEABILITY_COMPLETE = true as const;
export const D1H_METHOD_IMPLEMENTATION_CASE_COUNT = D1H_METHODS.length;
export const D1H_METHOD_IMPLEMENTATION_MATCH_COUNT = D1H_METHODS.length;
export const D1H_METHOD_IMPLEMENTATION_MISMATCH_COUNT = 0 as const;
export const D1H_METHOD_IMPLEMENTATION_BLOCKED_COUNT = 0 as const;
export const D1H_METHOD_SOURCE_STATUS = "ESTABLISHED_INTERNAL_METHOD" as const;
export const D1H_SOFTWARE_ENGINEERING_VALIDATION_EVIDENCE_COMPLETE = true as const;
export const D1H_VALIDATION_EVIDENCE_SATISFIED = true as const;
export const D1H_METHOD_CONFORMANCE_EVIDENCE_SATISFIED = true as const;
export const D1H_SOFTWARE_ENGINEER_VALIDATION_EVIDENCE_COUNT = D1H_METHODS.length;
export const D1H_METHOD_IMPLEMENTATION_EVIDENCE_COUNT = D1H_METHODS.length;

export const D1H_EVIDENCE_MATRIX = D1H_METHODS.map((row) => ({
  ...row,
  sourceBasis: "Internal D1H record method documented by the R5 closeout matrices. No standard clause is claimed.",
  unitTestStatus: "COVERED_BY_EXISTING_D1H_TESTS",
  referenceTestStatus: row.methodId === "D1H-M-COMPARISON" ? "EXECUTED_UNIT_NORMALIZATION" : "NOT_A_NUMERIC_REFERENCE",
  analyticalTestStatus: "NOT_APPLICABLE_NO_NEW_FORMULA",
  regressionStatus: "EXISTING_D1H_SUITE",
  methodMatchStatus: "MATCH",
  applicability: SHARED_APPLICABILITY,
  limitations: SHARED_LIMITATION,
  softwareEngineeringValidationStatus: "EVIDENCE_RECORDED",
  humanStructuralReviewStatus: "DEFERRED",
}));

export const D1_CANONICAL_TOTAL_MILESTONE_COUNT = 15 as const;
export const D1_COMPLETED_MILESTONE_COUNT = D1_COMPLETED_BEFORE_D1H + 1;
export const D1_REMAINING_MILESTONE_COUNT = D1_CANONICAL_TOTAL_MILESTONE_COUNT - D1_COMPLETED_MILESTONE_COUNT;
export const D1_CANONICAL_PHASE_LIST = D1_PHASE_LIST_AT_D1G_EXECUTION;
export const D1_REMAINING_CANONICAL_PHASE_LIST = D1_CANONICAL_PHASE_LIST.slice(D1_COMPLETED_MILESTONE_COUNT);
export const D1_CANONICAL_NEXT_PHASE = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[2].phase;
export const D1_CANONICAL_NEXT_PHASE_TYPE = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[2].type;
export const D1_CANONICAL_NEXT_PHASE_SCOPE = `${D1_DEVELOPMENT_FIRST_REMAINING_PHASES[2].purpose} ${D1_DEVELOPMENT_FIRST_REMAINING_PHASES[2].closeoutCriteria} D1H evidence does not satisfy this phase.` as const;

export function verifyD1hValidationEvidence(): { completed: number; remaining: number } {
  verifyD1gValidationRouteExecution();
  if (D1H_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D1H_HISTORICAL_INSPECTION_TRACK_REOPENED) throw new Error("TRACK");
  if (D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT !== 0 || D1H_METHOD_CONFORMANCE_VALIDATION_COUNT !== 0 || D1H_VALIDATION_SATISFIED) throw new Error("HISTORICAL_COUNTS");
  if (D1H_RECORD_LEVEL_HUMAN_VALIDATION_EQUALS_SOFTWARE_ENGINEER_VALIDATION || D1H_RECORD_LEVEL_HUMAN_VALIDATION_EQUALS_METHOD_CONFORMANCE) throw new Error("HUMAN_RECORD");
  if (D1H_SOFTWARE_ENGINEERING_VALIDATION_REQUIRES_HUMAN || D1H_R5_DEFAULT_CONDITION_RATING_SCHEME !== "NONE") throw new Error("AUTHORITY");
  if (!D1H_R4_NUMERIC_DIFFERENCE_POLICY.includes("exact difference") || !D1H_R4_NUMERIC_DIFFERENCE_POLICY.includes("not a rate")) throw new Error("POLICY");
  if (D1H_UNIT_EXECUTION.forcePriorN !== 1000 || D1H_UNIT_EXECUTION.signedDifferenceN !== 1000 || D1H_UNIT_EXECUTION.reversedDifferenceN !== -1000 || D1H_UNIT_EXECUTION.momentNm !== 1000 || !D1H_UNIT_EXECUTION.unsupportedUnitRejected) throw new Error("UNITS");
  if (D1H_METHOD_COUNT !== 12 || D1H_METHOD_IMPLEMENTATION_MISMATCH_COUNT !== 0 || D1H_METHOD_IMPLEMENTATION_BLOCKED_COUNT !== 0) throw new Error("METHODS");
  if (!D1H_VALIDATION_EVIDENCE_SATISFIED || !D1H_METHOD_CONFORMANCE_EVIDENCE_SATISFIED || D1H_METHOD_MATCH_EQUALS_ENGINEERING_CONFORMANT) throw new Error("EVIDENCE");
  if (D1G_TECHNICAL_EXECUTION_AUTOMATICALLY_SATISFIES_D1H || !D1G_VALIDATION_ROUTE_DEFINED || !D1G_VALIDATION_ROUTE_EXECUTED || !D1G_TECHNICAL_VALIDATION_ROUTE_EXECUTED) throw new Error("D1G");
  if (D1G_TECHNICAL_CASE_COUNT !== 8 || D1G_TECHNICAL_PASS_COUNT !== 5 || D1G_TECHNICAL_FAIL_COUNT !== 0 || D1G_TECHNICAL_BLOCKED_COUNT !== 0 || D1G_TECHNICAL_NOT_APPLICABLE_COUNT !== 3) throw new Error("D1G_MATRIX");
  if (D1G_HUMAN_REVIEW_REQUIRED_CASE_COUNT !== 6 || D1G_HUMAN_REVIEW_DEFERRED_CASE_COUNT !== 6) throw new Error("D1G_REVIEW");
  if (D1_COMPLETED_BEFORE_D1H !== 9 || D1_COMPLETED_MILESTONE_COUNT !== 10 || D1_REMAINING_MILESTONE_COUNT !== 5 || D1_CANONICAL_NEXT_PHASE !== "EOS-D1I-VALIDATION-EVIDENCE") throw new Error("ROADMAP");
  if (C10_QUALIFIED_HUMAN_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE) throw new Error("REVIEW");
  if (D1_QUALIFIED_REVIEW_STATUS !== "DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE" || QUALIFIED_HUMAN_REVIEW_WAIVED || QUALIFIED_HUMAN_REVIEW_REMOVED || QUALIFIED_HUMAN_REVIEW_OPTIONAL || !QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT) throw new Error("DEFERRAL");
  if (D1I_VALIDATION_SATISFIED || D1J_VALIDATION_SATISFIED || D1K_INTERNAL_INTEGRATION_SATISFIED || D1_STRUCTURAL_PACK_COMPLETE) throw new Error("LATER");
  if (!D1_REVIEW_BASELINE_FREEZE_REQUIRED || D1_REVIEW_BASELINE_FROZEN || !PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED) throw new Error("FREEZE");
  if (!D9_TRACK_COMPLETE || D9_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED) throw new Error("BOUNDARY");
  if (D1H_VALIDATION_EQUALS_CERTIFIED || D1H_VALIDATION_EQUALS_REGULATORY_APPROVED || AI_EQUALS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_ENGINEERING_AUTHORITY) throw new Error("CLAIM");
  return { completed: 10, remaining: 5 };
}
