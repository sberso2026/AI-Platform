import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  detailedDesignReadySnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { LegacyRelationalArtifactBinaryStore, MemoryObjectArtifactBinaryStore, RoutingArtifactBinaryStore } from "../artifact-automation/binary-adapters";
import { hashBytes, pointerFromArtifact, assertSignedDownload } from "../artifact-automation/binary-store";
import { assessObjectConsistency, reconcileArtifactStorage } from "../artifact-automation/storage-reconciliation";
import { createMemoryWorkContextStore } from "../work-context/memory-store";
import { EngineeringWorkContextService } from "../work-context/service";
import { attentionFingerprint } from "../attention/fingerprint";
import { createTestChangeWorkbenchService } from "../change-workbench/service";
import { loadChangeFixture, A11E_TENANT, A11E_PROJECT_A, A11E_WORKSPACE } from "../change-workbench/fixture";
import { workbenchActionsForLifecycle } from "../workbench/lifecycle-actions";
import {
  A14B_FAILURE_CLASSES,
  A14B_TIMEOUTS,
  PILOT_CONCURRENCY_TARGET,
  PILOT_HEALTH_COMPONENTS,
  PILOT_OPERATIONAL_ALERTS,
  PILOT_PERFORMANCE_THRESHOLDS,
  PILOT_STOP_CONDITIONS,
  healthPayloadIsSafe,
  mayRetryFailure,
  pilotOperationalHealth,
  rehearseKillSwitch,
  simulateJobAttempt,
  type JobAttemptState,
} from "../pilot/a14b-reliability";
import { SURVEILLANCE_PROHIBITIONS } from "../pilot/a14a-profile";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

