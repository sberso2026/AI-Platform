/**
 * Phase 13B — Postgres adapter for Engineering Model Interoperability (batch_86).
 */

import { randomUUID } from "node:crypto";
import type { EngineeringModelChangeImpact } from "./change-impact";
import type { EngineeringModelOutboxEvent } from "./events";
import type { EngineeringModelElementReference } from "./engineering-model-element-reference";
import type {
  EngineeringModelReference,
  EngineeringModelVersion,
} from "./engineering-model-reference";
import type {
  EngineeringModelMapping,
  EngineeringModelMappingReview,
} from "./mappings";
import type { EngineeringModelRepositoryPort } from "./persistence";
import type { EngineeringAnalysisResultReference } from "./result-reference";

const MODELS = "engineering_model_references";
const VERSIONS = "engineering_model_versions";
const ELEMENTS = "engineering_model_elements";
const MAPPINGS = "engineering_model_mappings";
const REVIEWS = "engineering_model_mapping_reviews";
const IMPACTS = "engineering_model_change_impacts";
const RESULTS = "engineering_model_result_references";
const OUTBOX = "engineering_model_interop_outbox_events";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = { from: (table: string) => any };

function mapModel(row: Record<string, unknown>): EngineeringModelReference {
  return {
    kind: "engineering_model_reference",
    owner: "source_client_engineering_application",
    federationOwner: "engineering_model_interoperability",
    modelRefId: String(row.model_ref_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    providerKey: String(row.provider_key),
    externalModelId: String(row.external_model_id),
    displayName: row.display_name != null ? String(row.display_name) : undefined,
    formatFamily: row.format_family as EngineeringModelReference["formatFamily"],
    status: row.status as EngineeringModelReference["status"],
    platformFileRef:
      row.platform_file_ref != null ? String(row.platform_file_ref) : undefined,
    projectId: row.project_id != null ? String(row.project_id) : undefined,
    assetId: row.asset_id != null ? String(row.asset_id) : undefined,
    spatialReferenceId:
      row.spatial_reference_id != null
        ? String(row.spatial_reference_id)
        : undefined,
    twinId: row.twin_id != null ? String(row.twin_id) : undefined,
    schemaHint: row.schema_hint != null ? String(row.schema_hint) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    rtbOwned: false,
    federated: true,
    version: Number(row.version ?? 1),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapVersion(row: Record<string, unknown>): EngineeringModelVersion {
  return {
    kind: "engineering_model_version",
    owner: "source_client_engineering_application",
    federationOwner: "engineering_model_interoperability",
    modelVersionId: String(row.model_version_id),
    modelRefId: String(row.model_ref_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    versionLabel: String(row.version_label),
    platformFileRef:
      row.platform_file_ref != null ? String(row.platform_file_ref) : undefined,
    schemaId: row.schema_id != null ? String(row.schema_id) : undefined,
    parserVersion:
      row.parser_version != null ? String(row.parser_version) : undefined,
    contentSha256:
      row.content_sha256 != null ? String(row.content_sha256) : undefined,
    elementCount:
      row.element_count != null ? Number(row.element_count) : undefined,
    ingestedAt: row.ingested_at != null ? String(row.ingested_at) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapElement(row: Record<string, unknown>): EngineeringModelElementReference {
  return {
    kind: "engineering_model_element_reference",
    owner: "source_client_engineering_application",
    federationOwner: "engineering_model_interoperability",
    elementRefId: String(row.element_ref_id),
    modelRefId: String(row.model_ref_id),
    modelVersionId:
      row.model_version_id != null ? String(row.model_version_id) : undefined,
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    externalElementId: String(row.external_element_id),
    globalId: row.global_id != null ? String(row.global_id) : undefined,
    elementKind: row.element_kind != null ? String(row.element_kind) : undefined,
    ifcEntityType:
      row.ifc_entity_type != null ? String(row.ifc_entity_type) : undefined,
    displayName: row.display_name != null ? String(row.display_name) : undefined,
    storeyName: row.storey_name != null ? String(row.storey_name) : undefined,
    sourceProperties:
      (row.source_properties as Record<string, string | number | boolean | null>) ??
      undefined,
    spatialReferenceId:
      row.spatial_reference_id != null
        ? String(row.spatial_reference_id)
        : undefined,
    assetId: row.asset_id != null ? String(row.asset_id) : undefined,
    twinId: row.twin_id != null ? String(row.twin_id) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMapping(row: Record<string, unknown>): EngineeringModelMapping {
  return {
    kind: "engineering_model_mapping",
    owner: "engineering_model_interoperability",
    mappingId: String(row.mapping_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    modelRefId: String(row.model_ref_id),
    modelVersionId:
      row.model_version_id != null ? String(row.model_version_id) : undefined,
    elementRefId:
      row.element_ref_id != null ? String(row.element_ref_id) : undefined,
    targetKind: row.target_kind as EngineeringModelMapping["targetKind"],
    targetId: row.target_id != null ? String(row.target_id) : undefined,
    state: row.state as EngineeringModelMapping["state"],
    candidateTargetId:
      row.candidate_target_id != null
        ? String(row.candidate_target_id)
        : undefined,
    confirmedTargetId:
      row.confirmed_target_id != null
        ? String(row.confirmed_target_id)
        : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    aiSelfApproval: false,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapReview(row: Record<string, unknown>): EngineeringModelMappingReview {
  return {
    kind: "engineering_model_mapping_review",
    owner: "engineering_model_interoperability",
    reviewId: String(row.review_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    mappingId: String(row.mapping_id),
    decision: row.decision as EngineeringModelMappingReview["decision"],
    reviewerId: row.reviewer_id != null ? String(row.reviewer_id) : undefined,
    rationale: row.rationale != null ? String(row.rationale) : undefined,
    aiSelfApproval: false,
    workflowSlug: "engineering_model_interoperability.mapping_review",
    createdAt: String(row.created_at),
  };
}

function mapImpact(row: Record<string, unknown>): EngineeringModelChangeImpact {
  return {
    kind: "engineering_model_change_impact",
    owner: "engineering_model_interoperability",
    changeImpactId: String(row.change_impact_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    modelRefId: String(row.model_ref_id),
    fromModelVersionId:
      row.from_model_version_id != null
        ? String(row.from_model_version_id)
        : undefined,
    toModelVersionId:
      row.to_model_version_id != null
        ? String(row.to_model_version_id)
        : undefined,
    summary: String(row.summary),
    severity: row.severity as EngineeringModelChangeImpact["severity"],
    affectedElementCount:
      row.affected_element_count != null
        ? Number(row.affected_element_count)
        : undefined,
    affectedMappingCount:
      row.affected_mapping_count != null
        ? Number(row.affected_mapping_count)
        : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapResult(row: Record<string, unknown>): EngineeringAnalysisResultReference {
  return {
    kind: "engineering_analysis_result_reference",
    owner: row.owner as EngineeringAnalysisResultReference["owner"],
    federationOwner: "engineering_model_interoperability",
    resultRefId: String(row.result_ref_id),
    modelRefId: String(row.model_ref_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    externalResultId: String(row.external_result_id),
    resultKind: row.result_kind != null ? String(row.result_kind) : undefined,
    provenance: row.provenance as EngineeringAnalysisResultReference["provenance"],
    rtbGenerated: Boolean(row.rtb_generated),
    trustClassification:
      row.trust_classification as EngineeringAnalysisResultReference["trustClassification"],
    solverProviderId:
      row.solver_provider_id != null ? String(row.solver_provider_id) : undefined,
    platformFileRef:
      row.platform_file_ref != null ? String(row.platform_file_ref) : undefined,
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class PostgresEngineeringModelRepository
  implements EngineeringModelRepositoryPort
{
  readonly adapterKind = "postgres" as const;

  constructor(private readonly supabase: SupabaseLike) {}

  newId(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  async saveModel(ref: EngineeringModelReference): Promise<EngineeringModelReference> {
    const row = {
      model_ref_id: ref.modelRefId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      provider_key: ref.providerKey,
      external_model_id: ref.externalModelId,
      display_name: ref.displayName ?? null,
      format_family: ref.formatFamily,
      status: ref.status,
      platform_file_ref: ref.platformFileRef ?? null,
      project_id: ref.projectId ?? null,
      asset_id: ref.assetId ?? null,
      spatial_reference_id: ref.spatialReferenceId ?? null,
      twin_id: ref.twinId ?? null,
      schema_hint: ref.schemaHint ?? null,
      notes: ref.notes ?? null,
      rtb_owned: false,
      federated: true,
      version: ref.version,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.supabase.from(MODELS).upsert(row);
    if (error) throw new Error(`save_model:${error.message}`);
    return ref;
  }

  async getModel(tenantId: string, workspaceId: string, modelRefId: string) {
    const { data, error } = await this.supabase
      .from(MODELS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("model_ref_id", modelRefId)
      .maybeSingle();
    if (error) throw new Error(`get_model:${error.message}`);
    return data ? mapModel(data) : null;
  }

  async listModels(tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from(MODELS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`list_models:${error.message}`);
    return (data ?? []).map(mapModel);
  }

  async saveVersion(ref: EngineeringModelVersion): Promise<EngineeringModelVersion> {
    const row = {
      model_version_id: ref.modelVersionId,
      model_ref_id: ref.modelRefId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      version_label: ref.versionLabel,
      platform_file_ref: ref.platformFileRef ?? null,
      schema_id: ref.schemaId ?? null,
      parser_version: ref.parserVersion ?? null,
      content_sha256: ref.contentSha256 ?? null,
      element_count: ref.elementCount ?? null,
      ingested_at: ref.ingestedAt ?? null,
      notes: ref.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.supabase.from(VERSIONS).upsert(row);
    if (error) throw new Error(`save_version:${error.message}`);
    return ref;
  }

  async getVersion(tenantId: string, workspaceId: string, modelVersionId: string) {
    const { data, error } = await this.supabase
      .from(VERSIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("model_version_id", modelVersionId)
      .maybeSingle();
    if (error) throw new Error(`get_version:${error.message}`);
    return data ? mapVersion(data) : null;
  }

  async listVersions(tenantId: string, workspaceId: string, modelRefId?: string) {
    let q = this.supabase
      .from(VERSIONS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (modelRefId) q = q.eq("model_ref_id", modelRefId);
    const { data, error } = await q;
    if (error) throw new Error(`list_versions:${error.message}`);
    return (data ?? []).map(mapVersion);
  }

  async saveElement(
    ref: EngineeringModelElementReference,
  ): Promise<EngineeringModelElementReference> {
    const row = {
      element_ref_id: ref.elementRefId,
      model_ref_id: ref.modelRefId,
      model_version_id: ref.modelVersionId ?? null,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      external_element_id: ref.externalElementId,
      global_id: ref.globalId ?? null,
      element_kind: ref.elementKind ?? null,
      ifc_entity_type: ref.ifcEntityType ?? null,
      display_name: ref.displayName ?? null,
      storey_name: ref.storeyName ?? null,
      source_properties: ref.sourceProperties ?? {},
      spatial_reference_id: ref.spatialReferenceId ?? null,
      asset_id: ref.assetId ?? null,
      twin_id: ref.twinId ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.supabase.from(ELEMENTS).upsert(row);
    if (error) throw new Error(`save_element:${error.message}`);
    return ref;
  }

  async getElement(tenantId: string, workspaceId: string, elementRefId: string) {
    const { data, error } = await this.supabase
      .from(ELEMENTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("element_ref_id", elementRefId)
      .maybeSingle();
    if (error) throw new Error(`get_element:${error.message}`);
    return data ? mapElement(data) : null;
  }

  async listElements(tenantId: string, workspaceId: string, modelRefId?: string) {
    let q = this.supabase
      .from(ELEMENTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (modelRefId) q = q.eq("model_ref_id", modelRefId);
    const { data, error } = await q;
    if (error) throw new Error(`list_elements:${error.message}`);
    return (data ?? []).map(mapElement);
  }

  async saveMapping(ref: EngineeringModelMapping): Promise<EngineeringModelMapping> {
    const row = {
      mapping_id: ref.mappingId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      model_ref_id: ref.modelRefId,
      model_version_id: ref.modelVersionId ?? null,
      element_ref_id: ref.elementRefId ?? null,
      target_kind: ref.targetKind,
      target_id: ref.targetId ?? null,
      state: ref.state,
      candidate_target_id: ref.candidateTargetId ?? null,
      confirmed_target_id: ref.confirmedTargetId ?? null,
      notes: ref.notes ?? null,
      ai_self_approval: false,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.supabase.from(MAPPINGS).upsert(row);
    if (error) throw new Error(`save_mapping:${error.message}`);
    return ref;
  }

  async getMapping(tenantId: string, workspaceId: string, mappingId: string) {
    const { data, error } = await this.supabase
      .from(MAPPINGS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .eq("mapping_id", mappingId)
      .maybeSingle();
    if (error) throw new Error(`get_mapping:${error.message}`);
    return data ? mapMapping(data) : null;
  }

  async listMappings(tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from(MAPPINGS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`list_mappings:${error.message}`);
    return (data ?? []).map(mapMapping);
  }

  async saveReview(
    ref: EngineeringModelMappingReview,
  ): Promise<EngineeringModelMappingReview> {
    const row = {
      review_id: ref.reviewId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      mapping_id: ref.mappingId,
      decision: ref.decision,
      reviewer_id: ref.reviewerId ?? null,
      rationale: ref.rationale ?? null,
      ai_self_approval: false,
      workflow_slug: ref.workflowSlug,
    };
    const { error } = await this.supabase.from(REVIEWS).insert(row);
    if (error) throw new Error(`save_review:${error.message}`);
    return ref;
  }

  async listReviews(tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from(REVIEWS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`list_reviews:${error.message}`);
    return (data ?? []).map(mapReview);
  }

  async saveChangeImpact(
    ref: EngineeringModelChangeImpact,
  ): Promise<EngineeringModelChangeImpact> {
    const row = {
      change_impact_id: ref.changeImpactId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      model_ref_id: ref.modelRefId,
      from_model_version_id: ref.fromModelVersionId ?? null,
      to_model_version_id: ref.toModelVersionId ?? null,
      summary: ref.summary,
      severity: ref.severity,
      affected_element_count: ref.affectedElementCount ?? null,
      affected_mapping_count: ref.affectedMappingCount ?? null,
      notes: ref.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.supabase.from(IMPACTS).upsert(row);
    if (error) throw new Error(`save_change_impact:${error.message}`);
    return ref;
  }

  async listChangeImpacts(tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from(IMPACTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`list_change_impacts:${error.message}`);
    return (data ?? []).map(mapImpact);
  }

  async saveResult(
    ref: EngineeringAnalysisResultReference,
  ): Promise<EngineeringAnalysisResultReference> {
    const row = {
      result_ref_id: ref.resultRefId,
      model_ref_id: ref.modelRefId,
      tenant_id: ref.tenantId,
      workspace_id: ref.workspaceId,
      external_result_id: ref.externalResultId,
      result_kind: ref.resultKind ?? null,
      provenance: ref.provenance,
      rtb_generated: ref.rtbGenerated,
      trust_classification: ref.trustClassification,
      solver_provider_id: ref.solverProviderId ?? null,
      platform_file_ref: ref.platformFileRef ?? null,
      owner: ref.owner,
      notes: ref.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await this.supabase.from(RESULTS).upsert(row);
    if (error) throw new Error(`save_result:${error.message}`);
    return ref;
  }

  async listResults(tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from(RESULTS)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`list_results:${error.message}`);
    return (data ?? []).map(mapResult);
  }

  async enqueueOutbox(record: EngineeringModelOutboxEvent) {
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
    if (error) throw new Error(`enqueue_outbox:${error.message}`);
    return record;
  }

  async listOutbox(tenantId: string, workspaceId: string) {
    const { data, error } = await this.supabase
      .from(OUTBOX)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId);
    if (error) throw new Error(`list_outbox:${error.message}`);
    return (data ?? []).map(
      (row: Record<string, unknown>): EngineeringModelOutboxEvent => ({
        outboxId: String(row.outbox_id),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id),
        eventType: row.event_type as EngineeringModelOutboxEvent["eventType"],
        payload: (row.payload as EngineeringModelOutboxEvent["payload"]) ?? {},
        correlationId:
          row.correlation_id != null ? String(row.correlation_id) : undefined,
        published: Boolean(row.published),
        createdAt: String(row.created_at),
        publishedAt:
          row.published_at != null ? String(row.published_at) : undefined,
      }),
    );
  }
}

export function createPostgresEngineeringModelRepository(
  supabase: SupabaseLike,
): PostgresEngineeringModelRepository {
  return new PostgresEngineeringModelRepository(supabase);
}
