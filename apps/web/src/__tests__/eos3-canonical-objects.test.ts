import { describe, expect, it } from "vitest";
import {
  EOS3_OBJECT_IMPLEMENTATION_STATUS,
  EOS3_OBJECT_TYPES,
  assertImplementedNotQualified,
} from "../lib/engineering/eos3-canonical-objects";
import { EOS3_GRAPH_AUTHORITY_MODEL, baselinesContainingRevision, evidenceSupportingDecision, requirementsDrivingObject, traceDigitalThread } from "../lib/engineering/eos3-digital-thread";
import { mappingDefined, EOS2_TO_EOS3_OBJECT_MAPPING } from "../lib/engineering/eos3-object-mapping";
import { aiMayPerform, assertHumanAuthority, interfaceAuthorityBoundary } from "../lib/engineering/eos3-object-authority";
import { runEos3StagingCanonicalWorkflow } from "../lib/engineering/eos3-staging-workflow";
import { listStructuredObjects, structuredOutranksVector } from "../lib/engineering/eos3-structured-retrieval";
import { evaluateEos3Access } from "../lib/commerce/eos3-entitlement";
import { EOS3_VERSION, EOS3_RELEASE_STATUS } from "../lib/commerce/eos3-identity";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE, getEos2ExternalCustomerHoldState } from "../lib/commerce/eos2-external-customer-hold";

describe("EOS 3.2 canonical object and digital thread", () => {
  it("preserves EOS 3.1 foundation identity and fail-closed access", () => {
    expect(EOS3_VERSION).toBe("3.0.0");
    expect(EOS3_RELEASE_STATUS).toBe("GENERAL_AVAILABILITY");
    expect(
      evaluateEos3Access({
        authenticated: true,
        requestedProductKey: "eos-3",
        tenantId: "t",
        workspaceId: "w",
        record: null,
        enrollmentState: "DEVELOPMENT",
        productionEnvironment: true,
      }).reason,
    ).toBe("production_denied");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
    expect(getEos2ExternalCustomerHoldState().externalCustomerOnboardingAuthorized).toBe(false);
  });

  it("implements all canonical object families with status classification", () => {
    expect(EOS3_OBJECT_TYPES.length).toBe(19);
    for (const t of EOS3_OBJECT_TYPES) {
      expect(EOS3_OBJECT_IMPLEMENTATION_STATUS[t]).toBeTruthy();
    }
    expect(EOS3_OBJECT_IMPLEMENTATION_STATUS.OptimizationRun).toBe("NEW_EOS3_OBJECT");
    expect(mappingDefined()).toBe(true);
    expect(EOS2_TO_EOS3_OBJECT_MAPPING.length).toBe(19);
  });

  it("runs staging digital-thread workflow with authority and immutability", () => {
    const result = runEos3StagingCanonicalWorkflow();
    // Exact staging workflow sizes for phase evidence.
    expect(result.objectCount).toBe(20);
    expect(result.relationshipCount).toBe(25);
    expect(result.threadTraceLength).toBeGreaterThan(5);
    expect(result.performanceMs).toBeGreaterThanOrEqual(0);
    // eslint-disable-next-line no-console
    console.log(
      "EOS32_STAGING_COUNTS",
      JSON.stringify({
        objectCount: result.objectCount,
        relationshipCount: result.relationshipCount,
        threadTraceLength: result.threadTraceLength,
        performanceMs: result.performanceMs,
      }),
    );
    expect(result.calculationQualification.d1).toBe("QUALIFIED_BOUNDED");
    expect(result.calculationQualification.nonD1).toBe("IMPLEMENTED");
    expect(result.calculationQualification.externalSolver).toBe("IMPLEMENTED");
    expect(assertImplementedNotQualified("IMPLEMENTED").qualified).toBe(false);
    expect(assertImplementedNotQualified("QUALIFIED_BOUNDED").qualified).toBe(true);

    const view = result.store.view();
    const discipline = [...result.store.objects.values()].find((o) => o.objectType === "DisciplineObject")!;
    const decision = [...result.store.objects.values()].find((o) => o.objectType === "Decision")!;
    const baseline = [...result.store.objects.values()].find((o) => o.objectType === "Baseline")!;
    const deliverable = [...result.store.objects.values()].find((o) => o.objectType === "Deliverable")!;
    const revA = [...result.store.revisions.values()].find((r) => r.revisionIdentifier === "A")!;

    expect(requirementsDrivingObject(view, discipline.id).length).toBeGreaterThan(0);
    expect(evidenceSupportingDecision(view, decision.id).length).toBeGreaterThan(0);
    expect(baselinesContainingRevision(view, revA.id).some((b) => b.id === baseline.id)).toBe(true);
    expect(deliverable.governedState).toBe("STALE");
    expect(decision.payload.decisionMaker).toBeTruthy();
    expect(baseline.governedState).toBe("FROZEN");
    expect(result.store.baselineMembers[0].memberRevisionId).toBe(revA.id);

    expect(() => result.store.mutateRevisionPayload(revA.id, { massKg: 9999 })).toThrow(/revision_immutable/);
    expect(() => result.store.rewriteBaselineMembership(baseline.id)).toThrow(/baseline_immutable/);
    expect(traceDigitalThread(view, discipline.id).length).toBeGreaterThan(3);
    expect(listStructuredObjects(result.store).length).toBe(result.objectCount);
    expect(structuredOutranksVector()).toBe(true);
    expect(EOS3_GRAPH_AUTHORITY_MODEL).toBe("STRUCTURED_CANONICAL_STATE");
    expect(interfaceAuthorityBoundary().aiCannotAccept).toBe(true);
    expect(aiMayPerform("accept_interface")).toBe(false);
    expect(() => assertHumanAuthority("freeze_baseline", { role: "ai" })).toThrow(/ai_authority_denied/);
    expect(result.store.events.some((e) => e.eventType === "BASELINE_FROZEN")).toBe(true);
    expect(result.store.audit.length).toBeGreaterThan(0);
  });
});
