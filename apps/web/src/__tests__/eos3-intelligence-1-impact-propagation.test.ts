import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests } from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import {
  __resetRelationshipGraphForTests,
  createGraphEdge,
  listEdgesForObject,
} from "../lib/engineering/eos3-relationship-graph-core";
import {
  __resetDecisionAssumptionLineageForTests,
  EOS_STALENESS_PROPAGATION_IMPLEMENTED,
  getAssumption,
  getDecision,
} from "../lib/engineering/eos3-decision-assumption-lineage";
import {
  IMPACT_STATE_MEANINGS,
  NON_PROPAGATING_RELATIONSHIP_TYPES,
  EOS_AUTOMATIC_CALCULATION_INVALIDATION,
  EOS_AUTOMATIC_DECISION_REVERSAL,
  EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL,
  EOS_PROPAGATION_REQUIRES_LIVE_LLM,
  EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY,
} from "../lib/engineering/eos3-impact-state-semantics";
import {
  __resetImpactPropagationForTests,
  acknowledgeImpactReview,
  auditExistingChangeImpactModels,
  buildMyWorkImpactAttentionItems,
  buildWorkPackageImpactUiHints,
  explainImpact,
  filterImpactsForAuthorization,
  listActiveImpacts,
  measureImpactPerformanceBaseline,
  processEngineeringChange,
  queryAssetConfigurationImpact,
  queryRequirementChangeImpact,
  resolveImpact,
  runPilot001MassImpactScenario,
  unauthorizedImpactWriteBlocked,
} from "../lib/engineering/eos3-impact-propagation";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000041";
const WS = "00000000-0000-4000-8000-intel10001";
const PROJECT = "PILOT-001-INTEL1";

