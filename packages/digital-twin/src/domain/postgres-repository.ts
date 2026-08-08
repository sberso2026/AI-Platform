/**
 * Phase 12B — Postgres repository adapter for Digital Twin core tables.
 */

import { randomUUID } from "node:crypto";
import type { TwinIdentity } from "./identity";
import type { TwinRepresentationReference } from "./representation";
import type { TwinRelationship } from "./relationships";
import type { DigitalThreadLink } from "./thread";
import type { TwinStateReference } from "./state";
import {
  assertProductionRepositorySafe,
  type DigitalTwinRepositoryPort,
  type OutboxEventRecord,
  type PersistedTwinIdentity,
  type PersistedTwinRepresentation,
  type PersistedTwinRelationship,
  type PersistedThreadLink,
  type PersistedStateReference,
  type TwinReviewRecord,
} from "./persistence";

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

function mapStateRow(row: Record<string, unknown>): PersistedStateReference {
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
    return ((data ?? []) as Record<string, unknown>[]).map(mapStateRow);
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
}

export function createPostgresDigitalTwinRepository(supabase: unknown): PostgresDigitalTwinRepository {
  return new PostgresDigitalTwinRepository(supabase as AnyClient);
}
