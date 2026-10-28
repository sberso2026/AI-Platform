import { createHash } from "node:crypto";
import { createBaseline, createDeliveryLifecycle } from "../delivery-lifecycle";
import type { BaselineType } from "../delivery-lifecycle/model";
import {
  AI_BASELINE_MUTATION_AUTHORITY,
  AI_DELIVERABLE_APPROVAL_AUTHORITY,
  AI_FREEZE_APPROVAL_AUTHORITY,
  AI_IFC_RELEASE_AUTHORITY,
  AI_RELEASE_AUTHORITY,
  type DeliverableRecord,
  type Discipline,
  type FreezeException,
  type FreezeRecord,
  type FreezeRegister,
  type IssuePurpose,
  type PackageRecord,
  type RevisionRef,
  type TransmittalRecord,
} from "./model";

export type FreezeActor = {
  actorId: string;
  actorRole: string | null;
  actingRole: string;
  at: string;
  workspaceId: string;
};

export type FreezeEnvelope = { register: FreezeRegister; error: string | null; approvalGranted: false };

const REVIEW_NEXT: Record<string, string[]> = {
  not_started: ["in_review"],
  in_review: ["comments_issued", "review_complete"],
  comments_issued: ["comments_resolved", "rejected"],
  comments_resolved: ["review_complete"],
  review_complete: [],
  rejected: [],
};

function deny(register: FreezeRegister, error: string): FreezeEnvelope {
  return { register, error, approvalGranted: false };
}
function ok(register: FreezeRegister): FreezeEnvelope {
  return { register, error: null, approvalGranted: false };
}
function sameWorkspace(register: FreezeRegister, actor: FreezeActor): boolean {
  return register.workspaceId === actor.workspaceId;
}
function isAi(actor: FreezeActor): boolean {
  return actor.actorRole === "ai" || actor.actingRole === "ai";
}
function genericAuthority(actor: FreezeActor): boolean {
  return actor.actorRole === "owner" || actor.actorRole === "admin" || actor.actorRole === "pilot-engineer" || actor.actorRole === "pilot_engineer" || isAi(actor);
}
function copyItems(items: RevisionRef[]): RevisionRef[] {
  return items.map((item) => ({ ...item }));
}
function audit(register: FreezeRegister, actor: FreezeActor, action: string, detail: FreezeRegister["audits"][number]["detail"]): FreezeRegister {
  const id = String(detail.recordId ?? "");
  return {
    ...register,
    audits: [...register.audits, { action, at: actor.at, actorId: actor.actorId, actingRole: actor.actingRole, detail }],
    events: id ? [...register.events, { type: action, id }] : register.events,
  };
}

export function baselineFingerprint(items: RevisionRef[]): string {
  const lines = copyItems(items)
    .sort((left, right) => `${left.objectId}|${left.revision}`.localeCompare(`${right.objectId}|${right.revision}`))
    .map((item) => `${item.objectId}|${item.revision}|${item.status}|${item.source}|${item.discipline}`);
  return createHash("sha256").update(lines.join("\n")).digest("hex");
}

export function createFreezeRegister(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): FreezeEnvelope {
  createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  return ok({
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    freezes: [], deliverables: [], packages: [], transmittals: [], events: [],
    audits: [{ action: "freeze_register_created", at: input.at, actorId: input.actorId, actingRole: "owner", detail: { a4Replaced: false, documentsReplaced: false } }],
    a4Replaced: false, documentsReplaced: false,
  });
}

export function addFreeze(register: FreezeRegister, actor: FreezeActor, freeze: Omit<FreezeRecord, "items" | "exceptions" | "frozen" | "fingerprint" | "approvalStatus"> & { items: RevisionRef[] }): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (freeze.items.some((item) => item.revision === "latest" || !item.revision)) return deny(register, "A freeze must reference an exact revision.");
  const created: FreezeRecord = { ...freeze, items: copyItems(freeze.items), exceptions: [], frozen: false, fingerprint: baselineFingerprint(freeze.items), approvalStatus: "pending" };
  return ok(audit({ ...register, freezes: [...register.freezes, created] }, actor, "freeze_candidate_created", { recordId: freeze.id }));
}

export function updateFreezeItem(register: FreezeRegister, actor: FreezeActor, freezeId: string, objectId: string, status: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const freeze = register.freezes.find((item) => item.id === freezeId);
  if (!freeze) return deny(register, "The freeze was not found.");
  if (freeze.frozen || AI_BASELINE_MUTATION_AUTHORITY) return deny(register, "A frozen baseline is not rewritten.");
  const items = freeze.items.map((item) => item.objectId === objectId ? { ...item, status } : item);
  return ok(replaceFreeze(register, { ...freeze, items, fingerprint: baselineFingerprint(items) }));
}

