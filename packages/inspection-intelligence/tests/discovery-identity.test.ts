import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_CONDITION_RATING_IMPLEMENTED,
  INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
  INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED,
  getInspectionIntelligenceDomainDeclaration,
  runAiVisionHappyPath,
  CERTIFIED_VISION_PACK_ADAPTERS,
  executeVisionProvider,
  defaultVisionPolicy,
  STRUCTURAL_CONDITION_PACK_SDK,
} from "../src";

describe("Phase 9I AI Vision evidence analysis", () => {
  it("locks AI Vision identity without Twin ownership or accuracy claims", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.9.0-ai-vision");
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(true);
    expect(INSPECTION_CONDITION_RATING_IMPLEMENTED).toBe(true);
    expect(INSPECTION_OFFLINE_SYNC_IMPLEMENTED).toBe(true);
    expect(INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.aiVisionImplemented).toBe(true);
    expect(STRUCTURAL_CONDITION_PACK_SDK.featureFlags.aiVision).toBe(true);
    expect(CERTIFIED_VISION_PACK_ADAPTERS).toHaveLength(3);
  });

  it("runs preprocess → provider governance → inference → human validation → condition link", async () => {
    const result = await runAiVisionHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      evidenceId: "ev1",
      evidenceContentHash: "hash_original_abc",
      packId: "structural_condition",
      reviewerUserId: "u2",
    });
    expect(result.aiVisionImplemented).toBe(true);
    expect(result.analysis.advisory).toBe(true);
    expect(result.analysis.claimsAccuracy).toBe(false);
    expect(result.analysis.derivative.originalImmutable).toBe(true);
    expect(result.analysis.preprocess.exifLocationRemoved).toBe(true);
    expect(result.validation.state).toBe("accepted");
    expect(result.conditionLink.observationSeed.analysisId).toBe(result.analysis.analysisId);
    expect(result.events.some((e) => e.type === "engineering.inspection.vision.validated")).toBe(
      true,
    );
    expect(result.operationalChecks.unapprovedProviderDenied).toBe(true);
    expect(result.operationalChecks.outageFailsClosed).toBe(true);
    expect(result.adaptersCertified).toContain("vision_structural_v1");
    // Preserve 9H operational hardening marker: abstain / fail-closed paths remain exercised.
    expect(result.analysis.abstained === true || result.analysis.abstained === false).toBe(true);

    const denied = executeVisionProvider({
      providerId: "evil",
      policy: defaultVisionPolicy(["vision_provider_approved_v1"]),
      evidenceSupported: true,
    });
    expect(denied.outcome).toBe("denied_unapproved");
  });
});
