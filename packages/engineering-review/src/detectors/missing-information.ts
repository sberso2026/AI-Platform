import { ERA1_REVIEW_RULES } from "../rule";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const missingInformationDetector: ReviewDetector = {
  ruleId: "er.missing_information",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    const required = context.scope.requiredFields ?? [];
    if (!rule || required.length === 0) return [];
    const present = new Set(context.documents.flatMap((doc) => Object.keys(doc.fields)));
    const detections: DetectorDetection[] = [];
    for (const field of required) {
      if (present.has(field)) continue;
      const host = context.documents[0];
      if (!host) continue;
      detections.push({
        detectionKey: `missing_information:${field}`,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        reviewType: rule.reviewType,
        category: rule.outputCategory,
        title: `Missing required field ${field}`,
        description: `Required field "${field}" is not present in extracted package fields.`,
        severity: "moderate",
        confidenceScore: 0.8,
        evidence: [
          {
            evidenceId: `${host.documentId}:missing:${field}`,
            documentId: host.documentId,
            tenantId: host.tenantId,
            workspaceId: host.workspaceId,
            projectId: host.projectId,
            revision: host.revision,
            span: `required_field_absent:${field}`,
            sourceType: "structured_field",
          },
        ],
        requirementReferences: [],
        reasoningSummary: "Package-level required field checklist failed.",
        recommendedAction: "Supply the missing information in the design package.",
      });
    }
    return detections;
  },
};