export function addException(register: FreezeRegister, actor: FreezeActor, freezeId: string, exception: FreezeException): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const freeze = register.freezes.find((item) => item.id === freezeId);
  if (!freeze) return deny(register, "The freeze was not found.");
  if (freeze.frozen) return deny(register, "A frozen baseline is not rewritten.");
  return ok(audit(replaceFreeze(register, { ...freeze, exceptions: [...freeze.exceptions, exception] }), actor, "freeze_exception_created", { recordId: exception.id }));
}

export function assessFreeze(freeze: FreezeRecord): { readiness: "READY" | "READY_WITH_CONDITIONS" | "NOT_READY" | "NOT_ASSESSED"; blockers: string[] } {
  const blockers: string[] = [];
  for (const item of freeze.items) {
    if (item.status === "stale") blockers.push("STALE_MODEL");
    if (item.status === "unaccepted") blockers.push("UNACCEPTED_INTERFACE");
    if (item.status === "missing") blockers.push("MISSING_DELIVERABLE");
  }
  if (blockers.length) return { readiness: "NOT_READY", blockers };
  if (freeze.exceptions.some((item) => item.status === "open")) return { readiness: "READY_WITH_CONDITIONS", blockers: [] };
  if (!freeze.items.length) return { readiness: "NOT_ASSESSED", blockers: [] };
  return { readiness: "READY", blockers: [] };
}

export function approveFreeze(register: FreezeRegister, actor: FreezeActor, freezeId: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor) || genericAuthority(actor) || actor.actingRole !== "freeze_authority" || AI_FREEZE_APPROVAL_AUTHORITY) {
    return deny(register, "Freeze approval is not granted by owner, admin, or AI.");
  }
  const freeze = register.freezes.find((item) => item.id === freezeId);
  if (!freeze) return deny(register, "The freeze was not found.");
  if (freeze.frozen) return deny(register, "A frozen baseline is not rewritten.");
  if (assessFreeze(freeze).readiness === "NOT_READY") return deny(register, "Freeze readiness is not ready.");
  const lifecycle = createDeliveryLifecycle({ id: `${register.id}-lifecycle`, tenantId: register.tenantId, workspaceId: register.workspaceId, projectId: register.projectId, actorId: actor.actorId, at: actor.at });
  createBaseline({ lifecycle: lifecycle.lifecycle, id: freeze.id, baselineType: freeze.freezeType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: [] });
  return ok(audit(replaceFreeze(register, { ...freeze, frozen: true, approvalStatus: "approved" }), actor, "freeze_approved", { recordId: freeze.id, fingerprint: freeze.fingerprint }));
}

export function compareBaselines(left: RevisionRef[], right: RevisionRef[]): { added: string[]; removed: string[]; revised: string[] } {
  const before = new Map(left.map((item) => [item.objectId, item.revision]));
  const after = new Map(right.map((item) => [item.objectId, item.revision]));
  return {
    added: [...after.keys()].filter((id) => !before.has(id)),
    removed: [...before.keys()].filter((id) => !after.has(id)),
    revised: [...after.keys()].filter((id) => before.has(id) && before.get(id) !== after.get(id)),
  };
}

export function addDeliverable(register: FreezeRegister, actor: FreezeActor, deliverable: Omit<DeliverableRecord, "freshness" | "disposition" | "checksum" | "issuedDate" | "withdrawnReason" | "withdrawalAuthority" | "withdrawalDate" | "replacementId" | "baselineId">): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (deliverable.revision === "latest") return deny(register, "A deliverable revision must be exact.");
  const created: DeliverableRecord = {
    ...deliverable,
    dependencies: copyItems(deliverable.dependencies),
    freshness: "current",
    disposition: null,
    checksum: "",
    issuedDate: null,
    withdrawnReason: null,
    withdrawalAuthority: null,
    withdrawalDate: null,
    replacementId: null,
    baselineId: null,
  };
  return ok(audit({ ...register, deliverables: [...register.deliverables, created] }, actor, "deliverable_created", { recordId: deliverable.id }));
}

export function progressReview(register: FreezeRegister, actor: FreezeActor, id: string, to: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor) && to === "review_complete") return deny(register, "AI cannot complete deliverable review.");
  const current = register.deliverables.find((item) => item.id === id && item.current);
  if (!current) return deny(register, "The deliverable revision was not found.");
  if (!(REVIEW_NEXT[current.reviewStatus] ?? []).includes(to)) return deny(register, "That review transition is not legal.");
  return ok(audit(replaceDeliverable(register, { ...current, reviewStatus: to, engineeringStatus: to === "review_complete" ? "reviewed" : current.engineeringStatus }), actor, "deliverable_review_progressed", { recordId: id }));
}

