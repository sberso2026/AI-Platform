import { describe, expect, it } from "vitest";
import { scoreLead, enrichmentStatus } from "./lead-score";
import { GROWTH_DEMO_PROFILE } from "./demo";

describe("scoreLead", () => {
  it("scores a complete in-profile lead deterministically", () => {
    const score = scoreLead(
      {
        organisationName: "Northbound Civils",
        industry: "civil",
        geography: "AU",
        companySizeBand: "mid",
        services: "engineering",
        targetMarket: "public_infrastructure",
        website: "https://northbound.example",
        evidenceOfNeed: true,
        relationshipKind: "referral",
      },
      GROWTH_DEMO_PROFILE,
    );
    expect(score.version).toBe("lead_score.v1");
    expect(score.total).toBe(100);
    expect(score.missingInputs).toEqual([]);
    expect(score.components).toHaveLength(8);
  });

  it("allows a lead with no personal contact", () => {
    const score = scoreLead(
      {
        organisationName: "Directory listing",
        industry: "civil",
        geography: "AU",
      },
      GROWTH_DEMO_PROFILE,
    );
    expect(score.components.find((c) => c.id === "industry_fit")?.score).toBe(15);
    expect(score.missingInputs).toContain("service_fit");
    expect(score.missingInputs).toContain("evidence_of_need");
  });

  it("does not fabricate missing enrichment", () => {
    const score = scoreLead({ organisationName: "Unknown Co" }, GROWTH_DEMO_PROFILE);
    expect(score.components.find((c) => c.id === "industry_fit")?.score).toBeNull();
    expect(score.missingInputs).toContain("industry_fit");
    expect(enrichmentStatus({ organisationName: "Unknown Co" })).toBe("none");
  });

  it("returns zero fit when industry is outside the target list", () => {
    const score = scoreLead({ organisationName: "X", industry: "retail" }, GROWTH_DEMO_PROFILE);
    expect(score.components.find((c) => c.id === "industry_fit")?.score).toBe(0);
  });
});
