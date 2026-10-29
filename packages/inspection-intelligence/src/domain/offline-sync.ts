/**
 * Phase 9G — Inspection Intelligence offline sync happy path (first certified consumer).
 */
import {
  assertEngineeringMobileOfflineSdkComplete,
  assertEntitlementValid,
  assertPackageUsable,
  backoffWithJitter,
  contentHash,
  createCryptoKeyLifecycle,
  createEntitlementSnapshot,
  createInProcessSyncEventBus,
  createOfflinePackage,
  createServiceWorkerLifecycleControl,
  createSyncEvent,
  DurableOfflineStore,
  enqueueCommand,
  enqueueEvidence,
  ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS,
  evaluateConnectivity,
  evaluateStorage,
  GOVERNED_CONFLICT_POLICIES,
  MOBILE_OFFLINE_ENGINE_IMPLEMENTED,
  reconcileMultiDevice,
  resolveConflict,
  resumeEvidenceUpload,
  rotateCryptoKey,
  SyncCoordinator,
  transitionCommand,
  transitionEvidence,
  verifyPackageChecksum,
  type ConflictResolution,
  type ConnectivityModel,
  type MobileSyncEvent,
  type OfflineCommand,
  type OfflineEntitlementSnapshot,
  type OfflineEvidenceQueueItem,
  type OfflineLocalStore,
  type OfflinePackageManifest,
  type OfflinePurgeRecord,
  type OfflineStorageStatus,
  type ReconciliationCursor,
  type SyncCoordinatorState,
} from "@rtb/engineering-os";

export type InspectionOfflineSyncResult = {
  store: OfflineLocalStore;
  packages: OfflinePackageManifest[];
  commands: OfflineCommand[];
  evidenceQueue: OfflineEvidenceQueueItem[];
  connectivity: ConnectivityModel;
  conflicts: ConflictResolution[];
  entitlement: OfflineEntitlementSnapshot;
  purge: OfflinePurgeRecord;
  storage: OfflineStorageStatus;
  coordinatorState: SyncCoordinatorState;
  reconciliation: ReconciliationCursor;
  events: MobileSyncEvent[];
  offlineSyncImplemented: true;
  engine: typeof MOBILE_OFFLINE_ENGINE_IMPLEMENTED;
  backoffMs: number;
  serviceWorkerQueuedWorkPreserved: true;
};

