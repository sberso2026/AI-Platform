import { failClosed } from "../errors";
import { asUntrustedDocumentText, DOCUMENT_TRUST_BOUNDARY } from "../trust-boundary";
import { createReviewOwnership, type ReviewOwnership } from "../ownership";
import type { ReviewDocumentFixture } from "../detectors/types";
import type { ReviewDocumentRole } from "../review-package";

/**
 * Anti-corruption snapshot of a Project Intelligence ready document.
 *
 * Duplicates PI field names without importing @rtb/project-intelligence
 * (no reverse or circular package edge). Callers map PI records into this
 * shape outside the domain engine.
 *
 * Extracted text remains UNTRUSTED CONTENT. This adapter never types
 * document text as a system instruction.
 */
export const PI_DOCUMENT_PROCESSING_STATUSES = [
  "registered",
  "queued",
  "fetching",
  "validating",
  "parsing",
  "normalizing",
  "chunking",
  "embedding",
  "indexing",
  "extracting",
  "validating_output",
  "ready",
  "ready_with_warnings",
  "retry_pending",
  "failed",
  "cancelled",
  "superseded",
  "archived",
] as const;

export type PiDocumentProcessingStatus = (typeof PI_DOCUMENT_PROCESSING_STATUSES)[number];

export const REVIEW_INPUT_READINESS = [
  "READY_MACHINE_READABLE",
  "NOT_READY",
  "OCR_REQUIRED",
  "UNSUPPORTED",
  "FAILED_INGESTION",
] as const;

export type ReviewInputReadiness = (typeof REVIEW_INPUT_READINESS)[number];

export type PiDocumentChunkSnapshot = {
  id: string;
  content: string;
  contentHash?: string;
  sectionPath?: string;
  pageStart?: number;
  pageEnd?: number;
  chunkIndex?: number;
};

export type ProjectIntelligenceDocumentSnapshot = {
  engineeringDocumentId: string;
  tenantId: string;
  workspaceId: string;
  engineeringProjectId?: string;
  title?: string;
  documentType?: string;
  documentNumber?: string;
  revision: string;
  mimeType?: string;
  processingStatus: string;
  warnings?: readonly string[];
  extractedText?: string;
  chunks?: readonly PiDocumentChunkSnapshot[];
  role?: ReviewDocumentRole;
  fields?: Readonly<Record<string, string>>;
  requirements?: ReviewDocumentFixture["requirements"];
  assumptions?: ReviewDocumentFixture["assumptions"];
  evidenceKeys?: readonly string[];
  fileName?: string;
  controlledFixture?: boolean;
  ingestionSource?: "internal_fixture" | "external_customer" | "unknown";
  scanState?: import("../malware-scan").ReviewMalwareScanState;
};

export type CanonicalReviewDocumentInput = {
  documentId: string;
  readiness: ReviewInputReadiness;
  reasons: readonly string[];
  revision: string;
  documentNumber?: string;
  title?: string;
  documentType?: string;
  mimeType?: string;
  processingStatus: string;
  ownership?: ReviewOwnership;
  untrustedText?: ReturnType<typeof asUntrustedDocumentText>;
  fixture?: ReviewDocumentFixture;
  trustBoundary: typeof DOCUMENT_TRUST_BOUNDARY;
};

export type PiReviewInputReport = {
  documents: readonly CanonicalReviewDocumentInput[];
  ready: readonly ReviewDocumentFixture[];
  blocking: readonly CanonicalReviewDocumentInput[];
};

const IMAGE_MIME = /^(image\/|application\/octet-stream$|application\/x-msdownload)/i;
const OCR_WARNING = /ocr_recommended|insufficient_extracted_text/i;

function machineReadableText(snapshot: ProjectIntelligenceDocumentSnapshot): string {
  const extracted = snapshot.extractedText?.trim() ?? "";
  if (extracted) return extracted;
  const chunks = (snapshot.chunks ?? [])
    .map((chunk) => chunk.content.trim())
    .filter(Boolean);
  return chunks.join("\n");
}

