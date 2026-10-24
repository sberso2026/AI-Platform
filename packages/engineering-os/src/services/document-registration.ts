import {
  inferStandardDocumentNumber,
  isTimestampRevisionArtifact,
  normalizeEngineeringRevision,
  preferCompleteStandardNumber,
} from "./document-identity";

export const ENGINEERING_DOCUMENT_TYPES = [
  { value: "drawing", label: "Drawing" },
  { value: "specification", label: "Specification" },
  { value: "calculation", label: "Calculation" },
  { value: "report", label: "Report" },
  { value: "procedure", label: "Procedure" },
  { value: "standard", label: "Standard" },
  { value: "data_sheet", label: "Data Sheet" },
  { value: "certificate", label: "Certificate" },
  { value: "inspection_record", label: "Inspection Record" },
  { value: "technical_query_attachment", label: "Technical Query Attachment" },
  { value: "correspondence", label: "Correspondence" },
  { value: "vendor_document", label: "Vendor Document" },
  { value: "manual", label: "Manual" },
  { value: "schedule", label: "Schedule" },
  { value: "other", label: "Other" },
] as const;

export type EngineeringDocumentTypeValue =
  (typeof ENGINEERING_DOCUMENT_TYPES)[number]["value"];

const TYPE_KEYWORDS: Array<{ value: EngineeringDocumentTypeValue; pattern: RegExp }> = [
  { value: "drawing", pattern: /\b(dwg|drawing|p&id|ga\b|isometric)\b/i },
  { value: "specification", pattern: /\b(spec|specification)\b/i },
  { value: "calculation", pattern: /\b(calc|calculation)\b/i },
  { value: "report", pattern: /\b(report)\b/i },
  { value: "procedure", pattern: /\b(procedure|sop|method statement)\b/i },
  { value: "standard", pattern: /\b(standard|code of practice)\b/i },
  { value: "data_sheet", pattern: /\b(data\s*sheet|datasheet)\b/i },
  { value: "certificate", pattern: /\b(certificate|cert\b|itp)\b/i },
  { value: "inspection_record", pattern: /\b(inspection|ndt|ncr)\b/i },
  { value: "technical_query_attachment", pattern: /\b(technical query|\btq\b)\b/i },
  { value: "correspondence", pattern: /\b(letter|correspondence|memo)\b/i },
  { value: "vendor_document", pattern: /\b(vendor|supplier)\b/i },
  { value: "manual", pattern: /\b(manual|handbook)\b/i },
  { value: "schedule", pattern: /\b(schedule|programme|program)\b/i },
];

export const DOCUMENT_METADATA_LOW_CONFIDENCE = 0.55;

export function isEngineeringDocumentType(
  value: string,
): value is EngineeringDocumentTypeValue {
  return ENGINEERING_DOCUMENT_TYPES.some((row) => row.value === value);
}

export function normalizeEngineeringDocumentType(
  value: string | null | undefined,
): EngineeringDocumentTypeValue | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (isEngineeringDocumentType(trimmed)) return trimmed;
  const byLabel = ENGINEERING_DOCUMENT_TYPES.find(
    (row) => row.label.toLowerCase() === value.trim().toLowerCase(),
  );
  return byLabel?.value ?? null;
}

export function sanitizeDocumentFileName(name: string): string {
  const trimmed = name.trim() || "document.bin";
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "document.bin";
}

export function fileStem(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  return base.replace(/\.[^.]+$/, "").trim();
}

export interface ProposedDocumentMetadata {
  documentNumber: string | null;
  title: string | null;
  revision: string | null;
  documentType: EngineeringDocumentTypeValue | null;
  confidence: number;
  provenance: string;
  lowConfidence: boolean;
}

function inferType(haystack: string): EngineeringDocumentTypeValue | null {
  for (const row of TYPE_KEYWORDS) {
    if (row.pattern.test(haystack)) return row.value;
  }
  return null;
}

function inferRevision(haystack: string): string | null {
  const labeled =
    haystack.match(/Rev(?:ision)?[\s._-]*([A-Z0-9]{1,4})(?=$|[\s._-])/i) ??
    haystack.match(/\bVersion[\s._-]*([A-Z0-9]{1,4})\b/i);
  const raw =
    labeled?.[1] && !/^EV/i.test(labeled[1])
      ? labeled[1].toUpperCase()
      : haystack.match(/(?:^|[_\-\s])R(\d{1,3})(?:[_\-\s.]|$)/i)?.[1] ?? null;
  if (!raw || isTimestampRevisionArtifact(raw)) return null;
  const normalized = normalizeEngineeringRevision(raw);
  return normalized.pendingReview ? null : normalized.revision;
}

