import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRootFromHere } from "./classify";

const root = repoRootFromHere();

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("EOS engineering standards reference and IP policy", () => {
  const policy = read("docs/architecture/engineering-os/EOS_ENGINEERING_STANDARDS_REFERENCE_AND_IP_POLICY.md");
  const cover = read("docs/architecture/engineering-os/EOS_D1_C10_C8_COVER_HUMAN_REVIEW_EVIDENCE.md");
  const crack = read("docs/architecture/engineering-os/EOS_D1_C10_C7_CRACK_WIDTH_HUMAN_REVIEW_EVIDENCE.md");
  const spacing = read("docs/architecture/engineering-os/EOS_D1_C10_C8_SPACING_HUMAN_REVIEW_EVIDENCE.md");
  const longTerm = read("docs/architecture/engineering-os/EOS_D1_C10_C7_LONG_TERM_HUMAN_REVIEW_EVIDENCE.md");

  it("requires an engineering basis and does not require a licensed document in the repository", () => {
    expect(policy).toContain("LICENSED_STANDARD_DOCUMENT_IN_REPOSITORY_REQUIRED: NO");
    expect(policy).toContain("AUTHORITATIVE_ENGINEERING_BASIS_REQUIRED: YES");
    expect(policy).toContain("ENGINEERING_METHOD_TRACEABILITY_REQUIRED: YES");
    expect(policy).toContain("INDEPENDENT_VALIDATION_REQUIRED: YES");
    expect(policy).toContain("STANDARD_REFERENCE_ALLOWED: YES");
    expect(policy).toContain("INDEPENDENT_IMPLEMENTATION_ALLOWED: YES");
    expect(policy).toContain("FULL_STANDARD_REPRODUCTION_DEFAULT: NO");
    expect(policy).toContain("SUBSTANTIAL_VERBATIM_REPRODUCTION_DEFAULT: NO");
    expect(policy).toContain("METHOD_MUST_BE_EXPRESSED_AS_RTB_ENGINEERING_SPECIFICATION: YES");
    expect(policy).toContain("DETERMINISTIC_ENGINE_REQUIRED_FOR_BOUND_NUMERICAL_METHOD: YES");
    expect(policy).toContain("AI_GENERATED_RESULT_COUNTS_AS_VALIDATION: NO");
    expect(policy).toContain("EOS_RESULT_USED_AS_OWN_REFERENCE: NO");
    expect(policy).toContain("NATIONAL_ANNEX_HARD_CODED_GLOBALLY: NO");
    expect(policy).not.toContain("LICENSED_STANDARD_DOCUMENT_IN_REPOSITORY_REQUIRED: YES");
  });

  it("reclassifies the future C7 prerequisite without implementing calculated mode", () => {
    expect(policy).toContain("OLD_BLOCKER_CONCEPT: EXACT_NORMATIVE_SOURCE_REQUIRED");
    expect(policy).toContain("NEW_BLOCKER_CONCEPT: AUTHORITATIVE_ENGINEERING_METHOD_BASIS_REQUIRED");
    expect(policy).toContain("C7_CALCULATED_MODE_IMPLEMENTED: NO");
    expect(policy).toContain("FROZEN_RUNTIME_BASELINE_CHANGED: NO");
    expect(policy).toContain("9b2c325cdad7b78d");
    expect(policy).toContain("REVIEW_INCOMPLETE");
  });

  it("leaves the recorded human-review outcomes unchanged", () => {
    expect(cover).toContain("291c17190f884252");
    expect(cover).toContain("ACCEPTED_FOR_STATED_SCOPE");
    expect(crack).toContain("92dd6720e23d0286");
    expect(crack).toContain("ACCEPTED_FOR_STATED_SCOPE");
    expect(spacing).toContain("98350cdff747d872");
    expect(spacing).toContain("ACCEPTED_FOR_STATED_SCOPE");
    expect(longTerm).toContain("9b2c325cdad7b78d");
    expect(longTerm).toContain("REVIEW_INCOMPLETE");
    expect(longTerm.replace(/\r\n/g, "\n")).toContain("INDEPENDENT_RESULT:\nBLANK");
    expect(policy).toContain("HISTORICAL_EVIDENCE_REWRITTEN: NO");
  });
});
