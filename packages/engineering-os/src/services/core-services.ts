import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type {
  CommerceExecutionContext,
  EngineeringAsset,
  EngineeringAssetCriticality,
  EngineeringDocument,
  EngineeringDocumentStatus,
  EngineeringProject,
  EngineeringProjectPhase,
  EngineeringProjectStatus,
} from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";

export class EngineeringProjectService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {}

  async list(
    commerce: CommerceExecutionContext,
    tenantId: string,
    limit = 50,
    options?: { aggregate?: boolean }
  ): Promise<EngineeringProject[]> {
    assertEngineeringService(commerce, "project.list", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_projects")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`Failed to list projects: ${error.message}`);
    return (data ?? []).map(mapProject);
  }

  async get(
    commerce: CommerceExecutionContext,
    tenantId: string,
    projectId: string,
    options?: { aggregate?: boolean }
  ): Promise<EngineeringProject | null> {
    assertEngineeringService(commerce, "project.get", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_projects")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", projectId)
      .single();
    if (error) return null;
    return mapProject(data);
  }

  async create(commerce: CommerceExecutionContext, input: {
    tenantId: string;
    workspaceId?: string;
    projectCode: string;
    projectName: string;
    clientName?: string;
    siteName?: string;
    location?: string;
    industry?: string;
    projectType?: string;
    projectPhase?: EngineeringProjectPhase;
    status?: EngineeringProjectStatus;
    startDate?: string;
    endDate?: string;
    metadata?: Record<string, unknown>;
    createdBy?: string;
  }): Promise<EngineeringProject> {
    assertEngineeringService(commerce, "project.create", input.tenantId);
    const { data, error } = await this.supabase
      .from("engineering_projects")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        project_code: input.projectCode,
        project_name: input.projectName,
        client_name: input.clientName ?? null,
        site_name: input.siteName ?? null,
        location: input.location ?? null,
        industry: input.industry ?? null,
        project_type: input.projectType ?? null,
        project_phase: input.projectPhase ?? "concept",
        status: input.status ?? "draft",
        start_date: input.startDate ?? null,
        end_date: input.endDate ?? null,
        metadata: (input.metadata ?? {}) as Json,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create project: ${error?.message}`);

    let knowledgeNodeId: string | undefined;
    if (this.kernel) {
      try {
        const node = await this.kernel.knowledgeGraph.createNode({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          nodeType: "engineering_project",
          title: `${input.projectCode} — ${input.projectName}`,
          content: { project_id: data.id, project_code: input.projectCode },
          sourceRef: data.id as string,
          createdBy: input.createdBy,
        });
        knowledgeNodeId = node.id;
        await this.supabase
          .from("engineering_projects")
          .update({ knowledge_node_id: knowledgeNodeId })
          .eq("id", data.id as string);

        await this.kernel.eventBus.publish({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          eventType: "engineering.project.created",
          source: "engineering-os",
          payload: { project_id: data.id, project_code: input.projectCode },
        });

        await this.supabase.from("engineering_audit_links").insert({
          tenant_id: input.tenantId,
          entity_type: "project",
          entity_id: data.id,
          action: "create",
        });
      } catch {
        // Platform integrations are best-effort during core create
      }
    }

    return mapProject({ ...data, knowledge_node_id: knowledgeNodeId ?? data.knowledge_node_id });
  }

  async update(
    commerce: CommerceExecutionContext,
    tenantId: string,
    projectId: string,
    updates: Partial<{
      projectName: string;
      clientName: string;
      siteName: string;
      location: string;
      industry: string;
      projectType: string;
      projectPhase: EngineeringProjectPhase;
      status: EngineeringProjectStatus;
      startDate: string;
      endDate: string;
      metadata: Record<string, unknown>;
    }>
  ): Promise<EngineeringProject> {
    assertEngineeringService(commerce, "project.update", tenantId);
    const payload: Record<string, unknown> = {};
    if (updates.projectName !== undefined) payload.project_name = updates.projectName;
    if (updates.clientName !== undefined) payload.client_name = updates.clientName;
    if (updates.siteName !== undefined) payload.site_name = updates.siteName;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.industry !== undefined) payload.industry = updates.industry;
    if (updates.projectType !== undefined) payload.project_type = updates.projectType;
    if (updates.projectPhase !== undefined) payload.project_phase = updates.projectPhase;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate;
    if (updates.endDate !== undefined) payload.end_date = updates.endDate;
    if (updates.metadata !== undefined) payload.metadata = updates.metadata as Json;

    const { data, error } = await this.supabase
      .from("engineering_projects")
      .update(payload)
      .eq("id", projectId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to update project: ${error?.message}`);
    return mapProject(data);
  }

  async search(
    commerce: CommerceExecutionContext,
    tenantId: string,
    query: string,
    options?: { aggregate?: boolean }
  ) {
    assertEngineeringService(commerce, "project.search", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_projects")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`project_code.ilike.%${query}%,project_name.ilike.%${query}%,client_name.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(`Failed to search projects: ${error.message}`);
    return (data ?? []).map(mapProject);
  }
}

