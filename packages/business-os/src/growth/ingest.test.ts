import { describe, expect, it } from "vitest";
import { GROWTH_DEMO_LEADS, GROWTH_DEMO_OPPORTUNITIES } from "./demo";

describe("BOS-3 growth ingestion contract", () => {
  it("allows leads without personal contact and uses integer money", () => {
    const noContact = GROWTH_DEMO_LEADS.find((l) => l.organisationName === "Northbound Civils");
    expect(noContact?.contactName).toBeUndefined();
    expect(noContact?.businessEmail).toBeUndefined();
    expect(noContact?.sourceType).toBe("public_directory");
    for (const opp of GROWTH_DEMO_OPPORTUNITIES) {
      if (opp.estimatedValueMinor != null) expect(String(opp.estimatedValueMinor)).toMatch(/^-?\d+$/);
      if (opp.probabilityBps != null) expect(String(opp.probabilityBps)).toMatch(/^\d+$/);
    }
  });

  it("uses source_type + source_ref as the natural idempotency key", () => {
    const keys = GROWTH_DEMO_LEADS.map((l) => `${l.sourceType}|${l.sourceRef}`);
    expect(new Set(keys).size).toBe(keys.length);
    const first = GROWTH_DEMO_LEADS[0];
    const duplicate = { ...first, owner: "Other" };
    expect(`${duplicate.sourceType}|${duplicate.sourceRef}`).toBe(`${first.sourceType}|${first.sourceRef}`);
  });
});
