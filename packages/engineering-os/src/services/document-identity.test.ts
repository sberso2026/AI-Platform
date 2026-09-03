import { describe, expect, it } from "vitest";
import {
  inferStandardDocumentNumber,
  preferCompleteStandardNumber,
  isTimestampRevisionArtifact,
  isValidEngineeringRevision,
  normalizeEngineeringRevision,
  resolveCanonicalDocumentRegistration,
} from "./document-identity";

describe("EOS-AI-DOC-2 document identity", () => {
  it("rejects timestamp and object-id revisions", () => {
    expect(isTimestampRevisionArtifact("1996-1788375243061")).toBe(true);
    expect(isValidEngineeringRevision("1996-1788375243061")).toBe(false);
    expect(normalizeEngineeringRevision("1996-1788375243061")).toEqual({
      revision: "A",
      pendingReview: true,
      rejected: "1996-1788375243061",
    });
  });

  it("accepts engineering revision patterns", () => {
    for (const revision of ["A", "B", "C", "0", "1", "2", "P1", "IFR", "IFC", "1996"]) {
      expect(isValidEngineeringRevision(revision)).toBe(true);
      expect(normalizeEngineeringRevision(revision).pendingReview).toBe(false);
    }
  });

  it("infers standard numbers from filenames without using the year as revision", () => {
    expect(inferStandardDocumentNumber("asnzs-1252-1996-excerpt.txt")).toBe("AS/NZS 1252:1996");
    expect(inferStandardDocumentNumber("AS_1755-1986_Conveyors_-_Design.pdf")).toBe("AS 1755:1986");
    expect(inferStandardDocumentNumber("AS 1755—1986")).toBe("AS 1755:1986");
    expect(preferCompleteStandardNumber("AS 1755", "AS 1755:1986")).toBe("AS 1755:1986");
  });

  it("reuses the same checksum identity instead of creating a second row", () => {
    const existing = {
      id: "canonical",
      document_number: "AS/NZS 1252:1996",
      revision: "A",
      file_name: "asnzs-1252-1996-excerpt.txt",
      file_size: 759,
      metadata: { source_sha256: "abc123" },
      status: "draft",
    };
    expect(
      resolveCanonicalDocumentRegistration({
        sourceChecksum: "abc123",
        fileName: "asnzs-1252-1996-excerpt.txt",
        fileSize: 759,
        existingByChecksum: existing,
        existingByNumberRevision: existing,
      }).action,
    ).toBe("reuse");
  });

  it("flags same number/revision with a different checksum for human review", () => {
    const existing = {
      id: "canonical",
      document_number: "AS/NZS 1252:1996",
      revision: "A",
      file_path: "t/w/d/A/file.pdf",
      metadata: { source_sha256: "aaa" },
      status: "draft",
    };
    const result = resolveCanonicalDocumentRegistration({
      sourceChecksum: "bbb",
      existingByNumberRevision: existing,
    });
    expect(result.action).toBe("conflict");
  });
});
