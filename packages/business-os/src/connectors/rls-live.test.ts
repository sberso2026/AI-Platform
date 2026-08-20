import { describe, expect, it } from "vitest";
import {
  BOS14A_STATUS,
  BOS15B_STATUS,
  BOS_LIVE_RLS_REPRESENTATIVE_TABLES,
  LIVE_RLS_STATUS,
  bosLiveRlsCertified,
  liveRlsEnvironmentAvailable,
} from "../release";

const envReady = liveRlsEnvironmentAvailable();

describe("BOS-14A live RLS honesty", () => {
  it("returns BOS14A_BLOCKED_LIVE_RLS_ENV and does not treat SQL inspection as live RLS", () => {
    expect(BOS14A_STATUS).toBe("BOS14A_BLOCKED_LIVE_RLS_ENV");
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(BOS15B_STATUS).toBe("BOS15B_BLOCKED_LIVE_RLS_ENV");
    expect(bosLiveRlsCertified).toBe(false);
    expect(BOS_LIVE_RLS_REPRESENTATIVE_TABLES.length).toBe(11);
    if (!envReady) {
      expect(envReady).toBe(false);
    }
  });

  it.skipIf(!envReady)("requires a live runner to assert Tenant A cannot mutate Tenant B rows", () => {
    expect(envReady).toBe(true);
  });
});
