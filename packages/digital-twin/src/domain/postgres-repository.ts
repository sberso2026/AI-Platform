/**
 * Phase 12B — Postgres repository adapter for Digital Twin core tables.
 */

import { randomUUID } from "node:crypto";
import type { TwinIdentity } from "./identity";
import type { TwinRepresentationReference } from "./representation";
import type { TwinRelationship } from "./relationships";
import type { DigitalThreadLink } from "./thread";
import type { TwinStateReference, TwinState, TwinStateVersion, TwinStateSnapshot } from "./state";
import type { RepresentationVersion } from "./representation-versioning";
import type { TwinTimelineEvent } from "./timeline";
import {
  assertProductionRepositorySafe,
  type DigitalTwinRepositoryPort,
  type OutboxEventRecord,
  type PersistedTwinIdentity,
  type PersistedTwinRepresentation,
  type PersistedTwinRelationship,
  type PersistedThreadLink,
  type PersistedStateReference,
  type PersistedTwinState,
  type PersistedTwinStateVersion,
  type PersistedTwinSnapshot,
  type PersistedRepresentationVersion,
  type PersistedTimelineEvent,
  type TwinReviewRecord,
  type TwinStateReviewRecord,
  type IngestionIdempotencyRecord,
  type PersistedStateCandidate,
  type PersistedStateReconciliation,
  type PersistedSourceAdapter,
  type PersistedStateSchema,
  type PersistedSourceAuthorityPolicy,
  type PersistedTelemetrySource,
  type PersistedTelemetryChannel,
  type PersistedTelemetryBinding,
  type PersistedTelemetryAggregationPolicy,
  type PersistedTelemetryProjectionRecord,
  type TelemetryBindingReviewRecord,
} from "./persistence";

const STATES = "digital_twin_states";
const STATE_VERSIONS = "digital_twin_state_versions";
const REP_VERSIONS = "digital_twin_representation_versions";
const SNAPSHOTS = "digital_twin_snapshots";
const TIMELINE = "digital_twin_timeline_events";
const STATE_REVIEWS = "digital_twin_state_reviews";
const SOURCE_ADAPTERS = "digital_twin_source_adapters";
const STATE_SCHEMAS = "digital_twin_state_schemas";
const STATE_CANDIDATES = "digital_twin_state_candidates";
const STATE_RECONCILIATION = "digital_twin_state_reconciliation";
const SOURCE_AUTHORITY = "digital_twin_source_authority_policies";
const INGESTION_IDEMPOTENCY = "digital_twin_ingestion_idempotency";
const TELEMETRY_SOURCES = "digital_twin_telemetry_sources";
const TELEMETRY_CHANNELS = "digital_twin_telemetry_channels";
const TELEMETRY_BINDINGS = "digital_twin_telemetry_bindings";
const TELEMETRY_POLICIES = "digital_twin_telemetry_aggregation_policies";
const TELEMETRY_PROJECTIONS = "digital_twin_telemetry_projection_records";
const TELEMETRY_BINDING_REVIEWS = "digital_twin_telemetry_binding_reviews";

