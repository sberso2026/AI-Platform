import { describe, expect, it } from "vitest";
import {
  assertA3GovernedRelationWrite,
  A3_WRITABLE_RELATIONS,
  isGovernedRelationType,
} from "../decision-intelligence/relations";
import {
  assertNoSelfParent,
  assertSystemAssetRelation,
  assertInterfaceType,
  assertVerifiedEndpointCount,
  INTERFACE_TYPES,
  LEGACY_ASSET_SYSTEM_FIELD,
} from "./invariants";

describe("EOS-A3 relation semantics", () => {
  it("reuses CONTAINS USES CONNECTS without new taxonomy names", () => {
    expect(A3_WRITABLE_RELATIONS).toEqual(expect.arrayContaining(["CONTAINS", "USES", "CONNECTS"]));
    for (const rel of ["CONTAINS", "USES", "CONNECTS"]) {
      expect(isGovernedRelationType(rel)).toBe(true);
    }
  });

  it("allows system CONTAINS asset and interface CONNECTS system", () => {
    expect(() =>
      assertA3GovernedRelationWrite({ relationship: "CONTAINS", fromType: "system", toType: "asset" }),
    ).not.toThrow();
    expect(() =>
      assertA3GovernedRelationWrite({ relationship: "CONNECTS", fromType: "interface", toType: "system" }),
    ).not.toThrow();
  });

  it("rejects free-text relations", () => {
    expect(() =>
      assertA3GovernedRelationWrite({ relationship: "wired_to", fromType: "system", toType: "asset" }),
    ).toThrow(/Ungoverned relation type/);
  });

  it("distinguishes CONTAINS membership from USES shared dependency", () => {
    expect(() => assertSystemAssetRelation("CONTAINS")).not.toThrow();
    expect(() => assertSystemAssetRelation("USES")).not.toThrow();
    expect(() => assertSystemAssetRelation("CONNECTS")).toThrow(/CONTAINS/);
  });
});

describe("EOS-A3 hierarchy and interface invariants", () => {
  it("rejects self-parent", () => {
    expect(() => assertNoSelfParent("sys-1", "sys-1")).toThrow(/cannot parent itself/);
  });

  it("governs interface types", () => {
    for (const type of INTERFACE_TYPES) assertInterfaceType(type);
    expect(() => assertInterfaceType("mechanical")).toThrow(/Unknown interface type/);
  });

  it("requires two endpoints before verified", () => {
    expect(() => assertVerifiedEndpointCount("identified", 0)).not.toThrow();
    expect(() => assertVerifiedEndpointCount("verified", 1)).toThrow(/at least two endpoints/);
    expect(() => assertVerifiedEndpointCount("verified", 2)).not.toThrow();
  });

  it("keeps legacy asset.system field name as compatibility only", () => {
    expect(LEGACY_ASSET_SYSTEM_FIELD).toBe("system");
  });
});
