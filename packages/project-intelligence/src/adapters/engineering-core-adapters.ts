export interface ProjectContext { tenantId: string; workspaceId?: string; engineeringProjectId: string }
export interface EngineeringProject { id: string; code: string; name: string; status: string }
export interface EngineeringAsset { id: string; tag: string; name: string }
export interface EngineeringDocument {
  id: string;
  number: string;
  title: string;
  revision: string;
  documentType?: string;
  status?: string;
  mimeType?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
}
export interface EngineeringRegisterItem { id: string; type: string; title: string; status: string }
export interface TimelineEntry { id: string; occurredAt: string; type: string; summary: string }
export interface ActivityEntry { id: string; occurredAt: string; actorId?: string; action: string }
export interface SearchResult { id: string; kind: string; title: string; score?: number }
export interface CoreHealth { status: "healthy" | "warning" | "degraded" | "failed"; checkedAt: string }

export interface ProjectIntelligenceProjectAdapter { getProject(context: ProjectContext): Promise<EngineeringProject | null> }
export interface AssetAdapter { listAssets(context: ProjectContext): Promise<readonly EngineeringAsset[]> }
export interface DocumentAdapter {
  listDocuments(context: ProjectContext): Promise<readonly EngineeringDocument[]>;
  getDocument(context: ProjectContext, documentId: string): Promise<EngineeringDocument | null>;
}
export interface RegisterAdapter { listRegister(context: ProjectContext, register: string): Promise<readonly EngineeringRegisterItem[]> }
export interface TimelineAdapter { listTimeline(context: ProjectContext): Promise<readonly TimelineEntry[]> }
export interface ActivityAdapter { listActivity(context: ProjectContext): Promise<readonly ActivityEntry[]> }
export interface SearchAdapter { search(context: ProjectContext, query: string): Promise<readonly SearchResult[]> }
export interface HealthAdapter { getHealth(context: ProjectContext): Promise<CoreHealth> }

export type EngineeringDocumentRow = {
  id: string;
  document_number: string;
  title: string;
  revision: string;
  document_type?: string | null;
  status?: string | null;
  mime_type?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  tenant_id?: string;
  workspace_id?: string | null;
  engineering_project_id?: string | null;
};

/** Injected supabase-like client for Engineering Core document reads. */
export interface EngineeringDocumentsClient {
  from(table: "engineering_documents"): {
    select(columns: string): EngineeringDocumentsQuery;
  };
}

export interface EngineeringDocumentsQuery {
  eq(column: string, value: string): EngineeringDocumentsQuery;
  then?: never;
  // Thenable-compatible terminal methods used by adapters
  execute?(): Promise<{ data: EngineeringDocumentRow[] | null; error: { message: string } | null }>;
  maybeSingle(): Promise<{ data: EngineeringDocumentRow | null; error: { message: string } | null }>;
}

function mapDocumentRow(row: EngineeringDocumentRow): EngineeringDocument {
  return {
    id: row.id,
    number: row.document_number,
    title: row.title,
    revision: row.revision,
    documentType: row.document_type ?? undefined,
    status: row.status ?? undefined,
    mimeType: row.mime_type ?? undefined,
    fileName: row.file_name ?? undefined,
    filePath: row.file_path ?? undefined,
    fileSize: row.file_size ?? undefined,
  };
}

const DOCUMENT_COLUMNS =
  "id, document_number, title, revision, document_type, status, mime_type, file_name, file_path, file_size, tenant_id, workspace_id, engineering_project_id";

/**
 * Real DocumentAdapter backed by an injected supabase-like client.
 * Callers supply a thin query builder that resolves list/get against engineering_documents.
 */
export class SupabaseEngineeringDocumentAdapter implements DocumentAdapter {
  constructor(
    private readonly client: {
      list(context: ProjectContext): Promise<{ data: EngineeringDocumentRow[] | null; error: { message: string } | null }>;
      get(context: ProjectContext, documentId: string): Promise<{ data: EngineeringDocumentRow | null; error: { message: string } | null }>;
    },
  ) {}

