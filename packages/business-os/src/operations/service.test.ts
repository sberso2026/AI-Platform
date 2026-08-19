import { describe, expect, it } from "vitest";
import { createBusinessOS } from "../business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { ENGINEERING_PROJECT_LINK_CONTRACT, DECISION_ACTION_INTELLIGENCE_CONTRACT } from "./extensions";
import { OPERATIONS_DEMO_COSTS, OPERATIONS_DEMO_WORK } from "./demo";

describe("BOS-7 work operations service guards", () => {
  it("forbids autonomous assignment, external project writes, and autonomous completion", () => {
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(() => bos.workOperations.allocateResourcesAutonomously()).toThrow("autonomous_assignment_forbidden");
    expect(() => bos.workOperations.writeExternalProjectSystem()).toThrow("external_project_write_forbidden");
    expect(() => bos.workOperations.approveCompletionAutonomously()).toThrow("autonomous_completion_forbidden");
    expect(bos.workOperations.engineeringLink()).toEqual(ENGINEERING_PROJECT_LINK_CONTRACT);
    expect(bos.workOperations.decisionAction().available).toBe(true);
    expect(DECISION_ACTION_INTELLIGENCE_CONTRACT.implemented).toBe(true);
  });
});

describe("BOS-7 ingestion contract", () => {
  it("uses source_type + source_ref as the natural idempotency key", () => {
    const keys = OPERATIONS_DEMO_WORK.map((row) => `${row.sourceType}|${row.sourceRef}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(OPERATIONS_DEMO_COSTS.map((row) => row.valueState)).toEqual(
      expect.arrayContaining(["actual", "forecast", "budget"]),
    );
  });

  it("keeps operational cost as integer minor units", () => {
    for (const fact of OPERATIONS_DEMO_COSTS) {
      expect(String(fact.amountMinor)).toMatch(/^-?\d+$/);
    }
  });

  it("covers work without customer, without progress, and engineering reference-only linkage", () => {
    expect(OPERATIONS_DEMO_WORK.some((row) => row.provenance?.noCustomer)).toBe(true);
    expect(OPERATIONS_DEMO_WORK.some((row) => row.progressBps == null && row.provenance?.noProgress)).toBe(true);
    const linked = OPERATIONS_DEMO_WORK.find((row) => row.linkedEngineeringProjectRef);
    expect(linked?.linkedEngineeringProjectRef).toBe("EOS-PRJ-NORTHBOUND");
    expect(ENGINEERING_PROJECT_LINK_CONTRACT.readsEngineeringTables).toBe(false);
    expect(ENGINEERING_PROJECT_LINK_CONTRACT.writesEngineeringOs).toBe(false);
    expect(ENGINEERING_PROJECT_LINK_CONTRACT.mode).toBe("stable_reference");
  });
});