export function classifyPiDocumentReadiness(
  snapshot: ProjectIntelligenceDocumentSnapshot,
): { readiness: ReviewInputReadiness; reasons: string[] } {
  const reasons: string[] = [];
  const status = snapshot.processingStatus?.trim() ?? "";
  const warnings = snapshot.warnings ?? [];
  const mime = snapshot.mimeType?.trim() ?? "";
  const text = machineReadableText(snapshot);

  if (mime && IMAGE_MIME.test(mime)) {
    reasons.push(`unsupported_mime:${mime}`);
    return { readiness: "UNSUPPORTED", reasons };
  }

  if (status === "failed" || status === "cancelled") {
    reasons.push(`ingestion_status:${status}`);
    return { readiness: "FAILED_INGESTION", reasons };
  }

  if (
    status === "registered" ||
    status === "queued" ||
    status === "fetching" ||
    status === "validating" ||
    status === "parsing" ||
    status === "normalizing" ||
    status === "chunking" ||
    status === "embedding" ||
    status === "indexing" ||
    status === "extracting" ||
    status === "validating_output" ||
    status === "retry_pending" ||
    status === "superseded" ||
    status === "archived"
  ) {
    reasons.push(`not_ready_status:${status}`);
    return { readiness: "NOT_READY", reasons };
  }

  if (status !== "ready" && status !== "ready_with_warnings") {
    reasons.push(`unknown_processing_status:${status || "(empty)"}`);
    return { readiness: "NOT_READY", reasons };
  }

  if (warnings.some((warning) => OCR_WARNING.test(warning))) {
    reasons.push("ocr_required:pi_warning");
    return { readiness: "OCR_REQUIRED", reasons };
  }

  if (!text) {
    reasons.push("ocr_required:no_machine_readable_text");
    return { readiness: "OCR_REQUIRED", reasons };
  }

  if (!snapshot.engineeringProjectId?.trim()) {
    reasons.push("project_required");
    return { readiness: "NOT_READY", reasons };
  }

  return { readiness: "READY_MACHINE_READABLE", reasons: [] };
}

export function adaptProjectIntelligenceDocument(
  snapshot: ProjectIntelligenceDocumentSnapshot,
): CanonicalReviewDocumentInput {
  const { readiness, reasons } = classifyPiDocumentReadiness(snapshot);
  const ownership =
    snapshot.engineeringProjectId?.trim()
      ? createReviewOwnership({
          tenantId: snapshot.tenantId,
          workspaceId: snapshot.workspaceId,
          projectId: snapshot.engineeringProjectId,
        })
      : undefined;
  const text = machineReadableText(snapshot);
  const untrustedText = text ? asUntrustedDocumentText(text) : undefined;

  const fixture: ReviewDocumentFixture | undefined =
    readiness === "READY_MACHINE_READABLE" && ownership && untrustedText
      ? {
          ...ownership,
          documentId: snapshot.engineeringDocumentId,
          revision: snapshot.revision,
          role: snapshot.role ?? inferRole(snapshot.documentType),
          documentNumber: snapshot.documentNumber,
          inclusion: "current",
          fields: snapshot.fields ?? {},
          extractedText: untrustedText,
          requirements: snapshot.requirements,
          assumptions: snapshot.assumptions,
          evidenceKeys: snapshot.evidenceKeys,
        }
      : undefined;

  return {
    documentId: snapshot.engineeringDocumentId,
    readiness,
    reasons,
    revision: snapshot.revision,
    documentNumber: snapshot.documentNumber,
    title: snapshot.title,
    documentType: snapshot.documentType,
    mimeType: snapshot.mimeType,
    processingStatus: snapshot.processingStatus,
    ownership,
    untrustedText,
    fixture,
    trustBoundary: DOCUMENT_TRUST_BOUNDARY,
  };
}

export function adaptProjectIntelligenceDocuments(
  snapshots: readonly ProjectIntelligenceDocumentSnapshot[],
): PiReviewInputReport {
  const documents = snapshots.map(adaptProjectIntelligenceDocument);
  const ready = documents.flatMap((item) => (item.fixture ? [item.fixture] : []));
  const blocking = documents.filter((item) => item.readiness !== "READY_MACHINE_READABLE");
  return { documents, ready, blocking };
}

/**
 * Fail closed: a review run must not silently omit unsupported/OCR/not-ready documents.
 */
export function assertReviewInputsReady(report: PiReviewInputReport): readonly ReviewDocumentFixture[] {
  if (report.blocking.length > 0) {
    failClosed("review_input_not_ready", "Review inputs are not all machine-readable and ready", {
      blocking: report.blocking.map((item) => ({
        documentId: item.documentId,
        readiness: item.readiness,
        reasons: item.reasons,
      })),
    });
  }
  if (report.ready.length === 0) {
    failClosed("review_input_empty", "Review package has no ready machine-readable documents");
  }
  return report.ready;
}

function inferRole(documentType?: string): ReviewDocumentRole {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("spec")) return "specification";
  if (value.includes("draw") || value.includes("p&id") || value.includes("pid")) return "drawing";
  if (value.includes("calc")) return "calculation";
  if (value.includes("basis") || value.includes("dbm")) return "basis";
  return "other";
}
