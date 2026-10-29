/**
 * EOS-A15A-V3 persistence mapping.
 * Quantity-basis provenance remains structurally embedded on the MTO item.
 * Not a third Quantity Basis table and not an MTO Intelligence domain.
 */

import type { CanonicalDisciplineCode } from "../discipline-intelligence/catalog";
import type { ThreadRelation } from "../digital-thread/types";
import type { ValueLifecycleKey } from "./cross-lifecycle-value";
import {
  fingerprintItems,
  type MtoItemWorkflowStatus,
  type MtoSnapshot,
  type MtoSnapshotWorkflowStatus,
  type MtoStaleness,
  type QuantityItem,
  type QuantityOriginType,
  type QuantityVerificationStatus,
} from "./quantity-mto";

export const CALLER_SUPPLIED_MTO_KEYS = [
  "tenantId",
  "workspaceId",
  "aal",
  "approved",
  "authoritative",
  "verifiedBy",
  "createdBy",
  "fingerprint",
  "snapshotFingerprint",
  "supersedesSnapshotId",
] as const;

export type PersistedMtoSnapshot = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPlanId: string | null;
  systemId: string | null;
  discipline: string | null;
  disciplineScope: MtoSnapshot["disciplineScope"];
  lifecycleStage: ValueLifecycleKey;
  revision: string;
  status: MtoSnapshotWorkflowStatus;
  verificationState: MtoItemWorkflowStatus;
  sourceRevisionSet: string[];
  itemCount: number;
  snapshotFingerprint: string;
  staleness: MtoStaleness;
  createdAt: string;
  createdBy: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  supersedesSnapshotId: string | null;
  exportDisclaimer: string;
  items: QuantityItem[];
  thread: ThreadRelation[];
};

export type MtoItemListQuery = {
  offset?: number;
  limit?: number;
  discipline?: string | null;
  verification?: string | null;
};

export function toPersistSnapshotStatus(status: MtoSnapshot["status"] | MtoSnapshotWorkflowStatus): MtoSnapshotWorkflowStatus {
  if (status === "ISSUED_FOR_ENGINEERING" || status === "UNDER_REVIEW") return "UNDER_REVIEW";
  if (status === "VERIFIED") return "VERIFIED";
  if (status === "SUPERSEDED") return "SUPERSEDED";
  return "DRAFT";
}

export function toV2SnapshotStatus(status: MtoSnapshotWorkflowStatus): MtoSnapshot["status"] {
  if (status === "UNDER_REVIEW") return "ISSUED_FOR_ENGINEERING";
  return status;
}

export function toPersistItemVerification(status: QuantityVerificationStatus | MtoItemWorkflowStatus): MtoItemWorkflowStatus {
  if (status === "ENGINEER_ACCEPTED" || status === "VERIFIED") return "VERIFIED";
  if (status === "REJECTED") return "REJECTED";
  if (status === "NEEDS_INFORMATION") return "NEEDS_INFORMATION";
  return "UNVERIFIED";
}

export function toV2ItemVerification(status: MtoItemWorkflowStatus): QuantityVerificationStatus {
  if (status === "VERIFIED") return "ENGINEER_ACCEPTED";
  if (status === "REJECTED") return "REJECTED";
  if (status === "NEEDS_INFORMATION") return "NEEDS_INFORMATION";
  return "UNVERIFIED";
}

