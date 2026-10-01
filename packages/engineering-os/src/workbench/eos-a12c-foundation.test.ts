import { describe, expect, it } from "vitest";
import { LIFECYCLE_STAGES } from "../lifecycle-intelligence/types";
import { DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, transitionAllowed } from "../lifecycle-intelligence/profile";
import { mixedScopeView } from "../lifecycle-intelligence/resolve";
import { MATURITY_DIMENSIONS } from "../deliverable-intelligence/types";
import { HANDOVER_COMPLETENESS_STATES, INFORMATION_REQUIREMENT_AI_BOUNDARY } from "../information-requirements/types";
import { evaluateHandoverCompleteness } from "../information-requirements/handover";
import { WORK_GENERATOR_PRIVACY } from "../work-generator/types";
import { A12C_AI_BOUNDARY, A12C_LIFECYCLE_RECON, A12C_PRIVACY, canonicalLifecyclePreserved, resolveNextLifecycleWork } from "./journeys";
import { inheritWorkPlanContext } from "./inherit";
import { lifecycleEmptyState, blockedWorkExplanation } from "./empty-states";
import { impactPresentationLabel } from "./lifecycle-impact";
import { answerLifecycleQuestion, LIFECYCLE_ASK_QUESTIONS } from "./ask-lifecycle";
import { lifecycleTaskLabel } from "./lifecycle-attention";
import { composeOperationsReference } from "./operations-reference";
import { workbenchActionsForLifecycle, WORKBENCH_AI_BOUNDARY } from "./lifecycle-actions";
import { conceptSnapshot } from "../work-generator/fixture";
import { ref } from "../work-generator/compose";

