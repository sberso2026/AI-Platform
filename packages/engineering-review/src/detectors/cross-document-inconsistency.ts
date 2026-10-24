import { ERA1_REVIEW_RULES } from "../rule";
import { factCanonicalKey, factIdentity, type EngineeringFact } from "../facts";
import { evidenceFromField, type DetectorContext, type DetectorDetection, type ReviewDetector } from "./types";

function detectionsFromFacts(context: DetectorContext, rule: NonNullable<(typeof ERA1_REVIEW_RULES)[number]>): DetectorDetection[] {
  const groups = new Map<string, EngineeringFact[]>();
  for (const fact of context.facts ?? []) {
    const key = factIdentity(fact);
    const list = groups.get(key) ?? [];
    list.push(fact);
    groups.set(key, list);
  }
  const detections: DetectorDetection[] = [];
  for (const [identity, rows] of groups) {
    const unique = [...new Set(rows.map(factCanonicalKey))];
    if (unique.length < 2 || rows.length < 2) continue;
    const property = identity.split("|")[1] ?? identity;
    detections.push({
      detectionKey: `cross_document:${property}`,
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      reviewType: rule.reviewType,
      category: rule.outputCategory,
      title: `Conflicting ${property} across documents`,
      description: `Canonical property "${property}" has conflicting values: ${rows
        .map((row) => `${row.value}${row.unit ? ` ${row.unit}` : ""}`)
        .join(" vs ")}.`,
      severity: "major",
      confidenceScore: 0.9,
      evidence: rows.map((row) => ({
        evidenceId: `${row.sourceDocumentId}:${row.property}:${row.value}`,
        documentId: row.sourceDocumentId,
        tenantId: context.ownership.tenantId,
        workspaceId: context.ownership.workspaceId,
        projectId: context.ownership.projectId,
        revision: row.revision,
        span: row.span,
        sourceType: "extracted_text" as const,
      })),
      requirementReferences: [],
      reasoningSummary: "Deterministic mismatch of canonical engineering facts. Unit-compatible values are treated as equal.",
      recommendedAction: "Reconcile the conflicting values with the responsible discipline.",
    });
  }
  return detections;
}

export const crossDocumentInconsistencyDetector: ReviewDetector = {
  ruleId: "er.cross_document_inconsistency",
  detect(context: DetectorContext): readonly DetectorDetection[] {
    const rule = ERA1_REVIEW_RULES.find((item) => item.ruleId === this.ruleId);
    if (!rule) return [];
    const byField = new Map<string, { doc: DetectorContext["documents"][number]; value: string }[]>();
    for (const doc of context.documents) {
      for (const [field, value] of Object.entries(doc.fields)) {
        const list = byField.get(field) ?? [];
        list.push({ doc, value });
        byField.set(field, list);
      }
    }
    const detections: DetectorDetection[] = [];
    for (const [field, rows] of byField) {
      const unique = [...new Set(rows.map((row) => row.value))];
      if (unique.length < 2 || rows.length < 2) continue;
      detections.push({
        detectionKey: `cross_document:${field}`,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        reviewType: rule.reviewType,
        category: rule.outputCategory,
        title: `Conflicting ${field} across documents`,
        description: `Structured field "${field}" has conflicting values: ${unique.join(" vs ")}.`,
        severity: "major",
        confidenceScore: 0.9,
        evidence: rows.map((row) => evidenceFromField(row.doc, field, row.value)),
        requirementReferences: [],
        reasoningSummary: "Deterministic mismatch of identical field keys across package documents.",
        recommendedAction: "Reconcile the conflicting values with the responsible discipline.",
      });
    }
    detections.push(...detectionsFromFacts(context, rule));
    return detections;
  },
};
