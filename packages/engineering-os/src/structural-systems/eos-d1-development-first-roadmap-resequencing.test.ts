import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  AUTOMATED_DEVELOPMENT_TESTING_DEFERRED,
  AUTOMATED_TESTING_EQUALS_QUALIFIED_HUMAN_REVIEW,
  C10_SUPPLEMENTAL_INDEPENDENT_CALC_DEFERRED_TO_FINAL_REVIEW,
  C10_SUPPLEMENTAL_INDEPENDENT_CALC_PACK_IDS,
  C10_SUPPLEMENTAL_INDEPENDENT_CALC_SATISFIED,
  D1_CANONICAL_NEXT_PHASE,
  D1_CANONICAL_NEXT_PHASE_TYPE,
  D1_CANONICAL_PHASE_LIST,
  D1_DEVELOPMENT_FIRST_READY_FOR_NEXT_PHASE,
  D1_DEVELOPMENT_FIRST_REMAINING_PHASES,
  D1_QUALIFIED_STRUCTURAL_REVIEW_STATUS,
  D1_REMAINING_CANONICAL_PHASE_LIST,
  D1_RESEQUENCING_START_HEAD,
  D1_REVIEW_BASELINE_FREEZE_RECORD_FIELDS,
  D1_REVIEW_BASELINE_FREEZE_REQUIRED,
  D1_REVIEW_BASELINE_FROZEN,
  D1G_EXECUTION_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW,
  D1G_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW,
  D1H_EVIDENCE_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW,
  D1H_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW,
  D1I_EVIDENCE_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW,
  D1I_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW,
  D1J_EVIDENCE_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW,
  D1J_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW,
  D1K_INTEGRATION_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW,
  D1K_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW,
  DATABASE_SCHEMA_CHANGED,
  DEVELOPMENT_VALIDATION_FAILURE_CAN_TRIGGER_FIX,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  FIXED_REVISION_INHERITS_PREVIOUS_HUMAN_REVIEW,
  HUMAN_REVIEW_DEFERRED_EQUALS_HUMAN_REVIEW_WAIVED,
  MANDATORY_DEVELOPMENT_QUALITY_GATES,
  MATERIAL_CHANGE_AFTER_REVIEW_BASELINE_FREEZE_REQUIRES_REASSESSMENT,
  NEW_DEPENDENCY_ADDED,
  NEW_SUBSTANTIVE_RUNTIME_COUNT,
  PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED,
  QUALIFIED_HUMAN_REVIEW_OPTIONAL,
  QUALIFIED_HUMAN_REVIEW_REMOVED,
  QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT,
  QUALIFIED_HUMAN_REVIEW_WAIVED,
  RELEASE_GOVERNANCE_DEFERRED,
  SECURITY_REGRESSION_TESTING_DEFERRED,
  SILENT_ENGINEERING_CHANGE_ALLOWED,
  SOFTWARE_COMPLETE_EQUALS_ENGINEERING_VALIDATED,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D1G_EXECUTION_DURING_RESEQUENCING,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_HUMAN_REVIEW_BYPASS,
  VALIDATION_EVIDENCE_EQUALS_QUALIFIED_HUMAN_REVIEW,
  verifyDevelopmentFirstRoadmapResequencing,
} from "./d1-development-first-roadmap-resequencing";
import { D1_REMAINING_PHASES } from "./d1-structural-debt-canonicalization";
import {
  D1_CANONICAL_TOTAL_MILESTONE_COUNT,
  D1_COMPLETED_MILESTONE_COUNT,
  D1_REMAINING_MILESTONE_COUNT,
  D1G_VALIDATION_ROUTE_DEFINED,
  D1G_VALIDATION_ROUTE_EXECUTED,
} from "./d1g-validation-route-canonicalization";
import {
  C10_QUALIFIED_HUMAN_REVIEW_SATISFIED,
  C10_REVIEW_SUBJECT_COUNT,
  D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE,
  D1F_REVIEW_SUBJECTS,
} from "./d1-qualified-structural-review";
import { D1_STRUCTURAL_PACK_COMPLETE } from "./structural-pack-sequencing";

const here = dirname(fileURLToPath(import.meta.url));
const REVIEW = "EOS-D1-QUALIFIED-STRUCTURAL-REVIEW";

