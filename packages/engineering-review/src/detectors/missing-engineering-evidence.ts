import { ERA1_REVIEW_RULES } from "../rule";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const missingEngineeringEvidenceDetector: ReviewDetector = {
  ruleId: "er.missing_engineering_evidence",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    const expected = context.scope.expectedEvidenceKeys ?? [];
    if (!rule || expected.length === 0) return [];
    const present = new Set(
      context.documents.flatMap((doc) => [...Object.keys(doc.fields), ...(doc.evidenceKeys ?? [])]),
    );
    const host = context.documents[0];
    if (!host) return [];
    const detections: DetectorDetection[] = [];
    for (const key of expected) {
      if (present.has(key)) continue;
      detections.push({
        detectionKey: `missing_engineering_evidence:${key}`,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        reviewType: rule.reviewType,
        category: rule.outputCategory,
        title: `Missing engineering evidence ${key}`,
        description: `Expected evidence key "${key}" is not present in the extracted package.`,
        severity: "moderate",
        confidenceScore: 0.72,
        evidence: [
          {
            evidenceId: `${host.documentId}:evidence-gap:${key}`,
            documentId: host.documentId,
            tenantId: host.tenantId,
            workspaceId: host.workspaceId,
            projectId: host.projectId,
            revision: host.revision,
            span: `expected_evidence_absent:${key}`,
            sourceType: "structured_field",
          },
        ],
        requirementReferences: [],
        reasoningSummary: "Expected evidence checklist item is absent.",
        recommendedAction: "Attach the missing calculation, drawing, or specification evidence.",
      });
    }
    return detections;
  },
};
