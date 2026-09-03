import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORBIDDEN = [
  /AS 1755/i,
  /4\.8\.7\.6/,
  /4\.5 m/,
  /\blanyard\b/i,
  /pull wire/i,
  /70 N/,
  /230 N/,
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "tests") continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, acc);
    else if (/\.(ts|tsx|js)$/.test(entry.name)) acc.push(path);
  }
  return acc;
}

describe("anti-overfit: production structure/QA logic", () => {
  it("does not embed founder document numbers, clauses, values, or question strings", () => {
    const files = [
      ...walk(join(ROOT, "src/documents")),
      join(ROOT, "../engineering-os/src/services/document-structure.ts"),
      join(ROOT, "../engineering-os/src/services/normative-extraction.ts"),
      join(ROOT, "../engineering-os/src/services/document-grounded-answer.ts"),
      join(ROOT, "../engineering-os/src/services/claim-verification.ts"),
    ];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN) {
        expect(text, `${file} ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
