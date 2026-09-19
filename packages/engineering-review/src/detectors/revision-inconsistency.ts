import { ERA1_REVIEW_RULES } from "../rule";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

export const revisionInconsistencyDetector: ReviewDetector = {
  ruleId: "er.revision_inconsistency",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    if (!rule) return [];
    const byNumber = new Map<string, DetectorContext["documents"][number][]>();
    for (const doc of context.documents) {
      if ((doc.inclusion ?? "current") !== "current" || !doc.documentNumber) continue;
      const list = byNumber.get(doc.documentNumber) ?? [];
      list.push(doc);
      byNumber.set(doc.documentNumber, list);
    }
    const detections: DetectorDetection[] = [];
    for (const [documentNumber, docs] of byNumber) {
      const revisions = [...new Set(docs.map((doc) => doc.revision))];
      if (revisions.length < 2) continue;
      detections.push({
        detectionKey: `revision_inconsistency:${documentNumber}`,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        reviewType: rule.reviewType,
        category: rule.outputCategory,
        title: `Conflicting current revisions for ${documentNumber}`,
        description: `Document ${documentNumber} is included as current at revisions ${revisions.join(" and ")}.`,
        severity: "major",
        confidenceScore: 0.95,
        evidence: docs.map((doc) => ({
          evidenceId: `${doc.documentId}:rev:${doc.revision}`,
          documentId: doc.documentId,
          tenantId: doc.tenantId,
          workspaceId: doc.workspaceId,
          projectId: doc.projectId,
          revision: doc.revision,
          span: `${documentNumber} revision ${doc.revision}`,
          sourceType: "document_revision" as const,
        })),
        requirementReferences: [],
        reasoningSummary: "Two current inclusions of the same document number at different revisions.",
        recommendedAction: "Confirm the governing revision and mark superseded issues.",
      });
    }

    for (const ref of context.revisionRefs ?? []) {
      const current = context.documents.find(
        (doc) =>
          (doc.inclusion ?? "current") === "current" &&
          doc.documentNumber === ref.documentNumber,
      );
      if (!current || current.revision === ref.revision) continue;
      const source = context.documents.find((doc) => doc.documentId === ref.sourceDocumentId);
      if (!source) continue;
      detections.push({
        detectionKey: `revision_inconsistency:${ref.documentNumber}`,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        reviewType: rule.reviewType,
        category: rule.outputCategory,
        title: `Stale revision reference for ${ref.documentNumber}`,
        description: `Calculation references ${ref.documentNumber} Rev ${ref.revision} but the current controlled drawing is Rev ${current.revision}.`,
        severity: "major",
        confidenceScore: 0.92,
        evidence: [
          {
            evidenceId: `${source.documentId}:ref:${ref.documentNumber}:${ref.revision}`,
            documentId: source.documentId,
            tenantId: source.tenantId,
            workspaceId: source.workspaceId,
            projectId: source.projectId,
            revision: source.revision,
            span: ref.span,
            sourceType: "extracted_text" as const,
          },
          {
            evidenceId: `${current.documentId}:current:${current.revision}`,
            documentId: current.documentId,
            tenantId: current.tenantId,
            workspaceId: current.workspaceId,
            projectId: current.projectId,
            revision: current.revision,
            span: `${current.documentNumber ?? ref.documentNumber} revision ${current.revision}`,
            sourceType: "document_revision" as const,
          },
        ],
        requirementReferences: [],
        reasoningSummary: "Referenced drawing revision does not match the current controlled revision in the package.",
        recommendedAction: "Update the calculation to the governing revision or justify the superseded reference.",
      });
    }
    return detections;
  },
};
