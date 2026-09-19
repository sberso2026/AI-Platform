import type { ReviewDocumentFixture } from "./detectors/types";
import type { ReviewFinding } from "./finding";
import type { UntrustedDocumentText } from "./trust-boundary";

function unwrap(text: UntrustedDocumentText | string | undefined): string {
  if (!text) return "";
  return typeof text === "string" ? text : text.text;
}

const ABSENCE_SPAN = /^(required_field_absent:|expected_evidence_absent:)/;

export function evidenceResolvesToSource(
  evidence: { documentId: string; span?: string; revision?: string; sourceType: string },
  documents: readonly ReviewDocumentFixture[],
): boolean {
  const doc = documents.find((item) => item.documentId === evidence.documentId);
  if (!doc) return false;
  if (evidence.span && ABSENCE_SPAN.test(evidence.span)) return true;
  if (evidence.sourceType === "document_revision") {
    return !evidence.revision || evidence.revision === doc.revision || unwrap(doc.extractedText).includes(evidence.span ?? "");
  }
  const span = evidence.span?.trim();
  if (!span) return Boolean(evidence.revision && evidence.revision === doc.revision);
  const text = unwrap(doc.extractedText);
  if (text.includes(span)) return true;
  const fieldMatch = span.match(/^([A-Za-z0-9_]+)=(.+)$/);
  if (fieldMatch && doc.fields[fieldMatch[1]] === fieldMatch[2]) return true;
  return Object.values(doc.fields).some((value) => span.includes(value));
}

export function verifyFindingAgainstSources(
  finding: ReviewFinding,
  documents: readonly ReviewDocumentFixture[],
): ReviewFinding {
  const resolved = finding.evidence.map((item) =>
    evidenceResolvesToSource(item, documents) ? item : { ...item, verificationState: "insufficient" as const },
  );
  const grounded = resolved.every((item) => item.verificationState !== "insufficient") && resolved.some((item) => item.span || item.revision);
  return {
    ...finding,
    evidence: resolved,
    verificationState: grounded ? "evidence_verified" : "insufficient_evidence",
    reasoningBasis: grounded ? finding.reasoningBasis : "INSUFFICIENT_EVIDENCE",
  };
}
