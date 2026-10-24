/**
 * EOS-D1L-0 structural global certification gate architecture.
 * Contracts only. No eligibility evaluation and no certification decision.
 */

import { STRUCTURAL_OBJECT_KINDS } from "./structural-domain";

export const D1L_0_STATUS = "ARCHITECTURE_DEFINED" as const;
export const D1L_0_MATURITY = "STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE_DEFINED" as const;
export const D1L_0_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1L_0_STRUCTURAL_GLOBAL_CERTIFICATION_GATE_ARCHITECTURE.md" as const;
export const D1L_0_ARCHITECTURE_READY = true as const;
export const D1L_0_ELIGIBILITY_MODEL_READY = false as const;
export const D1L_0_CERTIFICATION_RUNTIME_READY = false as const;
export const D1L_0_CERTIFICATION_ELIGIBILITY_SATISFIED = false as const;
export const D1L_0_CERTIFICATION_AUTHORITY_READY = false as const;
export const D1L_0_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1L_0_D1A_IDENTITY_REUSE_REQUIRED = true as const;
export const D1L_0_STRUCTURAL_TARGET_KINDS = STRUCTURAL_OBJECT_KINDS;
export const D1L_0_CLAIM_TYPES = ["ANALYSIS_RESULT_CLAIM", "DESIGN_CHECK_CLAIM", "OPTIMIZATION_STUDY_EVIDENCE_CLAIM"] as const;
export const D1L_0_CLAIM_SCOPES = ["CHECK", "MEMBER", "SUBSYSTEM", "STRUCTURAL_SYSTEM", "PROJECT_CLAIM"] as const;
export const D1L_0_EVIDENCE_CATEGORIES = [
  "SOURCE_ENGINEERING_EVIDENCE",
  "VALIDATION_EVIDENCE",
  "ENGINEER_REVIEW_EVIDENCE",
  "CONFORMANCE_EVIDENCE",
  "SOLVER_QUALIFICATION_EVIDENCE",
  "CROSS_DISCIPLINE_EVIDENCE",
  "STANDARDS_JURISDICTION_EVIDENCE",
  "CERTIFICATION_AUTHORITY_EVIDENCE",
] as const;
export const D1L_0_MANIFEST_FIELDS = [
  "claimIdentity",
  "claimScope",
  "workspaceId",
  "projectId",
  "structuralTarget",
  "standardProfile",
  "standardEdition",
  "jurisdictionProfile",
  "jurisdictionProfileVersion",
  "designEvidence",
  "analysisEvidence",
  "validationEvidence",
  "engineerReviewEvidence",
  "conformanceEvidence",
  "solverQualificationEvidence",
  "crossDisciplineEvidence",
  "authorityEvidence",
  "provenance",
  "dependencyFingerprints",
  "manifestFingerprint",
] as const;
export const D1L_0_BLOCKER_CODES = [
  "MISSING_EVIDENCE",
  "STALE_EVIDENCE",
  "INVALID_EVIDENCE",
  "INSUFFICIENT_AUTHORITY",
  "PENDING_ENGINEER_REVIEW",
  "FAILED_ENGINEER_REVIEW",
  "MISSING_CONFORMANCE",
  "FAILED_CONFORMANCE",
  "UNQUALIFIED_SOLVER",
  "UNRESOLVED_D1K_INTERFACE",
  "STALE_D1K_INTERFACE",
  "INCOMPATIBLE_D1K_INTERFACE",
  "MISSING_JURISDICTION_PROFILE",
  "MISSING_STANDARDS_PROFILE",
  "UNSUPPORTED_CLAIM_TYPE",
  "UNRESOLVED_PARAMETER_SEMANTICS",
  "UNRESOLVED_RELEASE_CONDITION",
] as const;
export const D1L_0_BLOCKER_SEVERITIES = ["HARD_BLOCKER", "ADVISORY", "INFORMATIONAL", "DEFERRED_UNRELATED"] as const;
export const D1L_0_ELIGIBILITY_STATES = [
  "NOT_ASSESSED",
  "EVIDENCE_INCOMPLETE",
  "BLOCKED",
  "PENDING_REVIEW",
  "INELIGIBLE",
  "ELIGIBLE",
  "CERTIFICATION_DECISION_PENDING",
  "CERTIFIED",
  "CERTIFICATION_DENIED",
  "STALE",
] as const;
export const D1L_0_AUTHORITY_ROLES = [
  "EVIDENCE_PRODUCER",
  "ENGINEER_REVIEWER",
  "CONFORMANCE_AUTHORITY",
  "SOLVER_QUALIFICATION_AUTHORITY",
  "CERTIFICATION_AUTHORITY",
  "ADMINISTRATOR",
  "SYSTEM_DIAGNOSTIC",
  "AI_ASSISTANT",
] as const;
export const D1L_0_PROFILE_AXES = ["ENGINEERING_STANDARD", "JURISDICTION", "REGULATORY_PROFILE", "COMPANY_REQUIREMENT", "PROJECT_REQUIREMENT"] as const;
export const D1L_0_CONSEQUENCE_CLASS_NUMERIC_FACTORS_DEFINED = false as const;
export const D1L_0_CONSEQUENCE_PROFILE_SEAM =
  "No canonical consequence or reliability class exists. A future claim may cite a governed profile reference. This architecture does not invent class factors." as const;
