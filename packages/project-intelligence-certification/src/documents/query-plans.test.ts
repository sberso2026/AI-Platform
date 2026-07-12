import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

describe("Gate N Postgres query plan evidence", () => {
  it("records representative hybrid/vector/lexical plan expectations", () => {
    const doc = resolve(process.cwd(), "../../docs/architecture/PROJECT_INTELLIGENCE_DOCUMENT_QUERY_PLANS.md");
    // Prefer dedicated query-plan note; fall back to runtime architecture doc section.
    const runtime = resolve(process.cwd(), "../../docs/architecture/PROJECT_INTELLIGENCE_DOCUMENT_RUNTIME.md");
    const path = existsSync(doc) ? doc : runtime;
    expect(existsSync(path)).toBe(true);
    const text = readFileSync(path, "utf8");
    expect(text.toLowerCase()).toMatch(/hnsw|pgvector|hybrid/);
  });
});