function mapProject(row: Record<string, unknown>): EngineeringProject {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    project_code: row.project_code as string,
    project_name: row.project_name as string,
    client_name: row.client_name as string | undefined,
    site_name: row.site_name as string | undefined,
    location: row.location as string | undefined,
    industry: row.industry as string | undefined,
    project_type: row.project_type as string | undefined,
    project_phase: row.project_phase as EngineeringProjectPhase,
    status: row.status as EngineeringProjectStatus,
    start_date: row.start_date as string | undefined,
    end_date: row.end_date as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    knowledge_node_id: row.knowledge_node_id as string | undefined,
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export class EngineeringAssetService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {}

  async list(
    commerce: CommerceExecutionContext,
    tenantId: string,
    projectId?: string,
    limit = 50,
    options?: { aggregate?: boolean }
  ): Promise<EngineeringAsset[]> {
    assertEngineeringService(commerce, "asset.list", tenantId, options);
    let query = this.supabase
      .from("engineering_assets")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) query = query.eq("engineering_project_id", projectId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list assets: ${error.message}`);
    return (data ?? []).map(mapAsset);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, assetId: string): Promise<EngineeringAsset | null> {
    assertEngineeringService(commerce, "asset.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_assets")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", assetId)
      .single();
    if (error) return null;
    return mapAsset(data);
  }

  async create(commerce: CommerceExecutionContext, input: {
    tenantId: string;
    workspaceId?: string;
    engineeringProjectId?: string;
    assetTag: string;
    assetName: string;
    assetTypeId?: string;
    disciplineId?: string;
    parentAssetId?: string;
    location?: string;
    system?: string;
    subsystem?: string;
    criticality?: EngineeringAssetCriticality;
    status?: string;
    metadata?: Record<string, unknown>;
    createDigitalTwin?: boolean;
    createdBy?: string;
  }): Promise<EngineeringAsset> {
    assertEngineeringService(commerce, "asset.create", input.tenantId);
    const { data, error } = await this.supabase
      .from("engineering_assets")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        engineering_project_id: input.engineeringProjectId ?? null,
        asset_tag: input.assetTag,
        asset_name: input.assetName,
        asset_type_id: input.assetTypeId ?? null,
        discipline_id: input.disciplineId ?? null,
        parent_asset_id: input.parentAssetId ?? null,
        location: input.location ?? null,
        system: input.system ?? null,
        subsystem: input.subsystem ?? null,
        criticality: input.criticality ?? "medium",
        status: input.status ?? "active",
        metadata: (input.metadata ?? {}) as Json,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create asset: ${error?.message}`);

    let knowledgeNodeId: string | undefined;
    let digitalTwinId: string | undefined;

    if (this.kernel) {
      try {
        const node = await this.kernel.knowledgeGraph.createNode({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          nodeType: "engineering_asset",
          title: `${input.assetTag} — ${input.assetName}`,
          content: { asset_id: data.id, asset_tag: input.assetTag, criticality: input.criticality },
          sourceRef: data.id as string,
          createdBy: input.createdBy,
        });
        knowledgeNodeId = node.id;

        if (input.engineeringProjectId) {
          const { data: project } = await this.supabase
            .from("engineering_projects")
            .select("knowledge_node_id")
            .eq("id", input.engineeringProjectId)
            .single();
          if (project?.knowledge_node_id) {
            await this.kernel.knowledgeGraph.createEdge({
              tenantId: input.tenantId,
              fromNodeId: project.knowledge_node_id as string,
              toNodeId: knowledgeNodeId,
              edgeType: "contains",
              createdBy: input.createdBy,
            });
          }
        }

        if (input.createDigitalTwin !== false) {
          const twin = await this.kernel.digitalTwin.register({
            tenantId: input.tenantId,
            workspaceId: input.workspaceId,
            twinType: "asset",
            name: input.assetName,
            externalId: input.assetTag,
            metadata: { engineering_asset_id: data.id },
            knowledgeNodeId,
            createdBy: input.createdBy,
          });
          digitalTwinId = twin.id;
        }

        await this.supabase
          .from("engineering_assets")
          .update({
            knowledge_node_id: knowledgeNodeId ?? null,
            digital_twin_id: digitalTwinId ?? null,
          })
          .eq("id", data.id as string);

        await this.kernel.eventBus.publish({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          eventType: "engineering.asset.created",
          source: "engineering-os",
          payload: {
            asset_id: data.id,
            asset_tag: input.assetTag,
            criticality: input.criticality ?? "medium",
          },
        });

        if ((input.criticality ?? "medium") === "high" || input.criticality === "critical") {
          if (input.createdBy) {
            await this.kernel.notifications.create({
              tenantId: input.tenantId,
              userId: input.createdBy,
              title: "High-risk asset created",
              body: `Asset ${input.assetTag} created with ${input.criticality} criticality`,
              type: "engineering.asset.high_risk",
            }).catch(() => undefined);
          }
        }
      } catch {
        // best-effort
      }
    }

    return mapAsset({
      ...data,
      knowledge_node_id: knowledgeNodeId ?? data.knowledge_node_id,
      digital_twin_id: digitalTwinId ?? data.digital_twin_id,
    });
  }

  async search(
    commerce: CommerceExecutionContext,
    tenantId: string,
    query: string,
    options?: { aggregate?: boolean }
  ) {
    assertEngineeringService(commerce, "asset.search", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_assets")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`asset_tag.ilike.%${query}%,asset_name.ilike.%${query}%,system.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(`Failed to search assets: ${error.message}`);
    return (data ?? []).map(mapAsset);
  }
}

