import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
  INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_OPERATIONAL_WORKFLOWS_READY,
  getInspectionIntelligenceDomainDeclaration,
  runInspectionMobileProductHappyPath,
  denyCrossTenantScan,
  toPackMobileFormDescriptor,
  GENERIC_INSPECTION_PACK_SDK,
  COATINGS_PACK_SCAFFOLD,
} from "../src";
import {
  assertEngineeringMobileSdkComplete,
  ENGINEERING_MOBILE_SDK_VERSION,
  ENGINEERING_MOBILE_CAPABILITY_MANIFESTS,
  classifyViewport,
  MOBILE_MIN_TOUCH_TARGET_PX,
} from "@rtb/engineering-os";

describe("Phase 9F mobile product", () => {
  it("locks mobile identity without offline or AI Vision", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.6.0-mobile-product");
    expect(INSPECTION_MOBILE_PRODUCT_IMPLEMENTED).toBe(true);
    expect(INSPECTION_OPERATIONAL_WORKFLOWS_READY).toBe(true);
    expect(INSPECTION_OFFLINE_SYNC_IMPLEMENTED).toBe(false);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.usesEngineeringMobileSdk).toBe(true);
    expect(decl.mobileProductImplemented).toBe(true);
    expect(decl.offlineSyncImplemented).toBe(false);
  });

  it("exposes complete Engineering Mobile SDK capabilities and viewports", () => {
    expect(ENGINEERING_MOBILE_SDK_VERSION).toBe("0.6.0");
    expect(ENGINEERING_MOBILE_CAPABILITY_MANIFESTS.map((c) => c.capabilityId)).toContain(
      "camera.capture",
    );
    expect(() => assertEngineeringMobileSdkComplete()).not.toThrow();
    expect(classifyViewport(390, 844)).toBe("phone");
    expect(classifyViewport(1024, 768)).toBe("tablet_landscape");
    expect(classifyViewport(768, 1024)).toBe("tablet_portrait");
    expect(MOBILE_MIN_TOUCH_TARGET_PX).toBe(44);
  });

  it("runs camera → evidence → scan → annotation → attestation without mutating hash", async () => {
    const result = await runInspectionMobileProductHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      observationId: "o1",
      actorUserId: "u1",
      authenticationContext: "session:authenticated",
    });
    expect(result.evidence.aiVisionInference).toBe(false);
    expect(result.evidence.contentHash).toHaveLength(64);
    expect(result.annotation.sourceEvidenceId).toBe(result.evidence.evidenceId);
    expect(result.signatureMark.supplementaryOnly).toBe(true);
    expect(result.attestation.workflowTransition).toBe("submit");
    expect(result.offlineSyncImplemented).toBe(false);
    expect(result.syncReadiness).toBe("server_confirmed");
    expect(result.events.some((e) => e.type === "engineering.mobile.evidence_uploaded")).toBe(
      true,
    );
    expect(() =>
      denyCrossTenantScan({ scanTenantId: "other", sessionTenantId: "t1" }),
    ).toThrow(/cross_tenant/);
    const generic = toPackMobileFormDescriptor(GENERIC_INSPECTION_PACK_SDK);
    const coatings = toPackMobileFormDescriptor(COATINGS_PACK_SCAFFOLD);
    expect(generic.executableCodeForbidden).toBe(true);
    expect(coatings.measurementInputType).toBe("dft");
  });
});