export function approveDeliverable(register: FreezeRegister, actor: FreezeActor, id: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor) || genericAuthority(actor) || actor.actingRole !== "deliverable_authority" || AI_DELIVERABLE_APPROVAL_AUTHORITY) {
    return deny(register, "Deliverable approval is not granted by owner, admin, or AI.");
  }
  const current = register.deliverables.find((item) => item.id === id && item.current);
  if (!current) return deny(register, "The deliverable revision was not found.");
  if (current.reviewStatus !== "review_complete") return deny(register, "Approval requires a completed review.");
  return ok(audit(replaceDeliverable(register, { ...current, approvalStatus: "approved", engineeringStatus: "approved" }), actor, "deliverable_approved", { recordId: id }));
}

export function closeException(register: FreezeRegister, actor: FreezeActor, freezeId: string, exceptionId: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const freeze = register.freezes.find((item) => item.id === freezeId);
  if (!freeze) return deny(register, "The freeze was not found.");
  if (freeze.frozen) return deny(register, "A frozen baseline is not rewritten.");
  const exceptions = freeze.exceptions.map((item) => item.id === exceptionId ? { ...item, status: "closed" as const } : item);
  return ok(audit(replaceFreeze(register, { ...freeze, exceptions }), actor, "freeze_exception_closed", { recordId: exceptionId }));
}

export function updateDependencies(register: FreezeRegister, actor: FreezeActor, id: string, dependencies: RevisionRef[]): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.deliverables.find((item) => item.id === id && item.current);
  if (!current) return deny(register, "The deliverable revision was not found.");
  if (current.releaseStatus === "released") return deny(register, "A released revision is not rewritten.");
  return ok(replaceDeliverable(register, { ...current, dependencies: copyItems(dependencies), freshness: "current" }));
}

export function setIssuePurpose(register: FreezeRegister, actor: FreezeActor, id: string, purpose: IssuePurpose): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.deliverables.find((item) => item.id === id && item.current);
  if (!current) return deny(register, "The deliverable revision was not found.");
  if (current.releaseStatus === "released") return deny(register, "A released revision is not rewritten.");
  return ok(replaceDeliverable(register, { ...current, issuePurpose: purpose }));
}

export function displayIssuePurpose(purpose: IssuePurpose, mapping: Record<string, string> = { CONSTRUCTION: "IFC" }): { canonical: IssuePurpose; label: string } {
  return { canonical: purpose, label: mapping[purpose] ?? purpose };
}

export function releaseDeliverable(register: FreezeRegister, actor: FreezeActor, id: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.deliverables.find((item) => item.id === id && item.current);
  if (!current) return deny(register, "The deliverable revision was not found.");
  if (isAi(actor) || genericAuthority(actor) || actor.actingRole !== "release_authority" || AI_RELEASE_AUTHORITY || (current.issuePurpose === "CONSTRUCTION" && AI_IFC_RELEASE_AUTHORITY)) {
    return deny(register, "Release authority is not granted by owner, admin, or AI.");
  }
  if (current.reviewStatus !== "review_complete") return deny(register, "Release blocked: review is incomplete.");
  if (current.approvalStatus !== "approved" && current.approvalStatus !== "approved_with_conditions") return deny(register, "Release blocked: approval is missing.");
  if (current.freshness !== "current" || current.dependencies.some((item) => item.status !== "current")) return deny(register, "Release blocked: a dependency is stale.");
  const checksum = baselineFingerprint(current.dependencies.concat([{ objectId: current.id, revision: current.revision, status: current.releaseStatus, source: "deliverable", discipline: current.discipline }]));
  const released: DeliverableRecord = { ...current, releaseStatus: "released", issuedDate: actor.at, checksum, dependencies: copyItems(current.dependencies) };
  return ok(audit(replaceDeliverable(register, released), actor, "deliverable_released", { recordId: id, purpose: current.issuePurpose }));
}

export function markUpstreamRevision(register: FreezeRegister, actor: FreezeActor, objectId: string, revision: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const deliverables = register.deliverables.map((item) => {
    const stale = item.dependencies.some((dependency) => dependency.objectId === objectId && dependency.revision !== revision);
    return stale ? { ...item, freshness: "potentially_stale" as const } : item;
  });
  return ok(audit({ ...register, deliverables }, actor, "deliverable_marked_stale", { recordId: objectId, revision }));
}

