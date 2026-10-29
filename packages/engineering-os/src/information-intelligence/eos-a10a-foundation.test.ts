import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { traverseThread } from "../digital-thread/traversal";
import { evaluateAssurance } from "../assurance/evaluate";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID } from "../lifecycle-intelligence/fixture";
import { evaluateLifecycleGate } from "../lifecycle-intelligence/evaluate";
import { DEFAULT_ENGINEERING_LIFECYCLE_PROFILE } from "../lifecycle-intelligence/profile";
import { incompleteFeedEvidence } from "../lifecycle-intelligence/fixture";
import { INFORMATION_AI_BOUNDARY } from "./types";
import { composeInformationFreshness } from "./freshness";
import { rejectCallerSuppliedAuthority, resolveEngineeringInformationAuthority } from "./resolver";
import { createMemoryInformationStore } from "./memory-store";
import { EngineeringInformationService } from "./service";
import {
  A10A_SOURCE_A_ID,
  A10A_SOURCE_B_ID,
  A10A_SOURCE_C_ID,
  ambiguousAuthorityRefs,
  designCriteriaPolicy,
  mechanicalLoadPolicy,
  mechanicalLoadRef,
  missingAuthorityPolicy,
  structuralDesignCriteriaRefs,
} from "./fixture";
import {
  AUTHORITATIVE_INFORMATION_CRITERION,
  composeDeliverableInformationAuthority,
  enrichSearchHitWithInformation,
  informationThreadGraph,
  interfaceConsumesInformation,
  pinAnalysisInformationAuthority,
  requirementReferencesAuthoritativeInformation,
  surfaceAssumptionSourceState,
  surfaceDecisionReferencedInformation,
  withInformationLifecycleEvidence,
} from "./compose";
import type { AnalysisInputManifestV1 } from "../analysis-intelligence/types";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

async function seededService() {
  const store = createMemoryInformationStore();
  for (const row of structuralDesignCriteriaRefs()) await store.saveRef(row);
  await store.saveRef(mechanicalLoadRef());
  await store.savePolicy(designCriteriaPolicy("v1"));
  await store.savePolicy(mechanicalLoadPolicy());
  await store.savePolicy(missingAuthorityPolicy());
  return new EngineeringInformationService(stubClient(), store);
}

