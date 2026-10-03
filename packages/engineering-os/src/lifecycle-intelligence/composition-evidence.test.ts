import { describe, expect, it } from "vitest";
import { A11E_PROJECT_B } from "../change-workbench/fixture";
import { CRUSHER_EXPANSION_FEED_PROJECT_ID, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../work-generator/fixture";
import {
  A15A_V5B_REPORTBIND,
  A15A_V5B_REPORTBIND_HARDEN,
  assertCompositionEvidenceScope,
  evaluateEngineeringStateCompatibility,
  selectExplicitOverPlanLocal,
} from "./composition-evidence";
import type { PersistedMtoSnapshot } from "./quantity-mto-persist";

function snapshot(partial: Partial<PersistedMtoSnapshot> & Pick<PersistedMtoSnapshot, "id">): PersistedMtoSnapshot {
  return {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workPlanId: "mto-plan",
    systemId: null,
    discipline: "STRUCTURAL",
    disciplineScope: "STRUCTURAL",
    lifecycleStage: "FEED",
    revision: "A",
    status: "DRAFT",
    verificationState: "UNVERIFIED",
    sourceRevisionSet: [],
    itemCount: 0,
    snapshotFingerprint: "fp",
    staleness: "CURRENT",
    createdAt: "2026-10-03T00:00:00.000Z",
    createdBy: "cert-er-a1@rtb-cert.test",
    verifiedAt: null,
    verifiedBy: null,
    supersedesSnapshotId: null,
    exportDisclaimer: "DRAFT",
    items: [],
    thread: [],
    ...partial,
  };
}

describe("EOS-A15A-V5B-REPORTBIND composition evidence", () => {
  it("reuses V4/V4C binding without a new provenance subsystem", () => {
    expect(A15A_V5B_REPORTBIND.crossWorkPlanCalculationExecutionAllowed).toBe(false);
    expect(A15A_V5B_REPORTBIND.crossWorkPlanMtoEvidenceReferenceAllowed).toBe("YES_WITH_EXPLICIT_BINDING");
    expect(A15A_V5B_REPORTBIND.implicitProjectWideLatestMto).toBe(false);
    expect(A15A_V5B_REPORTBIND.sourceSelectionPrecedence).toBe("EXPLICIT_BOUND_SOURCE_OVER_PLAN_LOCAL");
    expect(A15A_V5B_REPORTBIND.newProvenanceSubsystem).toBe(false);
    expect(A15A_V5B_REPORTBIND.newGraphStore).toBe(false);
    expect(A15A_V5B_REPORTBIND.newSchema).toBe(false);
    expect(A15A_V5B_REPORTBIND_HARDEN.kgNodeRequiredForV5b).toBe(false);
    expect(A15A_V5B_REPORTBIND_HARDEN.blockedRunId).toBe("CANONICAL_RANDOM_UUID");
    expect(A15A_V5B_REPORTBIND_HARDEN.sectionAndUnitMassDisplay).toBe("NOT_REQUIRED_BY_CURRENT_TEMPLATE");
    expect(A15A_V5B_REPORTBIND_HARDEN.unverifiedCalculationMutable).toBe(true);
    expect(A15A_V5B_REPORTBIND_HARDEN.verifiedCalculationImmutable).toBe(true);
  });

  it("requires explicit MTO inputRefs to include the report calculation fingerprint", () => {
    const fingerprint = "e6125a540bb21e0184c3784142ca005015c02d20f51d583d8ac8487fc0231a5a";
    expect(evaluateEngineeringStateCompatibility({
      bindingKind: "EXPLICIT",
      reportCalculationFingerprint: fingerprint,
      mtoInputRefs: [fingerprint],
    })).toEqual({ ok: true });
    expect(evaluateEngineeringStateCompatibility({
      bindingKind: "EXPLICIT",
      reportCalculationFingerprint: fingerprint,
      mtoInputRefs: ["other"],
    })).toEqual({ ok: false, code: "ENGINEERING_STATE_MISMATCH" });
    expect(evaluateEngineeringStateCompatibility({
      bindingKind: "PLAN_LOCAL",
      reportCalculationFingerprint: fingerprint,
      mtoInputRefs: [],
    })).toEqual({ ok: true });
  });

  it("selects the exact explicit snapshot over a stale plan-local MTO", () => {
    const explicit = snapshot({ id: "60a6b753-61e6-4637-aa9f-5c527414abed", snapshotFingerprint: "46fe7119" });
    const planLocal = snapshot({ id: "e197a822-cd3f-41be-a909-b867be555491", revision: "D", snapshotFingerprint: "8ab573ce" });
    expect(selectExplicitOverPlanLocal({ explicit, planLocal })).toEqual({ snapshot: explicit, bindingKind: "EXPLICIT" });
  });

  it("denies cross-tenant, cross-workspace, and cross-project evidence scope", () => {
    const scope = {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      systemId: null,
    };
    expect(assertCompositionEvidenceScope(snapshot({ id: "ok" }), scope)).toBe("ok");
    expect(assertCompositionEvidenceScope(snapshot({ id: "t", tenantId: "other-tenant" }), scope)).toBe("CROSS_TENANT");
    expect(assertCompositionEvidenceScope(snapshot({ id: "w", workspaceId: "other-workspace" }), scope)).toBe("CROSS_WORKSPACE");
    expect(assertCompositionEvidenceScope(snapshot({ id: "p", projectId: A11E_PROJECT_B }), scope)).toBe("CROSS_PROJECT_MISMATCH");
  });
});
