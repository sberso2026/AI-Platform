import { describe, expect, it } from "vitest";
import { chunkParsedDocument } from "../src/documents/chunking";
import type { ParsedDocument } from "../src/documents/parser";

const parsed: ParsedDocument = {
  parserProvider: "native-text",
  parserVersion: "1.0.0",
  confidence: 0.9,
  warnings: [],
  pages: [
    {
      pageNumber: 1,
      text: "Scope\n\nDesign pressure is 10 bar.\n\n| Tag | Value |\n| P-1 | 10 |",
      blocks: [
        { type: "heading", text: "Scope", page: 1, confidence: 0.9 },
        { type: "paragraph", text: "Design pressure is 10 bar.", page: 1, sectionPath: "Scope", confidence: 0.9 },
        {
          type: "table",
          text: "| Tag | Value |\n| P-1 | 10 |",
          page: 1,
          sectionPath: "Scope",
          table: { headers: ["Tag", "Value"], rows: [["P-1", "10"]], page: 1 },
          confidence: 0.95,
        },
      ],
    },
  ],
};

describe("chunking lineage", () => {
  it("produces deterministic stable chunk ids and preserves table blocks", () => {
    const context = {
      tenantId: "t1",
      workspaceId: "w1",
      engineeringProjectId: "p1",
      engineeringDocumentId: "doc-1",
      revision: "A",
      processingVersion: "1",
    };
    const first = chunkParsedDocument(parsed, context);
    const second = chunkParsedDocument(parsed, context);

    expect(first.map((chunk) => chunk.stableChunkId)).toEqual(second.map((chunk) => chunk.stableChunkId));
    expect(first.some((chunk) => chunk.blockType === "table")).toBe(true);
    const table = first.find((chunk) => chunk.blockType === "table");
    expect(table?.tablePayload).toMatchObject({ headers: ["Tag", "Value"], rows: [["P-1", "10"]] });
    expect(first.every((chunk) => chunk.engineeringDocumentId === "doc-1" && chunk.revision === "A")).toBe(true);
    expect(first.every((chunk) => chunk.contentHash.length === 64)).toBe(true);
  });
});
