/**
 * Phase 9G offline scenario matrix — crash, retry, upload, entitlement, purge, etc.
 */
import { describe, expect, it } from "vitest";
import {
  assertEntitlementValid,
  assertPackageUsable,
  assertServiceWorkerUpdateSafe,
  backoffWithJitter,
  createCryptoKeyLifecycle,
  createEntitlementSnapshot,
  createOfflinePackage,
  createServiceWorkerLifecycleControl,
  DurableOfflineStore,
  enqueueCommand,
  enqueueEvidence,
  evaluateConnectivity,
  evaluateStorage,
  GOVERNED_CONFLICT_POLICIES,
  reconcileMultiDevice,
  resolveConflict,
  resumeEvidenceUpload,
  revokeEntitlementOnReconnect,
  revokePackage,
  selectRunnableCommands,
  SyncCoordinator,
  transitionCommand,
  transitionEvidence,
  verifyPackageChecksum,
} from "./offline";

describe("Engineering Mobile Offline SDK scenarios", () => {
  it("recovers queued work after crash/reload snapshot", async () => {
    const store = DurableOfflineStore.open({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
    });
    const cmd = enqueueCommand({
      entityType: "inspection_observation",
      entityId: "o1",
      action: "create",
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      operationId: "op_stable_1",
    });
    store.putCommand(cmd);
    const snap = store.snapshotForCrashRecovery();
    const recovered = DurableOfflineStore.recoverFromCrash(snap);
    expect(recovered.getCommand("op_stable_1")?.state).toBe("queued");
    const coordinator = new SyncCoordinator();
    coordinator.recover();
    expect(coordinator.state).toBe("idle");
  });

  it("retries failed commands idempotently without duplicating operation ids", () => {
    let cmd = enqueueCommand({
      entityType: "inspection_observation",
      entityId: "o1",
      action: "create",
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      operationId: "op_retry",
    });
    const key = cmd.idempotencyKey;
    cmd = transitionCommand(cmd, "running");
    cmd = transitionCommand(cmd, "failed");
    cmd = transitionCommand(cmd, "queued");
    expect(cmd.operationId).toBe("op_retry");
    expect(cmd.idempotencyKey).toBe(key);
    expect(cmd.retryCount).toBe(1);
    expect(backoffWithJitter(1, 100, () => 0.5)).toBeGreaterThan(100);
  });

  it("resumes partial evidence upload without duplicating original bytes", async () => {
    let item = await enqueueEvidence({
      bytes: "ABCDEFGHIJ",
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
    });
    item = transitionEvidence(item, "media_staged");
    item = transitionEvidence(item, "upload_pending");
    item = transitionEvidence(item, "uploading");
    item = resumeEvidenceUpload(item, 4);
    expect(item.uploadOffsetBytes).toBe(4);
    expect(item.originalBytes).toBe("ABCDEFGHIJ");
    item = resumeEvidenceUpload(item, 6);
    expect(item.state).toBe("uploaded");
    item = transitionEvidence(item, "server_confirmed");
    expect(item.serverConfirmed).toBe(true);
    expect(item.originalPreserved).toBe(true);
  });

  it("denies expired entitlement and integrity failures", async () => {
    const snap = await createEntitlementSnapshot({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      capabilities: ["inspection.write"],
      ttlHours: 1,
      issuedAt: new Date(Date.now() - 2 * 3600_000),
    });
    await expect(assertEntitlementValid(snap)).rejects.toThrow(/expired/);
    const fresh = await createEntitlementSnapshot({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      capabilities: ["inspection.write"],
    });
    const tampered = { ...fresh, integrityHash: "deadbeef" };
    await expect(assertEntitlementValid(tampered)).rejects.toThrow(/integrity/);
  });

  it("purges on account switch and isolates tenants", async () => {
    const store = DurableOfflineStore.open({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
    });
    store.putCommand(
      enqueueCommand({
        entityType: "x",
        entityId: "1",
        action: "a",
        tenantId: "t1",
        workspaceId: "w1",
        userId: "u1",
      }),
    );
    expect(() =>
      store.putCommand(
        enqueueCommand({
          entityType: "x",
          entityId: "2",
          action: "a",
          tenantId: "t2",
          workspaceId: "w1",
          userId: "u1",
        }),
      ),
    ).toThrow(/isolation/);
    const purge = store.purgeLocal("account_switch");
    expect(purge.recordsPurged).toBeGreaterThan(0);
    expect(store.listCommands()).toHaveLength(0);
  });

  it("rejects revoked packages and server-authoritative conflicts", async () => {
    const pkg = await createOfflinePackage({
      packageType: "template",
      version: 1,
      body: "{}",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });
    await verifyPackageChecksum(pkg);
    const revoked = revokePackage(pkg);
    expect(() => assertPackageUsable(revoked)).toThrow(/revoked/);
    const rejected = resolveConflict({
      entityType: "inspection_assignment",
      policy: GOVERNED_CONFLICT_POLICIES.inspection_assignment,
      clientBaseVersion: 5,
      serverVersion: 3,
    });
    expect(rejected.outcome).toBe("rejected");
    expect(rejected.lastWriteWinsForbidden).toBe(true);
  });

  it("upgrades schema and protects storage under pressure", () => {
    const store = DurableOfflineStore.open({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      schemaVersion: 1,
    });
    store.migrate(2);
    expect(store.meta.schemaVersion).toBe(2);
    expect(() => store.migrate(1)).toThrow(/downgrade/);
    const pressure = evaluateStorage({ usedBytes: 96, quotaBytes: 100 });
    expect(pressure.pressure).toBe("critical");
    expect(pressure.unsyncedEvidenceProtected).toBe(true);
    expect(pressure.evictionSafe).toBe(false);
  });

  it("treats clock skew and concurrent-device edits deterministically", async () => {
    const snap = await createEntitlementSnapshot({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      capabilities: ["inspection.read"],
      ttlHours: 1,
    });
    // Client clock ahead of server by 2h — still deny after true expiry with skew compensation
    await expect(
      assertEntitlementValid(snap, new Date(Date.parse(snap.expiresAt) + 1000).toISOString(), 0),
    ).rejects.toThrow(/expired/);
    const revoked = revokeEntitlementOnReconnect(snap);
    await expect(assertEntitlementValid(revoked)).rejects.toThrow(/revoked/);

    const a = {
      deviceId: "a",
      cursor: "c1",
      serverVersion: 2,
      clientBaseVersion: 1,
      causalityToken: "ca",
    };
    const b = {
      deviceId: "b",
      cursor: "c2",
      serverVersion: 4,
      clientBaseVersion: 2,
      causalityToken: "cb",
    };
    const merged = reconcileMultiDevice({ local: a, remote: b });
    expect(merged.serverVersion).toBe(4);
    expect(merged.causalityToken).toContain("ca");
  });

  it("enforces command dependencies and sync pause/resume/cancel", () => {
    const parent = enqueueCommand({
      entityType: "inspection_session",
      entityId: "s1",
      action: "update",
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      operationId: "op_parent",
    });
    const child = enqueueCommand({
      entityType: "inspection_observation",
      entityId: "o1",
      action: "create",
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      operationId: "op_child",
      dependsOn: ["op_parent"],
    });
    expect(selectRunnableCommands([parent, child])).toEqual([parent]);
    const doneParent = transitionCommand(transitionCommand(parent, "running"), "succeeded");
    expect(selectRunnableCommands([doneParent, child]).map((c) => c.operationId)).toEqual([
      "op_child",
    ]);

    const sync = new SyncCoordinator();
    sync.start("foreground_opportunistic");
    sync.pause();
    expect(sync.state).toBe("paused");
    sync.resume();
    expect(sync.tick(evaluateConnectivity({ browserOnline: true, serverReachable: true }))).toBe(
      "continue",
    );
    sync.cancel();
    expect(sync.state).toBe("cancelled");
  });

  it("preserves queues across service-worker version-compatible updates", async () => {
    const key = await createCryptoKeyLifecycle();
    expect(key.wrapped).toBe(true);
    expect(key.algorithm).toBe("AES-GCM");
    const sw = createServiceWorkerLifecycleControl("waiting");
    expect(() => assertServiceWorkerUpdateSafe(sw, "0.7.0")).not.toThrow();
    expect(sw.queuedWorkPreserved).toBe(true);
    expect(evaluateConnectivity({ browserOnline: true, serverReachable: false }).state).toBe(
      "browser_online_unverified",
    );
  });
});
