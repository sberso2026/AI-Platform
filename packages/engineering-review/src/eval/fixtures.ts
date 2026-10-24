import { asUntrustedDocumentText } from "../trust-boundary";
import { createReviewOwnership, type ReviewOwnership } from "../ownership";
import type { MvpReviewType } from "../review-scope";
import type { ReviewDocumentFixture } from "../detectors/types";
import type { ReviewDocumentRole } from "../review-package";

const OWNER: ReviewOwnership = createReviewOwnership({
  tenantId: "tenant-gold",
  workspaceId: "workspace-gold",
  projectId: "project-gold",
});

function doc(input: {
  documentId: string;
  revision: string;
  role: ReviewDocumentRole;
  documentNumber?: string;
  inclusion?: "current" | "superseded";
  fields?: Record<string, string>;
  text: string;
  requirements?: ReviewDocumentFixture["requirements"];
  assumptions?: ReviewDocumentFixture["assumptions"];
  evidenceKeys?: readonly string[];
}): ReviewDocumentFixture {
  return {
    ...OWNER,
    documentId: input.documentId,
    revision: input.revision,
    role: input.role,
    documentNumber: input.documentNumber,
    inclusion: input.inclusion,
    fields: input.fields ?? {},
    extractedText: asUntrustedDocumentText(input.text),
    requirements: input.requirements,
    assumptions: input.assumptions,
    evidenceKeys: input.evidenceKeys,
  };
}

/** Synthetic gold-set documents. No copyrighted standards text. */
export const GOLD_SET_DOCUMENTS = {
  specPressure150: doc({
    documentId: "doc-spec",
    revision: "C",
    role: "specification",
    documentNumber: "SPC-100",
    fields: { design_pressure: "150 kPa", material: "S355" },
    text: "Design pressure 150 kPa. Material S355.",
    requirements: [{ id: "REQ-1", text: "Vessel shall have a pressure relief path.", mappedEvidence: false }],
    assumptions: [{ id: "ASM-1", text: "Assume foundation soil is dense sand.", supported: false }],
    evidenceKeys: ["material"],
  }),
  calcPressure200: doc({
    documentId: "doc-calc",
    revision: "A",
    role: "calculation",
    documentNumber: "CAL-100",
    fields: { design_pressure: "200 kPa" },
    text: "Calculation uses design pressure 200 kPa.",
  }),
  consistentSpec: doc({
    documentId: "doc-spec-ok",
    revision: "C",
    role: "specification",
    documentNumber: "SPC-200",
    fields: { design_pressure: "150 kPa", design_basis: "DB-1", relief_path: "PSV-1" },
    text: "Design pressure 150 kPa. Design basis DB-1. Relief path PSV-1.",
    requirements: [{ id: "REQ-OK", text: "Vessel shall have a pressure relief path.", mappedEvidence: true }],
    assumptions: [{ id: "ASM-OK", text: "Assume water density 1000 kg/m3.", supported: true }],
    evidenceKeys: ["design_basis", "relief_path"],
  }),
  consistentCalc: doc({
    documentId: "doc-calc-ok",
    revision: "A",
    role: "calculation",
    documentNumber: "CAL-200",
    fields: { design_pressure: "150 kPa" },
    text: "Calculation uses design pressure 150 kPa.",
  }),
  specRevC: doc({
    documentId: "doc-spec-c",
    revision: "C",
    role: "specification",
    documentNumber: "SPC-300",
    inclusion: "current",
    fields: { title: "Vessel specification" },
    text: "Specification revision C.",
  }),
  specRevDCurrent: doc({
    documentId: "doc-spec-d",
    revision: "D",
    role: "specification",
    documentNumber: "SPC-300",
    inclusion: "current",
    fields: { title: "Vessel specification" },
    text: "Specification revision D.",
  }),
} as const;

export type GoldCase = {
  id: string;
  documents: readonly ReviewDocumentFixture[];
  reviewTypes: readonly MvpReviewType[];
  requiredFields?: readonly string[];
  expectedEvidenceKeys?: readonly string[];
  expectedDetectionKeys: readonly string[];
  expectedAbsentKeys: readonly string[];
};

export const GOLD_CASES: readonly GoldCase[] = [
  {
    id: "true-pressure-conflict",
    documents: [GOLD_SET_DOCUMENTS.specPressure150, GOLD_SET_DOCUMENTS.calcPressure200],
    reviewTypes: ["cross_document_inconsistency"],
    expectedDetectionKeys: ["cross_document:design_pressure"],
    expectedAbsentKeys: ["missing_information:design_basis"],
  },
  {
    id: "non-finding-consistent-pressure",
    documents: [GOLD_SET_DOCUMENTS.consistentSpec, GOLD_SET_DOCUMENTS.consistentCalc],
    reviewTypes: [
      "cross_document_inconsistency",
      "missing_information",
      "requirement_traceability",
      "unsupported_assumption",
      "missing_engineering_evidence",
    ],
    requiredFields: ["design_basis"],
    expectedEvidenceKeys: ["relief_path"],
    expectedDetectionKeys: [],
    expectedAbsentKeys: [
      "cross_document:design_pressure",
      "missing_information:design_basis",
      "missing_engineering_evidence:relief_path",
      "requirement_traceability:doc-spec-ok:REQ-OK",
      "unsupported_assumption:doc-spec-ok:ASM-OK",
    ],
  },
  {
    id: "missing-required-field",
    documents: [GOLD_SET_DOCUMENTS.specPressure150],
    reviewTypes: ["missing_information"],
    requiredFields: ["design_basis"],
    expectedDetectionKeys: ["missing_information:design_basis"],
    expectedAbsentKeys: ["cross_document:design_pressure"],
  },
  {
    id: "requirement-without-evidence",
    documents: [GOLD_SET_DOCUMENTS.specPressure150],
    reviewTypes: ["requirement_traceability"],
    expectedDetectionKeys: ["requirement_traceability:doc-spec:REQ-1"],
    expectedAbsentKeys: [],
  },
  {
    id: "unsupported-assumption",
    documents: [GOLD_SET_DOCUMENTS.specPressure150],
    reviewTypes: ["unsupported_assumption"],
    expectedDetectionKeys: ["unsupported_assumption:doc-spec:ASM-1"],
    expectedAbsentKeys: [],
  },
  {
    id: "revision-conflict",
    documents: [GOLD_SET_DOCUMENTS.specRevC, GOLD_SET_DOCUMENTS.specRevDCurrent],
    reviewTypes: ["revision_inconsistency"],
    expectedDetectionKeys: ["revision_inconsistency:SPC-300"],
    expectedAbsentKeys: [],
  },
  {
    id: "missing-engineering-evidence",
    documents: [GOLD_SET_DOCUMENTS.specPressure150],
    reviewTypes: ["missing_engineering_evidence"],
    expectedEvidenceKeys: ["relief_path"],
    expectedDetectionKeys: ["missing_engineering_evidence:relief_path"],
    expectedAbsentKeys: [],
  },
];

export const GOLD_OWNERSHIP = OWNER;
