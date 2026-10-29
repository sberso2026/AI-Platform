import { describe, expect, it } from "vitest";
import { scanReviewSecrets } from "../scripts/secret-scan";

describe("Review secret scan", () => {
  it("finds no committed private keys, JWTs, or assigned service-role secrets in Review trees", () => {
    const result = scanReviewSecrets();
    expect(result.findings, result.findings.join("\n")).toEqual([]);
    expect(result.files).toBeGreaterThan(10);
  });
});