function mapAsset(row: Record<string, unknown>): EngineeringAsset {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    engineering_project_id: row.engineering_project_id as string | undefined,
    asset_tag: row.asset_tag as string,
    asset_name: row.asset_name as string,
    asset_type_id: row.asset_type_id as string | undefined,
    discipline_id: row.discipline_id as string | undefined,
    parent_asset_id: row.parent_asset_id as string | undefined,
    location: row.location as string | undefined,
    system: row.system as string | undefined,
    subsystem: row.subsystem as string | undefined,
    criticality: row.criticality as EngineeringAssetCriticality,
    status: row.status as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    digital_twin_id: row.digital_twin_id as string | undefined,
    knowledge_node_id: row.knowledge_node_id as string | undefined,
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export class EngineeringDocumentService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel
  ) {}

  async list(
    commerce: CommerceExecutionContext,
    tenantId: string,
    projectId?: string,
    limit = 50,
    options?: { aggregate?: boolean }
  ): Promise<EngineeringDocument[]> {
    assertEngineeringService(commerce, "document.list", tenantId, options);
    let query = this.supabase
      .from("engineering_documents")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (projectId) query = query.eq("engineering_project_id", projectId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list documents: ${error.message}`);
    return (data ?? []).map(mapDocument);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, documentId: string): Promise<EngineeringDocument | null> {
    assertEngineeringService(commerce, "document.get", tenantId);
    const { data, error } = await this.supabase
      .from("engineering_documents")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", documentId)
      .single();
    if (error) return null;
    return mapDocument(data);
  }

  async create(commerce: CommerceExecutionContext, input: {
    tenantId: string;
    workspaceId?: string;
    engineeringProjectId?: string;
    assetId?: string;
    documentNumber: string;
    title: string;
    documentType?: string;
    disciplineId?: string;
    revision?: string;
    status?: EngineeringDocumentStatus;
    filePath?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    source?: string;
    uploadedBy?: string;
  }): Promise<EngineeringDocument> {
    assertEngineeringService(commerce, "document.create", input.tenantId);
    const { data, error } = await this.supabase
      .from("engineering_documents")
      .insert({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId ?? null,
        engineering_project_id: input.engineeringProjectId ?? null,
        asset_id: input.assetId ?? null,
        document_number: input.documentNumber,
        title: input.title,
        document_type: input.documentType ?? null,
        discipline_id: input.disciplineId ?? null,
        revision: input.revision ?? "A",
        status: input.status ?? "draft",
        file_path: input.filePath ?? null,
        file_name: input.fileName ?? null,
        file_size: input.fileSize ?? null,
        mime_type: input.mimeType ?? null,
        source: input.source ?? "upload",
        uploaded_by: input.uploadedBy ?? null,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create document: ${error?.message}`);

    await this.supabase.from("engineering_document_versions").insert({
      document_id: data.id,
      revision: input.revision ?? "A",
      file_path: input.filePath ?? null,
      file_name: input.fileName ?? null,
      file_size: input.fileSize ?? null,
      mime_type: input.mimeType ?? null,
      status: input.status ?? "draft",
      uploaded_by: input.uploadedBy ?? null,
    });

    let knowledgeNodeId: string | undefined;
    if (this.kernel) {
      try {
        const node = await this.kernel.knowledgeGraph.createNode({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          nodeType: "engineering_document",
          title: `${input.documentNumber} — ${input.title}`,
          content: {
            document_id: data.id,
            document_number: input.documentNumber,
            revision: input.revision ?? "A",
          },
          sourceRef: data.id as string,
          createdBy: input.uploadedBy,
        });
        knowledgeNodeId = node.id;

        if (input.engineeringProjectId) {
          const { data: project } = await this.supabase
            .from("engineering_projects")
            .select("knowledge_node_id")
            .eq("id", input.engineeringProjectId)
            .single();
          if (project?.knowledge_node_id) {
            await this.kernel.knowledgeGraph.createEdge({
              tenantId: input.tenantId,
              fromNodeId: knowledgeNodeId,
              toNodeId: project.knowledge_node_id as string,
              edgeType: "belongs_to",
              createdBy: input.uploadedBy,
            });
          }
        }

        if (input.assetId) {
          const { data: asset } = await this.supabase
            .from("engineering_assets")
            .select("knowledge_node_id")
            .eq("id", input.assetId)
            .single();
          if (asset?.knowledge_node_id) {
            await this.kernel.knowledgeGraph.createEdge({
              tenantId: input.tenantId,
              fromNodeId: asset.knowledge_node_id as string,
              toNodeId: knowledgeNodeId,
              edgeType: "references",
              createdBy: input.uploadedBy,
            });
          }
        }

        await this.supabase
          .from("engineering_documents")
          .update({ knowledge_node_id: knowledgeNodeId })
          .eq("id", data.id as string);

        await this.kernel.eventBus.publish({
          tenantId: input.tenantId,
          workspaceId: input.workspaceId,
          eventType: "engineering.document.uploaded",
          source: "engineering-os",
          payload: {
            document_id: data.id,
            document_number: input.documentNumber,
            title: input.title,
          },
        });
      } catch {
        // best-effort
      }
    }

    return mapDocument({ ...data, knowledge_node_id: knowledgeNodeId ?? data.knowledge_node_id });
  }

  async search(
    commerce: CommerceExecutionContext,
    tenantId: string,
    query: string,
    options?: { aggregate?: boolean }
  ) {
    assertEngineeringService(commerce, "document.search", tenantId, options);
    const { data, error } = await this.supabase
      .from("engineering_documents")
      .select("*")
      .eq("tenant_id", tenantId)
      .or(`document_number.ilike.%${query}%,title.ilike.%${query}%`)
      .limit(20);
    if (error) throw new Error(`Failed to search documents: ${error.message}`);
    return (data ?? []).map(mapDocument);
  }
}

function mapDocument(row: Record<string, unknown>): EngineeringDocument {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    engineering_project_id: row.engineering_project_id as string | undefined,
    asset_id: row.asset_id as string | undefined,
    document_number: row.document_number as string,
    title: row.title as string,
    document_type: row.document_type as string | undefined,
    discipline_id: row.discipline_id as string | undefined,
    revision: row.revision as string,
    status: row.status as EngineeringDocumentStatus,
    file_path: row.file_path as string | undefined,
    file_name: row.file_name as string | undefined,
    file_size: row.file_size as number | undefined,
    mime_type: row.mime_type as string | undefined,
    source: row.source as string | undefined,
    knowledge_node_id: row.knowledge_node_id as string | undefined,
    uploaded_by: row.uploaded_by as string | undefined,
    uploaded_at: row.uploaded_at as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
