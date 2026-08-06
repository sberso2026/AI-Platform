import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
  INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
  INSPECTION_AI_VISION_IMPLEMENTED,
  getInspectionIntelligenceDomainDeclaration,
  runInspectionOfflineSyncHappyPath,
  denyExpiredEntitlement,
  buildPackAwareMobileReports,
  GENERIC_INSPECTION_PACK_SDK,
  COATINGS_PACK_SCAFFOLD,
} from "../src";
import {
  assertEngineeringMobileOfflineSdkComplete,
  ENGINEERING_MOBILE_OFFLINE_SDK_VERSION,
  MOBILE_OFFLINE_ENGINE_IMPLEMENTED,
  ENGINEERING_MOBILE_SDK_VERSION,
} from "@rtb/engineering-os";

describe("Phase 9G offline synchronization", () => {
  it("locks offline identity without AI Vision", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.7.0-offline-sync");
    expect(INSPECTION_MOBILE_PRODUCT_IMPLEMENTED).toBe(true);
    expect(INSPECTION_OFFLINE_SYNC_IMPLEMENTED).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.offlineSyncImplemented).toBe(true);
    expect(decl.mobileReportingImplemented).toBe(true);
  });

  it("exposes implemented Engineering Mobile Offline SDK", () => {
    expect(ENGINEERING_MOBILE_SDK_VERSION).toBe("0.7.0");
    expect(ENGINEERING_MOBILE_OFFLINE_SDK_VERSION).toBe("0.7.0");
    expect(MOBILE_OFFLINE_ENGINE_IMPLEMENTED.durableLocalCommandQueue).toBe(true);
    expect(() => assertEngineeringMobileOfflineSdkComplete()).not.toThrow();
  });

  it("runs offline package → queue → sync → conflict → entitlement → purge", async () => {
    const result = await runInspectionOfflineSyncHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      userId: "u1",
      deviceId: "d1",
      sessionId: "s1",
    });
    expect(result.offlineSyncImplemented).toBe(true);
    expect(result.store.encrypted).toBe(true);
    expect(result.store.schemaVersion).toBe(2);
    expect(result.packages).toHaveLength(2);
    expect(result.commands[0]?.state).toBe("succeeded");
    expect(result.evidenceQueue[0]?.originalPreserved).toBe(true);
    expect(result.connectivity.state).toBe("online_verified");
    expect(result.conflicts.every((c) => c.lastWriteWinsForbidden)).toBe(true);
    expect(result.events.some((e) => e.type === "engineering.mobile.sync.completed")).toBe(true);
    await expect(denyExpiredEntitlement(result.entitlement)).rejects.toThrow(/expired/);

    const genericReports = buildPackAwareMobileReports({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      pack: GENERIC_INSPECTION_PACK_SDK,
      evidenceVersions: ["1"],
      offlineOrigin: true,
      synchronizationStatus: "synced",
    });
    const coatingsReports = buildPackAwareMobileReports({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      pack: COATINGS_PACK_SCAFFOLD,
      evidenceVersions: ["1"],
      offlineOrigin: false,
      synchronizationStatus: "published",
    });
    expect(genericReports.every((r) => r.mobileReady)).toBe(true);
    expect(coatingsReports[0]?.packId).toBe("coatings");
  });
});
