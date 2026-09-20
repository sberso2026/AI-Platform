import {
  failClosed,
  InMemoryReviewProductTelemetry,
  TrustedReviewService,
  defaultReviewFileIngestionPolicy,
  type ProjectIntelligenceDocumentSnapshot,
  type ReviewActor,
  type ReviewDocumentRole,
} from "@rtb/engineering-review";
import {
  bindTrustedReviewAudit,
  createSupabaseEngineeringReviewStore,
  type ReviewSqlClient,
} from "@rtb/engineering-review-persistence";
import { createServiceClient } from "@/lib/supabase/service";
import type { AuthContext } from "@/lib/kernel";

const processTelemetry = new InMemoryReviewProductTelemetry();

export function reviewProductTelemetry() {
  return processTelemetry;
}

function inferRole(documentType?: string): ReviewDocumentRole {
  const value = (documentType ?? "").toLowerCase();
  if (value.includes("spec")) return "specification";
  if (value.includes("draw") || value.includes("p&id") || value.includes("pid")) return "drawing";
  if (value.includes("calc")) return "calculation";
  if (value.includes("basis") || value.includes("dbm")) return "basis";
  return "other";
}

class AuthedReviewProjectDirectory {
  constructor(
    private readonly client: ReviewSqlClient,
    private readonly expected: ReviewActor,
  ) {}

  async listProjects(actor: ReviewActor) {
    this.assertActor(actor);
    const { data, error } = await this.client
      .from("engineering_projects")
      .select("id, project_code, project_name, tenant_id, workspace_id")
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(`Failed to list authorized projects: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: String(row.id),
      code: row.project_code ? String(row.project_code) : undefined,
      name: String(row.project_name ?? "Untitled project"),
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
    }));
  }

  async getProject(actor: ReviewActor, projectId: string) {
    this.assertActor(actor);
    const { data, error } = await this.client
      .from("engineering_projects")
      .select("id, project_code, project_name, tenant_id, workspace_id")
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load project: ${error.message}`);
    if (!data || String(data.tenant_id) !== actor.tenantId) {
      failClosed("project_unauthorized", "Project is not authorized for this actor", { projectId });
    }
    if (String(data.workspace_id) !== actor.workspaceId) {
      failClosed("cross_workspace_rejected", "Project belongs to another workspace", { projectId });
    }
    return {
      id: String(data.id),
      code: data.project_code ? String(data.project_code) : undefined,
      name: String(data.project_name ?? "Untitled project"),
      tenantId: String(data.tenant_id),
      workspaceId: String(data.workspace_id),
    };
  }

  private assertActor(actor: ReviewActor) {
    if (actor.tenantId !== this.expected.tenantId || actor.workspaceId !== this.expected.workspaceId) {
      throw new Error("Review actor does not match authenticated context");
    }
  }
}

class AuthedReviewDocumentDirectory {
  constructor(
    private readonly client: ReviewSqlClient,
    private readonly expected: ReviewActor,
  ) {}

