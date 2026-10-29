import { describe, expect, it } from "vitest";
import { applyEos2Mode } from "../lib/commerce/eos2-rollout-mode";

describe("EOS 2 rollout mode merge", () => {
  it("creates the eos2 parent from null, empty, and unrelated settings", () => {
    for (const settings of [null, undefined, {}, { locale: "en" }]) {
      const applied = applyEos2Mode(settings, "controlled_pilot");
      expect(applied.ok).toBe(true);
      if (!applied.ok) continue;
      expect(applied.settings.eos2).toEqual({ mode: "controlled_pilot" });
      if (settings && typeof settings === "object" && "locale" in settings) {
        expect(applied.settings.locale).toBe("en");
      }
    }
  });

  it("replaces an existing mode and preserves sibling eos2 keys", () => {
    const applied = applyEos2Mode({ eos2: { mode: "controlled_pilot", note: "pilot" } }, "off");
    expect(applied).toMatchObject({
      ok: true,
      previousMode: "controlled_pilot",
      settings: { eos2: { mode: "off", note: "pilot" } },
    });
  });

  it("rejects a mode that is not off or controlled_pilot", () => {
    expect(applyEos2Mode({}, "ON")).toEqual({ ok: false, error: "invalid_mode" });
    expect(applyEos2Mode({}, "")).toEqual({ ok: false, error: "invalid_mode" });
  });

  it("keeps each sequential write equal to the mode that write persisted", () => {
    const first = applyEos2Mode({}, "controlled_pilot");
    const second = applyEos2Mode(first.ok ? first.settings : {}, "off");
    const third = applyEos2Mode(second.ok ? second.settings : {}, "controlled_pilot");
    expect(first.ok && first.settings.eos2?.mode).toBe("controlled_pilot");
    expect(second.ok && second.settings.eos2?.mode).toBe("off");
    expect(third.ok && third.settings.eos2?.mode).toBe("controlled_pilot");
  });
});
