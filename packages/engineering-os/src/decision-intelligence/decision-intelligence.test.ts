import { describe, expect, it } from "vitest";
import {
  A2_WRITABLE_RELATIONS,
  assertGovernedRelationWrite,
  isA2WritableRelation,
  isGovernedRelationType,
  LEGACY_UNGOVERNED_RELATION_EXAMPLE,
} from "./relations";
import {
  assertAssumptionConfidence,
  assertHumanApprovalActor,
  assertSingleSelectedAlternative,
  assertSupersessionPair,
  detectSupersessionCycle,
} from "./invariants";

describe("EOS-A2 governed relations", () => {
  it("accepts A2 writable taxonomy codes", () => {
    for (const rel of A2_WRITABLE_RELATIONS) {
      expect(isA2WritableRelation(rel)).toBe(true);
      expect(isGovernedRelationType(rel)).toBe(true);
    }
  });

  it("rejects unrestricted relation strings on new writes", () => {
    expect(isA2WritableRelation(LEGACY_UNGOVERNED_RELATION_EXAMPLE)).toBe(false);
    expect(() =>
      assertGovernedRelationWrite({
        relationship: "contains",
        fromType: "project",
        toType: "decision",
      }),
    ).toThrow(/Ungoverned relation type/);
  });

  it("rejects unknown object types", () => {
    expect(() =>
      assertGovernedRelationWrite({
        relationship: "BASED_ON",
        fromType: "value_object",
        toType: "assumption",
      }),
    ).toThrow(/Object type not allowed/);
  });
});

describe("EOS-A2 decision invariants", () => {
  it("forbids autonomous approval", () => {
    expect(() => assertHumanApprovalActor("ai", "user-1")).toThrow(/Autonomous AI approval/);
    expect(() => assertHumanApprovalActor("human", "")).toThrow(/authorized human actor/);
  });

  it("allows at most one selected alternative", () => {
    expect(() =>
      assertSingleSelectedAlternative(
        [
          { id: "a", is_selected: true },
          { id: "b", is_selected: true },
        ],
        "a",
      ),
    ).toThrow(/at most one alternative/);
    expect(() =>
      assertSingleSelectedAlternative([{ id: "a", is_selected: true }], "a"),
    ).not.toThrow();
  });

  it("rejects self-supersession and cross-tenant supersession", () => {
    expect(() =>
      assertSupersessionPair({
        decisionId: "d1",
        supersedesDecisionId: "d1",
        tenantId: "t1",
        workspaceId: "w1",
        prior: { id: "d1", tenant_id: "t1", workspace_id: "w1" },
      }),
    ).toThrow(/cannot supersede itself/);
    expect(() =>
      assertSupersessionPair({
        decisionId: "d2",
        supersedesDecisionId: "d1",
        tenantId: "t1",
        workspaceId: "w1",
        prior: { id: "d1", tenant_id: "t2", workspace_id: "w1" },
      }),
    ).toThrow(/share tenant/);
  });

  it("detects supersession cycles", () => {
    expect(
      detectSupersessionCycle("a", [
        { id: "a", supersedes_decision_id: "b" },
        { id: "b", supersedes_decision_id: "a" },
      ]),
    ).toBe(true);
    expect(
      detectSupersessionCycle("a", [
        { id: "a", supersedes_decision_id: "b" },
        { id: "b", supersedes_decision_id: null },
      ]),
    ).toBe(false);
  });
});

describe("EOS-A2 assumption invariants", () => {
  it("validates confidence bounds", () => {
    expect(() => assertAssumptionConfidence(0.4)).not.toThrow();
    expect(() => assertAssumptionConfidence(1.2)).toThrow(/confidence/);
  });
});
