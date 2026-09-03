import { describe, expect, it } from "vitest";
import { extractNormativeFacts, selectDirectFact } from "./normative-extraction";
import { verifyClaimsAgainstEvidence } from "./claim-verification";

describe("normative extraction and claim verification", () => {
  it("extracts a maximum interval fact without document-specific constants in the matcher", () => {
    const facts = extractNormativeFacts({
      text: "Supports for cables shall be provided at intervals not exceeding 3.0 m. A cross cable may be installed.",
      page: 11,
      sectionPath: "4.1.2",
    });
    expect(facts.some((fact) => fact.operator === "MAX" && fact.value === "3.0" && fact.unit === "m")).toBe(true);
    const selected = selectDirectFact({
      query: "what is the maximum interval for cable supports?",
      excerpts: [{ text: facts[0]!.span, page: 11, sectionPath: "4.1.2" }],
    });
    expect(selected?.value).toBe("3.0");
  });

  it("marks numerical claims missing from evidence as unsupported", () => {
    const verified = verifyClaimsAgainstEvidence(
      "The maximum interval is 3.0 m and the operating force is 70 N.",
      "Supports shall be provided at intervals not exceeding 3.0 m.",
    );
    expect(verified.claims.some((claim) => claim.value === "70" && claim.support === "UNSUPPORTED")).toBe(true);
    expect(verified.unsupportedRequirementRate).toBeGreaterThan(0);
  });
});
