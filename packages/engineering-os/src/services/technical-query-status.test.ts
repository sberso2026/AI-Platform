import { describe, expect, it } from "vitest";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { mapTechnicalQueryStatus } from "./technical-query-status";

describe("mapTechnicalQueryStatus", () => {
  it("maps canonical and presentation aliases", () => {
    expect(mapTechnicalQueryStatus(undefined)).toBe("responded");
    expect(mapTechnicalQueryStatus("responded")).toBe("responded");
    expect(mapTechnicalQueryStatus("answered")).toBe("responded");
    expect(mapTechnicalQueryStatus("open")).toBe("open");
    expect(mapTechnicalQueryStatus("closed")).toBe("closed");
  });

  it("rejects invalid transitions with 422", () => {
    try {
      mapTechnicalQueryStatus("approved");
      throw new Error("expected 422");
    } catch (err) {
      expect(err).toBeInstanceOf(CommerceDomainError);
      expect((err as CommerceDomainError).statusCode).toBe(422);
      expect((err as CommerceDomainError).code).toBe("invalid_transition");
    }
  });
});