describe("EOS-A10A Engineering Information Intelligence foundation", () => {
  it("resolves one authoritative current source without inferring engineering approval", async () => {
    const service = await seededService();
    const resolution = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      discipline: "STRUCTURAL",
      lifecycleStage: "FEED",
      actorId: "engineer-a1",
      now: "2026-09-30T18:00:00.000Z",
    });
    expect(resolution.outcome).toBe("RESOLVED");
    expect(resolution.selectedRefId).toBe(A10A_SOURCE_B_ID);
    expect(resolution.authorityState).toBe("AUTHORITATIVE_FOR_PURPOSE");
    expect(resolution.explanation.engineeringApproved).toBe(false);
    expect(resolution.candidates.find((row) => row.refId === A10A_SOURCE_A_ID)?.authorityState).toBe("WORKING_INFORMATION");
    expect(resolution.candidates.find((row) => row.refId === A10A_SOURCE_C_ID)?.freshness).toBe("SUPERSEDED");
    expect(resolution.explanation.whyApplies).toMatch(/not engineering approval/i);
    expect(INFORMATION_AI_BOUNDARY.maySelectAuthoritativeSource).toBe(false);
  });

  it("returns CONFLICT when two eligible sources compete and does not pick a winner", async () => {
    const store = createMemoryInformationStore();
    for (const row of ambiguousAuthorityRefs()) await store.saveRef(row);
    await store.savePolicy(designCriteriaPolicy("v1"));
    const service = new EngineeringInformationService(stubClient(), store);
    const resolution = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      actorId: "engineer-a1",
    });
    expect(resolution.outcome).toBe("CONFLICT");
    expect(resolution.selectedRefId).toBeNull();
    expect(resolution.authorityState).toBe("CONFLICTING_AUTHORITY");
    expect(resolution.explanation.conflictOrAmbiguity).toMatch(/No automatic winner/);
  });

  it("returns NO_AUTHORITATIVE_SOURCE without fabricating a fallback", async () => {
    const service = await seededService();
    const resolution = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "MATERIAL_PROPERTY",
      purpose: "FOR_DESIGN_INPUT",
      actorId: "engineer-a1",
    });
    expect(resolution.outcome).toBe("NO_AUTHORITATIVE_SOURCE");
    expect(resolution.selectedRefId).toBeNull();
  });

  it("does not silently return a source after it becomes stale and retains historical provenance", async () => {
    const store = createMemoryInformationStore();
    const refs = structuralDesignCriteriaRefs();
    for (const row of refs) await store.saveRef(row);
    await store.savePolicy(designCriteriaPolicy("v1"));
    const service = new EngineeringInformationService(stubClient(), store);
    const first = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      actorId: "engineer-a1",
      now: "2026-09-30T18:00:00.000Z",
    });
    expect(first.selectedRefId).toBe(A10A_SOURCE_B_ID);
    const current = await store.getRef(A10A_SOURCE_B_ID);
    await store.saveRef({
      ...current!,
      sourceFacts: { ...current!.sourceFacts, stale: true, staleReasons: ["STALE_REQUIREMENT_CHANGED"] },
    });
    const second = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      actorId: "engineer-a1",
      now: "2026-09-30T19:00:00.000Z",
    });
    expect(second.outcome).toBe("SOURCE_STALE");
    expect(second.selectedRefId).toBeNull();
    const historical = await service.getResolution(commerce("analysis.read"), CRUSHER_FEED_TENANT, first.id);
    expect(historical?.selectedRefId).toBe(A10A_SOURCE_B_ID);
    expect(historical?.policyVersion).toBe("v1");
  });

  it("retains policy v1 on historical resolution after v2 is saved", async () => {
    const store = createMemoryInformationStore();
    for (const row of structuralDesignCriteriaRefs()) await store.saveRef(row);
    await store.savePolicy(designCriteriaPolicy("v1"));
    const service = new EngineeringInformationService(stubClient(), store);
    const v1 = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      policyVersion: "v1",
      actorId: "engineer-a1",
    });
    await store.savePolicy({ ...designCriteriaPolicy("v2"), eligibleSourceKinds: ["DOCUMENT", "DATASET"] });
    const v2 = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      policyVersion: "v2",
      actorId: "engineer-a1",
    });
    expect(v1.policyVersion).toBe("v1");
    expect(v2.policyVersion).toBe("v2");
    const historical = await service.getResolution(commerce("analysis.read"), CRUSHER_FEED_TENANT, v1.id);
    expect(historical?.policyVersion).toBe("v1");
  });

  it("keeps Mechanical ownership when Structural consumes load information", async () => {
    const service = await seededService();
    const resolution = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "LOAD_DATA",
      purpose: "FOR_DESIGN_INPUT",
      actorId: "structural-engineer",
    });
    const ref = (await service.list(commerce("analysis.read"), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID)).find((row) => row.id === "info-ref-mech-operating-load");
    expect(resolution.outcome).toBe("RESOLVED");
    expect(ref?.responsibleDiscipline).toBe("MECHANICAL");
    const consumed = interfaceConsumesInformation(resolution, ref!.responsibleDiscipline!);
    expect(consumed.ownershipTransferred).toBe(false);
  });

  it("composes Digital Thread over governed relations without fabricating completeness", () => {
    const refs = structuralDesignCriteriaRefs();
    const graph = informationThreadGraph({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      ref: refs[1]!,
      sourceType: "document",
      sourceId: refs[1]!.sourceObjectId,
    });
    const traversal = traverseThread(graph, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      root: { objectType: "engineering_information", objectId: refs[1]!.id },
      direction: "both",
      maxDepth: 3,
    });
    expect(traversal.relationships.some((rel) => rel.relationship === "USES")).toBe(true);
    expect(graph.links.some((rel) => rel.relationship === "SUPPORTED_BY")).toBe(true);
    expect(graph.nodes.some((node) => node.objectType === "configuration_baseline")).toBe(true);
  });

  it("shows deliverable authority without upgrading maturity, review, or approval", async () => {
    const service = await seededService();
    const resolution = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      actorId: "engineer-a1",
    });
    const composed = composeDeliverableInformationAuthority({ bound: true, resolution });
    expect(composed.authorityVisible).toBe(true);
    expect(composed.maturityUpgraded).toBe(false);
    expect(composed.reviewComplete).toBe(false);
    expect(composed.approved).toBe(false);
  });

  it("emits an Assurance Condition for ambiguous authority without a Finding", () => {
    const refs = ambiguousAuthorityRefs();
    const resolution = resolveEngineeringInformationAuthority({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      refs,
      policies: [designCriteriaPolicy("v1")],
      request: {
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        informationType: "DESIGN_CRITERIA",
        purpose: "FOR_ENGINEERING_REVIEW",
        actorId: "engineer-a1",
      },
    });
    const detections = evaluateAssurance({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      graph: {
        nodes: [
          {
            tenantId: CRUSHER_FEED_TENANT,
            workspaceId: CRUSHER_FEED_WORKSPACE,
            projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
            objectType: "engineering_information",
            objectId: "info-scope-design-criteria",
            status: resolution.outcome,
          },
        ],
        links: [],
      },
      now: "2026-09-30T18:00:00.000Z",
    });
    expect(detections.some((row) => row.conditionType === "AMBIGUOUS_INFORMATION_AUTHORITY")).toBe(true);
    expect(detections.every((row) => row.conditionType !== "FINDING" as string)).toBe(true);
  });

  it("reuses search hits rather than creating a search engine", () => {
    const hit = enrichSearchHitWithInformation(
      { id: "doc-str-dc-revb", title: "Structural Design Criteria" },
      {
        authorityState: "AUTHORITATIVE_FOR_PURPOSE",
        freshness: "CURRENT",
      } as never,
      structuralDesignCriteriaRefs()[1],
    );
    expect(hit.informationAuthorityState).toBe("AUTHORITATIVE_FOR_PURPOSE");
    expect(hit.title).toBe("Structural Design Criteria");
  });

  it("composes freshness from source-domain stale reasons and rejects caller authority claims", () => {
    expect(composeInformationFreshness({ stale: true, staleReasons: ["STALE_REQUIREMENT_CHANGED"] }, "2026-09-30T18:00:00.000Z")).toBe("STALE");
    expect(composeInformationFreshness({ superseded: true }, "2026-09-30T18:00:00.000Z")).toBe("SUPERSEDED");
    expect(rejectCallerSuppliedAuthority({ authoritative: true })).toBe("caller_supplied_authority_rejected");
    expect(requirementReferencesAuthoritativeInformation({ outcome: "RESOLVED" } as never).verified).toBe(false);
    expect(surfaceAssumptionSourceState({ freshness: "STALE" } as never).assumptionInvalidated).toBe(false);
    expect(surfaceDecisionReferencedInformation({ outcome: "SOURCE_STALE" } as never).reversed).toBe(false);
  });

  it("pins Analysis information authority without rewriting the A7B manifest", () => {
    const manifest = { schema_version: "1", request: { id: "anl-1" } } as unknown as AnalysisInputManifestV1;
    const pinned = pinAnalysisInformationAuthority(
      manifest,
      { outcome: "RESOLVED", informationType: "MATERIAL_PROPERTY", purpose: "FOR_DESIGN_INPUT", policyId: "p", policyVersion: "v1", freshness: "CURRENT" } as never,
      structuralDesignCriteriaRefs()[1],
    );
    expect(pinned.manifest).toBe(manifest);
    expect(pinned.informationAuthorityPins[0]?.policyVersion).toBe("v1");
  });

  it("evaluates optional lifecycle information criterion only when the profile includes it", () => {
    const serviceResolution = resolveEngineeringInformationAuthority({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      refs: structuralDesignCriteriaRefs(),
      policies: [designCriteriaPolicy("v1")],
      request: {
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        informationType: "DESIGN_CRITERIA",
        purpose: "FOR_ENGINEERING_REVIEW",
        actorId: "engineer-a1",
      },
    });
    const profile = {
      ...DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      criteria: [...DEFAULT_ENGINEERING_LIFECYCLE_PROFILE.criteria, AUTHORITATIVE_INFORMATION_CRITERION],
    };
    const evaluation = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: "a9a-feed-project-assignment",
      profile,
      gateId: "FEED_EXIT",
      evidence: withInformationLifecycleEvidence(incompleteFeedEvidence(), serviceResolution),
    });
    expect(evaluation.criteria.some((row) => row.criterionId === "A10A-INF-001" && row.status === "SATISFIED")).toBe(true);
  });

  it("measures representative authority resolution", async () => {
    const service = await seededService();
    const started = Date.now();
    const resolution = await service.resolve(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      informationType: "DESIGN_CRITERIA",
      purpose: "FOR_ENGINEERING_REVIEW",
      actorId: "engineer-a1",
    });
    expect(resolution.metrics.candidateCount).toBeGreaterThan(0);
    expect(resolution.metrics.policyEvaluations).toBe(1);
    expect(Date.now() - started).toBeGreaterThanOrEqual(0);
  });
});