export const D1L_0_EVIDENCE_COMPLETE_EQUALS_CERTIFIED = false as const;
export const D1L_0_ENGINEER_VALIDATED_EQUALS_CERTIFIED = false as const;
export const D1L_0_CONFORMANCE_PASS_EQUALS_CERTIFIED = false as const;
export const D1L_0_SOLVER_EXECUTED_EQUALS_SOLVER_CERTIFIED = false as const;
export const D1L_0_SOLVER_VALIDATED_EQUALS_SOLVER_CERTIFIED = false as const;
export const D1L_0_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED = false as const;
export const D1L_0_PARTIAL_CERTIFICATION_EQUALS_GLOBAL_CERTIFICATION = false as const;
export const D1L_0_D1J_COMPLETE_EQUALS_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_0_ENGINEERING_CERTIFICATION_EQUALS_PRODUCT_GA = false as const;
export const D1L_0_RELEASE_ELIGIBLE_EQUALS_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_0_D1G_CERTIFICATION_BLOCKER_PRESERVED = true as const;
export const D1L_0_D1G_LIVE_VALIDATION_BLOCKER = true as const;
export const D1L_0_D1G_ENGINEER_VALIDATION_BLOCKER = true as const;
export const D1L_0_D1G_CONFORMANCE_BLOCKER = true as const;
export const D1L_0_D1G_CERTIFIED_SOLVER_BLOCKER = true as const;
export const D1L_0_C10_DEBT_CLASSIFICATION =
  "Nonblocking to architecture. Blocking to a concrete design-check claim that depends on C10. C10 review is not closed." as const;
export const D1L_0_D1F_DEBT_CLASSIFICATION =
  "Nonblocking to architecture. Blocking to a system-scope claim that depends on system-orchestrator review. That review is not closed." as const;
export const D1L_0_D1H_DEBT_CLASSIFICATION =
  "Nonblocking to architecture. Blocking to a claim that uses inspection-condition evidence. D1H engineer validation remains pending." as const;
export const D1L_0_D1I_DEBT_CLASSIFICATION =
  "Nonblocking to architecture. Blocking to a claim that uses twin or D1I conformance evidence. Those validations remain pending." as const;
export const D1L_0_D1J_DEBT_CLASSIFICATION =
  "Nonblocking to architecture. Blocking to an optimization-study claim. Concrete parameter semantics remain NOT_AVAILABLE and block only a claim that uses them." as const;
export const D1L_0_GA_SECURITY_DEBT_CLASSIFICATION =
  "Blocks general availability only. Does not block this architecture and is not an engineering-certification blocker." as const;
