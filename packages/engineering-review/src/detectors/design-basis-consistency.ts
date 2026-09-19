import { ERA1_REVIEW_RULES } from "../rule";
import { factCanonicalKey, factIdentity, type EngineeringFact } from "../facts";
import type { DetectorContext, DetectorDetection, ReviewDetector } from "./types";

/**
 * Design-basis consistency: a basis document fact that conflicts with another
 * document in the package. Reuses canonical fact identity; does not interpret drawings.
 */
export const designBasisConsistencyDetector: ReviewDetector = {
  ruleId: "er.design_basis_consistency",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    if (!rule) return [];
    const facts = context.facts ?? [];
    const basisDocIds = new Set(
      context.documents.filter((doc) => doc.role === "basis").map((doc) => doc.documentId),
    );
    if (basisDocIds.size === 0) return [];

    const groups = new Map<string, EngineeringFact[]>();
    for (const fact of facts) {
      const key = factIdentity(fact);
      const list = groups.get(key) ?? [];
      list.push(fact);
      groups.set(key, list);
    }

    const detections: DetectorDetection[] = [];
    for (const [identity, rows] of groups) {
      const involvesBasis = rows.some((row) => basisDocIds.has(row.sourceDocumentId));
      const unique = [...new Set(rows.map(factCanonicalKey))];
      if (!involvesBasis || unique.length < 2 || rows.length < 2) continue;
      const property = identity.split("|")[1] ?? identity;
      detections.push({
        detectionKey: `cross_document:${property}`,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        reviewType: rule.reviewType,
        category: rule.outputCategory,
        title: `Design-basis conflict on ${property}`,
        description: `Design-basis value for "${property}" conflicts with other package documents: ${rows
          .map((row) => `${row.value}${row.unit ? ` ${row.unit}` : ""}`)
          .join(" vs ")}.`,
        severity: "major",
        confidenceScore: 0.9,
        evidence: rows.map((row) => ({
          evidenceId: `basis:${row.sourceDocumentId}:${row.property}:${row.value}`,
          documentId: row.sourceDocumentId,
          tenantId: context.ownership.tenantId,
          workspaceId: context.ownership.workspaceId,
          projectId: context.ownership.projectId,
          revision: row.revision,
          span: row.span,
          sourceType: "extracted_text" as const,
        })),
        requirementReferences: [],
        reasoningSummary: "Deterministic mismatch between design-basis facts and other documents.",
        recommendedAction: "Reconcile the design basis with the conflicting document and record the governing value.",
      });
    }
    return detections;
  },
};
