import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  APPLICATION_RELEASE_IDENTITY_ADR,
  APPLICATION_RELEASE_SEMVER,
  GA_TAG_FORCE_UPDATE_FORBIDDEN,
  GA_TAG_IMMUTABLE,
  RELEASE_MANIFEST_DOES_NOT_SUPERSEDE_HISTORICAL_GA_TAG,
  assertGaTagMatchesVersion,
  formatApplicationGaTag,
  isApplicationGaTag,
} from "./application-release-identity";

const ROOT = resolve(import.meta.dirname, "../../../..");

describe("RTB application release identity policy", () => {
  it("is recorded as an accepted ADR with required rules", () => {
    const adrPath = resolve(ROOT, APPLICATION_RELEASE_IDENTITY_ADR);
    expect(existsSync(adrPath)).toBe(true);
    const adr = readFileSync(adrPath, "utf8");
    expect(adr).toMatch(/Status: Accepted/);
    expect(adr).toMatch(/Immutable GA tags/);
    expect(adr).toMatch(/Semantic version advancement/);
    expect(adr).toMatch(/\*\*PATCH\*\*/);
    expect(adr).toMatch(/\*\*MINOR\*\*/);
    expect(adr).toMatch(/\*\*MAJOR\*\*/);
    expect(adr).toMatch(/Second-generation product line/);
    expect(adr).toMatch(/historical certification/);
    expect(adr).toMatch(/Force-push of a GA tag is forbidden/);
  });

  it("locks immutability and tag pattern primitives", () => {
    expect(GA_TAG_IMMUTABLE).toBe(true);
    expect(GA_TAG_FORCE_UPDATE_FORBIDDEN).toBe(true);
    expect(RELEASE_MANIFEST_DOES_NOT_SUPERSEDE_HISTORICAL_GA_TAG).toBe(true);
    expect(isApplicationGaTag("project-intelligence-v1.0.0")).toBe(true);
    expect(isApplicationGaTag("project-intelligence-v1.1.0")).toBe(true);
    expect(isApplicationGaTag("engineering-os-v1.0.0")).toBe(true);
    expect(isApplicationGaTag("project-intelligence-v1.0.0-moved")).toBe(false);
    expect(formatApplicationGaTag("project-intelligence", "1.1.0")).toBe(
      "project-intelligence-v1.1.0",
    );
    expect(() =>
      assertGaTagMatchesVersion(
        "project-intelligence-v1.1.0",
        "project-intelligence",
        "1.1.0",
      ),
    ).not.toThrow();
  });

  it("defines patch, minor, and major criteria", () => {
    expect(APPLICATION_RELEASE_SEMVER.patch).toMatch(/defect repair/i);
    expect(APPLICATION_RELEASE_SEMVER.minor).toMatch(/additive/i);
    expect(APPLICATION_RELEASE_SEMVER.major).toMatch(/Breaking public-contract/i);
    expect(APPLICATION_RELEASE_SEMVER.secondGenerationProductLine).toMatch(
      /New application key/,
    );
  });
});
