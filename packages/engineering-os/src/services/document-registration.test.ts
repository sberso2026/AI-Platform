import { describe, expect, it } from "vitest";
import {
  fallbackDocumentNumber,
  isFilenameFallbackNumber,
  metadataReviewStateFromProposal,
  normalizeEngineeringDocumentType,
  proposeDocumentMetadataFromFilename,
  proposeDocumentMetadataFromText,
  sanitizeDocumentFileName,
} from "./document-registration";

describe("document registration helpers", () => {
  it("sanitizes object keys", () => {
    expect(sanitizeDocumentFileName("Pump Spec (Rev A).pdf")).toBe("Pump_Spec__Rev_A_.pdf");
  });

  it("maps display labels onto canonical document types", () => {
    expect(normalizeEngineeringDocumentType("Data Sheet")).toBe("data_sheet");
    expect(normalizeEngineeringDocumentType("drawing")).toBe("drawing");
    expect(normalizeEngineeringDocumentType("nope")).toBeNull();
  });

  it("proposes number, revision, type, and title from an engineering filename", () => {
    const proposed = proposeDocumentMetadataFromFilename("P-1234-ME-001_RevB_Pump_Datasheet.pdf");
    expect(proposed.documentNumber).toContain("P-1234");
    expect(proposed.revision).toBe("B");
    expect(proposed.documentType).toBe("data_sheet");
    expect(proposed.title?.toLowerCase()).toContain("pump");
    expect(proposed.lowConfidence).toBe(false);
  });

  it("marks low-confidence filename-only guesses", () => {
    const proposed = proposeDocumentMetadataFromFilename("scan.pdf");
    expect(proposed.lowConfidence).toBe(true);
    expect(proposed.documentNumber).toBeNull();
  });

  it("prefers extracted text over filename when present", () => {
    const proposed = proposeDocumentMetadataFromText(
      "Document Number: SPEC-0099\nRevision: C\nPump Mechanical Specification\n",
      "scan.pdf",
    );
    expect(proposed.documentNumber).toBe("SPEC-0099");
    expect(proposed.revision).toBe("C");
    expect(proposed.documentType).toBe("specification");
    expect(proposed.provenance).toBe("extracted_header");
  });

  it("builds a register fallback number from the filename", () => {
    expect(fallbackDocumentNumber("Site Plan.pdf")).toMatch(/^UPL-/);
  });

  it("proposes AS/NZS and AS standard numbers from filenames", () => {
    const asnzs = proposeDocumentMetadataFromFilename("asnzs-1252-1996-excerpt.txt");
    expect(asnzs.documentNumber).toBe("AS/NZS 1252:1996");
    expect(asnzs.revision).toBeNull();
    const conveyor = proposeDocumentMetadataFromFilename(
      "AS_1755-1986_Conveyors_-_Design___Fabric.pdf",
    );
    expect(conveyor.documentNumber).toBe("AS 1755:1986");
  });

  it("keeps the year when extracted header uses an em dash", () => {
    const proposed = proposeDocumentMetadataFromText(
      "AS 1755—1986\nConveyors — Design, construction, installation and operation\n",
      "AS_1755-1986_Conveyors_-_Design___Fabric.pdf",
    );
    expect(proposed.documentNumber).toBe("AS 1755:1986");
    expect(proposed.provenance).toBe("extracted_header");
  });

  it("keeps filename-derived and UPL- fallback numbers in review_required", () => {
    expect(isFilenameFallbackNumber("UPL-AS_1755-1986_Conveyors_-_Design")).toBe(true);
    expect(
      metadataReviewStateFromProposal({
        registerNumber: "UPL-AS_1755-1986_Conveyors_-_Design",
        proposal: {
          documentNumber: "AS 1755:1986",
          title: "Conveyors",
          revision: null,
          documentType: "standard",
          confidence: 0.8,
          provenance: "extracted_header",
          lowConfidence: false,
        },
      }),
    ).toBe("review_required");
  });
});
