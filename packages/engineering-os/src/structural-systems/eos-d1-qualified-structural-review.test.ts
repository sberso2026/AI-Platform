import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildEuC10R3aReviewPacks } from "../structural-concrete/eu-c10/review-packs";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  AI_CAN_SATISFY_QUALIFIED_STRUCTURAL_REVIEW,
  AUTOMATED_TEST_CAN_REPLACE_STRUCTURAL_REVIEW,
  C10_EXISTING_HUMAN_REVIEW_EVIDENCE_STATUS,
  C10_QUALIFIED_HUMAN_REVIEW_SATISFIED,
  C10_REVIEW_PACKAGE_COMPLETE,
  C10_REVIEW_SUBJECT_COUNT,
  C10_REVIEW_SUBJECTS,
  CURSOR_CAN_SIGN_STRUCTURAL_REVIEW,
  D1_QUALIFIED_REVIEW_STATUS,
  D1_REVIEW_FINDING_FIELDS,
  D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE,
  D1F_EXISTING_HUMAN_REVIEW_EVIDENCE_STATUS,
  D1F_REVIEW_PACKAGE_COMPLETE,
  D1F_REVIEW_SUBJECT_COUNT,
  D1F_REVIEW_SUBJECTS,
  FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED,
  MANUAL_HUMAN_REVIEW_ACTION_COUNT,
  MANUAL_HUMAN_REVIEW_REQUIRED,
  QUALIFIED_REVIEW_EQUALS_CERTIFICATION,
  QUALIFIED_REVIEW_EQUALS_CONFORMANCE,
  QUALIFIED_REVIEW_EQUALS_REGULATORY_APPROVAL,
  READY_FOR_NEXT_PHASE,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_APPROVED,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  verifyQualifiedStructuralReview,
} from "./d1-qualified-structural-review";
import { D1_COMPLETED_MILESTONE_COUNT, D1_REMAINING_MILESTONE_COUNT } from "./d1g-validation-route-canonicalization";

const here = dirname(fileURLToPath(import.meta.url));

describe("EOS-D1 qualified structural review", () => {
  it("blocks the phase because no qualified human review is recorded", () => {
    expect(verifyQualifiedStructuralReview()).toEqual({ satisfied: false, completed: 8, remaining: 7 });
    expect(D1_QUALIFIED_REVIEW_STATUS).toBe("DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE");
    expect(D1_COMPLETED_MILESTONE_COUNT).toBe(8);
    expect(D1_REMAINING_MILESTONE_COUNT).toBe(7);
    expect(C10_QUALIFIED_HUMAN_REVIEW_SATISFIED).toBe(false);
    expect(D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE).toBe(false);
    expect(C10_EXISTING_HUMAN_REVIEW_EVIDENCE_STATUS).toBe("NOT_FOUND");
    expect(D1F_EXISTING_HUMAN_REVIEW_EVIDENCE_STATUS).toBe("NOT_FOUND");
    expect(C10_REVIEW_PACKAGE_COMPLETE && D1F_REVIEW_PACKAGE_COMPLETE).toBe(true);
    expect(MANUAL_HUMAN_REVIEW_REQUIRED).toBe(true);
    expect(MANUAL_HUMAN_REVIEW_ACTION_COUNT).toBe(2);
    expect(READY_FOR_NEXT_PHASE).toBe(false);
    expect(AI_CAN_SATISFY_QUALIFIED_STRUCTURAL_REVIEW || CURSOR_CAN_SIGN_STRUCTURAL_REVIEW || AUTOMATED_TEST_CAN_REPLACE_STRUCTURAL_REVIEW).toBe(false);
    expect(FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED || REVIEW_COMPLETED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(QUALIFIED_REVIEW_EQUALS_CONFORMANCE || QUALIFIED_REVIEW_EQUALS_CERTIFICATION || QUALIFIED_REVIEW_EQUALS_REGULATORY_APPROVAL).toBe(false);
    expect(D1_REVIEW_FINDING_FIELDS).toContain("exact_subject_revision");
    const sourceText = readFileSync(join(here, "d1-qualified-structural-review.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "d1-qualified-structural-review.ts"), sourceText)).toEqual([]);
  });

  it("binds the C10 package to the 16 prepared pack fingerprints and leaves them unsigned", () => {
    const packs = buildEuC10R3aReviewPacks();
    expect(packs).toHaveLength(C10_REVIEW_SUBJECT_COUNT);
    expect(D1F_REVIEW_SUBJECT_COUNT).toBe(1);
    expect(D1F_REVIEW_SUBJECTS[0]?.implementationRevision).toBe("1db11bfc7481dc01fabedb320d44d156f2dc4f37");
    for (const subject of C10_REVIEW_SUBJECTS) {
      const pack = packs.find((item) => item.packId === subject.packId);
      expect(pack?.capabilityId).toBe(subject.capabilityId);
      expect(pack?.packFingerprint).toBe(subject.packFingerprint);
      expect(pack?.reviewStatus).toBe(subject.reviewStatus);
      expect(pack?.reviewerRef).toBe("");
      expect(pack?.reviewSignature).toBe("");
      expect(pack?.engineerValidationState).toBe("PENDING_HUMAN_REVIEW");
    }
  }, 20000);
});
