import { describe, expect, it } from "vitest";
import { canonicalizeQuantity, factsConflict, parseQuantity } from "./facts";
import { extractPackageContent } from "./extract";
import { ERA4_GOLD_PACKAGES, ERA4_GOLD_OWNERSHIP } from "./eval/gold-packages";
import { evaluateEra4GoldSet } from "./eval/evaluate-gold";
import { runGroundedReviewPipeline } from "./pipeline";
import { validateInferenceCandidates } from "./inference";
import { createReviewPackage } from "./review-package";
import { createReviewRun } from "./review-run";
import { createReviewScope } from "./review-scope";
import { ERA1_REVIEW_RULES } from "./rule";
import { assertReviewTransition } from "./lifecycle";
import { expectCode } from "./expect-code";
import type { ReviewInferenceProvider } from "./ai-boundary";

function runPackage(gold: (typeof ERA4_GOLD_PACKAGES)[number]) {
  const pkg = createReviewPackage({
    id: `pkg-${gold.id}`,
    tenantId: ERA4_GOLD_OWNERSHIP.tenantId,
    workspaceId: ERA4_GOLD_OWNERSHIP.workspaceId,
    projectId: ERA4_GOLD_OWNERSHIP.projectId,
    name: gold.name,
    createdBy: "era4",
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
  return runGroundedReviewPipeline({ run, pkg, documents: gold.documents });
}

describe("ERA-4 canonical facts", () => {
  it("treats 40 MPa and 40 N/mm² as equal and 250 kN != 180 kN", () => {
    expect(canonicalizeQuantity(40, "MPa")).toEqual(canonicalizeQuantity(40, "N/mm²"));
    expect(parseQuantity("250 kN")).not.toEqual(parseQuantity("180 kN"));
    expect(
      factsConflict(
        {
          subject: "concrete",
          property: "compressive_strength",
          value: "40",
          unit: "MPa",
          sourceDocumentId: "a",
          span: "Concrete strength = 40 MPa",
        },
        {
          subject: "concrete",
          property: "compressive_strength",
          value: "40",
          unit: "N/mm²",
          sourceDocumentId: "b",
          span: "Concrete strength = 40 N/mm²",
        },
      ),
    ).toBe(false);
  });
});

describe("ERA-4 gold-set intelligence", () => {
  it("produces the expected finding on each positive package and silence on negative controls", async () => {
    for (const gold of ERA4_GOLD_PACKAGES) {
      const result = await runPackage(gold);
      const keys = result.findings.map((finding) => finding.provenance.detectionKey);
      expect(keys, gold.id).toEqual([...gold.expectedDetectionKeys]);
      expect(result.findings, gold.id).toHaveLength(gold.expectedFindingCount);
      for (const finding of result.findings) {
        expect(finding.verificationState, gold.id).toBe("evidence_verified");
        expect(finding.status, gold.id).toBe("awaiting_engineer");
        expect(finding.severity).toBeTruthy();
        expect(finding.confidence.score).toBeGreaterThan(0);
      }
    }
  });

  it("resolves citations to source text and does not present fabricated AI evidence", async () => {
    const gold = ERA4_GOLD_PACKAGES[1];
    const forged: ReviewInferenceProvider = {
      async proposeFindings() {
        return [
          {
            title: "Invented crack",
            description: "The drawing shows 999 MPa.",
            category: "cross_document_inconsistency",
            proposedSeverity: "critical",
            proposedConfidenceScore: 0.99,
            evidence: [
              {
                documentId: "doc-does-not-exist",
                tenantId: ERA4_GOLD_OWNERSHIP.tenantId,
                workspaceId: ERA4_GOLD_OWNERSHIP.workspaceId,
                projectId: ERA4_GOLD_OWNERSHIP.projectId,
                span: "not in the document",
                page: 99,
                sourceType: "extracted_text",
              },
            ],
            reasoningSummary: "model said so",
            recommendedAction: "ignore",
          },
        ];
      },
    };
    const pkg = createReviewPackage({
      id: "pkg-ai",
      tenantId: ERA4_GOLD_OWNERSHIP.tenantId,
      workspaceId: ERA4_GOLD_OWNERSHIP.workspaceId,
      projectId: ERA4_GOLD_OWNERSHIP.projectId,
      name: gold.name,
      createdBy: "era4",
      documents: gold.documents.map((doc) => ({
        documentId: doc.documentId,
        revision: doc.revision,
        role: doc.role,
        documentNumber: doc.documentNumber,
      })),
    });
    const run = createReviewRun({
      id: "run-ai",
      pkg,
      scope: createReviewScope({ reviewTypes: gold.reviewTypes }),
      rules: ERA1_REVIEW_RULES,
    });
    const result = await runGroundedReviewPipeline({ run, pkg, documents: gold.documents, inference: forged });
    expect(result.findings).toHaveLength(0);
    expect(result.stages.inferenceRejected).toBeGreaterThan(0);
    expect(validateInferenceCandidates(await forged.proposeFindings({ documents: [], scope: run.scope }), gold.documents).accepted).toEqual([]);
  });

  it("keeps human authority: AI cannot accept findings", async () => {
    const gold = ERA4_GOLD_PACKAGES[0];
    const result = await runPackage(gold);
    const finding = result.findings[0];
    expect(finding).toBeTruthy();
    expect(finding!.status).toBe("awaiting_engineer");
    expectCode(() => assertReviewTransition(finding!.status, "accepted", "ai"), "ai_cannot_dispose");
  });
});

describe("ERA-4 evaluation metrics", () => {
  it("reports deterministic per-package and per-category metrics", async () => {
    const report = await evaluateEra4GoldSet();
    expect(report.engineerConfirmedFindingRate).toBeNull();
    expect(report.reviewTimeSaved).toBeNull();
    expect(report.aggregate.precision).toBeGreaterThanOrEqual(0.9);
    expect(report.aggregate.recall).toBeGreaterThanOrEqual(0.8);
    expect(report.aggregate.falsePositiveRate).toBeLessThanOrEqual(0.1);
    expect(report.aggregate.evidenceGroundingRate).toBe(1);
    expect(report.aggregate.unsupportedClaimRate).toBe(0);
    expect(report.aggregate.duplicateFindingRate).toBe(0);
    const consistent = report.byPackage.find((row) => row.id === "pkg-2-consistent-control");
    expect(consistent?.findingCount).toBe(0);
    expect(report.byCategory.length).toBeGreaterThan(0);
    const second = await evaluateEra4GoldSet();
    expect(second.aggregate).toEqual(report.aggregate);
  });
});

describe("ERA-4 extraction", () => {
  it("extracts facts and revision references from machine-readable text", () => {
    const extracted = extractPackageContent(ERA4_GOLD_PACKAGES[4].documents);
    expect(extracted.revisionRefs.some((item) => item.documentNumber === "S-101" && item.revision === "B")).toBe(true);
  });
});