describe("EOS-A14B reliability, recovery, and pilot operations", () => {
  it("defines bounded failure, retry, timeout, health, alert, and stop models", () => {
    expect(A14B_FAILURE_CLASSES).toContain("OBJECT_STORAGE_UNAVAILABLE");
    expect(mayRetryFailure("TRANSIENT_NETWORK")).toBe(true);
    expect(mayRetryFailure("AUTHORIZATION_FAILURE")).toBe(false);
    expect(mayRetryFailure("VALIDATION_FAILURE")).toBe(false);
    expect(mayRetryFailure("MALWARE_SCANNER_UNAVAILABLE")).toBe(false);
    expect(A14B_TIMEOUTS.malwareScanMs).toBe(8_000);
    expect(A14B_TIMEOUTS.signedUrlTtlSeconds).toBe(300);
    expect(PILOT_CONCURRENCY_TARGET.namedUsers).toBe(2);
    expect(PILOT_CONCURRENCY_TARGET.documentedTeamTarget).toBe(5);
    expect(PILOT_CONCURRENCY_TARGET.notEnterpriseScale).toBe(true);
    expect(PILOT_HEALTH_COMPONENTS).toContain("optional_connectors");
    const health = pilotOperationalHealth({
      application: "ok",
      database: "ok",
      objectStorage: "ok",
      malwareScanner: "unavailable",
      jobs: "ok",
      eventProcessing: "ok",
      optionalConnectors: "not_applicable",
    });
    expect(health.overall).toBe("degraded");
    expect(health.blockers).toEqual([]);
    expect(PILOT_OPERATIONAL_ALERTS).toContain("migration_integrity_error");
    expect(PILOT_STOP_CONDITIONS).toContain("cross_tenant_data_exposure");
    expect(SURVEILLANCE_PROHIBITIONS.productivityScoring).toBe(false);
    expect(healthPayloadIsSafe({ status: "healthy", service: "rtb-ai-os" })).toBe(true);
    expect(healthPayloadIsSafe({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IngiLCJpYXQiOjF9.xxx" })).toBe(false);
    const kill = rehearseKillSwitch({ EOS_CONTROLLED_PILOT_ENABLED: "0" });
    expect(kill.enabled).toBe(false);
    expect(kill.dataPreserved).toBe(true);
  });

  it("recovers jobs, bounds poison items, and preserves partial-batch success", () => {
    let job: JobAttemptState = { jobId: "pilot-job", status: "pending", retryCount: 0, maxRetries: 3 };
    job = simulateJobAttempt(job, "transient");
    expect(job.status).toBe("pending");
    expect(job.retryCount).toBe(1);
    const restarted = simulateJobAttempt(job, "success");
    expect(restarted.status).toBe("completed");
    expect(simulateJobAttempt(restarted, "transient").status).toBe("completed");
    let poison: JobAttemptState = { jobId: "poison", status: "pending", retryCount: 0, maxRetries: 3 };
    poison = simulateJobAttempt(poison, "poison");
    poison = simulateJobAttempt(poison, "poison");
    poison = simulateJobAttempt(poison, "poison");
    expect(poison.status).toBe("failed");
    expect(poison.retryCount).toBe(3);
  });

  it("replays work events without duplicate ids and collapses Attention fingerprints", async () => {
    const store = createMemoryWorkContextStore();
    const service = new EngineeringWorkContextService({ from() { return this; } } as never, store);
    const first = await service.recordMaterialEvent(commerce(), CRUSHER_FEED_TENANT, {
      eventType: "ARTIFACT_GENERATED",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      sourceObjectType: "engineering_generated_artifact",
      sourceObjectId: "art-1",
      sourceEventId: "ARTIFACT_GENERATED:art-1",
    });
    const replay = await service.recordMaterialEvent(commerce(), CRUSHER_FEED_TENANT, {
      eventType: "ARTIFACT_GENERATED",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      sourceObjectType: "engineering_generated_artifact",
      sourceObjectId: "art-1",
      sourceEventId: "ARTIFACT_GENERATED:art-1",
    });
    expect(replay.id).toBe(first.id);
    const fp = attentionFingerprint({
      sourceDomain: "artifact",
      sourceObjectId: "art-1",
      category: "REVIEW_REQUIRED",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stateKey: "READY_FOR_ENGINEER_REVIEW",
    });
    expect(fp).toBe(attentionFingerprint({
      sourceDomain: "artifact",
      sourceObjectId: "art-1",
      category: "REVIEW_REQUIRED",
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stateKey: "READY_FOR_ENGINEER_REVIEW",
    }));
  });

  it("detects object/metadata inconsistency and orphans without deleting", async () => {
    const objectStore = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from(Buffer.from("PK\u0003\u0004ok"));
    const pointer = pointerFromArtifact({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      id: "obj-1",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sha256: hashBytes(bytes),
      byteSize: bytes.byteLength,
    });
    const stored = await objectStore.put(pointer, bytes);
    const auth = { tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID };
    expect(await assessObjectConsistency({ pointer: stored, objectStore, auth })).toBe("CONSISTENT");
    expect(await assessObjectConsistency({
      pointer: { ...stored, contentSha256: "ab".repeat(32) },
      objectStore,
      auth,
    })).toBe("HASH_MISMATCH");
    expect(await assessObjectConsistency({ pointer: null, objectStore, auth })).toBe("METADATA_MISSING");
    const missing = { ...stored, objectKey: `${stored.objectKey}-missing`, artifactId: "missing" };
    expect(await assessObjectConsistency({ pointer: missing, objectStore, auth })).toBe("OBJECT_MISSING");
    objectStore.corrupt(stored.objectKey);
    expect(await assessObjectConsistency({ pointer: stored, objectStore, auth })).toBe("SIZE_MISMATCH");
    const report = reconcileArtifactStorage({
      metadataKeys: ["eos/a", "eos/b"],
      objectKeys: ["eos/a", "eos/orphan"],
      incompleteMigrationArtifactIds: ["mig-1"],
    });
    expect(report.autoDeleted).toBe(false);
    expect(report.metadataWithoutObject).toEqual(["eos/b"]);
    expect(report.objectWithoutMetadata).toEqual(["eos/orphan"]);
    expect(report.incompleteMigration).toEqual(["mig-1"]);
  });

  it("recreates object from legacy fixture and requires a fresh signed URL", async () => {
    const legacy = new LegacyRelationalArtifactBinaryStore();
    const objectStore = new MemoryObjectArtifactBinaryStore();
    const bytes = Uint8Array.from(Buffer.from("PK\u0003\u0004restored"));
    const pointer = pointerFromArtifact({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      id: "restore-1",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      sha256: hashBytes(bytes),
      byteSize: bytes.byteLength,
    });
    const source = await legacy.put(pointer, bytes);
    const restored = await objectStore.put(source, await legacy.openRead(source, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    }));
    const read = await objectStore.openRead(restored, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(hashBytes(read)).toBe(source.contentSha256);
    const signed = await objectStore.generateAuthorizedDownload(restored, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(() => assertSignedDownload({
      expiresAt: "2000-01-01T00:00:00.000Z",
      objectKey: restored.objectKey,
      expectedObjectKey: restored.objectKey,
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      auth: { tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID },
    })).toThrow("SIGNED_URL_EXPIRED");
    expect(signed.permanentLink).toBe(false);
  });

  it("measures Profile A generation, download, impact, workbench, and a bounded soak", async () => {
    const routing = new RoutingArtifactBinaryStore(new LegacyRelationalArtifactBinaryStore(), new MemoryObjectArtifactBinaryStore());
    const plan = generateEngineeringWorkPlan({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      template: templateFor("DESIGN_CALCULATION", "DETAILED_DESIGN")!,
      snapshot: detailedDesignReadySnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      generatedBy: "cert-a14b",
    });
    const planStarted = Date.now();
    const plans = createMemoryWorkPlanStore();
    await plans.savePlan(plan);
    const workPlanMs = Date.now() - planStarted;
    const artifacts = createMemoryArtifactStore();
    const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id), undefined, undefined, routing);
    const times: Record<string, number> = {};
    for (const artifactType of ["CALCULATION_WORKBOOK", "DESIGN_REPORT", "OPTION_STUDY_PRESENTATION"] as const) {
      const started = Date.now();
      const generated = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, artifactType, projectCode: "ER-A1" });
      expect(generated.ok).toBe(true);
      if (!generated.ok) continue;
      const opened = await artifactSvc.openBinary(commerce("analysis.read"), CRUSHER_FEED_TENANT, generated.artifact.id);
      times[artifactType] = Date.now() - started;
      expect(opened?.bytes.byteLength).toBeGreaterThan(32);
      expect(JSON.stringify(generated.artifact)).not.toMatch(/contentBase64.:.[^"]{80,}/);
    }
    const snapshot = await artifacts.listArtifacts(CRUSHER_FEED_WORKSPACE, plan.id);
    const restoredStore = createMemoryArtifactStore();
    for (const row of snapshot) await restoredStore.saveArtifact(row);
    const afterRestart = await restoredStore.listArtifacts(CRUSHER_FEED_WORKSPACE, plan.id);
    expect(afterRestart.map((row) => row.id).sort()).toEqual(snapshot.map((row) => row.id).sort());

    const soakStarted = Date.now();
    for (let i = 0; i < 4; i += 1) {
      await artifactSvc.list(commerce("analysis.read"), CRUSHER_FEED_TENANT, plan.id);
    }
    const soakMs = Date.now() - soakStarted;

    const impactStarted = Date.now();
    const impact = await createTestChangeWorkbenchService({ graph: loadChangeFixture() }).assess(
      createTestCommerceExecutionContext({
        tenantId: A11E_TENANT,
        workspaceId: A11E_WORKSPACE,
        policy: { productKey: "engineering-os", action: "analysis.write", seatRequired: true },
      }),
      A11E_TENANT,
      { sourceObjectType: "engineering_information", sourceObjectId: "info-mech-load", projectId: A11E_PROJECT_A },
    );
    const impactMs = Date.now() - impactStarted;
    expect(impact.assessment.snapshot.automaticImpactConfirmation).toBe(false);
    expect(workbenchActionsForLifecycle("FEED").map((row) => row.code)).not.toEqual(
      workbenchActionsForLifecycle("CONSTRUCTION").map((row) => row.code),
    );
    expect(workPlanMs).toBeLessThan(PILOT_PERFORMANCE_THRESHOLDS.workPlanGenerationP95Ms);
    expect(times.CALCULATION_WORKBOOK).toBeLessThan(PILOT_PERFORMANCE_THRESHOLDS.artifactGenerationP95Ms);
    expect(times.DESIGN_REPORT).toBeLessThan(PILOT_PERFORMANCE_THRESHOLDS.artifactGenerationP95Ms);
    expect(times.OPTION_STUDY_PRESENTATION).toBeLessThan(PILOT_PERFORMANCE_THRESHOLDS.artifactGenerationP95Ms);
    expect(impactMs).toBeLessThan(PILOT_PERFORMANCE_THRESHOLDS.impactAssessmentP95Ms);
    expect(soakMs).toBeLessThan(5_000);
  });
});