export function snapshotFromPersisted(row: PersistedMtoSnapshot): MtoSnapshot {
  const items = row.items.map((item) => ({
    ...item,
    verificationStatus: toV2ItemVerification(toPersistItemVerification(item.verificationStatus)),
  }));
  return {
    tenantId: row.tenantId,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    systemId: row.systemId,
    assetId: null,
    id: row.id,
    revision: row.revision,
    disciplineScope: row.disciplineScope,
    lifecycleStage: row.lifecycleStage,
    sourceRevisions: row.sourceRevisionSet,
    generatedAt: row.createdAt,
    generatedBy: row.createdBy ?? "",
    status: toV2SnapshotStatus(row.status),
    verificationState: toV2ItemVerification(row.verificationState),
    items,
    itemCount: items.length,
    fingerprint: row.snapshotFingerprint || fingerprintItems(items),
    supersedesSnapshotId: row.supersedesSnapshotId,
  };
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function itemFromRow(row: Record<string, unknown>, snapshot: { lifecycleStage: ValueLifecycleKey }): QuantityItem {
  const origin = String(row.quantity_origin ?? "MISSING") as QuantityOriginType;
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    itemCode: String(row.item_code),
    description: String(row.description),
    discipline: String(row.discipline) as CanonicalDisciplineCode | "MULTIDISCIPLINARY",
    category: String(row.category),
    material: (row.material as string | null) ?? null,
    grade: (row.grade as string | null) ?? null,
    specification: (row.specification as string | null) ?? null,
    tag: (row.tag as string | null) ?? null,
    quantity: num(row.quantity),
    unit: (row.unit as string | null) ?? null,
    sourceUnit: (row.source_unit as string | null) ?? null,
    conversionRecorded: Boolean(row.conversion_recorded),
    quantityOrigin: origin,
    quantityMaturity: row.quantity_maturity as QuantityItem["quantityMaturity"],
    verificationStatus: toV2ItemVerification(String(row.verification_status ?? "UNVERIFIED") as MtoItemWorkflowStatus),
    lifecycleStage: snapshot.lifecycleStage,
    status: (row.status as QuantityItem["status"]) ?? "ACTIVE",
    semantics: (row.semantics as QuantityItem["semantics"]) ?? "bulk_mto",
    section: (row.section as string | null) ?? null,
    length: num(row.length),
    unitMass: num(row.unit_mass),
    totalMass: num(row.total_mass),
    volume: num(row.volume),
    verifiedAt: (row.verified_at as string | null) ?? null,
    verifiedBy: (row.verified_by as string | null) ?? null,
    basis: {
      id: `${row.id}:basis`,
      sourceType: origin,
      sourceRef: (row.source_ref as string | null) ?? null,
      sourceRevision: (row.source_revision as string | null) ?? null,
      measurementMethod: (row.measurement_method as string | null) ?? null,
      derivationMethod: (row.derivation_method as string | null) ?? null,
      formula: (row.formula as string | null) ?? null,
      assumptions: Array.isArray(row.assumptions) ? (row.assumptions as string[]) : [],
      exclusions: Array.isArray(row.exclusions) ? (row.exclusions as string[]) : [],
      extractionRecordId: (row.extraction_record_id as string | null) ?? null,
      inputRefs: Array.isArray(row.input_refs) ? (row.input_refs as string[]) : [],
      createdAt: String(row.created_at ?? new Date().toISOString()),
      createdBy: String(row.verified_by ?? "system"),
    },
  };
}

export function snapshotHeaderFromRow(row: Record<string, unknown>, items: QuantityItem[], thread: ThreadRelation[] = []): PersistedMtoSnapshot {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    workPlanId: (row.work_plan_id as string | null) ?? null,
    systemId: (row.system_id as string | null) ?? null,
    discipline: (row.discipline as string | null) ?? null,
    disciplineScope: row.discipline_scope as PersistedMtoSnapshot["disciplineScope"],
    lifecycleStage: row.lifecycle_stage as ValueLifecycleKey,
    revision: String(row.revision),
    status: String(row.status) as MtoSnapshotWorkflowStatus,
    verificationState: String(row.verification_state) as MtoItemWorkflowStatus,
    sourceRevisionSet: Array.isArray(row.source_revision_set) ? (row.source_revision_set as string[]) : [],
    itemCount: Number(row.item_count ?? items.length),
    snapshotFingerprint: String(row.snapshot_fingerprint ?? ""),
    staleness: (row.staleness as MtoStaleness) ?? "CURRENT",
    createdAt: String(row.created_at),
    createdBy: (row.created_by as string | null) ?? null,
    verifiedAt: (row.verified_at as string | null) ?? null,
    verifiedBy: (row.verified_by as string | null) ?? null,
    supersedesSnapshotId: (row.supersedes_snapshot_id as string | null) ?? null,
    exportDisclaimer: String(row.export_disclaimer ?? "Export does not imply engineering approval, IFC, or DESIGN ACCEPTED."),
    items,
    thread,
  };
}

