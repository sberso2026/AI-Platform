import { describe, expect, it } from "vitest";
import { proposeDocumentMetadataFromSource } from "../src/documents/metadata-proposal";

describe("document metadata proposal", () => {
  it("extracts document number and title from plain text", async () => {
    const text = "Document Number: SPEC-4401\nRevision: A\nCooling Water Specification\n";
    const proposed = await proposeDocumentMetadataFromSource({
      fileName: "notes.txt",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(text),
    });
    expect(proposed.documentNumber).toBe("SPEC-4401");
    expect(proposed.revision).toBe("A");
    expect(proposed.documentType).toBe("specification");
    expect(proposed.title?.toLowerCase()).toContain("cooling");
    expect(proposed.lowConfidence).toBe(false);
  });

  it("falls back to filename when bytes are missing", async () => {
    const proposed = await proposeDocumentMetadataFromSource({
      fileName: "DWG-12-AA_RevC_Site_Layout.pdf",
      mimeType: "application/pdf",
    });
    expect(proposed.documentNumber).toMatch(/DWG-12/i);
    expect(proposed.revision).toBe("C");
    expect(proposed.documentType).toBe("drawing");
  });
});
