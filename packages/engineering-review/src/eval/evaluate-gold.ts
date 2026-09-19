import { createReviewPackage } from "../review-package";
import { createReviewRun } from "../review-run";
import { createReviewScope } from "../review-scope";
import { ERA1_REVIEW_RULES } from "../rule";
import { runGroundedReviewPipeline } from "../pipeline";
import { evaluateDetections, type ReviewEvalMetrics } from "./metrics";
import { ERA4_GOLD_OWNERSHIP, ERA4_GOLD_PACKAGES, type GoldPackage } from "./gold-packages";
import type { ReviewFindingCategory } from "../finding";

export type CategoryEval = {
  category: ReviewFindingCategory | "all";
  metrics: ReviewEvalMetrics;
};

export type GoldEvaluationReport = {
  aggregate: ReviewEvalMetrics;
  byPackage: { id: string; predicted: string[]; expected: string[]; findingCount: number }[];
  byCategory: CategoryEval[];
  engineerConfirmedFindingRate: null;
  reviewTimeSaved: null;
};

function categoryFromKey(key: string): ReviewFindingCategory {
  if (key.startsWith("cross_document:")) return "cross_document_inconsistency";
  if (key.startsWith("missing_information:")) return "missing_information";
  if (key.startsWith("requirement_traceability:")) return "requirement_traceability_gap";
  if (key.startsWith("unsupported_assumption:")) return "unsupported_assumption";
  if (key.startsWith("revision_inconsistency:")) return "revision_inconsistency";
  if (key.startsWith("missing_engineering_evidence:")) return "missing_engineering_evidence";
  return "other_observation";
}

export async function evaluateEra4GoldSet(
  packages: readonly GoldPackage[] = ERA4_GOLD_PACKAGES,
): Promise<GoldEvaluationReport> {
  const predicted: string[] = [];
  const expected: string[] = [];
  const absent: string[] = [];
  let grounded = 0;
  let findingCount = 0;
  let unsupported = 0;
  const byPackage: GoldEvaluationReport["byPackage"] = [];
  const perCategory = new Map<
    ReviewFindingCategory,
    { predicted: string[]; expected: string[]; absent: string[]; grounded: number; count: number; unsupported: number }
  >();

  function bucket(category: ReviewFindingCategory) {
    const current = perCategory.get(category) ?? {
      predicted: [],
      expected: [],
      absent: [],
      grounded: 0,
      count: 0,
      unsupported: 0,
    };
    perCategory.set(category, current);
    return current;
  }

  for (const gold of packages) {
    const pkg = createReviewPackage({
      id: `pkg-${gold.id}`,
      tenantId: ERA4_GOLD_OWNERSHIP.tenantId,
      workspaceId: ERA4_GOLD_OWNERSHIP.workspaceId,
      projectId: ERA4_GOLD_OWNERSHIP.projectId,
      name: gold.name,
      createdBy: "era4-eval",
      documents: gold.documents.map((doc) => ({
        documentId: doc.documentId,
        revision: doc.revision,
        role: doc.role,
        documentNumber: doc.documentNumber,
        inclusion: doc.inclusion,
      })),
    });
    const run = createReviewRun({
      id: `run-${gold.id}`,
      pkg,
      scope: createReviewScope({ reviewTypes: gold.reviewTypes }),
      rules: ERA1_REVIEW_RULES.filter((rule) => gold.reviewTypes.includes(rule.reviewType)),
    });
    const result = await runGroundedReviewPipeline({ run, pkg, documents: gold.documents });
    const actualPredicted = result.findings.map(
      (finding) => finding.provenance.detectionKey ?? `unkeyed:${finding.category}`,
    );

    predicted.push(...actualPredicted);
    expected.push(...gold.expectedDetectionKeys);
    absent.push(...gold.expectedAbsentKeys);
    findingCount += result.findings.length;
    grounded += result.findings.filter((item) => item.verificationState === "evidence_verified").length;
    unsupported += result.stages.suppressedUnsupportedCount;

    byPackage.push({
      id: gold.id,
      predicted: actualPredicted,
      expected: [...gold.expectedDetectionKeys],
      findingCount: result.findings.length,
    });

    for (const key of actualPredicted) {
      const row = bucket(categoryFromKey(key));
      row.predicted.push(key);
      row.count += 1;
      row.grounded += 1;
    }
    for (const key of gold.expectedDetectionKeys) {
      bucket(categoryFromKey(key)).expected.push(key);
    }
    for (const key of gold.expectedAbsentKeys) {
      bucket(categoryFromKey(key)).absent.push(key);
    }
  }

  const aggregate = evaluateDetections({
    predictedKeys: predicted,
    expectedKeys: expected,
    absentKeys: absent,
    evidenceGroundedCount: grounded,
    predictedFindingCount: findingCount,
    unsupportedClaimCount: unsupported,
  });

  const byCategory: CategoryEval[] = [...perCategory.entries()].map(([category, row]) => ({
    category,
    metrics: evaluateDetections({
      predictedKeys: row.predicted,
      expectedKeys: row.expected,
      absentKeys: row.absent,
      evidenceGroundedCount: row.grounded,
      predictedFindingCount: row.count,
      unsupportedClaimCount: row.unsupported,
    }),
  }));

  return {
    aggregate,
    byPackage,
    byCategory,
    engineerConfirmedFindingRate: null,
    reviewTimeSaved: null,
  };
}
