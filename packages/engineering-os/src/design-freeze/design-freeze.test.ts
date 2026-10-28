import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addDeliverable,
  addException,
  addFreeze,
  addPackage,
  addPackageMember,
  addTransmittal,
  approveDeliverable,
  approveFreeze,
  assessFreeze,
  baselineFingerprint,
  closeException,
  compareBaselines,
  createFreezeRegister,
  deliverableRegister,
  disciplineReadiness,
  displayIssuePurpose,
  EXTERNAL_DMS_ADAPTER_OPERATIONS,
  formatRevision,
  freezeHome,
  includeInBaseline,
  mapExternalStatus,
  markUpstreamRevision,
  packageReadiness,
  postIfcDisposition,
  progressReview,
  readinessAdvisory,
  releaseDeliverable,
  setDisposition,
  setIssuePurpose,
  supersedeDeliverable,
  updateDependencies,
  updateFreezeItem,
  withdrawDeliverable,
} from "./index";
import type { FreezeActor } from "./engine";
import {
  AI_BASELINE_MUTATION_AUTHORITY,
  AI_DELIVERABLE_APPROVAL_AUTHORITY,
  AI_FREEZE_APPROVAL_AUTHORITY,
  AI_IFC_RELEASE_AUTHORITY,
  AI_RELEASE_AUTHORITY,
  DISCIPLINES,
  type Discipline,
  type FreezeRegister,
  type RevisionRef,
} from "./model";

const at = "2026-10-29T00:40:00Z";
function actor(actingRole: string, role = "release_governor"): FreezeActor {
  return { actorId: "eng-1", actorRole: role, actingRole, at, workspaceId: "workspace-a" };
}
function must<T extends { error: string | null; register: FreezeRegister }>(result: T): FreezeRegister {
  expect(result.error).toBeNull();
  return result.register;
}
function ref(objectId: string, discipline: Discipline, revision = "1", status = "current"): RevisionRef {
  return { objectId, revision, status, source: "synthetic", discipline };
}
function releaseReady(register: FreezeRegister, id: string, discipline: Discipline): FreezeRegister {
  register = must(progressReview(register, actor(discipline), id, "in_review"));
  register = must(progressReview(register, actor(discipline), id, "review_complete"));
  register = must(approveDeliverable(register, actor("deliverable_authority"), id));
  return must(releaseDeliverable(register, actor("release_authority"), id));
}

