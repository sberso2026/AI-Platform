import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EU_CONCRETE_PACK_CERTIFIED, EU_CONCRETE_PRODUCT_CLAIM_LEVEL, EU_CONCRETE_STANDARD_CONFORMANCE_STATE } from "@rtb/types";
import { D1E_INTERNAL_ROADMAP } from "./capability";
import {
  aggregateEuC9MemberChecks,
  assertEuC9FoundationPreservesPriorLimits,
  EU_C9_BASIC_ANCHORAGE_EQUALS_DESIGN_ANCHORAGE,
  EU_C9_C6_C4_HANDOFF_STATE,
  EU_C9_C6_USED_AS_GENERAL_SECOND_ORDER_ANALYSIS,
  EU_C9_C7_SLS_REFERENCE_EQUALS_COMPLETE_SLS,
  EU_C9_MEMBER_CAPABILITY_MATRIX,
  EU_C9_R1_FIRST_MEMBER_IMPLEMENTATION,
  EU_C9_R1_RUNTIME_MEMBER_ORCHESTRATOR_COUNT,
  EU_C9_UNAVAILABLE_CHECK_CAN_BE_COUNTED_AS_PASS,
  euC9ExecutionDagHasCycle,
  NEW_C9_BEAM_RUNTIME_ORCHESTRATOR_IMPLEMENTED,
  NEW_ENGINEERING_FORMULA_IN_ORCHESTRATION_FRAMEWORK,
} from "./eu-c9/foundation";

describe("EOS-D1E-EU-C9-R1 member orchestration foundation", () => {
  it("records compatibility without a runtime member orchestrator", () => {
    expect(EU_C9_R1_FIRST_MEMBER_IMPLEMENTATION).toBe("BEAM");
    expect(EU_C9_R1_RUNTIME_MEMBER_ORCHESTRATOR_COUNT).toBe(0);
    expect(NEW_C9_BEAM_RUNTIME_ORCHESTRATOR_IMPLEMENTED).toBe(false);
    expect(NEW_ENGINEERING_FORMULA_IN_ORCHESTRATION_FRAMEWORK).toBe(false);
    expect(EU_C9_C6_USED_AS_GENERAL_SECOND_ORDER_ANALYSIS).toBe(false);
    expect(EU_C9_C6_C4_HANDOFF_STATE).toBe("BLOCKED_MISSING_AUTHORITY");
    expect(EU_C9_C7_SLS_REFERENCE_EQUALS_COMPLETE_SLS).toBe(false);
    expect(EU_C9_BASIC_ANCHORAGE_EQUALS_DESIGN_ANCHORAGE).toBe(false);
    expect(EU_C9_MEMBER_CAPABILITY_MATRIX.BEAM["D1E.EU.C5.PUNCHING"]).toBe("NOT_APPLICABLE");
    expect(EU_C9_MEMBER_CAPABILITY_MATRIX.COLUMN["D1E.EU.C6.NOMINAL_CURVATURE"]).toBe("APPLICABLE_WITH_RESTRICTIONS");
    expect(EU_C9_UNAVAILABLE_CHECK_CAN_BE_COUNTED_AS_PASS).toBe(false);
    expect(aggregateEuC9MemberChecks(["SATISFIED", "NOT_APPLICABLE"])).toBe("MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE");
    expect(aggregateEuC9MemberChecks(["SATISFIED", "DEFERRED"])).toBe("MEMBER_INCOMPLETE");
    expect(aggregateEuC9MemberChecks(["SATISFIED", "NOT_IMPLEMENTED"])).toBe("MEMBER_INCOMPLETE");
    expect(aggregateEuC9MemberChecks(["SATISFIED", "UNDETERMINED"])).toBe("MEMBER_UNDETERMINED");
    expect(aggregateEuC9MemberChecks(["NOT_SATISFIED", "DEFERRED"])).toBe("MEMBER_NOT_SATISFIED");
    expect(euC9ExecutionDagHasCycle()).toBe(false);
    expect(() => assertEuC9FoundationPreservesPriorLimits()).not.toThrow();
    const source = readFileSync(new URL("./eu-c9/foundation.ts", import.meta.url), "utf8");
    expect(source).not.toContain("fyd");
    expect(source).not.toMatch(/Math\./);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R1-MEMBER-ORCHESTRATION-FOUNDATION")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C9-R2-BEAM-ORCHESTRATION")?.status).toBe("NOT_STARTED");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
  });
});
