import { describe, expect, it } from "vitest";
import {
  adaptProjectIntelligenceDocument,
  adaptProjectIntelligenceDocuments,
  assertReviewInputsReady,
  classifyPiDocumentReadiness,
  type ProjectIntelligenceDocumentSnapshot,
} from "./adapters/pi-input";
import { DOCUMENT_TRUST_BOUNDARY } from "./trust-boundary";
import { expectCode } from "./expect-code";

const BASE: ProjectIntelligenceDocumentSnapshot = {
  engineeringDocumentId: "doc-spec",
  tenantId: "tenant-gold",
  workspaceId: "workspace-gold",
  engineeringProjectId: "project-gold",
  title: "Vessel specification",
  documentType: "specification",
  documentNumber: "SPC-100",
  revision: "C",
  mimeType: "application/pdf",
  processingStatus: "ready",
  warnings: [],
  extractedText: "Design pressure 150 kPa. Material S355.",
  chunks: [
    {
      id: "chunk-1",
      content: "Design pressure 150 kPa. Material S355.",
      sectionPath: "Design",
      pageStart: 1,
    },
  ],
  role: "specification",
  fields: { design_pressure: "150 kPa", material: "S355" },
};

describe("PI review input adapter", () => {
  it("maps a PI-ready document to untrusted canonical review input", () => {
    const adapted = adaptProjectIntelligenceDocument(BASE);
    expect(adapted.readiness).toBe("READY_MACHINE_READABLE");
    expect(adapted.untrustedText?.trust).toBe("untrusted_document");
    expect(adapted.untrustedText?.text).toContain("150 kPa");
    expect(adapted.trustBoundary).toEqual(DOCUMENT_TRUST_BOUNDARY);
    expect(adapted.trustBoundary.promptInjectionSolved).toBe(false);
    expect(adapted.fixture?.extractedText.trust).toBe("untrusted_document");
  });

  it("does not silently accept OCR-required or unsupported documents", () => {
    expect(classifyPiDocumentReadiness({ ...BASE, warnings: ["insufficient_extracted_text:ocr_recommended"] }).readiness).toBe(
      "OCR_REQUIRED",
    );
    expect(classifyPiDocumentReadiness({ ...BASE, extractedText: "", chunks: [] }).readiness).toBe("OCR_REQUIRED");
    expect(classifyPiDocumentReadiness({ ...BASE, mimeType: "image/tiff" }).readiness).toBe("UNSUPPORTED");
    expect(classifyPiDocumentReadiness({ ...BASE, processingStatus: "failed" }).readiness).toBe("FAILED_INGESTION");
    expect(classifyPiDocumentReadiness({ ...BASE, processingStatus: "parsing" }).readiness).toBe("NOT_READY");
    expect(classifyPiDocumentReadiness({ ...BASE, processingStatus: "ready_with_warnings", warnings: [] }).readiness).toBe(
      "READY_MACHINE_READABLE",
    );
  });

  it("fails closed when a review package includes unreadiness instead of omitting it", () => {
    const report = adaptProjectIntelligenceDocuments([
      BASE,
      { ...BASE, engineeringDocumentId: "doc-scan", warnings: ["ocr_recommended"], extractedText: "" },
    ]);
    expect(report.ready).toHaveLength(1);
    expect(report.blocking).toHaveLength(1);
    expect(report.blocking[0]?.readiness).toBe("OCR_REQUIRED");
    expectCode(() => assertReviewInputsReady(report), "review_input_not_ready");
  });
});
