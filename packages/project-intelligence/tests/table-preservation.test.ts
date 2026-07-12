import { describe, expect, it } from "vitest";
import { chunkParsedDocument } from "../src/documents/chunking";
import type { ParsedDocument } from "../src/documents/parser";

describe("table structure preservation", () => {
  it("keeps table rows as structured chunks with headers and units", () => {
    const parsed: ParsedDocument = {
      pages: [
        {
          pageNumber: 1,
          text: "Nozzle schedule",
          blocks: [
            {
              type: "table",
              text: "Tag|Size|Rating\nN1|DN100|300#\nN2|DN50|150#",
              page: 1,
              confidence: 0.9,
              table: {
                title: "Nozzle schedule",
                headers: ["Tag", "Size", "Rating"],
                rows: [
                  ["N1", "DN100", "300#"],
                  ["N2", "DN50", "150#"],
                ],
                footnotes: ["Ratings per ASME B16.5"],
              },
            },
          ],
        },
      ],
      language: "en",
      parserProvider: "native-text",
      parserVersion: "1.0.0",
      confidence: 0.9,
      warnings: [],
    };

    const chunks = chunkParsedDocument(parsed, {
      tenantId: "t1",
      workspaceId: "w1",
      engineeringDocumentId: "d1",
      revision: "A",
      processingVersion: "1",
    });

    const tableChunk = chunks.find((chunk) => chunk.blockType === "table");
    expect(tableChunk).toBeTruthy();
    expect(tableChunk?.content).toContain("Tag");
    expect(tableChunk?.content).toContain("DN100");
    expect(tableChunk?.content).toContain("300#");
    expect(tableChunk?.tablePayload?.headers).toEqual(["Tag", "Size", "Rating"]);
    expect(tableChunk?.tablePayload?.title).toBe("Nozzle schedule");
    expect(tableChunk?.tablePayload?.footnotes).toContain("Ratings per ASME B16.5");
  });
});
