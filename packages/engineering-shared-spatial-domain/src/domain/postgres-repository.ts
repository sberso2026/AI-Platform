/**
 * Phase 12M — Postgres adapter for Shared Spatial Domain tables (batch_85).
 */

import type { SharedSpatialRepositoryPort } from "./persistence";
import type { SpatialOutboxEvent } from "./events";
import type {
  CoordinateReference,
  CoordinateReferenceSystemReference,
  LegacySpatialReconciliation,
  SpatialReference,
  SpatialReferenceReview,
  SpatialReferenceStatus,
  SpatialReferenceType,
  SpatialRelationshipKind,
  SpatialRelationshipReference,
  CoordinateReferenceSystemKind,
  LegacySpatialReconciliationState,
  SpatialReferenceReviewDecision,
} from "./spatial-references";
import { randomUUID } from "node:crypto";

const SPATIAL_REFS = "engineering_spatial_references";
const RELATIONSHIPS = "engineering_spatial_relationships";
const CRS = "engineering_coordinate_reference_systems";
const COORDS = "engineering_coordinate_references";
const REVIEWS = "engineering_spatial_reference_reviews";
const LEGACY = "engineering_legacy_spatial_reconciliations";
const OUTBOX = "engineering_shared_spatial_outbox_events";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = {
  from: (table: string) => any;
};