export function itemInsertRow(snapshot: PersistedMtoSnapshot, item: QuantityItem) {
  return {
    id: item.id,
    snapshot_id: snapshot.id,
    tenant_id: snapshot.tenantId,
    workspace_id: snapshot.workspaceId,
    project_id: snapshot.projectId,
    item_code: item.itemCode,
    description: item.description,
    discipline: item.discipline,
    system_id: item.systemId ?? snapshot.systemId,
    asset_id: item.assetId ?? null,
    tag: item.tag ?? null,
    category: item.category,
    material: item.material,
    grade: item.grade,
    specification: item.specification,
    quantity: item.quantity,
    unit: item.unit,
    source_unit: item.sourceUnit ?? null,
    conversion_recorded: Boolean(item.conversionRecorded),
    quantity_origin: item.quantityOrigin,
    quantity_maturity: item.quantityMaturity,
    source_type: item.basis.sourceType,
    source_ref: item.basis.sourceRef,
    source_revision: item.basis.sourceRevision,
    measurement_method: item.basis.measurementMethod,
    derivation_method: item.basis.derivationMethod,
    formula: item.basis.formula,
    extraction_record_id: item.basis.extractionRecordId ?? null,
    input_refs: item.basis.inputRefs ?? [],
    assumptions: item.basis.assumptions,
    exclusions: item.basis.exclusions,
    verification_status: toPersistItemVerification(item.verificationStatus),
    verified_at: item.verifiedAt ?? null,
    verified_by: item.verifiedBy ?? null,
    semantics: item.semantics,
    status: item.status,
    section: item.section ?? null,
    length: item.length ?? null,
    unit_mass: item.unitMass ?? null,
    total_mass: item.totalMass ?? null,
    volume: item.volume ?? null,
  };
}

export function snapshotInsertRow(row: PersistedMtoSnapshot) {
  return {
    id: row.id,
    tenant_id: row.tenantId,
    workspace_id: row.workspaceId,
    project_id: row.projectId,
    work_plan_id: row.workPlanId,
    system_id: row.systemId,
    discipline: row.discipline,
    discipline_scope: row.disciplineScope,
    lifecycle_stage: row.lifecycleStage,
    revision: row.revision,
    status: row.status,
    verification_state: row.verificationState,
    source_revision_set: row.sourceRevisionSet,
    item_count: row.itemCount,
    snapshot_fingerprint: row.snapshotFingerprint,
    staleness: row.staleness,
    created_at: row.createdAt,
    created_by: row.createdBy,
    verified_at: row.verifiedAt,
    verified_by: row.verifiedBy,
    supersedes_snapshot_id: row.supersedesSnapshotId,
    export_disclaimer: row.exportDisclaimer,
  };
}

export function paginateItems(items: QuantityItem[], query: MtoItemListQuery = {}) {
  const discipline = query.discipline?.trim();
  const verification = query.verification?.trim();
  const filtered = items.filter((row) => {
    if (discipline && discipline !== "ALL" && row.discipline !== discipline) return false;
    if (verification && verification !== "ALL" && toPersistItemVerification(row.verificationStatus) !== verification) return false;
    return true;
  });
  const offset = Math.max(0, query.offset ?? 0);
  const limit = Math.min(200, Math.max(1, query.limit ?? 50));
  return { total: filtered.length, offset, limit, items: filtered.slice(offset, offset + limit) };
}
