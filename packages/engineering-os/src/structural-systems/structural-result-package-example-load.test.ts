import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { decodeStructuralResultPackageExample, D1G_VALIDATION_COMPARISONS } from "./d1g-validation-route-execution";

const examplePath = join(dirname(fileURLToPath(import.meta.url)), "eos-structural-result-package-v1.example.json");
const exampleBytes = readFileSync(examplePath);

describe("structural result package example production load", () => {
  it("keeps the repository fixture bytes and the executed comparison results", () => {
    const decoded = decodeStructuralResultPackageExample(exampleBytes.toString("base64"));
    expect(Buffer.from(decoded).equals(exampleBytes)).toBe(true);
    expect(createHash("sha256").update(decoded).digest("hex")).toBe(createHash("sha256").update(exampleBytes).digest("hex"));
    expect(D1G_VALIDATION_COMPARISONS.map((row) => row.referenceResult)).toEqual([-12500, 12500]);
    expect(D1G_VALIDATION_COMPARISONS.every((row) => row.result === "PASS" && row.referenceResult === row.eosResult)).toBe(true);
  });

  it("fails closed without a path or a substitute package when the bundled fixture is missing", () => {
    expect(() => decodeStructuralResultPackageExample("")).toThrow("D1G_RESULT_PACKAGE_EXAMPLE_UNAVAILABLE");
    try {
      decodeStructuralResultPackageExample("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).toBe("D1G_RESULT_PACKAGE_EXAMPLE_UNAVAILABLE");
      expect(message).not.toMatch(/vercel|[/\\]/);
    }
  });
});