describe("EOS-D1 development-first roadmap resequencing", () => {
  it("D1_RESEQUENCING_GOVERNANCE_TESTS keeps the 15-phase denominator and records the start head", () => {
    expect(verifyDevelopmentFirstRoadmapResequencing()).toEqual({ completed: 8, remaining: 7, total: 15, reviewSatisfied: false });
    expect(D1_RESEQUENCING_START_HEAD).toBe("d2611bce78eac86ab9e951f2dd43d0408343467b");
    expect(D1_CANONICAL_TOTAL_MILESTONE_COUNT).toBe(15);
    expect(D1_COMPLETED_MILESTONE_COUNT).toBe(8);
    expect(D1_REMAINING_MILESTONE_COUNT).toBe(7);
    expect(D1_CANONICAL_PHASE_LIST).toHaveLength(15);
    expect(D1_REMAINING_CANONICAL_PHASE_LIST).toEqual([
      "EOS-D1G-VALIDATION-ROUTE-EXECUTION",
      "EOS-D1H-VALIDATION-EVIDENCE",
      "EOS-D1I-VALIDATION-EVIDENCE",
      "EOS-D1J-VALIDATION-EVIDENCE",
      "EOS-D1K-INTERNAL-INTEGRATION-EVIDENCE",
      REVIEW,
      "EOS-D1-STRUCTURAL-PACK-BOUNDED-CLOSEOUT",
    ]);
    expect(D1_REMAINING_PHASES[1]?.phase).toBe(REVIEW);
    expect(NEW_SUBSTANTIVE_RUNTIME_COUNT).toBe(0);
    expect(D1_DEVELOPMENT_FIRST_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1_CANONICAL_NEXT_PHASE).toBe("EOS-D1G-VALIDATION-ROUTE-EXECUTION");
    expect(D1_CANONICAL_NEXT_PHASE_TYPE).toBe("D1G_VALIDATION_ROUTE_EXECUTION");
  });

  it("D1_RESEQUENCING_DEPENDENCY_TESTS places development evidence ahead of final human review", () => {
    const execution = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[0];
    const evidence = D1_DEVELOPMENT_FIRST_REMAINING_PHASES.slice(1, 4);
    const integration = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[4];
    const review = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[5];
    const closeout = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[6];
    expect(execution?.dependencies).toEqual(["EOS-D1G-VALIDATION-ROUTE-CANONICALIZATION"]);
    expect(execution?.dependencies).not.toContain(REVIEW);
    for (const row of evidence) {
      expect(row.dependencies).toContain("EOS-D1G-VALIDATION-ROUTE-EXECUTION");
      expect(row.dependencies).not.toContain(REVIEW);
    }
    expect(integration?.dependencies).not.toContain(REVIEW);
    expect(review?.dependencies).toEqual([
      "EOS-D1G-VALIDATION-ROUTE-EXECUTION",
      "EOS-D1H-VALIDATION-EVIDENCE",
      "EOS-D1I-VALIDATION-EVIDENCE",
      "EOS-D1J-VALIDATION-EVIDENCE",
      "EOS-D1K-INTERNAL-INTEGRATION-EVIDENCE",
    ]);
    expect(closeout?.dependencies[0]).toBe(REVIEW);
    expect(D1G_EXECUTION_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW).toBe(true);
    expect(D1H_EVIDENCE_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW).toBe(true);
    expect(D1I_EVIDENCE_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW).toBe(true);
    expect(D1J_EVIDENCE_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW).toBe(true);
    expect(D1K_INTEGRATION_ALLOWED_BEFORE_FINAL_HUMAN_REVIEW).toBe(true);
  });

  it("D1_QUALIFIED_REVIEW_DEFERRAL_TESTS defers review without waiving it", () => {
    expect(D1_QUALIFIED_STRUCTURAL_REVIEW_STATUS).toBe("DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE");
    expect(C10_QUALIFIED_HUMAN_REVIEW_SATISFIED).toBe(false);
    expect(D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE).toBe(false);
    expect(QUALIFIED_HUMAN_REVIEW_WAIVED).toBe(false);
    expect(QUALIFIED_HUMAN_REVIEW_REMOVED).toBe(false);
    expect(QUALIFIED_HUMAN_REVIEW_OPTIONAL).toBe(false);
    expect(QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT).toBe(true);
    expect(HUMAN_REVIEW_DEFERRED_EQUALS_HUMAN_REVIEW_WAIVED).toBe(false);
  });

  it("D1_REVIEW_REQUIREMENT_PRESERVATION_TESTS keeps the review package and six supplemental calculations", () => {
    expect(C10_REVIEW_SUBJECT_COUNT).toBe(16);
    expect(D1F_REVIEW_SUBJECTS[0]?.implementationRevision).toBe("1db11bfc7481dc01fabedb320d44d156f2dc4f37");
    expect(D1F_REVIEW_SUBJECTS[0]?.contractRevision).toBe("27e902bdba212fcc79adf2c27a99b686f80d7192");
    expect(C10_SUPPLEMENTAL_INDEPENDENT_CALC_PACK_IDS).toEqual([
      "C10-R3A-PACK-C3-UNIAXIAL",
      "C10-R3A-PACK-C7-CRACK-WIDTH",
      "C10-R3A-PACK-C7-LONG-TERM",
      "C10-R3A-PACK-C8-COVER",
      "C10-R3A-PACK-C8-SPACING",
      "C10-R3A-PACK-C8-ANCHORAGE",
    ]);
    expect(C10_SUPPLEMENTAL_INDEPENDENT_CALC_DEFERRED_TO_FINAL_REVIEW).toBe(true);
    expect(C10_SUPPLEMENTAL_INDEPENDENT_CALC_SATISFIED).toBe(false);
    expect(D1G_VALIDATION_ROUTE_DEFINED).toBe(true);
    expect(D1G_VALIDATION_ROUTE_EXECUTED).toBe(false);
  });

  it("D1_BASELINE_FREEZE_GOVERNANCE_TESTS requires a freeze before final review and reassessment after a material change", () => {
    expect(D1_REVIEW_BASELINE_FREEZE_REQUIRED).toBe(true);
    expect(D1_REVIEW_BASELINE_FROZEN).toBe(false);
    expect(MATERIAL_CHANGE_AFTER_REVIEW_BASELINE_FREEZE_REQUIRES_REASSESSMENT).toBe(true);
    expect(D1_REVIEW_BASELINE_FREEZE_RECORD_FIELDS).toEqual([
      "c10PackFingerprints",
      "d1fImplementationRevision",
      "d1fContractRevision",
      "d1gValidationEvidenceRevisions",
      "d1hEvidenceRevisions",
      "d1iEvidenceRevisions",
      "d1jEvidenceRevisions",
      "d1kIntegrationEvidenceRevisions",
      "sourceCodeRevisions",
      "testArtefacts",
      "limitations",
    ]);
  });

  it("D1_DEVELOPMENT_TESTING_CONTINUITY_TESTS keeps automated gates mandatory", () => {
    expect(AUTOMATED_DEVELOPMENT_TESTING_DEFERRED).toBe(false);
    expect(SECURITY_REGRESSION_TESTING_DEFERRED).toBe(false);
    expect(RELEASE_GOVERNANCE_DEFERRED).toBe(false);
    expect(MANDATORY_DEVELOPMENT_QUALITY_GATES).toContain("UNIT");
    expect(MANDATORY_DEVELOPMENT_QUALITY_GATES).toContain("SECURITY_REGRESSION");
    expect(MANDATORY_DEVELOPMENT_QUALITY_GATES).toContain("RLS_REGRESSION");
    expect(MANDATORY_DEVELOPMENT_QUALITY_GATES).toContain("RELEASE_GOVERNANCE");
    expect(DEVELOPMENT_VALIDATION_FAILURE_CAN_TRIGGER_FIX).toBe(true);
    expect(FIXED_REVISION_INHERITS_PREVIOUS_HUMAN_REVIEW).toBe(false);
    expect(PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED).toBe(true);
    expect(SILENT_ENGINEERING_CHANGE_ALLOWED).toBe(false);
  });

  it("D1_NO_REVIEW_BYPASS_TESTS refuses to treat automated evidence as human review", () => {
    expect(D1G_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(D1H_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(D1I_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(D1J_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(D1K_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(AUTOMATED_TESTING_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(VALIDATION_EVIDENCE_EQUALS_QUALIFIED_HUMAN_REVIEW).toBe(false);
    expect(SOFTWARE_COMPLETE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(UNAUTHORIZED_HUMAN_REVIEW_BYPASS).toBe(false);
    expect(UNAUTHORIZED_D1G_EXECUTION_DURING_RESEQUENCING).toBe(false);
  });

  it("D1_NO_CLOSEOUT_PROMOTION_TESTS leaves the structural pack and general availability incomplete", () => {
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(EOS_ALL_DISCIPLINES_COMPLETE).toBe(false);
    expect(EOS_GA_READY).toBe(false);
    expect(UNAUTHORIZED_D1_PACK_COMPLETION).toBe(false);
    expect(UNAUTHORIZED_GA_PROMOTION).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
  });

  it("D1_BOUNDARY_MATRIX_TESTS stays inside governance metadata", () => {
    const sourceText = readFileSync(join(here, "d1-development-first-roadmap-resequencing.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "d1-development-first-roadmap-resequencing.ts"), sourceText)).toEqual([]);
  });
});