export function setDisposition(register: FreezeRegister, actor: FreezeActor, id: string, disposition: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (isAi(actor)) return deny(register, "AI cannot dispose a deliverable.");
  const current = register.deliverables.find((item) => item.id === id);
  if (!current) return deny(register, "The deliverable revision was not found.");
  return ok(audit(replaceDeliverable(register, { ...current, disposition }), actor, "deliverable_disposition_recorded", { recordId: id, disposition }));
}

export function supersedeDeliverable(register: FreezeRegister, actor: FreezeActor, id: string, nextRevision: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const current = register.deliverables.find((item) => item.id === id && item.current);
  if (!current) return deny(register, "The deliverable revision was not found.");
  const successorId = `${id}-${nextRevision}`;
  const successor: DeliverableRecord = {
    ...current,
    id: successorId,
    revision: nextRevision,
    current: true,
    releaseStatus: "not_released",
    reviewStatus: "not_started",
    approvalStatus: "pending",
    freshness: "current",
    disposition: null,
    checksum: "",
    issuedDate: null,
    engineeringStatus: "in_preparation",
    baselineId: null,
    dependencies: copyItems(current.dependencies),
  };
  const deliverables = register.deliverables.map((item) => item.id === id ? { ...item, current: false, releaseStatus: item.releaseStatus === "released" ? "superseded" : item.releaseStatus, engineeringStatus: "superseded" } : item);
  return ok(audit({ ...register, deliverables: [...deliverables, successor] }, actor, "deliverable_superseded", { recordId: successorId, previousId: id }));
}

export function withdrawDeliverable(register: FreezeRegister, actor: FreezeActor, id: string, detail: { reason: string; authority: string; date: string; replacementId: string | null }): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (genericAuthority(actor) || actor.actingRole !== "release_authority") return deny(register, "Withdrawal authority is not granted by owner, admin, or AI.");
  const current = register.deliverables.find((item) => item.id === id);
  if (!current) return deny(register, "The deliverable revision was not found.");
  return ok(audit(replaceDeliverable(register, {
    ...current,
    releaseStatus: "withdrawn",
    engineeringStatus: "withdrawn",
    current: false,
    withdrawnReason: detail.reason,
    withdrawalAuthority: detail.authority,
    withdrawalDate: detail.date,
    replacementId: detail.replacementId,
  }), actor, "deliverable_withdrawn", { recordId: id }));
}

export function addPackage(register: FreezeRegister, actor: FreezeActor, packageRecord: PackageRecord): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  return ok(audit({ ...register, packages: [...register.packages, packageRecord] }, actor, "package_created", { recordId: packageRecord.id }));
}

export function addPackageMember(register: FreezeRegister, actor: FreezeActor, packageId: string, deliverableId: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  if (!register.packages.some((item) => item.id === packageId)) return deny(register, "The package was not found.");
  return ok(audit({ ...register, packages: register.packages.map((item) => item.id === packageId ? { ...item, deliverableIds: [...item.deliverableIds, deliverableId] } : item) }, actor, "package_member_added", { recordId: packageId }));
}

export function packageReadiness(register: FreezeRegister, packageId: string): { ready: boolean; blockers: string[] } {
  const packageRecord = register.packages.find((item) => item.id === packageId);
  if (!packageRecord) return { ready: false, blockers: ["MISSING_PACKAGE"] };
  const blockers: string[] = [];
  for (const id of packageRecord.requiredIds) {
    if (!packageRecord.deliverableIds.includes(id)) blockers.push("MISSING_DELIVERABLE");
    const deliverable = register.deliverables.find((item) => item.id === id);
    if (deliverable?.freshness === "potentially_stale") blockers.push("STALE_DELIVERABLE");
  }
  return { ready: blockers.length === 0, blockers };
}

export function addTransmittal(register: FreezeRegister, actor: FreezeActor, transmittal: TransmittalRecord): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  return ok(audit({ ...register, transmittals: [...register.transmittals, transmittal] }, actor, "transmittal_created", { recordId: transmittal.id }));
}

export function includeInBaseline(register: FreezeRegister, actor: FreezeActor, freezeId: string, deliverableId: string): FreezeEnvelope {
  if (!sameWorkspace(register, actor)) return deny(register, "cross_workspace_denied");
  const freeze = register.freezes.find((item) => item.id === freezeId);
  const deliverable = register.deliverables.find((item) => item.id === deliverableId);
  if (!freeze || !deliverable) return deny(register, "The baseline member was not found.");
  if (freeze.frozen) return deny(register, "A frozen baseline is not rewritten.");
  const items = copyItems(freeze.items).concat([{ objectId: deliverable.id, revision: deliverable.revision, status: deliverable.releaseStatus, source: "deliverable", discipline: deliverable.discipline }]);
  return ok(replaceFreeze(replaceDeliverable(register, { ...deliverable, baselineId: freeze.id }), { ...freeze, items, fingerprint: baselineFingerprint(items) }));
}