describe("EOS 2.13 design freeze and deliverable governance", () => {
  it("freezes exact revisions and governs release without rewriting history", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordIacObjectIdentity");
    const feedItems = DISCIPLINES.map((discipline) => ref(`${discipline}-feed`, discipline));
    expect(baselineFingerprint(feedItems)).toBe(baselineFingerprint([...feedItems].reverse()));
    let register = must(createFreezeRegister({
      id: "frz", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-freeze-demo",
      projectTitle: "EOS Design Freeze and Deliverable Governance Demo", actorId: "eng-1", at,
    }));
    expect(register.a4Replaced).toBe(false);
    expect(register.documentsReplaced).toBe(false);
    expect(addFreeze(register, actor("mechanical"), { id: "bad", freezeType: "feed_baseline", stage: "feed", title: "bad", scope: "P-101", disciplines: ["mechanical"], items: [ref("x", "mechanical", "latest")] }).error).toMatch(/exact revision/);
    register = must(addFreeze(register, actor("mechanical"), { id: "feed", freezeType: "feed_baseline", stage: "feed", title: "FEED baseline", scope: "Synthetic Feed Pump Facility P-101", disciplines: [...DISCIPLINES], items: feedItems }));
    const feedFingerprint = register.freezes[0]?.fingerprint;
    register = must(approveFreeze(register, actor("freeze_authority"), "feed"));
    expect(register.freezes[0]?.frozen).toBe(true);
    expect(register.freezes[0]?.items).toHaveLength(8);
    expect(updateFreezeItem(register, actor("freeze_authority"), "feed", "process-feed", "stale").error).toMatch(/not rewritten/);
    expect(register.freezes[0]?.fingerprint).toBe(feedFingerprint);
    const later = feedItems.map((item) => item.objectId === "process-feed" ? { ...item, revision: "2" } : item).concat([ref("added-note", "process", "1")]);
    expect(compareBaselines(register.freezes[0]?.items ?? [], later).revised).toEqual(["process-feed"]);
    expect(compareBaselines(register.freezes[0]?.items ?? [], later).added).toEqual(["added-note"]);
    expect(register.freezes[0]?.items.find((item) => item.objectId === "process-feed")?.revision).toBe("1");

    register = must(addFreeze(register, actor("piping"), {
      id: "detailed", freezeType: "detailed_design_freeze", stage: "detailed_engineering", title: "Detailed freeze", scope: "P-101",
      disciplines: ["piping", "structural"], items: [ref("pipe-model", "piping", "1", "stale"), ref("str-basis", "structural")],
    }));
    expect(assessFreeze(register.freezes.find((item) => item.id === "detailed")!).readiness).toBe("NOT_READY");
    register = must(updateFreezeItem(register, actor("piping"), "detailed", "pipe-model", "current"));
    register = must(addException(register, actor("piping"), "detailed", { id: "ex-1", discipline: "piping", objectId: "pipe-model", rationale: "Reviewed assumption", condition: "Confirm before IFC", status: "open" }));
    expect(assessFreeze(register.freezes.find((item) => item.id === "detailed")!).readiness).toBe("READY_WITH_CONDITIONS");
    register = must(closeException(register, actor("piping"), "detailed", "ex-1"));
    expect(assessFreeze(register.freezes.find((item) => item.id === "detailed")!).readiness).toBe("READY");

    register = must(addDeliverable(register, actor("structural"), {
      id: "str-dwg", discipline: "structural", deliverableType: "drawing", number: "STR-DWG-001", title: "Pump support drawing",
      revision: "1", stage: "detailed_engineering", issuePurpose: "INTERNAL_REVIEW", engineeringStatus: "in_preparation",
      reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released", current: true, plannedDate: "2026-10-01",
      dependencies: [ref("mass", "mechanical", "1", "stale"), ref("pipe-load", "piping"), ref("geo-param", "geotechnical"), ref("str-calc", "structural", "1", "current")],
    }));
    expect(register.deliverables[0]?.dependencies.some((item) => item.status !== "current")).toBe(true);
    register = must(updateDependencies(register, actor("structural"), "str-dwg", [ref("mass", "mechanical"), ref("pipe-load", "piping"), ref("geo-param", "geotechnical"), ref("str-calc", "structural")]));
    expect(register.deliverables[0]?.dependencies.every((item) => item.status === "current")).toBe(true);
    expect(progressReview(register, actor("structural"), "str-dwg", "review_complete").error).toMatch(/not legal/);
    expect(releaseDeliverable(register, actor("release_authority"), "str-dwg").error).toMatch(/review is incomplete/);
    register = must(setIssuePurpose(register, actor("structural"), "str-dwg", "APPROVAL"));
    register = must(setIssuePurpose(register, actor("structural"), "str-dwg", "CONSTRUCTION"));
    expect(displayIssuePurpose("CONSTRUCTION")).toEqual({ canonical: "CONSTRUCTION", label: "IFC" });
    expect(register.deliverables.find((item) => item.id === "str-dwg")?.issuePurpose).toBe("CONSTRUCTION");
    register = releaseReady(register, "str-dwg", "structural");
    expect(register.deliverables.find((item) => item.id === "str-dwg")?.checksum.length).toBeGreaterThan(10);
    expect(register.audits.some((item) => item.action === "deliverable_released" && item.actingRole === "release_authority")).toBe(true);

    register = must(addFreeze(register, actor("structural"), { id: "ifc", freezeType: "ifc_baseline", stage: "detailed_engineering", title: "IFC baseline", scope: "P-101", disciplines: ["structural"], items: [] }));
    register = must(includeInBaseline(register, actor("structural"), "ifc", "str-dwg"));
    register = must(approveFreeze(register, actor("freeze_authority"), "ifc"));
    const ifcItems = register.freezes.find((item) => item.id === "ifc")?.items.map((item) => ({ ...item }));
    register = must(markUpstreamRevision(register, actor("mechanical"), "mass", "2"));
    expect(register.deliverables.find((item) => item.id === "str-dwg")?.freshness).toBe("potentially_stale");
    expect(register.deliverables.find((item) => item.id === "str-dwg")?.revision).toBe("1");
    expect(register.deliverables.filter((item) => item.number === "STR-DWG-001")).toHaveLength(1);
    expect(postIfcDisposition(register, "str-dwg")).toBe("REVISED_IFC_REQUIRED");
    expect(register.freezes.find((item) => item.id === "ifc")?.items).toEqual(ifcItems);
    register = must(setDisposition(register, actor("structural"), "str-dwg", "REVISION_REQUIRED"));
    register = must(supersedeDeliverable(register, actor("structural"), "str-dwg", "2"));
    expect(register.deliverables.find((item) => item.id === "str-dwg")?.releaseStatus).toBe("superseded");
    expect(register.deliverables.find((item) => item.id === "str-dwg-2")?.current).toBe(true);
    expect(register.freezes.find((item) => item.id === "ifc")?.items.find((item) => item.objectId === "str-dwg")?.revision).toBe("1");

    register = must(addDeliverable(register, actor("electrical"), {
      id: "old-list", discipline: "electrical", deliverableType: "list", number: "ELEC-LST-001", title: "Withdrawn list",
      revision: "1", stage: "feed", issuePurpose: "WORKING", engineeringStatus: "in_preparation", reviewStatus: "not_started",
      approvalStatus: "not_required", releaseStatus: "not_released", current: true, plannedDate: null, dependencies: [],
    }));
    register = must(withdrawDeliverable(register, actor("release_authority"), "old-list", { reason: "Superseded by package list", authority: "release_authority", date: at, replacementId: "str-dwg-2" }));
    expect(register.deliverables.find((item) => item.id === "old-list")?.withdrawnReason).toBe("Superseded by package list");

    register = must(addPackage(register, actor("electrical"), { id: "pkg", packageType: "IFC work package", deliverableIds: [], requiredIds: ["elec-dwg"], released: false }));
    expect(packageReadiness(register, "pkg").ready).toBe(false);
    register = must(addDeliverable(register, actor("electrical"), {
      id: "elec-dwg", discipline: "electrical", deliverableType: "drawing", number: "ELEC-DWG-001", title: "Load drawing",
      revision: "1", stage: "detailed_engineering", issuePurpose: "CONSTRUCTION", engineeringStatus: "in_preparation",
      reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released", current: true, plannedDate: null, dependencies: [],
    }));
    register = must(addPackageMember(register, actor("electrical"), "pkg", "elec-dwg"));
    expect(packageReadiness(register, "pkg").ready).toBe(true);
    register = must(addTransmittal(register, actor("electrical"), { id: "trm-1", packageId: "pkg", deliverableIds: ["elec-dwg"], issuePurpose: "CONSTRUCTION", sender: "eng-1", recipients: ["construction"], issueDate: at, status: "issued" }));

    for (const [id, discipline, type, number] of [
      ["proc-spec", "process", "specification", "PR-SPEC-001"],
      ["mech-data", "mechanical", "datasheet", "MECH-DS-001"],
      ["vendor-doc", "mechanical", "vendor_document", "VEN-001"],
      ["mto", "piping", "mto", "PIP-MTO-001"],
      ["str-model", "structural", "model", "STR-MOD-001"],
      ["str-calc-doc", "structural", "calculation", "STR-CAL-001"],
    ] as const) {
      register = must(addDeliverable(register, actor(discipline), {
        id, discipline, deliverableType: type, number, title: number, revision: "1", stage: "feed", issuePurpose: "INFORMATION",
        engineeringStatus: "in_preparation", reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released",
        current: true, plannedDate: null, dependencies: type === "calculation" ? [ref("mass", "mechanical", "1")] : [],
      }));
    }
    register = must(markUpstreamRevision(register, actor("mechanical"), "mass", "3"));
    register = must(addFreeze(register, actor("process"), {
      id: "cross", freezeType: "feed_baseline", stage: "feed", title: "Cross discipline", scope: "P-101",
      disciplines: ["structural", "instrumentation_and_control", "process"],
      items: [ref("str-ok", "structural"), ref("ic-if", "instrumentation_and_control", "1", "unaccepted"), ref("pr-if", "process", "1", "unaccepted")],
    }));
    const readiness = disciplineReadiness(register, "cross");
    expect(readiness.structural?.blockers).toEqual([]);
    expect(readiness.instrumentation_and_control?.blockers).toContain("UNACCEPTED_INTERFACE");
    expect(readiness.project?.blockers).toContain("UNACCEPTED_INTERFACE");
    expect(readiness.project).not.toHaveProperty("score");
    expect(readinessAdvisory(register)).toContain("one stale calculation");
    expect(readinessAdvisory(register)).toContain("one unresolved interface");
    expect(readinessAdvisory(register)).toContain("one missing approval");
    expect(readinessAdvisory(register)).toContain("one post-freeze change");
    expect(readinessAdvisory(register)).toContain("does not authorize release");
    expect(deliverableRegister(register).some((item) => item.number === "STR-DWG-001")).toBe(true);
    expect(formatRevision("3", { prefix: "Rev " })).toBe("Rev 3");
    expect(mapExternalStatus("IFC", { IFC: "CONSTRUCTION" })).toBe("CONSTRUCTION");
    expect(EXTERNAL_DMS_ADAPTER_OPERATIONS).toContain("retrieve_revision");
    expect(freezeHome(register).approvalGranted).toBe(false);
    expect(AI_FREEZE_APPROVAL_AUTHORITY).toBe(false);
    expect(AI_DELIVERABLE_APPROVAL_AUTHORITY).toBe(false);
    expect(AI_RELEASE_AUTHORITY).toBe(false);
    expect(AI_IFC_RELEASE_AUTHORITY).toBe(false);
    expect(AI_BASELINE_MUTATION_AUTHORITY).toBe(false);
  });

  it("denies generic authority and cross-workspace release", () => {
    let register = must(createFreezeRegister({
      id: "frz-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-freeze-demo",
      projectTitle: "EOS Design Freeze and Deliverable Governance Demo", actorId: "eng-1", at,
    }));
    register = must(addFreeze(register, actor("structural"), { id: "feed-2", freezeType: "feed_baseline", stage: "feed", title: "FEED", scope: "P-101", disciplines: ["structural"], items: [ref("str", "structural")] }));
    expect(approveFreeze(register, { ...actor("freeze_authority"), actorRole: "owner" }, "feed-2").error).toMatch(/not granted/);
    expect(approveFreeze(register, { ...actor("freeze_authority"), actorRole: "ai", actingRole: "ai" }, "feed-2").error).toMatch(/not granted/);
    register = must(addDeliverable(register, actor("structural"), {
      id: "dwg-2", discipline: "structural", deliverableType: "drawing", number: "STR-DWG-002", title: "Second drawing",
      revision: "1", stage: "feed", issuePurpose: "CONSTRUCTION", engineeringStatus: "in_preparation", reviewStatus: "not_started",
      approvalStatus: "pending", releaseStatus: "not_released", current: true, plannedDate: null, dependencies: [],
    }));
    register = must(progressReview(register, actor("structural"), "dwg-2", "in_review"));
    register = must(progressReview(register, actor("structural"), "dwg-2", "review_complete"));
    expect(approveDeliverable(register, { ...actor("deliverable_authority"), actorRole: "admin" }, "dwg-2").error).toMatch(/not granted/);
    expect(releaseDeliverable(register, { ...actor("release_authority"), actorRole: "ai", actingRole: "ai" }, "dwg-2").error).toMatch(/not granted/);
    expect(addDeliverable(register, { ...actor("structural"), workspaceId: "workspace-b" }, {
      id: "other", discipline: "structural", deliverableType: "drawing", number: "X", title: "X", revision: "1", stage: "feed",
      issuePurpose: "WORKING", engineeringStatus: "draft", reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released",
      current: true, plannedDate: null, dependencies: [],
    }).error).toBe("cross_workspace_denied");
    expect(releaseDeliverable(register, { ...actor("release_authority"), workspaceId: "workspace-b" }, "dwg-2").error).toBe("cross_workspace_denied");
  });
});