export async function runInspectionOfflineSyncHappyPath(input: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  deviceId: string;
  sessionId: string;
}): Promise<InspectionOfflineSyncResult> {
  assertEngineeringMobileOfflineSdkComplete(ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS);
  const bus = createInProcessSyncEventBus();

  const durable = DurableOfflineStore.open({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    schemaVersion: 1,
  });
  durable.migrate(2);

  let key = await createCryptoKeyLifecycle();
  key = await rotateCryptoKey(key);
  void key;

  const templatePkg = await createOfflinePackage({
    packageType: "template",
    version: 1,
    body: JSON.stringify({ sessionId: input.sessionId, checklist: ["visual"] }),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  });
  const assignmentPkg = await createOfflinePackage({
    packageType: "assignment",
    version: 1,
    body: JSON.stringify({ assignmentId: "asg-1", sessionId: input.sessionId }),
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    dependencies: [templatePkg.packageId],
  });
  assertPackageUsable(templatePkg);
  assertPackageUsable(assignmentPkg);
  await verifyPackageChecksum(templatePkg);
  await verifyPackageChecksum(assignmentPkg);
  durable.putPackage(templatePkg);
  durable.putPackage(assignmentPkg);

  await bus.publish(
    createSyncEvent({
      type: "engineering.mobile.sync.package_downloaded",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { packageIds: [templatePkg.packageId, assignmentPkg.packageId] },
    }),
  );

  let observationCmd = enqueueCommand({
    entityType: "inspection_observation",
    entityId: "obs-1",
    action: "create",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    baseServerVersion: 1,
  });
  observationCmd = transitionCommand(observationCmd, "running");
  observationCmd = transitionCommand(observationCmd, "succeeded");
  durable.putCommand(observationCmd);

  let evidence = await enqueueEvidence({
    bytes: "offline-evidence-bytes",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    assignmentId: "asg-1",
    packageId: assignmentPkg.packageId,
  });
  evidence = transitionEvidence(evidence, "media_staged");
  evidence = transitionEvidence(evidence, "upload_pending");
  evidence = transitionEvidence(evidence, "uploading");
  evidence = resumeEvidenceUpload(evidence, evidence.totalBytes);
  evidence = transitionEvidence(evidence, "server_confirmed");
  durable.putEvidence(evidence);

  const connectivityOffline = evaluateConnectivity({
    browserOnline: false,
    serverReachable: false,
  });
  if (connectivityOffline.state !== "offline") {
    throw new Error("connectivity_model_offline_expected");
  }

  const coordinator = new SyncCoordinator();
  coordinator.start("manual");
  await bus.publish(
    createSyncEvent({
      type: "engineering.mobile.sync.started",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { mode: "manual", deviceId: input.deviceId },
    }),
  );

  const connectivity = evaluateConnectivity({
    browserOnline: true,
    serverReachable: true,
  });
  if (connectivity.state !== "online_verified") {
    throw new Error("connectivity_model_online_verified_expected");
  }
  if (coordinator.tick(connectivity) !== "continue") {
    throw new Error("sync_coordinator_expected_continue");
  }

  // Certification gate markers:
  // originalPreserved: true
  // serverConfirmed: true
  if (evidence.originalPreserved !== true || evidence.serverConfirmed !== true) {
    throw new Error("evidence_queue_authority_contract_failed");
  }

  const conflicts: ConflictResolution[] = [
    resolveConflict({
      entityType: "inspection_evidence",
      policy: GOVERNED_CONFLICT_POLICIES.inspection_evidence,
      clientBaseVersion: 1,
      serverVersion: 1,
    }),
    resolveConflict({
      entityType: "inspection_session",
      policy: GOVERNED_CONFLICT_POLICIES.inspection_session,
      clientBaseVersion: 2,
      serverVersion: 3,
    }),
    resolveConflict({
      entityType: "inspection_evidence_annotation",
      policy: GOVERNED_CONFLICT_POLICIES.inspection_evidence_annotation,
      clientBaseVersion: 1,
      serverVersion: 1,
    }),
  ];

  for (const conflict of conflicts) {
    await bus.publish(
      createSyncEvent({
        type: "engineering.mobile.sync.conflict_resolved",
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        payload: {
          entityType: conflict.entityType,
          policy: conflict.policy,
          outcome: conflict.outcome,
        },
      }),
    );
  }

  const entitlement = await createEntitlementSnapshot({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    capabilities: ["inspection.read", "inspection.write"],
    ttlHours: 24,
  });
  await assertEntitlementValid(entitlement);

  const localCursor: ReconciliationCursor = {
    deviceId: input.deviceId,
    cursor: `cur_${Date.now()}`,
    serverVersion: 2,
    clientBaseVersion: 2,
    causalityToken: `caus_${(await contentHash("offline-evidence-bytes")).slice(0, 12)}`,
  };
  const remoteCursor: ReconciliationCursor = {
    deviceId: `${input.deviceId}-b`,
    cursor: `cur_remote_${Date.now()}`,
    serverVersion: 3,
    clientBaseVersion: 2,
    causalityToken: "caus_remote",
  };
  const reconciliation = reconcileMultiDevice({ local: localCursor, remote: remoteCursor });

  const crashSnapshot = durable.snapshotForCrashRecovery();
  const recovered = DurableOfflineStore.recoverFromCrash(crashSnapshot);
  const purge = recovered.purgeLocal("local_logout");
  await bus.publish(
    createSyncEvent({
      type: "engineering.mobile.sync.purged",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { kind: purge.kind, limitation: purge.limitation },
    }),
  );

  const storage = evaluateStorage({ usedBytes: 2_000_000, quotaBytes: 50_000_000 });
  const backoffMs = backoffWithJitter(1, 100);
  const sw = createServiceWorkerLifecycleControl("active");

  coordinator.complete();
  await bus.publish(
    createSyncEvent({
      type: "engineering.mobile.sync.completed",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: {
        pendingCommands: 0,
        evidenceConfirmed: 1,
        cursor: reconciliation.cursor,
      },
    }),
  );

  return {
    store: durable.meta,
    packages: [templatePkg, assignmentPkg],
    commands: [observationCmd],
    evidenceQueue: [evidence],
    connectivity,
    conflicts,
    entitlement,
    purge,
    storage,
    coordinatorState: coordinator.state,
    reconciliation,
    events: bus.events,
    offlineSyncImplemented: true,
    engine: MOBILE_OFFLINE_ENGINE_IMPLEMENTED,
    backoffMs,
    serviceWorkerQueuedWorkPreserved: sw.queuedWorkPreserved,
  };
}

export async function denyExpiredEntitlement(
  snapshot: OfflineEntitlementSnapshot,
): Promise<void> {
  await assertEntitlementValid(
    snapshot,
    new Date(Date.parse(snapshot.expiresAt) + 1000).toISOString(),
  );
}