function inferDocumentNumber(haystack: string): string | null {
  const standard = inferStandardDocumentNumber(haystack);
  if (standard) return standard;
  const match = haystack.match(
    /\b([A-Z]{1,8}[-_][A-Z0-9]{1,8}(?:[-_][A-Z0-9]{2,}){0,4})\b/i,
  );
  if (!match?.[1]) return null;
  const value = match[1].toUpperCase();
  if (/^(REV|VER)[-_]?/i.test(value)) return null;
  if (/^(?:META|TMP|RETRY)-\d{8,}$/i.test(value)) return null;
  return value;
}

export function proposeDocumentMetadataFromFilename(fileName: string): ProposedDocumentMetadata {
  const stem = fileStem(fileName);
  const haystack = stem.replace(/[_]+/g, " ");
  const documentNumber = inferDocumentNumber(stem);
  const revision = inferRevision(`${stem} ${haystack}`);
  const documentType = inferType(`${haystack} ${fileName}`);
  let title = haystack
    .replace(documentNumber ?? "", " ")
    .replace(/\b(?:rev(?:ision)?|ver(?:sion)?)[\s._-]*[A-Z0-9]{1,4}\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (title.length < 3) title = stem.replace(/[_-]+/g, " ").trim();
  const hits = [documentNumber, revision, documentType].filter(Boolean).length;
  const confidence = hits === 0 ? 0.35 : hits === 1 ? 0.55 : 0.72;
  return {
    documentNumber,
    title: title || null,
    revision,
    documentType,
    confidence,
    provenance: "filename",
    lowConfidence: confidence < DOCUMENT_METADATA_LOW_CONFIDENCE,
  };
}

export function proposeDocumentMetadataFromText(
  text: string,
  fileName?: string,
): ProposedDocumentMetadata {
  const fromFile = fileName
    ? proposeDocumentMetadataFromFilename(fileName)
    : {
        documentNumber: null,
        title: null,
        revision: null,
        documentType: null,
        confidence: 0,
        provenance: "none",
        lowConfidence: true,
      };
  const head = text.replace(/\r/g, "").split("\n").slice(0, 40).join("\n");
  const labelledNumber =
    head.match(
      /\b(?:document\s*(?:no\.?|number)|doc(?:ument)?\s*(?:no\.?|number)|drawing\s*(?:no\.?|number))\s*[:#]?\s*([A-Z0-9][A-Z0-9._/-]{2,})\b/i,
    )?.[1] ?? null;
  const numberFromText = preferCompleteStandardNumber(
    preferCompleteStandardNumber(inferStandardDocumentNumber(head), inferStandardDocumentNumber(text)),
    labelledNumber,
  );
  const revisionFromTextRaw =
    head.match(/\b(?:rev(?:ision)?)\s*[:#]?\s*([A-Z0-9]{1,4})\b/i)?.[1]?.toUpperCase() ??
    null;
  const revisionFromText =
    revisionFromTextRaw && !isTimestampRevisionArtifact(revisionFromTextRaw)
      ? normalizeEngineeringRevision(revisionFromTextRaw).pendingReview
        ? null
        : normalizeEngineeringRevision(revisionFromTextRaw).revision
      : null;
  const titleLine =
    head
      .split("\n")
      .map((line) => line.trim())
      .find(
        (line) =>
          line.length >= 8 &&
          line.length <= 120 &&
          /[A-Za-z]/.test(line) &&
          !/document\s*(no|number)/i.test(line) &&
          !/^(rev(?:ision)?|version)\b/i.test(line),
      ) ?? null;
  const typeFromText = inferType(head);
  const documentNumber = preferCompleteStandardNumber(numberFromText, fromFile.documentNumber);
  const revision = revisionFromText ?? fromFile.revision;
  const documentType = typeFromText ?? fromFile.documentType;
  const title = titleLine ?? fromFile.title;
  const hits = [documentNumber, revision, documentType, title].filter(Boolean).length;
  const confidence = Math.min(0.92, 0.45 + hits * 0.12);
  return {
    documentNumber,
    title,
    revision,
    documentType,
    confidence,
    provenance: numberFromText || titleLine ? "extracted_header" : fromFile.provenance,
    lowConfidence: confidence < DOCUMENT_METADATA_LOW_CONFIDENCE,
  };
}

export function fallbackDocumentNumber(fileName: string): string {
  const stem = sanitizeDocumentFileName(fileStem(fileName)).replace(/\./g, "-");
  return `UPL-${stem.slice(0, 40)}` || "UPL-DOCUMENT";
}

export function fallbackDocumentTitle(fileName: string): string {
  return fileStem(fileName).replace(/[_-]+/g, " ").trim() || fileName;
}

export type DocumentMetadataReviewState = "proposed" | "review_required" | "confirmed";
export type DocumentNumberProvenance =
  | "extracted_header"
  | "extracted_page"
  | "filename"
  | "filename_fallback"
  | "manual"
  | "imported";

export function isFilenameFallbackNumber(value: string | null | undefined): boolean {
  return /^UPL-/i.test((value ?? "").trim());
}

export function normalizeNumberProvenance(value: string | null | undefined): DocumentNumberProvenance {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw === "extracted_page" || raw === "extracted_text_page") return "extracted_page";
  if (raw === "extracted_header" || raw === "extracted_text") return "extracted_header";
  if (raw === "filename_fallback" || raw === "filename_size_limited" || raw === "filename_parse_failed" || raw === "filename_download_failed") {
    return "filename_fallback";
  }
  if (raw === "manual") return "manual";
  if (raw === "imported" || raw === "imported_metadata") return "imported";
  if (raw === "filename") return "filename";
  return isFilenameFallbackNumber(raw) ? "filename_fallback" : "filename";
}

export function metadataReviewStateFromProposal(input: {
  registerNumber: string;
  proposal?: ProposedDocumentMetadata | null;
  existingState?: string | null;
}): DocumentMetadataReviewState {
  const existing = (input.existingState ?? "").trim().toLowerCase();
  if (existing === "confirmed") return "confirmed";
  const provenance = normalizeNumberProvenance(input.proposal?.provenance);
  if (
    isFilenameFallbackNumber(input.registerNumber) ||
    provenance === "filename" ||
    provenance === "filename_fallback" ||
    Boolean(input.proposal?.lowConfidence)
  ) {
    return "review_required";
  }
  if (existing === "proposed") return "proposed";
  return "proposed";
}

export function buildDocumentMetadataReviewFields(input: {
  registerNumber: string;
  registerRevision: string;
  proposal?: ProposedDocumentMetadata | null;
  existing?: Record<string, unknown> | null;
  numberSource?: string | null;
}): Record<string, unknown> {
  const existing = input.existing ?? {};
  if (String(existing.metadata_review_state ?? "") === "confirmed") {
    return existing;
  }
  const proposal = input.proposal;
  const proposedNumber =
    proposal?.documentNumber ??
    (typeof existing.proposed_document_number === "string" ? existing.proposed_document_number : null);
  const numberSource = normalizeNumberProvenance(
    input.numberSource ??
      proposal?.provenance ??
      (typeof existing.document_number_source === "string" ? existing.document_number_source : null) ??
      (isFilenameFallbackNumber(input.registerNumber) ? "filename_fallback" : "filename"),
  );
  const revisionSource = normalizeNumberProvenance(
    typeof existing.revision_source === "string"
      ? existing.revision_source
      : proposal?.revision
        ? proposal.provenance
        : isFilenameFallbackNumber(input.registerNumber)
          ? "filename_fallback"
          : "filename",
  );
  const state = metadataReviewStateFromProposal({
    registerNumber: input.registerNumber,
    proposal: proposal ?? null,
    existingState: typeof existing.metadata_review_state === "string" ? existing.metadata_review_state : null,
  });
  return {
    ...existing,
    metadata_review_state: state,
    proposed_document_number: proposedNumber,
    proposed_title: proposal?.title ?? existing.proposed_title ?? null,
    proposed_revision: proposal?.revision ?? existing.proposed_revision ?? null,
    proposed_document_type: proposal?.documentType ?? existing.proposed_document_type ?? null,
    document_number_source: numberSource,
    revision_source: revisionSource,
    document_number_confidence: proposal?.confidence ?? existing.document_number_confidence ?? null,
    revision_confidence: proposal?.revision ? proposal.confidence : existing.revision_confidence ?? null,
    metadata_proposal_provenance: proposal?.provenance ?? existing.metadata_proposal_provenance ?? numberSource,
  };
}

