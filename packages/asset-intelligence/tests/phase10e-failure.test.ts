import { describe, expect, it } from "vitest";
import {
  ASSET_INTELLIGENCE_VERSION,
  CRITICALITY_IS_HEALTH_FACTOR,
  FAILURE_HEALTH_CONTRIBUTION_ENABLED,
  FAILURE_INTELLIGENCE_READY,
  FAILURE_TAXONOMY_REGISTRY_READY,
  PHASE_10D_CERTIFIED_COMMIT,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  assertFailureCapability,
  assertOwnershipLock,
  createAssetFailureIntelligenceEngine,
  createAssetIntelligenceEngine,
  createDurableAssetIntelligenceMemoryStore,
  createFailureTaxonomyRegistry,
  createHealthCompositionEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  EXAMPLE_PACK_KEYS,
  AssetIntelligenceRepository,
  roleHasCapability,
  startFailureReview,
} from "../src/index";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Phase 10E failure intelligence", () => {
  it("locks version and claim flags", () => {
    expect(ASSET_INTELLIGENCE_VERSION).toBe("0.6.0-timeseries");
    expect(FAILURE_TAXONOMY_REGISTRY_READY).toBe(true);
    expect(FAILURE_INTELLIGENCE_READY).toBe(true);
    expect(CRITICALITY_IS_HEALTH_FACTOR).toBe(false);
    expect(FAILURE_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(PHASE_10D_CERTIFIED_COMMIT).toBe(
      "ef6981e1c42f80cbb12337c21e6830eb22c3fdbf",
    );
    expect(assertOwnershipLock().assetIdentityOwnership).toBe(
      "engineering_os_shared_domain",
    );
  });

  it("keeps failure mode and mechanism distinct in taxonomy", () => {
    const registry = createFailureTaxonomyRegistry();
    const mode = registry.requireActive("failure_mode", "FM.LOSS_OF_FUNCTION");
    const mech = registry.requireActive("failure_mechanism", "MECH.FATIGUE");
    expect(mode.kind).toBe("failure_mode");
    expect(mech.kind).toBe("failure_mechanism");
    expect(mode.code).not.toBe(mech.code);
  });

  it("accepts versioned pack extensions without claiming shared owner", () => {
    const registry = createFailureTaxonomyRegistry();
    expect(EXAMPLE_PACK_KEYS).toContain("pipelines");
    registry.registerPackExtension({
      packKey: "pipelines",
      packVersion: "0.1.0",
      entries: [
        {
          taxonomyId: "ftx_pack_pipe_leak",
          taxonomyVersion: "1.0.0",
          kind: "failure_mode",
          code: "FM.PIPE.LEAK",
          name: "Pipeline leak",
          description: "Loss of containment on pipeline segment.",
          applicableAssetClasses: ["pipeline"],
          packOwner: "pipelines",
          status: "active",
          effectiveFrom: "2026-08-07T00:00:00.000Z",
        },
      ],
    });
    expect(registry.requireActive("failure_mode", "FM.PIPE.LEAK").packOwner).toBe(
      "pipelines",
    );
    expect(() =>
      registry.registerPackExtension({
        packKey: "pipelines",
        packVersion: "0.1.0",
        entries: [
          {
            taxonomyId: "bad",
            taxonomyVersion: "1.0.0",
            kind: "failure_mode",
            code: "FM.BAD",
            name: "Bad",
            description: "x",
            applicableAssetClasses: ["*"],
            packOwner: "engineering_os_shared",
            status: "active",
            effectiveFrom: "2026-08-07T00:00:00.000Z",
          },
        ],
      }),
    ).toThrow(/pack_cannot_claim_shared_owner/);
  });

  it("abstains on insufficient evidence and never certifies PoF", () => {
    const engine = createAssetFailureIntelligenceEngine();
    const bundle = engine.assess({
      assetId: "a1",
      recordedAt: "2026-08-07T04:00:00.000Z",
      provenance: {
        sourceSystem: "manual.engineering_assessment",
        observedAt: "2026-08-07T04:00:00.000Z",
      },
      failureModeCode: "FM.LOSS_OF_FUNCTION",
      mechanismCode: "MECH.FATIGUE",
      evidenceRefs: [],
    });
    expect(bundle.abstained).toBe(true);
    expect(bundle.failureMode.probabilityOfFailureCertified).toBe(false);
    expect(bundle.failureMode.aiMayPublishForbidden).toBe(true);
  });

  it("produces distinct mode/mechanism/cause with root cause demoted until human approval", () => {
    const engine = createAssetFailureIntelligenceEngine();
    const bundle = engine.assess({
      assetId: "a1",
      recordedAt: "2026-08-07T04:00:00.000Z",
      provenance: {
        sourceSystem: "manual.engineering_assessment",
        observedAt: "2026-08-07T04:00:00.000Z",
        evidenceRefs: ["e1", "e2", "e3"],
      },
      failureModeCode: "FM.LOSS_OF_FUNCTION",
      mechanismCode: "MECH.CORROSION",
      causeCode: "CAUSE.OVERLOAD",
      causeClassification: "rootCause",
      effectCode: "EFFECT.LOCAL",
      consequenceCode: "CONS.SAFETY",
      detectionMethodCode: "DET.VISUAL_INSPECTION",
      evidenceRefs: ["e1", "e2", "e3"],
    });
    expect(bundle.abstained).toBe(false);
    expect(bundle.failureMode.kind).toBe("failure_mode");
    expect(bundle.mechanism?.kind).toBe("failure_mechanism");
    expect(bundle.cause?.classification).toBe("suspectedCause");
    expect(bundle.cause?.rootCauseRequiresHumanApproval).toBe(true);
    expect(bundle.consequence?.createsCanonicalRiskRecord).toBe(false);
  });

  it("enforces role least privilege and engineer self-approve ban", () => {
    expect(roleHasCapability("viewer", "failure.assess")).toBe(false);
    expect(roleHasCapability("engineer", "failure.assess")).toBe(true);
    expect(() => assertFailureCapability("viewer", "failure.assess")).toThrow(
      /failure_capability_denied/,
    );
    expect(() => assertFailureCapability("engineer", "failure.approve")).toThrow(
      /engineer_self_approve_forbidden/,
    );
  });

  it("keeps failure out of health composition v2 and rejects premature v3", () => {
    const composer = createHealthCompositionEngine();
    expect(() =>
      composer.compose({
        assetId: "a1",
        stateId: "h1",
        recordedAt: "2026-08-07T04:00:00.000Z",
        provenance: {
          sourceSystem: "test",
          observedAt: "2026-08-07T04:00:00.000Z",
          evidenceRefs: ["e1", "e2", "e3"],
        },
        compositionMethod: "compose_condition_reliability_failure_v3",
        sourceKeys: ["manual.engineering_assessment"],
        condition: { rating: "good", index: 0.8, evidenceRefs: ["e1"] },
      }),
    ).toThrow(/failure_health_contribution_disabled/);
  });

  it("persists versioned failure assessments without mutating health", async () => {
    const store = createDurableAssetIntelligenceMemoryStore();
    const repository = new AssetIntelligenceRepository(store);
    const identityPort = createInMemorySharedDomainIdentityPort([
      {
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        owner: "engineering_os_shared_domain",
      },
    ]);
    const events = createInProcessAssetIntelligenceEventPipeline();
    const engine = createAssetIntelligenceEngine({
      identityPort,
      repository,
      events,
    });

    const first = await engine.assessFailure({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      failureModeCode: "FM.LOSS_OF_FUNCTION",
      mechanismCode: "MECH.FATIGUE",
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
      idempotencyKey: "fail-1",
    });
    expect(first.healthMutated).toBe(false);
    expect(first.failureMode.version).toBe(1);
    expect(first.bundle.mechanism).toBeDefined();

    const replay = await engine.assessFailure({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      failureModeCode: "FM.LOSS_OF_FUNCTION",
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
      idempotencyKey: "fail-1",
    });
    expect(replay.idempotentReplay).toBe(true);

    const review = startFailureReview({
      tenantId: "t1",
      workspaceId: "w1",
      failureModeStateId: first.failureMode.stateId,
      startedBy: "engineer-1",
    });
    const approved = await engine.reviewFailure({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      failureModeStateId: first.failureMode.stateId,
      workflowInstance: review.instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });
    expect(approved.failureMode.reviewStatus).toBe("published");
    expect(approved.failureMode.version).toBe(2);
    expect(approved.healthMutated).toBe(false);
  });

  it("documents failure vs degradation boundary", () => {
    const doc = readFileSync(
      resolve(
        __dirname,
        "../../../docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_BOUNDARY.md",
      ),
      "utf8",
    );
    expect(doc).toMatch(/Governed Degradation Analysis/);
    expect(doc).toMatch(/Engineering Time Series/);
    expect(doc).toMatch(/not certified in 10F/i);
  });
});
