import { ERA1_REVIEW_RULES } from "../rule";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const requirementTraceabilityDetector: ReviewDetector = {
  ruleId: "er.requirement_traceability",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    if (!rule) return [];
    const detections: DetectorDetection[] = [];
    for (const doc of context.documents) {
      for (const requirement of doc.requirements ?? []) {
        if (requirement.mappedEvidence) continue;
        detections.push({
          detectionKey: `requirement_traceability:${doc.documentId}:${requirement.id}`,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          reviewType: rule.reviewType,
          category: rule.outputCategory,
          title: `Requirement ${requirement.id} has no mapped evidence`,
          description: `Extracted requirement "${requirement.id}" is not mapped to supporting evidence.`,
          severity: "major",
          confidenceScore: 0.75,
          evidence: [
            {
              evidenceId: `${doc.documentId}:req:${requirement.id}`,
              documentId: doc.documentId,
              tenantId: doc.tenantId,
              workspaceId: doc.workspaceId,
              projectId: doc.projectId,
              revision: doc.revision,
              span: requirement.text,
              sourceType: "requirement_statement",
            },
          ],
          requirementReferences: [requirement.id],
          reasoningSummary: "Explicit extracted requirement without a mapped evidence flag.",
          recommendedAction: "Trace the requirement to specification, drawing, or calculation evidence.",
        });
      }
    }
    return detections;
  },
};