  async listDocuments(actor: ReviewActor, projectId: string): Promise<readonly ProjectIntelligenceDocumentSnapshot[]> {
    if (actor.tenantId !== this.expected.tenantId || actor.workspaceId !== this.expected.workspaceId) {
      return [];
    }
    const { data, error } = await this.client
      .from("engineering_documents")
      .select(
        "id, tenant_id, workspace_id, engineering_project_id, title, document_number, document_type, revision, mime_type, file_path, file_name, source, status",
      )
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .eq("engineering_project_id", projectId)
      .not("status", "in", "(superseded,obsolete)")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(`Failed to list authorized documents: ${error.message}`);
    const rows = data ?? [];
    const ids = rows.map((row) => String(row.id));
    const chunksByDoc = await this.loadChunks(actor, ids);
    return rows.map((row) => {
      const metadata: Record<string, unknown> = {};
      const chunks = chunksByDoc.get(String(row.id)) ?? [];
      const extractedText =
        (typeof metadata.extracted_text === "string" && metadata.extracted_text) ||
        (typeof metadata.review_extracted_text === "string" && metadata.review_extracted_text) ||
        chunks.map((chunk) => chunk.content).join("\n") ||
        undefined;
      const warnings = Array.isArray(metadata.warnings)
        ? metadata.warnings.filter((item): item is string => typeof item === "string")
        : undefined;
      const processingStatus =
        typeof metadata.processing_status === "string"
          ? metadata.processing_status
          : extractedText
            ? "ready"
            : row.file_path
              ? "ready_with_warnings"
              : "registered";
      const source = row.source ? String(row.source) : "";
      const controlledFixture =
        metadata.cert_fixture === true ||
        source === "internal_fixture" ||
        source === "cert_fixture";
      return {
        engineeringDocumentId: String(row.id),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id ?? ""),
        engineeringProjectId: row.engineering_project_id ? String(row.engineering_project_id) : undefined,
        title: row.title ? String(row.title) : undefined,
        documentNumber: row.document_number ? String(row.document_number) : undefined,
        documentType: row.document_type ? String(row.document_type) : undefined,
        revision: String(row.revision ?? "A"),
        mimeType: row.mime_type ? String(row.mime_type) : undefined,
        fileName: row.file_name ? String(row.file_name) : undefined,
        processingStatus,
        warnings: warnings ?? (extractedText ? undefined : ["ocr_recommended"]),
        extractedText,
        chunks,
        role: inferRole(row.document_type ? String(row.document_type) : undefined),
        controlledFixture,
        ingestionSource: controlledFixture ? "internal_fixture" : "unknown",
        fields:
          metadata.fields && typeof metadata.fields === "object" && !Array.isArray(metadata.fields)
            ? Object.fromEntries(
                Object.entries(metadata.fields as Record<string, unknown>).filter(
                  (entry): entry is [string, string] => typeof entry[1] === "string",
                ),
              )
            : undefined,
      };
    });
  }

  private async loadChunks(actor: ReviewActor, documentIds: string[]) {
    const map = new Map<string, { id: string; content: string; sectionPath?: string; pageStart?: number; chunkIndex?: number }[]>();
    if (documentIds.length === 0) return map;
    const { data, error } = await this.client
      .from("project_intelligence_document_chunks")
      .select("id, engineering_document_id, content, section_path, page_start, chunk_index")
      .eq("tenant_id", actor.tenantId)
      .eq("workspace_id", actor.workspaceId)
      .in("engineering_document_id", documentIds)
      .is("deleted_at", null)
      .limit(2000);
    if (error) return map;
    for (const row of data ?? []) {
      const documentId = String(row.engineering_document_id);
      const list = map.get(documentId) ?? [];
      list.push({
        id: String(row.id),
        content: String(row.content ?? ""),
        sectionPath: row.section_path ? String(row.section_path) : undefined,
        pageStart: typeof row.page_start === "number" ? row.page_start : undefined,
        chunkIndex: typeof row.chunk_index === "number" ? row.chunk_index : undefined,
      });
      map.set(documentId, list);
    }
    return map;
  }
}

export function createTrustedReviewRuntime(ctx: AuthContext, actor: ReviewActor) {
  if (!ctx.workspaceId) {
    throw new Error("Workspace is required");
  }
  const userClient = ctx.supabase as unknown as ReviewSqlClient;
  const service = createServiceClient() as unknown as ReviewSqlClient;
  const store = createSupabaseEngineeringReviewStore({
    client: userClient,
    kind: "authenticated",
    audit: bindTrustedReviewAudit(service),
  });
  return new TrustedReviewService({
    store,
    projects: new AuthedReviewProjectDirectory(userClient, actor),
    documents: new AuthedReviewDocumentDirectory(userClient, actor),
    telemetry: processTelemetry,
    fileIngestionPolicy: defaultReviewFileIngestionPolicy(),
  });
}