export const D1L_0_D1K_EVIDENCE_HANDOFF_REUSES_D1K = true as const;
export const D1L_0_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1L_0_STALE_D1K_EVIDENCE_CAN_SUPPORT_CURRENT_CERTIFICATION = false as const;
export const D1L_0_UNRESOLVED_D1K_CONFLICT_CAN_BE_IGNORED = false as const;
export const D1L_0_D1K_DISPOSITION_EQUALS_CERTIFICATION_APPROVAL = false as const;
export const D1L_0_FLOATING_LATEST_EVIDENCE_ALLOWED = false as const;
export const D1L_0_STANDARD_VERSION_PINNING_REQUIRED = true as const;
export const D1L_0_JURISDICTION_PROFILE_VERSION_PINNING_REQUIRED = true as const;
export const D1L_0_CERTIFICATION_AUTO_CARRIED_TO_CHANGED_EVIDENCE = false as const;
export const D1L_0_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1L_0_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1L_0_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1L_0_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1L_0_ADMIN_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_0_ADMIN_IMPLIES_CERTIFICATION_AUTHORITY = false as const;
export const D1L_0_AI_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1L_0_AI_CAN_MARK_CERTIFICATION_ELIGIBLE = false as const;
export const D1L_0_AI_CAN_MARK_CERTIFIED = false as const;
export const D1L_0_AI_CAN_GRANT_CERTIFICATION = false as const;
export const D1L_0_AI_CAN_WAIVE_CERTIFICATION_BLOCKER = false as const;
export const D1L_0_AI_CAN_CLEAR_HARD_BLOCKER = false as const;
export const D1L_0_CERTIFICATION_CONFIDENCE_SCORE_IMPLEMENTED = false as const;
export const D1L_0_CALLER_CAN_DISABLE_MANDATORY_REQUIREMENT = false as const;
export const D1L_0_CERTIFICATION_CLAIM_RUNTIME_COUNT = 0 as const;
export const D1L_0_CERTIFICATION_ELIGIBILITY_RUNTIME_COUNT = 0 as const;
export const D1L_0_CERTIFICATION_DECISION_RUNTIME_COUNT = 0 as const;
export const D1L_0_CERTIFICATION_ISSUANCE_RUNTIME_COUNT = 0 as const;
export const D1L_0_CERTIFICATION_REVOCATION_RUNTIME_COUNT = 0 as const;
export const D1L_0_NEW_SOLVER_RUNTIME_COUNT = 0 as const;
export const D1L_0_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1L_0_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1L_0_D9_RUNTIME_COUNT = 0 as const;
export const D1L_0_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1L_0_D9_INTELLIGENCE_IMPLEMENTED = false as const;
export const D1L_0_D1M_ABSORBED = false as const;
export const D1L_0_D1N_ABSORBED = false as const;
export const D1L_0_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1L_0_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = true as const;
export const D1L_0_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1L_0_PROVISIONAL_DECOMPOSITION =
  "R1 certification claim and exact evidence manifest. R2 eligibility blocker evaluation. R3 standards and jurisdiction profile governance. R4 certification authority and decision record. R5 evidence invalidation and supersession. R6 closeout. This sequence is the canonical next decomposition and is not implemented here." as const;
export const D1L_R1_CANONICAL_PHASE = "EOS-D1L-R1-CERTIFICATION-CLAIM-EVIDENCE-MANIFEST-FOUNDATION" as const;
export const D1L_R1_PHASE_TYPE = "STRUCTURAL_CERTIFICATION_CLAIM_EVIDENCE_MANIFEST_FOUNDATION" as const;
export const D1L_R1_CANONICAL_SCOPE =
  "Record a scoped certification claim and an exact evidence manifest that pins revisions, standards, jurisdiction, and dependency fingerprints. Do not evaluate eligibility, issue certification, grant conformance, certify a solver, or start D2 through D9." as const;
