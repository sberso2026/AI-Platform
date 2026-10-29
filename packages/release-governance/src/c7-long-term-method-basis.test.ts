import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRootFromHere } from "./classify";

const root = repoRootFromHere();

function read(path: string): string {
  return readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
}

describe("C7 calculated long-term method basis", () => {
  const basis = read("docs/architecture/engineering-os/EOS_C7_LONG_TERM_CALCULATED_METHOD_BASIS.md");
  const historical = read("docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md");

  it("records an independently authored basis without implementing calculated mode", () => {
    expect(basis).toContain("LICENSED_STANDARD_DOCUMENT_IN_REPOSITORY_REQUIRED: NO");
    expect(basis).toContain("AUTHORITATIVE_ENGINEERING_METHOD_BASIS_REQUIRED: YES");
    expect(basis).toContain("RTB_INDEPENDENTLY_AUTHORED_METHOD_SPECIFICATION: YES");
    expect(basis).toContain("C7_CALCULATED_MODE_IMPLEMENTED: NO");
    expect(basis).toContain("CREEP_METHOD_ID: RTB-C7-GEN1-INFORMATIVE-CREEP-HB3");
    expect(basis).toContain("SHRINKAGE_METHOD_ID: RTB-C7-GEN1-INFORMATIVE-SHRINKAGE-HB3");
    expect(basis).toContain("SILENT_ENGINEERING_DEFAULT_ALLOWED: NO");
    expect(basis).toContain("PHI_EF_CALCULATED: NO");
    expect(basis).toContain("OLD_VALUES_USED_AS_CALCULATED_BENCHMARK: NO");
    expect(basis).toContain("SELF_REFERENCE_ALLOWED: NO");
    expect(basis).toContain("READY_FOR_CALCULATED_MODE_IMPLEMENTATION: YES");
  });

  it("preserves the historical explicit-state review", () => {
    expect(historical).toContain("FROZEN_FINGERPRINT:\n9b2c325cdad7b78d");
    expect(historical).toContain("REVIEWER_OUTCOME:\nREVIEW_INCOMPLETE");
    expect(historical).toContain("INDEPENDENT_RESULT:\nBLANK");
    expect(basis).toContain("OLD_C7_HUMAN_REVIEW_PRESERVED: YES");
    expect(basis).toContain("C7_LONG_TERM_REVIEW_STATUS: REVIEW_INCOMPLETE");
  });
});