export function disciplineReadiness(register: FreezeRegister, freezeId: string): Record<string, { blockers: string[] }> {
  const freeze = register.freezes.find((item) => item.id === freezeId);
  const result: Record<string, { blockers: string[] }> = {};
  for (const discipline of freeze?.disciplines ?? []) {
    result[discipline] = { blockers: (freeze?.items ?? []).filter((item) => item.discipline === discipline && item.status !== "current").map((item) => item.status === "unaccepted" ? "UNACCEPTED_INTERFACE" : item.status === "stale" ? "STALE_MODEL" : "NOT_CURRENT") };
  }
  result.project = { blockers: [...new Set(Object.values(result).flatMap((item) => item.blockers))] };
  return result;
}

export function postIfcDisposition(register: FreezeRegister, deliverableId: string): "NO_IFC_IMPACT" | "REVISED_IFC_REQUIRED" | "CONSTRUCTION_REVIEW_REQUIRED" {
  const deliverable = register.deliverables.find((item) => item.id === deliverableId);
  if (!deliverable || deliverable.freshness !== "potentially_stale") return "NO_IFC_IMPACT";
  const inIfc = register.freezes.some((freeze) => freeze.freezeType === "ifc_baseline" && freeze.frozen && freeze.items.some((item) => item.objectId === deliverable.id));
  return inIfc ? "REVISED_IFC_REQUIRED" : "CONSTRUCTION_REVIEW_REQUIRED";
}

export function deliverableRegister(register: FreezeRegister) {
  return register.deliverables.map((item) => ({
    number: item.number,
    title: item.title,
    discipline: item.discipline,
    type: item.deliverableType,
    revision: item.revision,
    purpose: item.issuePurpose,
    review: item.reviewStatus,
    approval: item.approvalStatus,
    release: item.releaseStatus,
    stale: item.freshness === "potentially_stale",
    baselineId: item.baselineId,
  }));
}

export function readinessAdvisory(register: FreezeRegister): string {
  const notes: string[] = [];
  if (register.deliverables.some((item) => item.deliverableType === "calculation" && item.freshness === "potentially_stale")) notes.push("one stale calculation");
  if (register.freezes.some((freeze) => freeze.items.some((item) => item.status === "unaccepted"))) notes.push("one unresolved interface");
  if (register.deliverables.some((item) => item.approvalStatus === "pending")) notes.push("one missing approval");
  if (register.deliverables.some((item) => item.freshness === "potentially_stale" && item.baselineId)) notes.push("one post-freeze change");
  return [
    "FACT: the statements below use stored revisions.",
    "CONFIGURATION_STATE: a baseline lists exact revisions.",
    "DELIVERABLE_STATE: approval and release are separate.",
    `BLOCKER: ${notes.join("; ") || "none"}.`,
    "EXCEPTION: open exceptions stay explicit.",
    "CHANGE_IMPACT: a stale deliverable stays a candidate.",
    "RECOMMENDATION: an authorized engineer reviews each blocker.",
    "HUMAN_DECISION_REQUIRED: this statement does not authorize release.",
  ].join(" ");
}

export function formatRevision(revision: string, scheme: { prefix?: string } = {}): string {
  return `${scheme.prefix ?? ""}${revision}`;
}

export function mapExternalStatus(external: string, mapping: Record<string, string>): string | null {
  return mapping[external] ?? null;
}

export function freezeHome(register: FreezeRegister) {
  const target = register.freezes[0];
  return {
    stage: target?.stage ?? "not_classified",
    target: target?.freezeType ?? null,
    disciplines: target ? disciplineReadiness(register, target.id) : {},
    deliverables: deliverableRegister(register),
    packages: register.packages.length,
    transmittals: register.transmittals.length,
    stale: register.deliverables.filter((item) => item.freshness === "potentially_stale").length,
    advisory: readinessAdvisory(register),
    approvalGranted: false as const,
    releasedByAi: AI_RELEASE_AUTHORITY,
  };
}

function replaceFreeze(register: FreezeRegister, next: FreezeRecord): FreezeRegister {
  return { ...register, freezes: register.freezes.map((item) => item.id === next.id ? next : item) };
}
function replaceDeliverable(register: FreezeRegister, next: DeliverableRecord): FreezeRegister {
  return { ...register, deliverables: register.deliverables.map((item) => item.id === next.id ? next : item) };
}
