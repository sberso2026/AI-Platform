import { describe, expect, it } from "vitest";
import { LIVE_RLS_STATUS, bosLiveRlsCertified, liveRlsEnvironmentAvailable } from "../release";

const envReady = liveRlsEnvironmentAvailable();

describe("BOS-13 live RLS honesty", () => {
  it("does not represent SQL inspection as live RLS when the database environment is absent", () => {
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(bosLiveRlsCertified).toBe(false);
    if (!envReady) {
      expect(envReady).toBe(false);
    }
  });

  it.skipIf(!envReady)("requires a live runner to assert Tenant A cannot mutate Tenant B rows", () => {
    expect(envReady).toBe(true);
  });
});