function mapSpatialRow(row: Record<string, unknown>): SpatialReference {
  return {
    kind: "spatial_reference",
    owner: "engineering_os_shared_spatial_domain",
    id: String(row.spatial_reference_id),
    spatialRefId: String(row.spatial_reference_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    code: row.code != null ? String(row.code) : undefined,
    name: row.name != null ? String(row.name) : undefined,
    referenceType: row.reference_type as SpatialReferenceType,
    parentSpatialReferenceId:
      row.parent_spatial_reference_id != null
        ? String(row.parent_spatial_reference_id)
        : undefined,
    crsId: row.crs_id != null ? String(row.crs_id) : undefined,
    status: row.status as SpatialReferenceStatus,
    version: Number(row.version ?? 1),
    supersededById:
      row.superseded_by_id != null ? String(row.superseded_by_id) : undefined,
    alignmentReference:
      row.alignment_reference != null ? String(row.alignment_reference) : undefined,
    chainage: row.chainage != null ? String(row.chainage) : undefined,
    station: row.station != null ? String(row.station) : undefined,
    offset: row.linear_offset != null ? String(row.linear_offset) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    hierarchyImpliesGeometry: false,
  };
}

function mapCrsRow(row: Record<string, unknown>): CoordinateReferenceSystemReference {
  return {
    kind: "crs_reference",
    owner: "engineering_os_shared_spatial_domain",
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    crsId: String(row.crs_id),
    crsKind: row.crs_kind as CoordinateReferenceSystemKind,
    coordinateReferenceSystem: String(row.coordinate_reference_system),
    authority: row.authority != null ? String(row.authority) : undefined,
    epsgCode: row.epsg_code != null ? Number(row.epsg_code) : undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    description: row.description != null ? String(row.description) : undefined,
    status: row.status as SpatialReferenceStatus,
    version: Number(row.version ?? 1),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    transformImplemented: false,
  };
}

function mapCoordRow(row: Record<string, unknown>): CoordinateReference {
  return {
    kind: "coordinate_reference",
    owner: "engineering_os_shared_spatial_domain",
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    coordinateReferenceId: String(row.coordinate_reference_id),
    spatialReferenceId:
      row.spatial_reference_id != null ? String(row.spatial_reference_id) : undefined,
    crsId: String(row.crs_id),
    x: row.x != null ? Number(row.x) : undefined,
    y: row.y != null ? Number(row.y) : undefined,
    z: row.z != null ? Number(row.z) : undefined,
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    elevation: row.elevation != null ? Number(row.elevation) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    storesGeometryBlob: false,
  };
}

function mapRelRow(row: Record<string, unknown>): SpatialRelationshipReference {
  return {
    kind: "spatial_relationship",
    owner: "engineering_os_shared_spatial_domain",
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    relationshipId: String(row.relationship_id),
    fromSpatialReferenceId: String(row.from_spatial_reference_id),
    toSpatialReferenceId: String(row.to_spatial_reference_id),
    relationshipKind: row.relationship_kind as SpatialRelationshipKind,
    geometricProof: false,
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapLegacyRow(row: Record<string, unknown>): LegacySpatialReconciliation {
  return {
    kind: "legacy_spatial_reconciliation",
    owner: "engineering_os_shared_spatial_domain",
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    reconciliationId: String(row.reconciliation_id),
    sourceTable: String(row.source_table),
    sourceColumn: String(row.source_column),
    sourceRecordId: String(row.source_record_id),
    legacyText: String(row.legacy_text),
    state: row.state as LegacySpatialReconciliationState,
    candidateSpatialReferenceId:
      row.candidate_spatial_reference_id != null
        ? String(row.candidate_spatial_reference_id)
        : undefined,
    confirmedSpatialReferenceId:
      row.confirmed_spatial_reference_id != null
        ? String(row.confirmed_spatial_reference_id)
        : undefined,
    isCanonical: false,
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapReviewRow(row: Record<string, unknown>): SpatialReferenceReview {
  return {
    kind: "spatial_reference_review",
    owner: "engineering_os_shared_spatial_domain",
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    reviewId: String(row.review_id),
    spatialReferenceId: String(row.spatial_reference_id),
    decision: row.decision as SpatialReferenceReviewDecision,
    reviewerId: row.reviewer_id != null ? String(row.reviewer_id) : undefined,
    rationale: row.rationale != null ? String(row.rationale) : undefined,
    aiSelfApproval: false,
    createdAt: String(row.created_at),
  };
}

export class PostgresSharedSpatialRepository implements SharedSpatialRepositoryPort {
  readonly adapterKind = "postgres" as const;

  constructor(private readonly supabase: SupabaseLike) {}

  newId(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  async saveSpatialReference(ref: SpatialReference): Promise<SpatialReference> {
    const row = {
      spatial_reference_id: ref.id,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      code: ref.code ?? null,
      name: ref.name ?? null,
      reference_type: ref.referenceType,
      parent_spatial_reference_id: ref.parentSpatialReferenceId ?? null,
      crs_id: ref.crsId ?? null,
      status: ref.status,
      version: ref.version,
      superseded_by_id: ref.supersededById ?? null,
      alignment_reference: ref.alignmentReference ?? null,
      chainage: ref.chainage ?? null,
      station: ref.station ?? null,
      linear_offset: ref.offset ?? null,
      notes: ref.notes ?? null,
      hierarchy_implies_geometry: false,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from(SPATIAL_REFS)
      .upsert(row, { onConflict: "spatial_reference_id" })
      .select("*")
      .single();
    if (error) throw new Error(`spatial_reference_persist_failed:${error.message}`);
    return mapSpatialRow(data);
  }

  async getSpatialReference(
    tenantId: string,
    workspaceId: string,
    spatialReferenceId: string,
  ): Promise<SpatialReference | null> {
    const { data, error } = await this.supabase
      .from(SPATIAL_REFS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("spatial_reference_id", spatialReferenceId)
      .maybeSingle();
    if (error) throw new Error(`spatial_reference_get_failed:${error.message}`);
    return data ? mapSpatialRow(data) : null;
  }

  async listSpatialReferences(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialReference[]> {
    const { data, error } = await this.supabase
      .from(SPATIAL_REFS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`spatial_reference_list_failed:${error.message}`);
    return (data ?? []).map(mapSpatialRow);
  }

  async saveCrs(
    ref: CoordinateReferenceSystemReference,
  ): Promise<CoordinateReferenceSystemReference> {
    const row = {
      crs_id: ref.crsId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      crs_kind: ref.crsKind,
      coordinate_reference_system: ref.coordinateReferenceSystem,
      authority: ref.authority ?? null,
      epsg_code: ref.epsgCode ?? null,
      metadata: ref.metadata ?? {},
      description: ref.description ?? null,
      status: ref.status,
      version: ref.version,
      transform_implemented: false,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from(CRS)
      .upsert(row, { onConflict: "crs_id" })
      .select("*")
      .single();
    if (error) throw new Error(`crs_persist_failed:${error.message}`);
    return mapCrsRow(data);
  }

  async getCrs(
    tenantId: string,
    workspaceId: string,
    crsId: string,
  ): Promise<CoordinateReferenceSystemReference | null> {
    const { data, error } = await this.supabase
      .from(CRS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("crs_id", crsId)
      .maybeSingle();
    if (error) throw new Error(`crs_get_failed:${error.message}`);
    return data ? mapCrsRow(data) : null;
  }

  async listCrs(
    tenantId: string,
    workspaceId: string,
  ): Promise<CoordinateReferenceSystemReference[]> {
    const { data, error } = await this.supabase
      .from(CRS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`crs_list_failed:${error.message}`);
    return (data ?? []).map(mapCrsRow);
  }

  async saveCoordinate(ref: CoordinateReference): Promise<CoordinateReference> {
    const row = {
      coordinate_reference_id: ref.coordinateReferenceId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      spatial_reference_id: ref.spatialReferenceId ?? null,
      crs_id: ref.crsId,
      x: ref.x ?? null,
      y: ref.y ?? null,
      z: ref.z ?? null,
      latitude: ref.latitude ?? null,
      longitude: ref.longitude ?? null,
      elevation: ref.elevation ?? null,
      stores_geometry_blob: false,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from(COORDS)
      .upsert(row, { onConflict: "coordinate_reference_id" })
      .select("*")
      .single();
    if (error) throw new Error(`coordinate_persist_failed:${error.message}`);
    return mapCoordRow(data);
  }

  async getCoordinate(
    tenantId: string,
    workspaceId: string,
    coordinateReferenceId: string,
  ): Promise<CoordinateReference | null> {
    const { data, error } = await this.supabase
      .from(COORDS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("coordinate_reference_id", coordinateReferenceId)
      .maybeSingle();
    if (error) throw new Error(`coordinate_get_failed:${error.message}`);
    return data ? mapCoordRow(data) : null;
  }

  async listCoordinates(
    tenantId: string,
    workspaceId: string,
  ): Promise<CoordinateReference[]> {
    const { data, error } = await this.supabase
      .from(COORDS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`coordinate_list_failed:${error.message}`);
    return (data ?? []).map(mapCoordRow);
  }

  async saveRelationship(
    ref: SpatialRelationshipReference,
  ): Promise<SpatialRelationshipReference> {
    const row = {
      relationship_id: ref.relationshipId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      from_spatial_reference_id: ref.fromSpatialReferenceId,
      to_spatial_reference_id: ref.toSpatialReferenceId,
      relationship_kind: ref.relationshipKind,
      geometric_proof: false,
      notes: ref.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from(RELATIONSHIPS)
      .upsert(row, { onConflict: "relationship_id" })
      .select("*")
      .single();
    if (error) throw new Error(`relationship_persist_failed:${error.message}`);
    return mapRelRow(data);
  }

  async getRelationship(
    tenantId: string,
    workspaceId: string,
    relationshipId: string,
  ): Promise<SpatialRelationshipReference | null> {
    const { data, error } = await this.supabase
      .from(RELATIONSHIPS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("relationship_id", relationshipId)
      .maybeSingle();
    if (error) throw new Error(`relationship_get_failed:${error.message}`);
    return data ? mapRelRow(data) : null;
  }

  async listRelationships(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialRelationshipReference[]> {
    const { data, error } = await this.supabase
      .from(RELATIONSHIPS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`relationship_list_failed:${error.message}`);
    return (data ?? []).map(mapRelRow);
  }

  async saveReconciliation(
    ref: LegacySpatialReconciliation,
  ): Promise<LegacySpatialReconciliation> {
    const row = {
      reconciliation_id: ref.reconciliationId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      source_table: ref.sourceTable,
      source_column: ref.sourceColumn,
      source_record_id: ref.sourceRecordId,
      legacy_text: ref.legacyText,
      state: ref.state,
      candidate_spatial_reference_id: ref.candidateSpatialReferenceId ?? null,
      confirmed_spatial_reference_id: ref.confirmedSpatialReferenceId ?? null,
      is_canonical: false,
      notes: ref.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await this.supabase
      .from(LEGACY)
      .upsert(row, { onConflict: "reconciliation_id" })
      .select("*")
      .single();
    if (error) throw new Error(`legacy_persist_failed:${error.message}`);
    return mapLegacyRow(data);
  }

  async getReconciliation(
    tenantId: string,
    workspaceId: string,
    reconciliationId: string,
  ): Promise<LegacySpatialReconciliation | null> {
    const { data, error } = await this.supabase
      .from(LEGACY)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("reconciliation_id", reconciliationId)
      .maybeSingle();
    if (error) throw new Error(`legacy_get_failed:${error.message}`);
    return data ? mapLegacyRow(data) : null;
  }

  async listReconciliations(
    tenantId: string,
    workspaceId: string,
  ): Promise<LegacySpatialReconciliation[]> {
    const { data, error } = await this.supabase
      .from(LEGACY)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`legacy_list_failed:${error.message}`);
    return (data ?? []).map(mapLegacyRow);
  }

  async saveReview(ref: SpatialReferenceReview): Promise<SpatialReferenceReview> {
    const row = {
      review_id: ref.reviewId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      spatial_reference_id: ref.spatialReferenceId,
      decision: ref.decision,
      reviewer_id: ref.reviewerId ?? null,
      rationale: ref.rationale ?? null,
      ai_self_approval: false,
    };
    const { data, error } = await this.supabase
      .from(REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`review_persist_failed:${error.message}`);
    return mapReviewRow(data);
  }

  async listReviews(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialReferenceReview[]> {
    const { data, error } = await this.supabase
      .from(REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`review_list_failed:${error.message}`);
    return (data ?? []).map(mapReviewRow);
  }

  async enqueueOutbox(record: SpatialOutboxEvent): Promise<SpatialOutboxEvent> {
    const row = {
      outbox_id: record.outboxId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      event_type: record.eventType,
      payload: record.payload,
      correlation_id: record.correlationId ?? null,
      published: record.published,
      created_at: record.createdAt,
      published_at: record.publishedAt ?? null,
    };
    const { error } = await this.supabase.from(OUTBOX).insert(row);
    if (error) throw new Error(`spatial_outbox_persist_failed:${error.message}`);
    return record;
  }

  async listOutbox(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialOutboxEvent[]> {
    const { data, error } = await this.supabase
      .from(OUTBOX)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`spatial_outbox_list_failed:${error.message}`);
    return (data ?? []).map((row: Record<string, unknown>) => ({
      outboxId: String(row.outbox_id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      eventType: row.event_type as SpatialOutboxEvent["eventType"],
      payload: (row.payload as SpatialOutboxEvent["payload"]) ?? {},
      correlationId: row.correlation_id != null ? String(row.correlation_id) : undefined,
      published: Boolean(row.published),
      createdAt: String(row.created_at),
      publishedAt: row.published_at != null ? String(row.published_at) : undefined,
    }));
  }
}

export function createPostgresSharedSpatialRepository(
  supabase: SupabaseLike,
): SharedSpatialRepositoryPort {
  return new PostgresSharedSpatialRepository(supabase);
}
