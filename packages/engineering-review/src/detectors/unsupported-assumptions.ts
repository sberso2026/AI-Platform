import { ERA1_REVIEW_RULES } from "../rule";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const unsupportedAssumptionDetector: ReviewDetector = {
  ruleId: "er.unsupported_assumption",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    if (!rule) return [];
    const detections: DetectorDetection[] = [];
    for (const doc of context.documents) {
      for (const assumption of doc.assumptions ?? []) {
        if (assumption.supported) continue;
        detections.push({
          detectionKey: `unsupported_assumption:${doc.documentId}:${assumption.id}`,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          reviewType: rule.reviewType,
          category: rule.outputCategory,
          title: `Unsupported assumption ${assumption.id}`,
          description: `Declared assumption "${assumption.id}" has no supporting evidence.`,
          severity: "moderate",
          confidenceScore: 0.7,
          evidence: [
            {
              evidenceId: `${doc.documentId}:assumption:${assumption.id}`,
              documentId: doc.documentId,
              tenantId: doc.tenantId,
              workspaceId: doc.workspaceId,
              projectId: doc.projectId,
              revision: doc.revision,
              span: assumption.text,
              sourceType: "declared_assumption",
            },
          ],
          requirementReferences: [],
          reasoningSummary: "Assumption declared in extracted text without supporting evidence.",
          recommendedAction: "Provide geotechnical, specification, or calculation support, or withdraw the assumption.",
        });
      }
    }
    return detections;
  },
};
