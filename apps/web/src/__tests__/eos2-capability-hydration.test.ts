import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("EOS 2.19 capability hydration hardening", () => {
  it("does not seed React state from sessionStorage during render", () => {
    const source = readFileSync(
      resolve(__dirname, "../hooks/use-engineering-capabilities.ts"),
      "utf8",
    );
    expect(source).toContain("SSR and the first client paint must share one tree");
    expect(source).toContain("OP-018-003");
    expect(source).not.toMatch(/const cached = typeof window !== "undefined" \? readCache\(\) : null;/);
    expect(source).toMatch(/loaded:\s*false/);
    expect(source).toMatch(/const cached = readCache\(\);\s*\n\s*if \(cached\)/);
  });

  it("labels engineering-basis overview as non-authoritative scaffold", () => {
    const page = readFileSync(
      resolve(__dirname, "../app/(platform)/engineering/(eos2)/engineering-basis/page.tsx"),
      "utf8",
    );
    const route = readFileSync(
      resolve(__dirname, "../app/api/engineering/engineering-basis/route.ts"),
      "utf8",
    );
    expect(page).toContain("Scaffold overview (not EOS 2 pilot persistence counts)");
    expect(page).toContain("engineering-basis-overview-scope");
    expect(route).toContain('viewSource: "unpersisted_scaffold"');
    expect(route).toContain("persistedBasisSetCount");
  });
});
