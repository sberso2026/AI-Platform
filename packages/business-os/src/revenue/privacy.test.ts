import { describe, expect, it } from "vitest";
import { REVENUE_DEMO_DRAFTS } from "./demo";
import { GROWTH_DEMO_LEADS } from "../growth/demo";

describe("BOS-4 privacy / suppression", () => {
  it("does not prepare demo outreach against suppressed growth leads", () => {
    expect(GROWTH_DEMO_LEADS.every((lead) => lead.suppressed !== true)).toBe(true);
    for (const draft of REVENUE_DEMO_DRAFTS) {
      expect(draft.type === "internal_note" || draft.recipientContext == null).toBe(true);
      expect(draft.provenance?.externalSend).toBe(false);
    }
  });
});
