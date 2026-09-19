import { describe, expect, it } from "vitest";
import { runDetectors } from "./detectors";
import { GOLD_CASES, GOLD_OWNERSHIP } from "./eval/fixtures";
import { evaluateDetections } from "./eval/metrics";
import { createReviewScope } from "./review-scope";
import { verifyFindingEvidence } from "./finding";
import { constructFindingFromDetection } from "./engine";
import { createReviewPackage } from "./review-package";
import { createReviewRun } from "./review-run";
import { ERA1_REVIEW_RULES } from "./rule";

describe("gold-set evaluation", () => {
  it("computes deterministic precision, recall, FPR, grounding, and duplication", () => {
    const predicted: string[] = [];
    const expected: string[] = [];
    const absent: string[] = [];
    let grounded = 0;
    let findingCount = 0;

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
      predicted.push(...detections.map((item) => item.detectionKey));
      expected.push(...gold.expectedDetectionKeys);
      absent.push(...gold.expectedAbsentKeys);

      const pkg = createReviewPackage({
        id: `pkg-${gold.id}`,
        tenantId: GOLD_OWNERSHIP.tenantId,
        workspaceId: GOLD_OWNERSHIP.workspaceId,
        projectId: GOLD_OWNERSHIP.projectId,
        name: gold.id,
        createdBy: "eval",
        documents: gold.documents.map((doc) => ({
          documentId: doc.documentId,
          revision: doc.revision,
          role: doc.role,
          documentNumber: doc.documentNumber,
        })),
      });
      const run = createReviewRun({
        id: `run-${gold.id}`,
        pkg,
        scope: createReviewScope({ reviewTypes: gold.reviewTypes }),
        rules: ERA1_REVIEW_RULES.filter((rule) => gold.reviewTypes.includes(rule.reviewType)),
      });
      for (const [index, detection] of detections.entries()) {
        const finding = verifyFindingEvidence(
          constructFindingFromDetection(detection, { run, pkg, documents: gold.documents }, index),
        );
        findingCount += 1;
        if (finding.verificationState === "evidence_verified") grounded += 1;
      }
    }

    const metrics = evaluateDetections({
      predictedKeys: predicted,
      expectedKeys: expected,
      absentKeys: absent,
      evidenceGroundedCount: grounded,
      predictedFindingCount: findingCount,
    });

    expect(metrics.precision).toBe(1);
    expect(metrics.recall).toBe(1);
    expect(metrics.falsePositiveRate).toBe(0);
    expect(metrics.evidenceGroundingRate).toBe(1);
    expect(metrics.duplicateFindingRate).toBe(0);
    expect(metrics.counts.truePositives).toBe(expected.length);
    expect(metrics.counts.falsePositives).toBe(0);
    expect(metrics.counts.falseNegatives).toBe(0);
  });

  it("does not use random scores", () => {
    const first = evaluateDetections({
      predictedKeys: ["a"],
      expectedKeys: ["a", "b"],
      evidenceGroundedCount: 1,
      predictedFindingCount: 1,
    });
    const second = evaluateDetections({
      predictedKeys: ["a"],
      expectedKeys: ["a", "b"],
      evidenceGroundedCount: 1,
      predictedFindingCount: 1,
    });
    expect(first).toEqual(second);
    expect(first.recall).toBe(0.5);
    expect(first.precision).toBe(1);
  });
});
