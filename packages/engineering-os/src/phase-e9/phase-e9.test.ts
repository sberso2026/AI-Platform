import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  implementsOwnAiStack,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE9Invariants,
  getPhaseE9Declaration,
  PhaseE9NoEngineOwnershipDuplication,
  PhaseE9NoSecondIntelligenceRegistry,
  PhaseE9ReusesCertifiedEnginesOnly,
  rejectFabricatedIntelligence,
} from "./contracts";
import { getDefaultIntelligenceCatalog, listUserFacingCatalogConcepts } from "./catalog";
import { EngineeringIntelligenceRouter, inferIntelligenceIntent } from "./router";
import { EngineeringIntelligenceService } from "./invocation";
import { applyIntelligenceToReasoning, contextualIntelligenceActions } from "./ask-bridge";
import {
  emitMemoryFromIntelligenceOutcome,
  proposeActionFromIntelligence,
} from "./handoffs";
import { EngineeringReasoningService } from "../phase-e5/reasoning-service";
import { EngineeringActionProposalService } from "../phase-e8/proposal-service";
import { EngineeringMemoryCaptureService } from "../phase-e7/capture";

const entitled = [
  "project_intelligence",
  "asset_intelligence",
  "inspection_intelligence",
  "project_controls",
];

describe("Phase E9 unified engineering intelligence", () => {
  it("20. E0-E8 invariants + no duplicate engine ownership", () => {
    expect(PhaseE9NoSecondIntelligenceRegistry).toBe(true);
    expect(PhaseE9ReusesCertifiedEnginesOnly).toBe(true);
    expect(PhaseE9NoEngineOwnershipDuplication).toBe(true);
    expect(implementsOwnAiStack).toBe(false);
    expect(getPhaseE9Declaration().platformCapabilityRegistryOwner).toBe(
      "platform_intelligence",
    );
    assertPhaseE9Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      implementsOwnAiStack,
      EngineeringOSProductBoundaryLocked,
    });
    expect(() => rejectFabricatedIntelligence()).toThrow(/fabricated/);
  });

  it("1. capability routing", () => {
    const router = new EngineeringIntelligenceRouter();
    const route = router.route({
      tenantId: "t1",
      userId: "u1",
      query: "what are the major risks?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: entitled,
    });
    expect(route.reasonCode).toBe("MATCHED");
    expect(route.selected.length).toBeGreaterThan(0);
    expect(route.selected.length).toBeLessThanOrEqual(2);
  });

  it("2. entitlement filtering", () => {
    const router = new EngineeringIntelligenceRouter();
    const denied = router.route({
      tenantId: "t1",
      userId: "u1",
      query: "what are the major risks?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: ["digital_twin"],
    });
    expect(denied.reasonCode).toBe("NO_ENTITLEMENT");
    expect(denied.selected.length).toBe(0);
    const empty = router.route({
      tenantId: "t1",
      userId: "u1",
      query: "what are the major risks?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: [],
    });
    expect(empty.reasonCode).toBe("NO_ENTITLEMENT");
  });

  it("3. unsupported intent fallback", async () => {
    expect(inferIntelligenceIntent("hello world casually")).toBeNull();
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "hello world casually",
      entitledKeys: entitled,
    });
    expect(out.fallbackToEvidence).toBe(true);
    expect(out.results.length).toBe(0);
  });

  it("4. Project Intelligence integration", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what requires attention on this project?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: entitled,
    });
    expect(out.results.some((r) => r.owner === "project_intelligence")).toBe(true);
  });

  it("5. Asset/Condition integration", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what changed in condition?",
      objectType: "asset",
      objectId: "a1",
      entitledKeys: entitled,
      providedInputs: { assetId: "a1" },
    });
    expect(
      out.results.some(
        (r) =>
          r.capabilityId === "asset_intelligence.condition" ||
          r.capabilityId === "inspection_intelligence.condition",
      ),
    ).toBe(true);
  });

  it("6. Decision Support integration", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what options do we have?",
      projectId: "p1",
      objectType: "decision",
      objectId: "d1",
      entitledKeys: entitled,
    });
    expect(out.results.some((r) => r.capabilityId === "project_controls.decision_support")).toBe(
      true,
    );
  });

  it("7. Scenario integration", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what if we defer this?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: entitled,
      providedInputs: { projectId: "p1", scenarioHypothesis: "defer permanent fix" },
    });
    expect(
      out.results.some((r) => r.capabilityId === "project_controls.scenario_intelligence"),
    ).toBe(true);
    expect(out.results[0]?.authorityStatus).toBe("SCENARIO");
  });

  it("8. Risk/Opportunity integration", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what is uncertain about project risks?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: entitled,
    });
    expect(
      out.results.some(
        (r) => r.capabilityId === "project_controls.risk_opportunity_intelligence",
      ) || out.results.length > 0,
    ).toBe(true);
  });

  it("9. Assurance integration", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what needs human review for assurance?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: entitled,
    });
    expect(
      out.results.some((r) => r.capabilityId === "project_controls.assurance_intelligence"),
    ).toBe(true);
  });

  it("10. Explainability provenance", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "why was this recommended?",
      projectId: "p1",
      objectType: "project",
      objectId: "subj-1",
      entitledKeys: entitled,
      providedInputs: { subjectId: "subj-1", projectId: "p1" },
    });
    const reasoning = await new EngineeringReasoningService().reason({
      query: "why?",
      evidence: [],
    });
    const merged = applyIntelligenceToReasoning(reasoning, out.results);
    expect(merged.why.ruleOrToolBasis.some((l) => /E9 intelligence/i.test(l))).toBe(true);
    expect(merged.why.chainOfThoughtExposed).toBe(false);
    expect(out.results.every((r) => r.provenance.version && r.provenance.owner)).toBe(true);
  });

  it("11. missing input", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what if we defer this?",
      objectType: "project",
      entitledKeys: entitled,
      // no projectId / scenarioHypothesis
    });
    expect(out.route.reasonCode).toBe("MISSING_INPUT");
    expect(out.fallbackToEvidence).toBe(true);
  });

  it("12. engine unavailable", async () => {
    const svc = new EngineeringIntelligenceService(undefined, undefined, {
      unavailableCapabilityIds: ["project_intelligence.risk_attention"],
    });
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what requires attention?",
      projectId: "p1",
      objectType: "project",
      entitledKeys: ["project_intelligence"],
      maxCapabilities: 1,
    });
    expect(out.limitations.some((l) => /unavailable/i.test(l))).toBe(true);
  });

  it("13. engine failure", async () => {
    const svc = new EngineeringIntelligenceService(undefined, undefined, {
      failingCapabilityIds: ["project_controls.decision_support"],
    });
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what options do we have?",
      projectId: "p1",
      objectType: "decision",
      entitledKeys: ["project_controls"],
      maxCapabilities: 1,
      intent: "what_are_the_options",
    });
    expect(out.limitations.some((l) => /error/i.test(l))).toBe(true);
    expect(out.results.length).toBe(0);
  });

  it("14. stale result", async () => {
    const svc = new EngineeringIntelligenceService(undefined, undefined, {
      staleCapabilityIds: ["asset_intelligence.condition"],
    });
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what changed in condition?",
      objectType: "asset",
      objectId: "a1",
      entitledKeys: entitled,
      providedInputs: { assetId: "a1" },
      maxCapabilities: 1,
    });
    expect(out.results.some((r) => r.freshness === "STALE")).toBe(true);
  });

  it("15. human-authority semantics", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what options do we have?",
      projectId: "p1",
      entitledKeys: entitled,
    });
    for (const r of out.results) {
      expect(r.reviewRequired).toBe(true);
      expect(r.provenance.intelligenceIsNotApproval).toBe(true);
      expect(r.provenance.predictionIsNotFact).toBe(true);
      expect(r.provenance.scenarioIsNotForecastAuthority).toBe(true);
      expect(r.provenance.riskSignalIsNotAcceptedRisk).toBe(true);
      expect(r.provenance.assuranceFindingIsNotSignOff).toBe(true);
    }
  });

  it("16. E8 proposal handoff", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what options do we have?",
      projectId: "p1",
      entitledKeys: entitled,
    });
    const proposals = new EngineeringActionProposalService();
    const handoff = await proposeActionFromIntelligence({
      envelope: out.results[0]!,
      proposalService: proposals,
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
    });
    expect("proposalId" in handoff).toBe(true);
    const stored = await proposals.getForReview("t1", (handoff as { proposalId: string }).proposalId);
    expect(stored?.approvalState).toBe("READY_FOR_REVIEW");
  });

  it("17. E7 memory guard", async () => {
    const svc = new EngineeringIntelligenceService();
    const scenario = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what if we defer this?",
      projectId: "p1",
      entitledKeys: entitled,
      providedInputs: { projectId: "p1", scenarioHypothesis: "defer" },
    });
    const capture = new EngineeringMemoryCaptureService();
    const blocked = await emitMemoryFromIntelligenceOutcome({
      envelope: scenario.results[0]!,
      capture,
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      reviewed: true,
    });
    expect(blocked.emitted).toBe(false);

    const decision = await svc.routeAndInvoke({
      tenantId: "t1",
      userId: "u1",
      query: "what options do we have?",
      projectId: "p1",
      entitledKeys: entitled,
    });
    const unreviewed = await emitMemoryFromIntelligenceOutcome({
      envelope: decision.results[0]!,
      capture,
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      reviewed: false,
    });
    expect(unreviewed.emitted).toBe(false);
    const reviewed = await emitMemoryFromIntelligenceOutcome({
      envelope: decision.results[0]!,
      capture,
      tenantId: "t1",
      userId: "u1",
      projectId: "p1",
      reviewed: true,
    });
    expect(reviewed.emitted).toBe(true);
  });

  it("18. cross-tenant attack", async () => {
    const svc = new EngineeringIntelligenceService();
    const out = await svc.routeAndInvoke({
      tenantId: "tenant-b",
      userId: "attacker",
      query: "what are the major risks?",
      projectId: "p-secret-a",
      objectType: "project",
      entitledKeys: [],
    });
    expect(out.results.length).toBe(0);
    expect(out.fallbackToEvidence).toBe(true);
    expect(out.route.reasonCode).toBe("NO_ENTITLEMENT");
  });

  it("19. catalog concepts hide unavailable; contextual cards", () => {
    const concepts = listUserFacingCatalogConcepts(entitled);
    expect(concepts.some((c) => c.concept === "Projects")).toBe(true);
    expect(
      concepts.every((c) => c.capabilities.every((cap) => cap.availability === "AVAILABLE")),
    ).toBe(true);
    const actions = contextualIntelligenceActions({
      objectType: "project",
      entitledKeys: entitled,
      catalog: getDefaultIntelligenceCatalog(),
    });
    expect(actions.some((a) => a.id === "review_risk" || a.id === "view_assurance")).toBe(true);
  });
});
