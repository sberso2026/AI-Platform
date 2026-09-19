import { describe, expect, it } from "vitest";
import { runDetectors } from "./detectors";
import { GOLD_CASES, GOLD_OWNERSHIP } from "./eval/fixtures";
import { createReviewScope } from "./review-scope";
import { runDeterministicReview } from "./engine";
import { createReviewPackage } from "./review-package";
import { createReviewRun } from "./review-run";
import { ERA1_REVIEW_RULES } from "./rule";

describe("deterministic detectors", () => {
  it("emits expected detections for each gold case and no unexpected keys", () => {
    for (const gold of GOLD_CASES) {
      const detections = runDetectors({
        ownership: GOLD_OWNERSHIP,
        documents: gold.documents,
        scope: createReviewScope({
          reviewTypes: gold.reviewTypes,
          requiredFields: gold.requiredFields,
          expectedEvidenceKeys: gold.expectedEvidenceKeys,
        }),
      });
      const keys = detections.map((item) => item.detectionKey);
      expect(keys, gold.id).toEqual([...gold.expectedDetectionKeys]);
      for (const absent of gold.expectedAbsentKeys) {
        expect(keys, `${gold.id} absent ${absent}`).not.toContain(absent);
      }
    }
  });

  it("constructs verified findings through the staged engine", () => {
    const gold = GOLD_CASES[0];
    const pkg = createReviewPackage({
      id: "pkg-gold",
      tenantId: GOLD_OWNERSHIP.tenantId,
      workspaceId: GOLD_OWNERSHIP.workspaceId,
      projectId: GOLD_OWNERSHIP.projectId,
      name: "Gold package",
      createdBy: "fixture",
      documents: gold.documents.map((doc) => ({
        documentId: doc.documentId,
        revision: doc.revision,
        role: doc.role,
        documentNumber: doc.documentNumber,
        inclusion: doc.inclusion,
      })),
    });
    const run = createReviewRun({
      id: "run-gold",
      pkg,
      scope: createReviewScope({ reviewTypes: gold.reviewTypes }),
      rules: ERA1_REVIEW_RULES.filter((rule) => gold.reviewTypes.includes(rule.reviewType)),
    });
    const result = runDeterministicReview({ run, pkg, documents: gold.documents });
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.verificationState).toBe("evidence_verified");
    expect(result.findings[0]?.status).toBe("awaiting_engineer");
    expect(result.findings[0]?.severity).toBe("major");
    expect(result.findings[0]?.confidence.band).toBe("high");
    expect(result.disclaimer).toMatch(/does not replace professional engineering judgment/);
  });
});