describe("EOS-A12C lifecycle experience foundation", () => {
  it("reuses the A9 canonical lifecycle and does not create Lifecycle V2", () => {
    expect(A12C_LIFECYCLE_RECON.newLifecycleDomain).toBe("NO");
    expect(A12C_LIFECYCLE_RECON.newJourneyDomain).toBe("NO");
    expect(A12C_LIFECYCLE_RECON.newWorkbench).toBe("NO");
    expect(A12C_LIFECYCLE_RECON.lifecycleIntelligence).toBe("REUSE");
    expect(canonicalLifecyclePreserved().stages).toEqual(LIFECYCLE_STAGES);
    expect(canonicalLifecyclePreserved().handoverCanonicalStage).toBe(false);
    expect(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE.stages).toEqual(LIFECYCLE_STAGES);
    expect(transitionAllowed(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, "DETAILED_DESIGN", "FEED")).toBe(true);
    expect(transitionAllowed(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, "CONSTRUCTION", "DETAILED_DESIGN")).toBe(true);
  });

  it("preserves mixed lifecycle state across systems and packages", () => {
    const mixed = mixedScopeView([
      { id: "p", tenantId: "t", workspaceId: "w", projectId: "proj", scopeType: "PROJECT", scopeId: "proj", parentScopeType: null, parentScopeId: null, stage: "FEED", profileId: "EOS-DEFAULT-ENGINEERING", profileVersion: "v1", version: 1, assignedBy: "eng", assignedAt: "2026-10-01T00:00:00.000Z" },
      { id: "proc", tenantId: "t", workspaceId: "w", projectId: "proj", scopeType: "SYSTEM", scopeId: "sys-process", parentScopeType: "PROJECT", parentScopeId: "proj", stage: "FEED", profileId: "EOS-DEFAULT-ENGINEERING", profileVersion: "v1", version: 1, assignedBy: "eng", assignedAt: "2026-10-01T00:00:00.000Z" },
      { id: "str", tenantId: "t", workspaceId: "w", projectId: "proj", scopeType: "SYSTEM", scopeId: "sys-struct", parentScopeType: "PROJECT", parentScopeId: "proj", stage: "DETAILED_DESIGN", profileId: "EOS-DEFAULT-ENGINEERING", profileVersion: "v1", version: 1, assignedBy: "eng", assignedAt: "2026-10-01T00:00:00.000Z" },
      { id: "con", tenantId: "t", workspaceId: "w", projectId: "proj", scopeType: "ASSET", scopeId: "pkg-early-works", parentScopeType: "PROJECT", parentScopeId: "proj", stage: "CONSTRUCTION", profileId: "EOS-DEFAULT-ENGINEERING", profileVersion: "v1", version: 1, assignedBy: "eng", assignedAt: "2026-10-01T00:00:00.000Z" },
    ]);
    expect(mixed.map((row) => `${row.scopeType}:${row.stage}`)).toEqual([
      "PROJECT:FEED",
      "SYSTEM:FEED",
      "SYSTEM:DETAILED_DESIGN",
      "ASSET:CONSTRUCTION",
    ]);
  });

  it("does not copy Concept assumptions as Prefeasibility facts", () => {
    const inherited = inheritWorkPlanContext({
      from: conceptSnapshot(),
      fromStage: "CONCEPT",
      toStage: "PREFEASIBILITY",
      fromPlanId: "plan-concept",
      systemId: "sys-primary-crushing",
    });
    expect(inherited.assumptions[0]?.disposition).toBe("VALIDATE");
    expect(inherited.snapshot.assumptions[0]?.whyIncluded).toMatch(/validation/);
    expect(inherited.handoff.advancesLifecycleGate).toBe(false);
    expect(inherited.handoff.openAssumptions[0]?.disposition).toBe("VALIDATE");
    expect(inherited.snapshot.requirements[0]?.objectId).toBe("req-client-12mtpa");
  });

  it("keeps preliminary Feasibility information from being auto-marked FEED-suitable", () => {
    const inherited = inheritWorkPlanContext({
      from: {
        ...conceptSnapshot(),
        information: [{ informationType: "LOAD_DATA", title: "Preliminary equipment reactions", purpose: "FOR_COORDINATION", revision: "B", freshness: "CURRENT", authorityOutcome: "INFORMATIONAL", whyIncluded: "Coordination only." }],
        interfaces: [ref("interface", "if-cr-cv-01", "Mechanical → Structural", "Open interface.")],
        decisions: [ref("decision", "dec-option-a", "Option A selected", "Human decision.")],
      },
      fromStage: "FEASIBILITY",
      toStage: "FEED",
      fromPlanId: "plan-feas",
    });
    expect(inherited.snapshot.gaps.some((row) => /not automatically suitable for FEED/i.test(row.explanation))).toBe(true);
    expect(inherited.snapshot.decisions[0]?.title).toMatch(/Option A/);
  });

  it("adapts empty, blocked, impact, and attention copy to lifecycle", () => {
    expect(lifecycleEmptyState("FEED").title).toMatch(/No FEED Work Plan exists/);
    expect(lifecycleEmptyState("FEED").actionLabel).toBe("Start FEED Engineering Work");
    const blocked = blockedWorkExplanation({
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "DETAILED_DESIGN",
      whyBlocked: "Detailed Design calculation cannot start because Vendor Load Data is not accepted for design input.",
      missingTitle: "Vendor Load Data",
    });
    expect(blocked.explanation).toMatch(/Vendor Load Data/);
    expect(blocked.next.map((row) => row.label)).toEqual(expect.arrayContaining(["Open Information", "Request Update"]));
    expect(impactPresentationLabel("CONCEPT")).toMatch(/option/i);
    expect(impactPresentationLabel("FEED")).toMatch(/interface/i);
    expect(impactPresentationLabel("DETAILED_DESIGN")).toMatch(/calculation/i);
    expect(impactPresentationLabel("CONSTRUCTION")).toMatch(/Field/);
    expect(impactPresentationLabel("COMMISSIONING")).toMatch(/handover/i);
    expect(lifecycleTaskLabel("CONCEPT").title).toBe("Review assumption");
    expect(lifecycleTaskLabel("FEED").title).toBe("Review vendor input");
    expect(lifecycleTaskLabel("DETAILED_DESIGN").title).toBe("Run Pre-Issue Review");
    expect(lifecycleTaskLabel("CONSTRUCTION").title).toBe("Prepare RFI response");
    expect(lifecycleTaskLabel("COMMISSIONING").title).toBe("Assess test deviation");
    expect(lifecycleTaskLabel("OPERATIONS").title).toBe("Provide missing final information");
  });

  it("shows materially different FEED, Detailed Design, and Construction workbench actions", () => {
    const feed = workbenchActionsForLifecycle("FEED").map((row) => row.code);
    const detailed = workbenchActionsForLifecycle("DETAILED_DESIGN").map((row) => row.code);
    const construction = workbenchActionsForLifecycle("CONSTRUCTION").map((row) => row.code);
    expect(feed).toContain("GENERATE_SPECIFICATION");
    expect(feed).toContain("ASSESS_VENDOR_CHANGE");
    expect(detailed).toContain("CREATE_REVIEW_PACKAGE");
    expect(detailed).toContain("ASSESS_DESIGN_CHANGE");
    expect(construction).toContain("RESPOND_RFI_TQ");
    expect(construction).toContain("ASSESS_FIELD_CHANGE");
    expect(feed).not.toEqual(detailed);
    expect(detailed).not.toEqual(construction);
    expect(workbenchActionsForLifecycle("COMMISSIONING").map((row) => row.code)).toContain("PREPARE_HANDOVER_PACKAGE");
    expect(WORKBENCH_AI_BOUNDARY.mayAdvanceLifecycle).toBe(false);
    expect(resolveNextLifecycleWork("COMMISSIONING").handoverExperience).toBe(true);
  });

  it("answers lifecycle Ask EOS questions from canonical facts without advancing gates", () => {
    const answer = answerLifecycleQuestion(LIFECYCLE_ASK_QUESTIONS[0], {
      plans: [],
      openAssumptions: [{ objectType: "assumption", objectId: "asm-1", title: "Dry-season access", whyIncluded: "Concept", disposition: "VALIDATE" }],
    });
    expect(answer).toMatch(/Dry-season access/);
    expect(A12C_AI_BOUNDARY.mayAdvanceLifecycle).toBe(false);
    expect(A12C_AI_BOUNDARY.mayAcceptHandover).toBe(false);
    expect(INFORMATION_REQUIREMENT_AI_BOUNDARY.mayAcceptHandover).toBe(false);
  });

  it("composes operations reference without building Asset Management OS", () => {
    const ops = composeOperationsReference({
      assetCode: "P-101",
      designRequirement: ref("requirement", "req-duty", "Pump duty", "Original design requirement."),
      datasheet: ref("engineering_information", "ds-p101", "Pump datasheet", "Vendor datasheet."),
      designDecision: ref("decision", "dec-pump", "P-101 selected", "Human decision."),
      drawing: ref("drawing", "dwg-p101", "Pump arrangement", "Current governed drawing."),
      commissioningEvidence: ref("engineering_information", "test-p101", "Commissioning test", "Test evidence."),
      operatingLimit: ref("engineering_information", "ol-p101", "Operating envelope", "Design operating limit."),
      modificationHistory: [ref("change", "chg-p101", "Seal upgrade", "Previous modification change.")],
    });
    expect(ops.assetManagementOs).toBe(false);
    expect(ops.assetCode).toBe("P-101");
    expect(ops.modificationHistory).toHaveLength(1);
  });

  it("preserves A10C handover completeness states and A9C maturity dimensions", () => {
    expect(HANDOVER_COMPLETENESS_STATES).toEqual(["COMPLETE", "PARTIAL", "INCOMPLETE", "STALE", "CONFLICTED"]);
    expect(MATURITY_DIMENSIONS).toEqual(["CONTENT", "TRACEABILITY", "COORDINATION", "REVIEW", "CONFIGURATION", "SUPPORTING_EVIDENCE"]);
    const completeness = evaluateHandoverCompleteness({
      pkg: {
        id: "ho-1",
        tenantId: "t",
        workspaceId: "w",
        projectId: "p",
        displayName: "Handover",
        systemId: "sys",
        assetId: null,
        discipline: "STRUCTURAL",
        lifecycleStage: "COMMISSIONING",
        state: "ASSEMBLING",
        acceptedBy: null,
        acceptedAt: null,
        createdBy: "eng",
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z",
      },
      requirements: [],
      evaluations: [{
        requirementId: "req-ho",
        satisfied: false,
        received: true,
        acceptedForPurpose: true,
        stale: true,
        superseded: false,
        conflicted: false,
        unmanagedRejected: false,
        informationRefId: "info-1",
        authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE",
        freshness: "STALE",
        engineeringApproved: false,
        explanation: "Late approved change superseded the assembled drawing.",
      }],
    });
    expect(completeness.completeness).toBe("STALE");
    expect(completeness.completenessPercent).toBeNull();
    expect(completeness.humanAcceptanceRequired).toBe(true);
    expect(A12C_PRIVACY.binaryDuplication).toBe("NO");
    expect(A12C_PRIVACY.companyTemplateBinaryUpload).toBe("DEFERRED");
    expect(WORK_GENERATOR_PRIVACY.employeeProductivityScoring).toBe("PROHIBITED");
  });
});
