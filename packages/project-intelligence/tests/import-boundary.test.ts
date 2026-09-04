import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve(__dirname, "../src");

describe("Project Intelligence import boundary", () => {
  it("does not re-export heavy parsers from the server barrel", () => {
    const server = readFileSync(resolve(SRC, "server.ts"), "utf8");
    expect(server).toContain("NO_HEAVY_PARSER_IMPORT_IN_GENERAL_PI_API_PATHS");
    expect(server).not.toContain("./documents/parser-routing");
    expect(server).not.toContain("./documents/document-worker");
    expect(server).not.toContain("pdf-parse");
  });

  it("keeps native PDF parsing on the parsers entry only", () => {
    const parsers = readFileSync(resolve(SRC, "parsers.ts"), "utf8");
    expect(parsers).toContain("./documents/native-parsers");
    expect(parsers).toContain("./documents/parser-routing");
    expect(readFileSync(resolve(SRC, "documents/native-parsers.ts"), "utf8")).toContain('from "pdf-parse"');
  });
});
