import { describe, expect, it } from "vitest";
import {
  DOCUMENT_MAX_UPLOAD_BYTES,
  validateDocumentStoragePolicy,
} from "../src/documents/storage-policy";
import { DocumentIntelligenceError } from "../src/documents/errors";

describe("storage policy", () => {
  it("accepts freeze MIME types within 25 MiB", () => {
    expect(
      validateDocumentStoragePolicy({
        mimeType: "application/pdf",
        fileName: "spec.pdf",
        sizeBytes: 1024,
      }),
    ).toMatchObject({ ok: true, mimeType: "application/pdf" });

    expect(
      validateDocumentStoragePolicy({
        mimeType: "text/plain",
        fileName: "notes.txt",
        sizeBytes: 10,
      }).ok,
    ).toBe(true);

    expect(
      validateDocumentStoragePolicy({
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileName: "report.docx",
        sizeBytes: 2048,
      }).ok,
    ).toBe(true);
  });

  it("rejects unsupported types and oversize files", () => {
    expect(() =>
      validateDocumentStoragePolicy({ mimeType: "image/png", fileName: "x.png", sizeBytes: 10 }),
    ).toThrow(DocumentIntelligenceError);

    expect(() =>
      validateDocumentStoragePolicy({
        mimeType: "application/pdf",
        fileName: "big.pdf",
        sizeBytes: DOCUMENT_MAX_UPLOAD_BYTES + 1,
      }),
    ).toThrow(/maximum upload size/i);
  });
});