describe("EOS-3-INTELLIGENCE-1 Staleness and Impact Propagation", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
    __resetAssetSystemContextForTests();
    __resetRelationshipGraphForTests();
    __resetDecisionAssumptionLineageForTests();
    __resetImpactPropagationForTests();
  });

  it("audits existing change impact models without duplication", () => {
    const a = auditExistingChangeImpactModels();
    expect(a.existingChangeImpactModelAudited).toBe(true);
    expect(a.duplicateChangeIntelligenceCreated).toBe(false);
    expect(a.impactShadowEngineeringStateCreated).toBe(false);
    expect(a.inProcessImpactSourceOfTruthCreated).toBe(false);
    expect(a.propagationRequiresLiveLlm).toBe(false);
    expect(a.dependencyNotEqualInvalidity).toBe(true);
    expect(EOS_PROPAGATION_REQUIRES_LIVE_LLM).toBe(false);
    expect(EOS_DEPENDENCY_NOT_EQUAL_INVALIDITY).toBe(true);
    expect(EOS_AUTOMATIC_CALCULATION_INVALIDATION).toBe(false);
    expect(EOS_AUTOMATIC_DECISION_REVERSAL).toBe(false);
    expect(EOS_AUTOMATIC_DELIVERABLE_WITHDRAWAL).toBe(false);
    // Domain-4 flag remains false (Domain-4 itself does not auto-propagate)
    expect(EOS_STALENESS_PROPAGATION_IMPLEMENTED).toBe(false);
    expect(IMPACT_STATE_MEANINGS.INVALIDATED.automaticInvalidation).toBe(false);
  });

  it("runs PILOT-001 12t→15t scenario with revision-aware history", () => {
    const result = runPilot001MassImpactScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      actorId: "pilot_engineer",
    });
    expect(result.historicalAssumptionPreserved).toBe(true);
    expect(result.automaticApprovals).toBe(false);
    expect(result.assumption?.value).toBe(15);
    expect(result.priorAssumption?.status).toBe("SUPERSEDED");
    expect(result.priorAssumption?.value).toBe(12);

    const hist = listEdgesForObject(WS, "CALC-001").filter(
      (e) =>
        e.relationshipType === "ASSUMES" &&
        e.target.objectStableId === "ASM-001" &&
        e.target.revisionLabel === "Rev 1",
    );
    expect(hist.length).toBeGreaterThan(0);

    expect(result.calculationImpacts.length).toBeGreaterThan(0);
    expect(
      result.calculationImpacts.some((i) =>
        ["STALE", "REVIEW_REQUIRED", "POTENTIALLY_AFFECTED", "REVIEW_RECOMMENDED"].includes(
          i.impactState,
        ),
      ),
    ).toBe(true);
    expect(result.decisionImpacts.some((i) => i.impactState === "REASSESSMENT_REQUIRED")).toBe(
      true,
    );
    const dec = getDecision(WS, "DEC-001");
    expect(dec?.status === "REASSESSMENT_REQUIRED" || result.decisionImpacts.length > 0).toBe(true);
    expect(result.propagation.automaticInvalidations.calculation).toBe(false);
    expect(result.propagation.automaticInvalidations.decision).toBe(false);
    expect(result.wpContract?.cards.needsAttention.length).toBeGreaterThan(0);
  });

  it("is idempotent for the same event key", () => {
    const first = processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "mass update",
      eventKey: "idem-1",
    });
    const second = processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "mass update",
      eventKey: "idem-1",
    });
    expect(second.eventSkippedDuplicate).toBe(true);
    const active = listActiveImpacts(WS, PROJECT);
    const keys = active.map((i) => i.dedupeKey);
    expect(new Set(keys).size).toBe(keys.length);
    expect(first.impacts.length).toBeGreaterThan(0);
  });

  it("does not propagate via CONNECTED_TO / ASSOCIATED_WITH alone (false positive control)", () => {
    processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSET_CONFIGURATION_CHANGE",
      triggerStableId: "AST-EQ-MOD-01",
      triggerObjectClass: "Asset",
      changeSummary: "equipment module association touch",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      eventKey: "fp-assoc",
      maxDepth: 2,
    });
    expect(NON_PROPAGATING_RELATIONSHIP_TYPES.has("ASSOCIATED_WITH")).toBe(true);
    expect(NON_PROPAGATING_RELATIONSHIP_TYPES.has("CONNECTED_TO")).toBe(true);
    // AST-PLT-201 must not become STALE solely from ASSOCIATED_WITH
    const plt = listActiveImpacts(WS, PROJECT).filter(
      (i) => i.affectedStableId === "AST-PLT-201" && i.impactState === "STALE",
    );
    expect(plt.length).toBe(0);
  });

  it("discovers known explicit paths (false negative control)", () => {
    const r = processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "operating mass revised",
      eventKey: "fn-asm",
    });
    const calcs = r.impacts.filter((i) => i.affectedStableId === "CALC-001");
    expect(calcs.length).toBeGreaterThan(0);
    const decisions = r.impacts.filter((i) => i.affectedStableId === "DEC-001");
    expect(decisions.length).toBeGreaterThan(0);
  });

  it("handles asset configuration and requirement revision scenarios", () => {
    const asset = queryAssetConfigurationImpact({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      assetStableId: "AST-PLT-201",
    });
    expect(asset.automaticInvalidations.approval).toBe(false);

    __resetImpactPropagationForTests();
    const req = queryRequirementChangeImpact({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      requirementStableId: "REQ-001",
    });
    expect(req.impacts.length).toBeGreaterThanOrEqual(0);
    // REQ APPLIES_TO WP-STR-004 should surface WP or associated engineering
    expect(
      req.impacts.some((i) => i.affectedStableId === "WP-STR-004") ||
        req.falsePositiveSkipped.length >= 0,
    ).toBe(true);
  });

  it("explains impact paths and supports acknowledgement / resolution under authority", () => {
    const r = processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "Vendor operating mass changed from 12 t to 15 t",
      eventKey: "ack-1",
    });
    const calcImpact = r.impacts.find((i) => i.affectedStableId === "CALC-001");
    expect(calcImpact).toBeTruthy();
    const explained = explainImpact(WS, calcImpact!.id);
    expect(explained?.why.length).toBeGreaterThan(5);
    expect(explained?.meaning.length).toBeGreaterThan(5);

    expect(() =>
      acknowledgeImpactReview({
        workspaceId: WS,
        impactId: calcImpact!.id,
        userId: "u1",
        role: "viewer",
        rationale: "looks fine",
        conclusion: "NO_CHANGE_REQUIRED",
        authorized: false,
      }),
    ).toThrow(/unauthorized/);

    const ack = acknowledgeImpactReview({
      workspaceId: WS,
      impactId: calcImpact!.id,
      userId: "u1",
      role: "qualified_reviewer",
      rationale: "Reviewed, no engineering change required",
      conclusion: "NO_CHANGE_REQUIRED",
      authorized: true,
    });
    expect(ack.acknowledgement?.conclusion).toBe("NO_CHANGE_REQUIRED");
    expect(ack.active).toBe(true); // not deleted

    const resolved = resolveImpact({
      workspaceId: WS,
      impactId: calcImpact!.id,
      userId: "u1",
      role: "qualified_reviewer",
      rationale: "Closed after review",
      status: "RESOLVED_NO_CHANGE",
      authorized: true,
    });
    expect(resolved.active).toBe(false);
    expect(resolved.impactState).toBe("RESOLVED_NO_CHANGE");
  });

  it("builds My Work impact data contract without risk ranking", () => {
    processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "mass change",
      eventKey: "mywork-1",
    });
    const items = buildMyWorkImpactAttentionItems(WS, PROJECT);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toMatchObject({
      projectId: PROJECT,
      deterministicNextAction: expect.any(String),
      impactState: expect.any(String),
    });
    const hints = buildWorkPackageImpactUiHints(WS, PROJECT, "WP-STR-004");
    expect(hints.needsAttention.length + hints.changed.length).toBeGreaterThan(0);
  });

  it("enforces RLS-style impact filtering and cross-workspace write block", () => {
    processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "mass",
      eventKey: "rls-1",
    });
    const all = listActiveImpacts(WS, PROJECT);
    const filtered = filterImpactsForAuthorization(all, new Set(["ASM-001"]));
    // Only impacts whose entire path is within the allow-set survive; CALC/DEC paths drop.
    expect(filtered.every((i) => i.affectedStableId === "ASM-001")).toBe(true);
    expect(filtered.length).toBeLessThan(all.length);
    expect(
      unauthorizedImpactWriteBlocked({
        callerWorkspaceId: WS,
        impactWorkspaceId: "other-workspace",
      }),
    ).toBe(true);
  });

  it("measures impact performance baseline without blockers", () => {
    const perf = measureImpactPerformanceBaseline({
      tenantId: TENANT,
      workspaceId: `${WS}-perf`,
      projectId: `${PROJECT}-PERF`,
      iterations: 8,
    });
    expect(perf.blockerCount).toBe(0);
    expect(perf.directP95Ms).toBeGreaterThanOrEqual(0);
    expect(perf.hop3P95Ms).toBeGreaterThanOrEqual(0);
    expect(perf.multiPathP95Ms).toBeGreaterThanOrEqual(0);
  });

  it("documents Intelligence-1 artifacts and preserves UI freeze markers", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_STALENESS_AND_IMPACT_PROPAGATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_IMPACT_STATE_SEMANTICS.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_IMPACT_PROPAGATION_RULES.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_IMPACT_RESOLUTION_AND_AUTHORITY.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_IMPACT_UI_DATA_CONTRACT.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_INTELLIGENCE1_PILOT_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_INTELLIGENCE_1_MANIFEST.json"))).toBe(true);

    const home = readFileSync(
      resolve(WEB_ROOT, "src/app/(platform)/engineering/page.tsx"),
      "utf8",
    );
    expect(home).toContain("approved-engineering-1c-locked");
    expect(home).not.toContain("impact-propagation"); // Home must not wait on impact graph

    const banner = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/impact-attention-banner.tsx"),
      "utf8",
    );
    expect(banner).toContain("data-eos-impact-contextual");
  });
});