type AnyClient = {
  from(table: string): {
    insert(row: unknown): { select(cols: string): { single(): Promise<{ data: unknown; error: { code?: string; message: string } | null }> } };
    select(cols: string): {
      eq(col: string, val: unknown): {
        eq(col: string, val: unknown): {
          eq(col: string, val: unknown): {
            maybeSingle(): Promise<{ data: unknown; error: { message: string } | null }>;
          };
          order(col: string, opts: { ascending: boolean }): Promise<{ data: unknown[]; error: { message: string } | null }>;
        };
        order(col: string, opts: { ascending: boolean }): Promise<{ data: unknown[]; error: { message: string } | null }>;
      };
      eq(col: string, val: unknown): {
        eq(col: string, val: unknown): Promise<{ data: unknown[]; error: { message: string } | null }>;
        maybeSingle(): Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
  };
};

const IDENTITIES = "digital_twin_identities";
const REPRESENTATIONS = "digital_twin_representations";
const RELATIONSHIPS = "digital_twin_typed_relationships";
const THREAD_LINKS = "digital_twin_thread_links";
const STATE_REFS = "digital_twin_state_references";
const REVIEWS = "digital_twin_reviews";
const OUTBOX = "digital_twin_outbox_events";

function mapIdentityRow(row: Record<string, unknown>): PersistedTwinIdentity {
  return {
    twinId: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    target: {
      canonicalEntityType: row.canonical_entity_type as TwinIdentity["target"]["canonicalEntityType"],
      canonicalEntityId: String(row.canonical_entity_id),
    },
    twinType: row.twin_type as TwinIdentity["twinType"],
    version: {
      twinVersion: Number(row.twin_version),
      configurationVersion: Number(row.configuration_version),
    },
    status: row.status as TwinIdentity["status"],
    kernelTwinId: row.kernel_twin_id ? String(row.kernel_twin_id) : undefined,
    reviewWorkflowInstanceId: row.review_workflow_instance_id
      ? String(row.review_workflow_instance_id)
      : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    mutatesCanonicalIdentity: false,
    duplicatesAssetFields: false,
    liveTelemetryBound: false,
    simulationExecuted: false,
    runtimeSyncEnabled: false,
    physicalActuationEnabled: false,
  };
}

function mapRepresentationRow(row: Record<string, unknown>): PersistedTwinRepresentation {
  return {
    representationId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    representationType: row.representation_type as TwinRepresentationReference["representationType"],
    sourceRef: String(row.source_ref),
    version: String(row.version),
    fidelityLevel: row.fidelity_level as TwinRepresentationReference["fidelityLevel"],
    coordinateSystem: row.coordinate_system ? String(row.coordinate_system) : undefined,
    units: row.units ? String(row.units) : undefined,
    status: row.status as TwinRepresentationReference["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    storesGeometryPayload: false,
    viewerEnabled: false,
    liveTelemetryBound: false,
  };
}

function mapRelationshipRow(row: Record<string, unknown>): PersistedTwinRelationship {
  return {
    relationshipId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    relationshipType: row.relationship_type as TwinRelationship["relationshipType"],
    targetRef: String(row.target_ref),
    targetKind: row.target_kind as TwinRelationship["targetKind"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    knowledgeGraphReuse: true,
    newGraphEngineIntroduced: false,
  };
}

function mapThreadLinkRow(row: Record<string, unknown>): PersistedThreadLink {
  return {
    linkId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    targetType: row.target_type as DigitalThreadLink["targetType"],
    targetRef: String(row.target_ref),
    platformTimelineRef: row.platform_timeline_ref as DigitalThreadLink["platformTimelineRef"],
    label: row.label ? String(row.label) : undefined,
    recordedAt: String(row.recorded_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    duplicatesTimelineStorage: false,
  };
}

function mapStateReferenceRow(row: Record<string, unknown>): PersistedStateReference {
  const base = {
    stateRefId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    category: row.category as PersistedStateReference["category"],
    version: Number(row.version),
    provenance: row.provenance as PersistedStateReference["provenance"],
    status: row.status as PersistedStateReference["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    externalRef: String(row.external_ref),
  };
  if (row.category === "observed") {
    return { ...base, category: "observed", observedAt: String(row.observed_at), liveIngestionEnabled: false };
  }
  if (row.category === "derived") {
    return { ...base, category: "derived", derivedFromRefs: (row.derived_from_refs as string[]) ?? [] };
  }
  if (row.category === "operational") {
    return {
      ...base,
      category: "operational",
      operationalContext: row.operational_context ? String(row.operational_context) : undefined,
    };
  }
  return {
    ...base,
    category: "simulated",
    simulationExecuted: false,
    simulationScenarioRef: row.simulation_scenario_ref ? String(row.simulation_scenario_ref) : undefined,
  };
}

function mapTwinStateRow(row: Record<string, unknown>): PersistedTwinState {
  return {
    stateId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    category: row.category as PersistedTwinState["category"],
    lifecycle: row.lifecycle as PersistedTwinState["lifecycle"],
    currentVersion: Number(row.current_version),
    provenance: row.provenance as PersistedTwinState["provenance"],
    externalRef: String(row.external_ref),
    confidence: row.confidence != null ? Number(row.confidence) : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    reviewStatus: row.review_status as PersistedTwinState["reviewStatus"],
    reviewWorkflowInstanceId: row.review_workflow_instance_id
      ? String(row.review_workflow_instance_id)
      : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    supersededAt: row.superseded_at ? String(row.superseded_at) : undefined,
    supersededByStateId: row.superseded_by_state_id ? String(row.superseded_by_state_id) : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    simulationExecuted: false,
    liveIngestionEnabled: false,
    storesTelemetryPayload: false,
  };
}

function mapStateVersionRow(row: Record<string, unknown>): PersistedTwinStateVersion {
  return {
    stateVersionId: String(row.id),
    stateId: String(row.state_id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    versionNumber: Number(row.version_number),
    category: row.category as PersistedTwinStateVersion["category"],
    lifecycle: row.lifecycle as PersistedTwinStateVersion["lifecycle"],
    provenance: row.provenance as PersistedTwinStateVersion["provenance"],
    externalRef: String(row.external_ref),
    confidence: row.confidence != null ? Number(row.confidence) : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    reviewStatus: row.review_status as PersistedTwinStateVersion["reviewStatus"],
    createdAt: String(row.created_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    simulationExecuted: false,
    storesTelemetryPayload: false,
  };
}

function mapRepVersionRow(row: Record<string, unknown>): PersistedRepresentationVersion {
  return {
    representationVersionId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    representationType: row.representation_type as PersistedRepresentationVersion["representationType"],
    sourceSystem: String(row.source_system),
    sourceRef: String(row.source_ref),
    revision: String(row.revision),
    effectiveDate: String(row.effective_date),
    fidelityLevel: row.fidelity_level as PersistedRepresentationVersion["fidelityLevel"],
    coordinateSystem: row.coordinate_system ? String(row.coordinate_system) : undefined,
    units: row.units ? String(row.units) : undefined,
    supersededBy: row.superseded_by ? String(row.superseded_by) : undefined,
    createdAt: String(row.created_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    storesGeometryPayload: false,
    viewerEnabled: false,
    liveTelemetryBound: false,
    overwritesHistoricalVersion: false,
  };
}

function mapSnapshotRow(row: Record<string, unknown>): PersistedTwinSnapshot {
  return {
    snapshotId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    stateVersionRefs: (row.state_version_refs as PersistedTwinSnapshot["stateVersionRefs"]) ?? [],
    representationVersionIds: row.representation_version_ids as string[] | undefined,
    label: row.label ? String(row.label) : undefined,
    createdAt: String(row.created_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    storesTelemetryPayload: false,
  };
}

function mapTimelineRow(row: Record<string, unknown>): PersistedTimelineEvent {
  return {
    eventId: String(row.id),
    twinId: String(row.twin_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    eventType: row.event_type as PersistedTimelineEvent["eventType"],
    entityType: row.entity_type as PersistedTimelineEvent["entityType"],
    entityId: String(row.entity_id),
    recordedAt: String(row.recorded_at),
    actorId: row.actor_id ? String(row.actor_id) : undefined,
    correlationId: row.correlation_id ? String(row.correlation_id) : undefined,
    summary: String(row.summary),
    refs: (row.refs as Record<string, string>) ?? {},
    appendOnly: true,
    overwritesPriorEvent: false,
  };
}

export class PostgresDigitalTwinRepository implements DigitalTwinRepositoryPort {
  readonly adapterKind = "postgres" as const;

  constructor(private readonly supabase: AnyClient) {
    assertProductionRepositorySafe("postgres");
  }

  newId(_prefix: string): string {
    return randomUUID();
  }

  async saveIdentity(identity: PersistedTwinIdentity): Promise<PersistedTwinIdentity> {
    const row = {
      id: identity.twinId,
      tenant_id: identity.tenantId,
      workspace_id: identity.workspaceId,
      twin_id: identity.twinId,
      canonical_entity_type: identity.target.canonicalEntityType,
      canonical_entity_id: identity.target.canonicalEntityId,
      twin_type: identity.twinType,
      twin_version: identity.version.twinVersion,
      configuration_version: identity.version.configurationVersion,
      status: identity.status,
      kernel_twin_id: identity.kernelTwinId ?? null,
      review_workflow_instance_id: identity.reviewWorkflowInstanceId ?? null,
      created_at: identity.createdAt,
      updated_at: identity.updatedAt,
      created_by: identity.createdBy ?? null,
      published_at: identity.publishedAt ?? null,
      mutates_canonical_identity: false,
      duplicates_asset_fields: false,
      live_telemetry_bound: false,
      simulation_executed: false,
      runtime_sync_enabled: false,
      physical_actuation_enabled: false,
    };
    const { error } = await this.supabase.from(IDENTITIES).insert(row).select("*").single();
    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message)) {
        const { error: updateError } = await (this.supabase.from(IDENTITIES) as unknown as {
          update(row: unknown): { eq(c: string, v: unknown): { eq(c: string, v: unknown): Promise<{ error: { message: string } | null }> } };
        }).update(row).eq("id", identity.twinId).eq("tenant_id", identity.tenantId);
        if (updateError) throw new Error(`twin_identity_persist_failed:${updateError.message}`);
        return identity;
      }
      throw new Error(`twin_identity_persist_failed:${error.message}`);
    }
    return identity;
  }

  async getIdentityById(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinIdentity | null> {
    const { data, error } = await this.supabase
      .from(IDENTITIES)
      .select("*")
      .eq("id", twinId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`twin_identity_read_failed:${error.message}`);
    return data ? mapIdentityRow(data as Record<string, unknown>) : null;
  }

  async getIdentityByTarget(
    tenantId: string,
    workspaceId: string,
    canonicalEntityType: string,
    canonicalEntityId: string,
  ): Promise<PersistedTwinIdentity | undefined> {
    const { data, error } = await this.supabase
      .from(IDENTITIES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("canonical_entity_type", canonicalEntityType)
      .eq("canonical_entity_id", canonicalEntityId)
      .maybeSingle();
    if (error) throw new Error(`twin_identity_read_failed:${error.message}`);
    return data ? mapIdentityRow(data as Record<string, unknown>) : undefined;
  }

  async listIdentities(tenantId: string, workspaceId: string): Promise<PersistedTwinIdentity[]> {
    const { data, error } = await this.supabase
      .from(IDENTITIES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_identity_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapIdentityRow);
  }

  async saveRepresentation(
    representation: PersistedTwinRepresentation,
  ): Promise<PersistedTwinRepresentation> {
    const row = {
      id: representation.representationId,
      tenant_id: representation.tenantId,
      workspace_id: representation.workspaceId,
      twin_id: representation.twinId,
      representation_type: representation.representationType,
      source_ref: representation.sourceRef,
      version: representation.version,
      fidelity_level: representation.fidelityLevel,
      coordinate_system: representation.coordinateSystem ?? null,
      units: representation.units ?? null,
      status: representation.status,
      created_at: representation.createdAt,
      updated_at: representation.updatedAt,
      created_by: representation.createdBy ?? null,
      stores_geometry_payload: false,
      viewer_enabled: false,
      live_telemetry_bound: false,
    };
    const { error } = await this.supabase.from(REPRESENTATIONS).insert(row).select("*").single();
    if (error) throw new Error(`twin_representation_persist_failed:${error.message}`);
    return representation;
  }

  async listRepresentations(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinRepresentation[]> {
    const { data, error } = await this.supabase
      .from(REPRESENTATIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_representation_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRepresentationRow);
  }

  async saveRelationship(
    relationship: PersistedTwinRelationship,
  ): Promise<PersistedTwinRelationship> {
    const row = {
      id: relationship.relationshipId,
      tenant_id: relationship.tenantId,
      workspace_id: relationship.workspaceId,
      twin_id: relationship.twinId,
      relationship_type: relationship.relationshipType,
      target_ref: relationship.targetRef,
      target_kind: relationship.targetKind,
      created_at: relationship.createdAt,
      updated_at: relationship.updatedAt,
      created_by: relationship.createdBy ?? null,
      knowledge_graph_reuse: true,
      new_graph_engine_introduced: false,
    };
    const { error } = await this.supabase.from(RELATIONSHIPS).insert(row).select("*").single();
    if (error) throw new Error(`twin_relationship_persist_failed:${error.message}`);
    return relationship;
  }

  async listRelationships(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinRelationship[]> {
    const { data, error } = await this.supabase
      .from(RELATIONSHIPS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_relationship_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRelationshipRow);
  }

  async saveThreadLink(link: PersistedThreadLink): Promise<PersistedThreadLink> {
    const row = {
      id: link.linkId,
      tenant_id: link.tenantId,
      workspace_id: link.workspaceId,
      twin_id: link.twinId,
      target_type: link.targetType,
      target_ref: link.targetRef,
      platform_timeline_ref: link.platformTimelineRef ?? null,
      label: link.label ?? null,
      recorded_at: link.recordedAt,
      created_by: link.createdBy ?? null,
      duplicates_timeline_storage: false,
    };
    const { error } = await this.supabase.from(THREAD_LINKS).insert(row).select("*").single();
    if (error) throw new Error(`twin_thread_link_persist_failed:${error.message}`);
    return link;
  }

  async listThreadLinks(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedThreadLink[]> {
    const { data, error } = await this.supabase
      .from(THREAD_LINKS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`twin_thread_link_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapThreadLinkRow);
  }

  async saveStateReference(state: PersistedStateReference): Promise<PersistedStateReference> {
    const row: Record<string, unknown> = {
      id: state.stateRefId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      twin_id: state.twinId,
      category: state.category,
      version: state.version,
      provenance: state.provenance,
      status: state.status,
      created_at: state.createdAt,
      updated_at: state.updatedAt,
      external_ref: state.externalRef,
      simulation_executed: false,
      live_ingestion_enabled: false,
    };
    if (state.category === "observed") {
      row.observed_at = state.observedAt;
    }
    if (state.category === "derived") {
      row.derived_from_refs = state.derivedFromRefs;
    }
    if (state.category === "operational") {
      row.operational_context = state.operationalContext ?? null;
    }
    if (state.category === "simulated") {
      row.simulation_scenario_ref = state.simulationScenarioRef ?? null;
    }
    const { error } = await this.supabase.from(STATE_REFS).insert(row).select("*").single();
    if (error) throw new Error(`twin_state_ref_persist_failed:${error.message}`);
    return state;
  }

  async listStateReferences(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedStateReference[]> {
    const { data, error } = await this.supabase
      .from(STATE_REFS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_state_ref_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapStateReferenceRow);
  }

  async saveReview(review: TwinReviewRecord): Promise<TwinReviewRecord> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      twin_id: review.twinId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
    };
    const { error } = await this.supabase.from(REVIEWS).insert(row).select("*").single();
    if (error) throw new Error(`twin_review_persist_failed:${error.message}`);
    return review;
  }

  async listReviews(
    tenantId: string,
    workspaceId: string,
    twinId?: string,
  ): Promise<TwinReviewRecord[]> {
    let query = this.supabase
      .from(REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (twinId) {
      query = (query as { eq(c: string, v: unknown): typeof query }).eq("twin_id", twinId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`twin_review_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      reviewId: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      twinId: String(row.twin_id),
      workflowInstanceId: String(row.workflow_instance_id),
      workflowState: String(row.workflow_state),
      outcome: row.outcome as TwinReviewRecord["outcome"],
      reviewerId: row.reviewer_id ? String(row.reviewer_id) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      createdAt: String(row.created_at),
      completedAt: row.completed_at ? String(row.completed_at) : undefined,
      selfApproved: false as const,
    }));
  }

  async enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord> {
    const row = {
      id: record.outboxId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      twin_id: record.twinId,
      event_type: record.eventType,
      payload: record.payload,
      correlation_id: record.correlationId ?? null,
      published: record.published,
      created_at: record.createdAt,
      published_at: record.publishedAt ?? null,
    };
    const { error } = await this.supabase.from(OUTBOX).insert(row).select("*").single();
    if (error) throw new Error(`twin_outbox_persist_failed:${error.message}`);
    return record;
  }

  async listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]> {
    const { data, error } = await this.supabase
      .from(OUTBOX)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_outbox_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      outboxId: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      twinId: String(row.twin_id),
      eventType: String(row.event_type),
      payload: row.payload as Record<string, unknown>,
      correlationId: row.correlation_id ? String(row.correlation_id) : undefined,
      published: Boolean(row.published),
      createdAt: String(row.created_at),
      publishedAt: row.published_at ? String(row.published_at) : undefined,
    }));
  }

  async saveState(state: PersistedTwinState): Promise<PersistedTwinState> {
    const row = {
      id: state.stateId,
      tenant_id: state.tenantId,
      workspace_id: state.workspaceId,
      twin_id: state.twinId,
      category: state.category,
      lifecycle: state.lifecycle,
      current_version: state.currentVersion,
      provenance: state.provenance,
      external_ref: state.externalRef,
      confidence: state.confidence ?? null,
      evidence_refs: state.evidenceRefs,
      review_status: state.reviewStatus,
      review_workflow_instance_id: state.reviewWorkflowInstanceId ?? null,
      created_at: state.createdAt,
      updated_at: state.updatedAt,
      published_at: state.publishedAt ?? null,
      superseded_at: state.supersededAt ?? null,
      superseded_by_state_id: state.supersededByStateId ?? null,
      created_by: state.createdBy ?? null,
      simulation_executed: false,
      live_ingestion_enabled: false,
      stores_telemetry_payload: false,
    };
    const { error } = await this.supabase.from(STATES).insert(row).select("*").single();
    if (error) {
      if (error.code === "23505" || /duplicate key/i.test(error.message)) {
        const { error: updateError } = await (this.supabase.from(STATES) as unknown as {
          update(row: unknown): { eq(c: string, v: unknown): { eq(c: string, v: unknown): Promise<{ error: { message: string } | null }> } };
        }).update(row).eq("id", state.stateId).eq("tenant_id", state.tenantId);
        if (updateError) throw new Error(`twin_state_persist_failed:${updateError.message}`);
        return state;
      }
      throw new Error(`twin_state_persist_failed:${error.message}`);
    }
    return state;
  }

  async getStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedTwinState | null> {
    const { data, error } = await this.supabase
      .from(STATES)
      .select("*")
      .eq("id", stateId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`twin_state_read_failed:${error.message}`);
    return data ? mapTwinStateRow(data as Record<string, unknown>) : null;
  }

  async listStates(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinState[]> {
    const { data, error } = await this.supabase
      .from(STATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_state_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapTwinStateRow);
  }

  async saveStateVersion(version: PersistedTwinStateVersion): Promise<PersistedTwinStateVersion> {
    const row = {
      id: version.stateVersionId,
      tenant_id: version.tenantId,
      workspace_id: version.workspaceId,
      twin_id: version.twinId,
      state_id: version.stateId,
      version_number: version.versionNumber,
      category: version.category,
      lifecycle: version.lifecycle,
      provenance: version.provenance,
      external_ref: version.externalRef,
      confidence: version.confidence ?? null,
      evidence_refs: version.evidenceRefs,
      review_status: version.reviewStatus,
      created_at: version.createdAt,
      created_by: version.createdBy ?? null,
      simulation_executed: false,
      stores_telemetry_payload: false,
    };
    const { error } = await this.supabase.from(STATE_VERSIONS).insert(row).select("*").single();
    if (error) throw new Error(`twin_state_version_persist_failed:${error.message}`);
    return version;
  }

  async listStateVersions(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedTwinStateVersion[]> {
    const { data, error } = await this.supabase
      .from(STATE_VERSIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("state_id", stateId)
      .order("version_number", { ascending: false });
    if (error) throw new Error(`twin_state_version_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapStateVersionRow);
  }

  async listStateVersionsForTwin(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinStateVersion[]> {
    const { data, error } = await this.supabase
      .from(STATE_VERSIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_state_version_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapStateVersionRow);
  }

  async saveRepresentationVersion(
    version: PersistedRepresentationVersion,
  ): Promise<PersistedRepresentationVersion> {
    const row = {
      id: version.representationVersionId,
      tenant_id: version.tenantId,
      workspace_id: version.workspaceId,
      twin_id: version.twinId,
      representation_type: version.representationType,
      source_system: version.sourceSystem,
      source_ref: version.sourceRef,
      revision: version.revision,
      effective_date: version.effectiveDate,
      fidelity_level: version.fidelityLevel,
      coordinate_system: version.coordinateSystem ?? null,
      units: version.units ?? null,
      superseded_by: version.supersededBy ?? null,
      created_at: version.createdAt,
      created_by: version.createdBy ?? null,
      stores_geometry_payload: false,
      viewer_enabled: false,
      live_telemetry_bound: false,
      overwrites_historical_version: false,
    };
    const { error } = await this.supabase.from(REP_VERSIONS).insert(row).select("*").single();
    if (error) throw new Error(`representation_version_persist_failed:${error.message}`);
    return version;
  }

  async listRepresentationVersions(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedRepresentationVersion[]> {
    const { data, error } = await this.supabase
      .from(REP_VERSIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("effective_date", { ascending: false });
    if (error) throw new Error(`representation_version_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRepVersionRow);
  }

  async saveSnapshot(snapshot: PersistedTwinSnapshot): Promise<PersistedTwinSnapshot> {
    const row = {
      id: snapshot.snapshotId,
      tenant_id: snapshot.tenantId,
      workspace_id: snapshot.workspaceId,
      twin_id: snapshot.twinId,
      state_version_refs: snapshot.stateVersionRefs,
      representation_version_ids: snapshot.representationVersionIds ?? null,
      label: snapshot.label ?? null,
      created_at: snapshot.createdAt,
      created_by: snapshot.createdBy ?? null,
      stores_telemetry_payload: false,
    };
    const { error } = await this.supabase.from(SNAPSHOTS).insert(row).select("*").single();
    if (error) throw new Error(`twin_snapshot_persist_failed:${error.message}`);
    return snapshot;
  }

  async getSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedTwinSnapshot | null> {
    const { data, error } = await this.supabase
      .from(SNAPSHOTS)
      .select("*")
      .eq("id", snapshotId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(`twin_snapshot_read_failed:${error.message}`);
    return data ? mapSnapshotRow(data as Record<string, unknown>) : null;
  }

  async listSnapshots(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinSnapshot[]> {
    const { data, error } = await this.supabase
      .from(SNAPSHOTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`twin_snapshot_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapSnapshotRow);
  }

  async appendTimelineEvent(event: PersistedTimelineEvent): Promise<PersistedTimelineEvent> {
    const row = {
      id: event.eventId,
      tenant_id: event.tenantId,
      workspace_id: event.workspaceId,
      twin_id: event.twinId,
      event_type: event.eventType,
      entity_type: event.entityType,
      entity_id: event.entityId,
      recorded_at: event.recordedAt,
      actor_id: event.actorId ?? null,
      correlation_id: event.correlationId ?? null,
      summary: event.summary,
      refs: event.refs,
      append_only: true,
      overwrites_prior_event: false,
    };
    const { error } = await this.supabase.from(TIMELINE).insert(row).select("*").single();
    if (error) throw new Error(`twin_timeline_persist_failed:${error.message}`);
    return event;
  }

  async listTimelineEvents(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTimelineEvent[]> {
    const { data, error } = await this.supabase
      .from(TIMELINE)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("recorded_at", { ascending: false });
    if (error) throw new Error(`twin_timeline_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapTimelineRow);
  }

  async saveStateReview(review: TwinStateReviewRecord): Promise<TwinStateReviewRecord> {
    const row = {
      id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      twin_id: review.twinId,
      state_id: review.stateId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
    };
    const { error } = await this.supabase.from(STATE_REVIEWS).insert(row).select("*").single();
    if (error) throw new Error(`twin_state_review_persist_failed:${error.message}`);
    return review;
  }

  async listStateReviews(
    tenantId: string,
    workspaceId: string,
    twinId?: string,
    stateId?: string,
  ): Promise<TwinStateReviewRecord[]> {
    let query = this.supabase
      .from(STATE_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (twinId) {
      query = (query as { eq(c: string, v: unknown): typeof query }).eq("twin_id", twinId);
    }
    if (stateId) {
      query = (query as { eq(c: string, v: unknown): typeof query }).eq("state_id", stateId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`twin_state_review_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      reviewId: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      twinId: String(row.twin_id),
      stateId: String(row.state_id),
      workflowInstanceId: String(row.workflow_instance_id),
      workflowState: String(row.workflow_state),
      outcome: row.outcome as TwinStateReviewRecord["outcome"],
      reviewerId: row.reviewer_id ? String(row.reviewer_id) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      createdAt: String(row.created_at),
      completedAt: row.completed_at ? String(row.completed_at) : undefined,
      selfApproved: false as const,
    }));
  }

  async saveSourceAdapter(adapter: PersistedSourceAdapter): Promise<PersistedSourceAdapter> {
    const row = {
      adapter_id: adapter.adapterId,
      adapter_version: adapter.adapterVersion,
      source_type: adapter.sourceType,
      source_system: adapter.sourceSystem,
      source_owner: adapter.sourceOwner,
      supported_target_types: adapter.supportedTargetTypes,
      supported_state_schemas: adapter.supportedStateSchemas,
      authentication_mode: adapter.authenticationMode,
      polling_or_push_mode: adapter.pollingOrPushMode,
      data_freshness_policy: adapter.dataFreshnessPolicy,
      idempotency_support: adapter.idempotencySupport,
      health: adapter.health,
      status: adapter.status,
      public_contract_ref: adapter.publicContractRef ?? null,
      stores_telemetry_payload: false,
      auto_publish_enabled: false,
    };
    const { error } = await this.supabase.from(SOURCE_ADAPTERS).upsert(row).select("*").single();
    if (error) throw new Error(`source_adapter_persist_failed:${error.message}`);
    return adapter;
  }

  async getSourceAdapterById(adapterId: string): Promise<PersistedSourceAdapter | null> {
    const { data, error } = await this.supabase
      .from(SOURCE_ADAPTERS)
      .select("*")
      .eq("adapter_id", adapterId)
      .maybeSingle();
    if (error) throw new Error(`source_adapter_read_failed:${error.message}`);
    return data ? mapSourceAdapterRow(data as Record<string, unknown>) : null;
  }

  async listSourceAdapters(
    _tenantId: string,
    _workspaceId: string,
  ): Promise<PersistedSourceAdapter[]> {
    const { data, error } = await this.supabase.from(SOURCE_ADAPTERS).select("*");
    if (error) throw new Error(`source_adapter_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapSourceAdapterRow);
  }

  async saveStateSchema(schema: PersistedStateSchema): Promise<PersistedStateSchema> {
    const row = {
      schema_id: schema.schemaId,
      schema_version: schema.schemaVersion,
      display_name: schema.displayName,
      category: schema.category,
      fields: schema.fields,
      allows_unrestricted_blob: false,
      stores_telemetry_payload: false,
    };
    const { error } = await this.supabase.from(STATE_SCHEMAS).upsert(row).select("*").single();
    if (error) throw new Error(`state_schema_persist_failed:${error.message}`);
    return schema;
  }

  async getStateSchemaById(schemaId: string): Promise<PersistedStateSchema | null> {
    const { data, error } = await this.supabase
      .from(STATE_SCHEMAS)
      .select("*")
      .eq("schema_id", schemaId)
      .maybeSingle();
    if (error) throw new Error(`state_schema_read_failed:${error.message}`);
    return data ? mapStateSchemaRow(data as Record<string, unknown>) : null;
  }

  async listStateSchemas(): Promise<PersistedStateSchema[]> {
    const { data, error } = await this.supabase.from(STATE_SCHEMAS).select("*");
    if (error) throw new Error(`state_schema_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapStateSchemaRow);
  }

  async saveStateCandidate(candidate: PersistedStateCandidate): Promise<PersistedStateCandidate> {
    const row = {
      id: candidate.candidateId,
      tenant_id: candidate.tenantId,
      workspace_id: candidate.workspaceId,
      twin_id: candidate.twinId,
      adapter_id: candidate.adapterId,
      schema_id: candidate.schemaId,
      schema_version: candidate.schemaVersion,
      category: candidate.category,
      lifecycle: candidate.lifecycle,
      external_ref: candidate.externalRef,
      idempotency_key: candidate.idempotencyKey,
      observed_at: candidate.observedAt,
      received_at: candidate.receivedAt,
      freshness: candidate.freshness,
      payload: candidate.payload,
      provenance: candidate.provenance,
      unit_governance: candidate.unitGovernance ?? null,
      confidence: candidate.confidence ?? null,
      evidence_refs: candidate.evidenceRefs,
      reconciliation_id: candidate.reconciliationId ?? null,
      published_state_id: candidate.publishedStateId ?? null,
      review_workflow_instance_id: candidate.reviewWorkflowInstanceId ?? null,
      created_by: candidate.createdBy ?? null,
      updated_at: candidate.updatedAt,
      stores_telemetry_payload: false,
      auto_publish_attempted: false,
      simulation_executed: false,
      live_ingestion_enabled: false,
    };
    const { error } = await this.supabase.from(STATE_CANDIDATES).upsert(row).select("*").single();
    if (error) throw new Error(`state_candidate_persist_failed:${error.message}`);
    return candidate;
  }

  async getStateCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedStateCandidate | null> {
    const { data, error } = await this.supabase
      .from(STATE_CANDIDATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("id", candidateId)
      .maybeSingle();
    if (error) throw new Error(`state_candidate_read_failed:${error.message}`);
    return data ? mapStateCandidateRow(data as Record<string, unknown>) : null;
  }

  async listStateCandidates(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedStateCandidate[]> {
    const { data, error } = await this.supabase
      .from(STATE_CANDIDATES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("received_at", { ascending: false });
    if (error) throw new Error(`state_candidate_list_failed:${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapStateCandidateRow);
  }

  async saveStateReconciliation(
    record: PersistedStateReconciliation,
  ): Promise<PersistedStateReconciliation> {
    const row = {
      id: record.reconciliationId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      twin_id: record.twinId,
      candidate_id: record.candidateId,
      outcome: record.outcome,
      conflicting_state_id: record.conflictingStateId ?? null,
      superseded_state_id: record.supersededStateId ?? null,
      notes: record.notes ?? null,
      evaluated_at: record.evaluatedAt,
      evaluated_by: record.evaluatedBy ?? null,
      requires_review: record.requiresReview,
      auto_publish_blocked: true,
    };
    const { error } = await this.supabase
      .from(STATE_RECONCILIATION)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`state_reconciliation_persist_failed:${error.message}`);
    return record;
  }

  async getStateReconciliationByCandidate(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedStateReconciliation | null> {
    const { data, error } = await this.supabase
      .from(STATE_RECONCILIATION)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("candidate_id", candidateId)
      .maybeSingle();
    if (error) throw new Error(`state_reconciliation_read_failed:${error.message}`);
    return data ? mapStateReconciliationRow(data as Record<string, unknown>) : null;
  }

  async saveSourceAuthorityPolicy(
    policy: PersistedSourceAuthorityPolicy,
  ): Promise<PersistedSourceAuthorityPolicy> {
    const row = {
      policy_id: policy.policyId,
      policy_version: policy.policyVersion,
      description: policy.description,
      rules: policy.rules,
      universal_ranking_forbidden: true,
    };
    const { error } = await this.supabase.from(SOURCE_AUTHORITY).upsert(row).select("*").single();
    if (error) throw new Error(`source_authority_persist_failed:${error.message}`);
    return policy;
  }

  async getSourceAuthorityPolicy(
    policyId: string,
  ): Promise<PersistedSourceAuthorityPolicy | null> {
    const { data, error } = await this.supabase
      .from(SOURCE_AUTHORITY)
      .select("*")
      .eq("policy_id", policyId)
      .maybeSingle();
    if (error) throw new Error(`source_authority_read_failed:${error.message}`);
    return data ? mapSourceAuthorityRow(data as Record<string, unknown>) : null;
  }

  async saveIngestionIdempotency(
    record: IngestionIdempotencyRecord,
  ): Promise<IngestionIdempotencyRecord> {
    const row = {
      id: record.idempotencyId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      idempotency_key: record.idempotencyKey,
      candidate_id: record.candidateId,
      created_at: record.createdAt,
    };
    const { error } = await this.supabase
      .from(INGESTION_IDEMPOTENCY)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`ingestion_idempotency_persist_failed:${error.message}`);
    return record;
  }

  async getIngestionIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IngestionIdempotencyRecord | null> {
    const { data, error } = await this.supabase
      .from(INGESTION_IDEMPOTENCY)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) throw new Error(`ingestion_idempotency_read_failed:${error.message}`);
    return data
      ? {
          idempotencyId: String(data.id),
          tenantId: String(data.tenant_id),
          workspaceId: String(data.workspace_id),
          idempotencyKey: String(data.idempotency_key),
          candidateId: String(data.candidate_id),
          createdAt: String(data.created_at),
        }
      : null;
  }

  async saveTelemetrySource(source: PersistedTelemetrySource): Promise<PersistedTelemetrySource> {
    const row = {
      source_id: source.sourceId,
      tenant_id: source.tenantId,
      workspace_id: source.workspaceId,
      twin_id: source.twinId,
      source_kind: source.sourceKind,
      external_ref: source.externalRef,
      engineering_series_id: source.engineeringSeriesId ?? null,
      attribute_key: source.attributeKey ?? null,
      display_name: source.displayName,
      description: source.description ?? null,
      owner_module: source.ownerModule,
      stores_raw_telemetry: false,
      created_at: source.createdAt,
      updated_at: source.updatedAt,
      created_by: source.createdBy ?? null,
    };
    const { error } = await this.supabase.from(TELEMETRY_SOURCES).insert(row).select("*").single();
    if (error) throw new Error(`telemetry_source_persist_failed:${error.message}`);
    return source;
  }

  async listTelemetrySources(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetrySource[]> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_SOURCES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`telemetry_sources_read_failed:${error.message}`);
    return (data ?? []).map((row) => mapTelemetrySourceRow(row as Record<string, unknown>));
  }

  async getTelemetrySourceById(
    tenantId: string,
    workspaceId: string,
    sourceId: string,
  ): Promise<PersistedTelemetrySource | null> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_SOURCES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("source_id", sourceId)
      .maybeSingle();
    if (error) throw new Error(`telemetry_source_read_failed:${error.message}`);
    return data ? mapTelemetrySourceRow(data as Record<string, unknown>) : null;
  }

  async saveTelemetryChannel(channel: PersistedTelemetryChannel): Promise<PersistedTelemetryChannel> {
    const row = {
      channel_id: channel.channelId,
      tenant_id: channel.tenantId,
      workspace_id: channel.workspaceId,
      twin_id: channel.twinId,
      source_id: channel.sourceId,
      channel_key: channel.channelKey,
      display_name: channel.displayName,
      unit: channel.unit,
      twin_attribute_key: channel.twinAttributeKey,
      engineering_series_ref: channel.engineeringSeriesRef ?? null,
      source_ref: channel.sourceRef,
      stores_raw_telemetry: false,
      created_at: channel.createdAt,
      updated_at: channel.updatedAt,
    };
    const { error } = await this.supabase.from(TELEMETRY_CHANNELS).insert(row).select("*").single();
    if (error) throw new Error(`telemetry_channel_persist_failed:${error.message}`);
    return channel;
  }

  async listTelemetryChannels(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetryChannel[]> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_CHANNELS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`telemetry_channels_read_failed:${error.message}`);
    return (data ?? []).map((row) => mapTelemetryChannelRow(row as Record<string, unknown>));
  }

  async saveTelemetryBinding(binding: PersistedTelemetryBinding): Promise<PersistedTelemetryBinding> {
    const row = {
      binding_id: binding.bindingId,
      tenant_id: binding.tenantId,
      workspace_id: binding.workspaceId,
      twin_id: binding.twinId,
      source_id: binding.sourceId,
      channel_id: binding.channelId,
      binding_key: binding.bindingKey,
      display_name: binding.displayName,
      lifecycle: binding.lifecycle,
      source_ref: binding.sourceRef,
      channel_ref: binding.channelRef,
      engineering_series_id: binding.engineeringSeriesId ?? null,
      policy_id: binding.policyId ?? null,
      review_workflow_instance_id: binding.reviewWorkflowInstanceId ?? null,
      superseded_by_binding_id: binding.supersededByBindingId ?? null,
      stores_raw_telemetry: false,
      auto_publish_enabled: false,
      created_at: binding.createdAt,
      updated_at: binding.updatedAt,
      created_by: binding.createdBy ?? null,
    };
    const { error } = await this.supabase.from(TELEMETRY_BINDINGS).insert(row).select("*").single();
    if (error) throw new Error(`telemetry_binding_persist_failed:${error.message}`);
    return binding;
  }

  async getTelemetryBindingById(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryBinding | null> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_BINDINGS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("binding_id", bindingId)
      .maybeSingle();
    if (error) throw new Error(`telemetry_binding_read_failed:${error.message}`);
    return data ? mapTelemetryBindingRow(data as Record<string, unknown>) : null;
  }

  async listTelemetryBindings(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetryBinding[]> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_BINDINGS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("twin_id", twinId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`telemetry_bindings_read_failed:${error.message}`);
    return (data ?? []).map((row) => mapTelemetryBindingRow(row as Record<string, unknown>));
  }

  async saveTelemetryAggregationPolicy(
    policy: PersistedTelemetryAggregationPolicy,
  ): Promise<PersistedTelemetryAggregationPolicy> {
    const row = {
      policy_id: policy.policyId,
      tenant_id: policy.tenantId,
      workspace_id: policy.workspaceId,
      binding_id: policy.bindingId,
      method: policy.method,
      window_seconds: policy.windowSeconds,
      min_samples: policy.minSamples,
      gap_handling: policy.gapHandling,
      interpolation: policy.interpolation,
      stale_after_seconds: policy.staleAfterSeconds,
      stores_raw_telemetry: false,
      created_at: policy.createdAt,
      updated_at: policy.updatedAt,
    };
    const { error } = await this.supabase.from(TELEMETRY_POLICIES).insert(row).select("*").single();
    if (error) throw new Error(`telemetry_policy_persist_failed:${error.message}`);
    return policy;
  }

  async getTelemetryAggregationPolicyByBinding(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryAggregationPolicy | null> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_POLICIES)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("binding_id", bindingId)
      .maybeSingle();
    if (error) throw new Error(`telemetry_policy_read_failed:${error.message}`);
    return data ? mapTelemetryPolicyRow(data as Record<string, unknown>) : null;
  }

  async saveTelemetryProjectionRecord(
    record: PersistedTelemetryProjectionRecord,
  ): Promise<PersistedTelemetryProjectionRecord> {
    const row = {
      projection_id: record.projectionId,
      tenant_id: record.tenantId,
      workspace_id: record.workspaceId,
      twin_id: record.twinId,
      binding_id: record.bindingId,
      projected_state: record.projectedState,
      candidate_id: record.candidateId ?? null,
      quality_rejected: record.qualityRejected,
      stale_detected: record.staleDetected,
      source_unavailable: record.sourceUnavailable,
      stores_raw_telemetry: false,
      created_at: record.createdAt,
    };
    const { error } = await this.supabase.from(TELEMETRY_PROJECTIONS).insert(row).select("*").single();
    if (error) throw new Error(`telemetry_projection_persist_failed:${error.message}`);
    return record;
  }

  async listTelemetryProjectionRecords(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryProjectionRecord[]> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_PROJECTIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("binding_id", bindingId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`telemetry_projections_read_failed:${error.message}`);
    return (data ?? []).map((row) => mapTelemetryProjectionRow(row as Record<string, unknown>));
  }

  async saveTelemetryBindingReview(
    review: TelemetryBindingReviewRecord,
  ): Promise<TelemetryBindingReviewRecord> {
    const row = {
      review_id: review.reviewId,
      tenant_id: review.tenantId,
      workspace_id: review.workspaceId,
      twin_id: review.twinId,
      binding_id: review.bindingId,
      workflow_instance_id: review.workflowInstanceId,
      workflow_state: review.workflowState,
      outcome: review.outcome ?? null,
      reviewer_id: review.reviewerId ?? null,
      notes: review.notes ?? null,
      created_at: review.createdAt,
      completed_at: review.completedAt ?? null,
      self_approved: false,
    };
    const { error } = await this.supabase
      .from(TELEMETRY_BINDING_REVIEWS)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(`telemetry_binding_review_persist_failed:${error.message}`);
    return review;
  }

  async listTelemetryBindingReviews(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<TelemetryBindingReviewRecord[]> {
    const { data, error } = await this.supabase
      .from(TELEMETRY_BINDING_REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("binding_id", bindingId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`telemetry_binding_reviews_read_failed:${error.message}`);
    return (data ?? []).map((row) => ({
      reviewId: String(row.review_id),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      twinId: String(row.twin_id),
      bindingId: String(row.binding_id),
      workflowInstanceId: String(row.workflow_instance_id),
      workflowState: String(row.workflow_state),
      outcome: row.outcome as TelemetryBindingReviewRecord["outcome"],
      reviewerId: row.reviewer_id ? String(row.reviewer_id) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      createdAt: String(row.created_at),
      completedAt: row.completed_at ? String(row.completed_at) : undefined,
      selfApproved: false as const,
    }));
  }
}

function mapSourceAdapterRow(row: Record<string, unknown>): PersistedSourceAdapter {
  return {
    adapterId: String(row.adapter_id),
    adapterVersion: String(row.adapter_version),
    sourceType: row.source_type as PersistedSourceAdapter["sourceType"],
    sourceSystem: String(row.source_system),
    sourceOwner: String(row.source_owner),
    supportedTargetTypes: (row.supported_target_types as string[]) ?? [],
    supportedStateSchemas: (row.supported_state_schemas as string[]) ?? [],
    authenticationMode: row.authentication_mode as PersistedSourceAdapter["authenticationMode"],
    pollingOrPushMode: row.polling_or_push_mode as PersistedSourceAdapter["pollingOrPushMode"],
    dataFreshnessPolicy: String(row.data_freshness_policy),
    idempotencySupport: Boolean(row.idempotency_support),
    health: row.health as PersistedSourceAdapter["health"],
    status: row.status as PersistedSourceAdapter["status"],
    publicContractRef: row.public_contract_ref ? String(row.public_contract_ref) : undefined,
    storesTelemetryPayload: false,
    autoPublishEnabled: false,
  };
}

function mapStateSchemaRow(row: Record<string, unknown>): PersistedStateSchema {
  return {
    schemaId: String(row.schema_id),
    schemaVersion: String(row.schema_version),
    displayName: String(row.display_name),
    category: row.category as PersistedStateSchema["category"],
    fields: (row.fields as PersistedStateSchema["fields"]) ?? [],
    allowsUnrestrictedBlob: false,
    storesTelemetryPayload: false,
  };
}

function mapStateCandidateRow(row: Record<string, unknown>): PersistedStateCandidate {
  return {
    candidateId: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    twinId: String(row.twin_id),
    adapterId: String(row.adapter_id),
    schemaId: String(row.schema_id),
    schemaVersion: String(row.schema_version),
    category: row.category as PersistedStateCandidate["category"],
    lifecycle: row.lifecycle as PersistedStateCandidate["lifecycle"],
    externalRef: String(row.external_ref),
    idempotencyKey: String(row.idempotency_key),
    observedAt: String(row.observed_at),
    receivedAt: String(row.received_at),
    freshness: row.freshness as PersistedStateCandidate["freshness"],
    payload: (row.payload as Record<string, unknown>) ?? {},
    provenance: row.provenance as PersistedStateCandidate["provenance"],
    unitGovernance: row.unit_governance as PersistedStateCandidate["unitGovernance"],
    confidence: row.confidence != null ? Number(row.confidence) : undefined,
    evidenceRefs: (row.evidence_refs as string[]) ?? [],
    reconciliationId: row.reconciliation_id ? String(row.reconciliation_id) : undefined,
    publishedStateId: row.published_state_id ? String(row.published_state_id) : undefined,
    reviewWorkflowInstanceId: row.review_workflow_instance_id
      ? String(row.review_workflow_instance_id)
      : undefined,
    createdBy: row.created_by ? String(row.created_by) : undefined,
    updatedAt: String(row.updated_at),
    storesTelemetryPayload: false,
    autoPublishAttempted: false,
    simulationExecuted: false,
    liveIngestionEnabled: false,
  };
}

function mapStateReconciliationRow(row: Record<string, unknown>): PersistedStateReconciliation {
  return {
    reconciliationId: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    twinId: String(row.twin_id),
    candidateId: String(row.candidate_id),
    outcome: row.outcome as PersistedStateReconciliation["outcome"],
    conflictingStateId: row.conflicting_state_id ? String(row.conflicting_state_id) : undefined,
    supersededStateId: row.superseded_state_id ? String(row.superseded_state_id) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    evaluatedAt: String(row.evaluated_at),
    evaluatedBy: row.evaluated_by ? String(row.evaluated_by) : undefined,
    requiresReview: Boolean(row.requires_review),
    autoPublishBlocked: true,
  };
}

function mapSourceAuthorityRow(row: Record<string, unknown>): PersistedSourceAuthorityPolicy {
  return {
    policyId: String(row.policy_id),
    policyVersion: String(row.policy_version),
    description: String(row.description),
    rules: (row.rules as PersistedSourceAuthorityPolicy["rules"]) ?? [],
    universalRankingForbidden: true,
  };
}

function mapTelemetrySourceRow(row: Record<string, unknown>): PersistedTelemetrySource {
  return {
    sourceId: String(row.source_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    twinId: String(row.twin_id),
    sourceKind: row.source_kind as PersistedTelemetrySource["sourceKind"],
    externalRef: String(row.external_ref),
    engineeringSeriesId: row.engineering_series_id ? String(row.engineering_series_id) : undefined,
    attributeKey: row.attribute_key ? String(row.attribute_key) : undefined,
    displayName: String(row.display_name),
    description: row.description ? String(row.description) : undefined,
    ownerModule: row.owner_module as PersistedTelemetrySource["ownerModule"],
    storesRawTelemetry: false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
  };
}

function mapTelemetryChannelRow(row: Record<string, unknown>): PersistedTelemetryChannel {
  return {
    channelId: String(row.channel_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    twinId: String(row.twin_id),
    sourceId: String(row.source_id),
    channelKey: String(row.channel_key),
    displayName: String(row.display_name),
    unit: String(row.unit),
    twinAttributeKey: String(row.twin_attribute_key),
    engineeringSeriesRef: row.engineering_series_ref ? String(row.engineering_series_ref) : undefined,
    sourceRef: row.source_ref as PersistedTelemetryChannel["sourceRef"],
    storesRawTelemetry: false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTelemetryBindingRow(row: Record<string, unknown>): PersistedTelemetryBinding {
  return {
    bindingId: String(row.binding_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    twinId: String(row.twin_id),
    sourceId: String(row.source_id),
    channelId: String(row.channel_id),
    bindingKey: String(row.binding_key),
    displayName: String(row.display_name),
    lifecycle: row.lifecycle as PersistedTelemetryBinding["lifecycle"],
    sourceRef: row.source_ref as PersistedTelemetryBinding["sourceRef"],
    channelRef: row.channel_ref as PersistedTelemetryBinding["channelRef"],
    engineeringSeriesId: row.engineering_series_id ? String(row.engineering_series_id) : undefined,
    policyId: row.policy_id ? String(row.policy_id) : undefined,
    reviewWorkflowInstanceId: row.review_workflow_instance_id
      ? String(row.review_workflow_instance_id)
      : undefined,
    supersededByBindingId: row.superseded_by_binding_id
      ? String(row.superseded_by_binding_id)
      : undefined,
    storesRawTelemetry: false,
    autoPublishEnabled: false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
  };
}

function mapTelemetryPolicyRow(row: Record<string, unknown>): PersistedTelemetryAggregationPolicy {
  return {
    policyId: String(row.policy_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    bindingId: String(row.binding_id),
    method: row.method as PersistedTelemetryAggregationPolicy["method"],
    windowSeconds: Number(row.window_seconds),
    minSamples: Number(row.min_samples),
    gapHandling: row.gap_handling as PersistedTelemetryAggregationPolicy["gapHandling"],
    interpolation: "not_implemented",
    staleAfterSeconds: Number(row.stale_after_seconds),
    storesRawTelemetry: false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTelemetryProjectionRow(row: Record<string, unknown>): PersistedTelemetryProjectionRecord {
  return {
    projectionId: String(row.projection_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    twinId: String(row.twin_id),
    bindingId: String(row.binding_id),
    projectedState: row.projected_state as PersistedTelemetryProjectionRecord["projectedState"],
    candidateId: row.candidate_id ? String(row.candidate_id) : undefined,
    qualityRejected: Boolean(row.quality_rejected),
    staleDetected: Boolean(row.stale_detected),
    sourceUnavailable: Boolean(row.source_unavailable),
    createdAt: String(row.created_at),
    storesRawTelemetry: false,
  };
}

export function createPostgresDigitalTwinRepository(supabase: unknown): PostgresDigitalTwinRepository {
  return new PostgresDigitalTwinRepository(supabase as AnyClient);
}