  static fromSupabaseLike(client: EngineeringDocumentsClient): SupabaseEngineeringDocumentAdapter {
    return new SupabaseEngineeringDocumentAdapter({
      async list(context) {
        // supabase-js query builders are thenable; support both thenable and explicit execute()
        const builder = client
          .from("engineering_documents")
          .select(DOCUMENT_COLUMNS)
          .eq("tenant_id", context.tenantId)
          .eq("engineering_project_id", context.engineeringProjectId);
        if (typeof (builder as { then?: unknown }).then === "function") {
          return await (builder as unknown as Promise<{ data: EngineeringDocumentRow[] | null; error: { message: string } | null }>);
        }
        if (builder.execute) return builder.execute();
        return { data: [], error: { message: "Engineering documents client query is not executable" } };
      },
      async get(context, documentId) {
        const builder = client
          .from("engineering_documents")
          .select(DOCUMENT_COLUMNS)
          .eq("id", documentId);
        return builder.maybeSingle();
      },
    });
  }

  async listDocuments(context: ProjectContext): Promise<readonly EngineeringDocument[]> {
    const { data, error } = await this.client.list(context);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    return rows
      .filter((row) => {
        if (context.workspaceId && row.workspace_id != null && row.workspace_id !== context.workspaceId) return false;
        return true;
      })
      .map(mapDocumentRow);
  }

  async getDocument(context: ProjectContext, documentId: string): Promise<EngineeringDocument | null> {
    const { data, error } = await this.client.get(context, documentId);
    if (error) throw new Error(error.message);
    if (!data) return null;
    if (data.tenant_id && data.tenant_id !== context.tenantId) return null;
    if (data.engineering_project_id && data.engineering_project_id !== context.engineeringProjectId) return null;
    if (context.workspaceId && data.workspace_id != null && data.workspace_id !== context.workspaceId) return null;
    return mapDocumentRow(data);
  }
}

export class UnconfiguredEngineeringCoreAdapters implements ProjectIntelligenceProjectAdapter, AssetAdapter, DocumentAdapter, RegisterAdapter, TimelineAdapter, ActivityAdapter, SearchAdapter, HealthAdapter {
  private unavailable<T>(name: string): Promise<T> { return Promise.reject(new Error(`${name} is not configured`)); }
  getProject(context: ProjectContext): Promise<EngineeringProject | null> { return this.unavailable(`Project adapter for ${context.engineeringProjectId}`); }
  listAssets(context: ProjectContext): Promise<readonly EngineeringAsset[]> { return this.unavailable(`Asset adapter for ${context.engineeringProjectId}`); }
  listDocuments(context: ProjectContext): Promise<readonly EngineeringDocument[]> { return this.unavailable(`Document adapter for ${context.engineeringProjectId}`); }
  getDocument(context: ProjectContext, documentId: string): Promise<EngineeringDocument | null> {
    return this.unavailable(`Document adapter get ${documentId} for ${context.engineeringProjectId}`);
  }
  listRegister(context: ProjectContext, register: string): Promise<readonly EngineeringRegisterItem[]> { return this.unavailable(`Register adapter ${register} for ${context.engineeringProjectId}`); }
  listTimeline(context: ProjectContext): Promise<readonly TimelineEntry[]> { return this.unavailable(`Timeline adapter for ${context.engineeringProjectId}`); }
  listActivity(context: ProjectContext): Promise<readonly ActivityEntry[]> { return this.unavailable(`Activity adapter for ${context.engineeringProjectId}`); }
  search(context: ProjectContext, query: string): Promise<readonly SearchResult[]> { return this.unavailable(`Search adapter ${query} for ${context.engineeringProjectId}`); }
  getHealth(context: ProjectContext): Promise<CoreHealth> { return this.unavailable(`Health adapter for ${context.engineeringProjectId}`); }
}

export function createDocumentAdapter(client?: EngineeringDocumentsClient): DocumentAdapter {
  return client
    ? SupabaseEngineeringDocumentAdapter.fromSupabaseLike(client)
    : new UnconfiguredEngineeringCoreAdapters();
}
