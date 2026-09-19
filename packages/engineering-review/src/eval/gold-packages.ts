import { asUntrustedDocumentText } from "../trust-boundary";
import { createReviewOwnership, type ReviewOwnership } from "../ownership";
import type { MvpReviewType } from "../review-scope";
import type { ReviewDocumentFixture } from "../detectors/types";
import type { ReviewDocumentRole } from "../review-package";
import { MVP_REVIEW_TYPES } from "../review-scope";

const OWNER: ReviewOwnership = createReviewOwnership({
  tenantId: "tenant-gold-era4",
  workspaceId: "workspace-gold-era4",
  projectId: "project-gold-era4",
});

function doc(input: {
  documentId: string;
  revision: string;
  role: ReviewDocumentRole;
  documentNumber?: string;
  inclusion?: "current" | "superseded";
  fields?: Record<string, string>;
  text: string;
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
  };
}

export type GoldPackage = {
  id: string;
  name: string;
  documents: readonly ReviewDocumentFixture[];
  reviewTypes: readonly MvpReviewType[];
  expectedDetectionKeys: readonly string[];
  expectedAbsentKeys: readonly string[];
  expectedFindingCount: number;
};

export const ERA4_GOLD_PACKAGES: readonly GoldPackage[] = [
  {
    id: "pkg-1-material-inconsistency",
    name: "PACKAGE 1 Material consistency",
    documents: [
      doc({
        documentId: "doc-basis-1",
        revision: "A",
        role: "basis",
        documentNumber: "DB-01",
        text: "Design Basis. Concrete strength = 40 MPa for superstructure elements.",
      }),
      doc({
        documentId: "doc-spec-1",
        revision: "A",
        role: "specification",
        documentNumber: "SPC-01",
        text: "Specification. Concrete strength = 40 MPa unless noted otherwise.",
      }),
      doc({
        documentId: "doc-dwg-1",
        revision: "A",
        role: "drawing",
        documentNumber: "S-001",
        text: "Drawing note. Concrete strength = 32 MPa.",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: ["cross_document:compressive_strength"],
    expectedAbsentKeys: [
      "revision_inconsistency:S-001",
      "unsupported_assumption:doc-basis-1:ASM-BEARING",
      "requirement_traceability:doc-basis-1:REQ-DESIGN-LIFE",
    ],
    expectedFindingCount: 1,
  },
  {
    id: "pkg-2-consistent-control",
    name: "PACKAGE 2 Consistent control",
    documents: [
      doc({
        documentId: "doc-basis-2",
        revision: "A",
        role: "basis",
        documentNumber: "DB-02",
        text: "Design Basis. Concrete strength = 40 MPa.",
      }),
      doc({
        documentId: "doc-spec-2",
        revision: "A",
        role: "specification",
        documentNumber: "SPC-02",
        text: "Specification. Concrete strength = 40 MPa.",
      }),
      doc({
        documentId: "doc-dwg-2",
        revision: "A",
        role: "drawing",
        documentNumber: "S-002",
        text: "Drawing note. Concrete strength = 40 MPa.",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: [],
    expectedAbsentKeys: ["cross_document:compressive_strength"],
    expectedFindingCount: 0,
  },
  {
    id: "pkg-3-design-load",
    name: "PACKAGE 3 Design load",
    documents: [
      doc({
        documentId: "doc-basis-3",
        revision: "A",
        role: "basis",
        documentNumber: "DB-03",
        text: "Design Basis. Equipment operating load = 250 kN.",
      }),
      doc({
        documentId: "doc-calc-3",
        revision: "A",
        role: "calculation",
        documentNumber: "CAL-03",
        text: "Calculation. Equipment operating load = 250 kN.",
      }),
      doc({
        documentId: "doc-sched-3",
        revision: "A",
        role: "drawing",
        documentNumber: "S-010",
        text: "Foundation schedule. Equipment operating load = 180 kN.",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: ["cross_document:operating_load"],
    expectedAbsentKeys: ["cross_document:compressive_strength"],
    expectedFindingCount: 1,
  },
  {
    id: "pkg-4-unsupported-assumption",
    name: "PACKAGE 4 Unsupported assumption",
    documents: [
      doc({
        documentId: "doc-calc-4",
        revision: "A",
        role: "calculation",
        documentNumber: "CAL-04",
        text: "Calculation. Allowable bearing pressure = 250 kPa. Pad foundation sized on that pressure. No geotechnical source is attached.",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: ["unsupported_assumption:doc-calc-4:ASM-BEARING"],
    expectedAbsentKeys: ["cross_document:allowable_bearing_pressure"],
    expectedFindingCount: 1,
  },
  {
    id: "pkg-5-revision-control",
    name: "PACKAGE 5 Revision control",
    documents: [
      doc({
        documentId: "doc-calc-5",
        revision: "A",
        role: "calculation",
        documentNumber: "CAL-05",
        text: "Calculation references Drawing S-101 Rev B for foundation layout.",
      }),
      doc({
        documentId: "doc-dwg-5",
        revision: "D",
        role: "drawing",
        documentNumber: "S-101",
        text: "Current controlled drawing S-101 Rev D.",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: ["revision_inconsistency:S-101"],
    expectedAbsentKeys: ["cross_document:compressive_strength"],
    expectedFindingCount: 1,
  },
  {
    id: "pkg-6-requirement-traceability",
    name: "PACKAGE 6 Requirement traceability",
    documents: [
      doc({
        documentId: "doc-req-6",
        revision: "A",
        role: "specification",
        documentNumber: "REQ-06",
        text: "Explicit project requirement: Design life = 50 years.",
      }),
      doc({
        documentId: "doc-basis-6",
        revision: "A",
        role: "basis",
        documentNumber: "DB-06",
        text: "Design basis for a warehouse superstructure. Gravity and wind loads are considered. No design-life statement.",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: ["requirement_traceability:doc-req-6:REQ-DESIGN-LIFE"],
    expectedAbsentKeys: ["cross_document:design_life"],
    expectedFindingCount: 1,
  },
  {
    id: "pkg-7-unit-equivalent-negative",
    name: "PACKAGE 7 Compatible units (negative control)",
    documents: [
      doc({
        documentId: "doc-basis-7",
        revision: "A",
        role: "basis",
        text: "Design Basis. Concrete strength = 40 MPa.",
      }),
      doc({
        documentId: "doc-spec-7",
        revision: "A",
        role: "specification",
        text: "Specification. Concrete strength = 40 N/mm².",
      }),
    ],
    reviewTypes: MVP_REVIEW_TYPES,
    expectedDetectionKeys: [],
    expectedAbsentKeys: ["cross_document:compressive_strength"],
    expectedFindingCount: 0,
  },
];

export const ERA4_GOLD_OWNERSHIP = OWNER;
