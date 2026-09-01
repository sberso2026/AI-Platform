import { describe, expect, it } from "vitest";
import {
  buildAuthLoginRedirect,
  buildAuthRecoveryRedirect,
  isBlockedAuthHost,
  normalizeAuthOrigin,
  resolveCanonicalAuthOrigin,
} from "./canonical-auth-origin";

const PILOT = "https://eos-pilot.rtbea.com.au";
const PREVIEW = "https://rtb-ai-platform-wkioaifl3-rtbea.vercel.app";
const PHI = "https://rtb-ai-platform-phi.vercel.app";

describe("canonical auth origin", () => {
  it("prefers NEXT_PUBLIC_APP_URL over VERCEL_URL and request origin", () => {
    expect(
      resolveCanonicalAuthOrigin({
        appUrl: PILOT,
        requestOrigin: PREVIEW,
        vercelUrl: "rtb-ai-platform-abc.vercel.app",
      }),
    ).toBe(PILOT);
  });

  it("does not use an arbitrary Preview hostname when the app URL is configured", () => {
    const origin = resolveCanonicalAuthOrigin({
      appUrl: PILOT,
      vercelUrl: PREVIEW,
    });
    expect(origin).toBe(PILOT);
    expect(origin?.includes("vercel.app")).toBe(false);
  });

  it("rejects localhost and the phi hobby hostname", () => {
    expect(normalizeAuthOrigin("http://localhost:3000")).toBeNull();
    expect(normalizeAuthOrigin("https://localhost")).toBeNull();
    expect(normalizeAuthOrigin(PHI)).toBeNull();
    expect(isBlockedAuthHost("rtb-ai-platform-phi.vercel.app")).toBe(true);
    expect(
      resolveCanonicalAuthOrigin({
        appUrl: "http://localhost:3000",
        requestOrigin: "http://127.0.0.1:3000",
        vercelUrl: PHI,
      }),
    ).toBeNull();
  });

  it("uses a safe HTTPS request origin when app URL is absent", () => {
    expect(
      resolveCanonicalAuthOrigin({
        requestOrigin: PILOT,
        vercelUrl: PREVIEW,
      }),
    ).toBe(PILOT);
  });

  it("does not treat a Vercel Preview Origin as a safe request origin", () => {
    expect(
      resolveCanonicalAuthOrigin({
        requestOrigin: PREVIEW,
        vercelUrl: "https://rtb-ai-platform-fallback.vercel.app",
      }),
    ).toBe("https://rtb-ai-platform-fallback.vercel.app");
  });

  it("falls back to VERCEL_URL only when app URL and safe origin are missing", () => {
    expect(
      resolveCanonicalAuthOrigin({
        vercelUrl: "rtb-ai-platform-fallback.vercel.app",
      }),
    ).toBe("https://rtb-ai-platform-fallback.vercel.app");
  });

  it("builds the login redirect on the canonical origin", () => {
    expect(buildAuthLoginRedirect({ appUrl: PILOT, vercelUrl: PREVIEW })).toBe(
      `${PILOT}/login`,
    );
  });

  it("builds the password recovery redirect on the canonical origin", () => {
    expect(buildAuthRecoveryRedirect({ appUrl: PILOT, vercelUrl: PREVIEW })).toBe(
      `${PILOT}/reset-password`,
    );
  });
});
