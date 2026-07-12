import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { isHashEmbeddingProvider } from "@rtb/project-intelligence/server";

describe("Gate O provider security and privacy", () => {
  it("security document exists and forbids client keys and hash production readiness", () => {
    const path = resolve(process.cwd(), "../../docs/security/PROJECT_INTELLIGENCE_DOCUMENT_PROVIDER_SECURITY.md");
    expect(existsSync(path)).toBe(true);
    const text = readFileSync(path, "utf8");
    expect(text).toMatch(/Server-only/);
    expect(text).toMatch(/Hash embedding/);
    expect(isHashEmbeddingProvider("platform-staging-hash")).toBe(true);
    expect(isHashEmbeddingProvider("openai")).toBe(false);
  });
});
