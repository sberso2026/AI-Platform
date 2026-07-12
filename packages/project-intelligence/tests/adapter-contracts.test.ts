import { describe, expect, it } from "vitest";
import { UnavailableLegacySourceAdapter, createLegacySourceAdapter } from "../src/adapters/legacy-source-adapter.js";

describe("adapter contracts", () => {
  it("returns an availability report including correlation id", async () => {
    const adapter = createLegacySourceAdapter();
    await expect(adapter.availability({ correlationId: "corr-1", timeoutMs: 500 })).resolves.toMatchObject({ available: false, correlationId: "corr-1" });
    expect(adapter).toBeInstanceOf(UnavailableLegacySourceAdapter);
  });
});
