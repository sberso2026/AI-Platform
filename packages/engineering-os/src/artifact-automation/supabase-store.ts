import type { SupabaseClient } from "@rtb/database";
import type { EngineeringArtifactGenerationRun, GeneratedEngineeringArtifact } from "./types";
import type { ArtifactStore } from "./memory-store";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapArtifact(row: Record<string, unknown>): GeneratedEngineeringArtifact {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    generationRunId: String(row.generation_run_id),
    workPlanId: String(row.work_plan_id),
    templateCode: String(row.template_code),
    templateVersion: String(row.template_version),
    artifactType: row.artifact_type as GeneratedEngineeringArtifact["artifactType"],
    outputFormat: row.output_format as GeneratedEngineeringArtifact["outputFormat"],
    fileName: String(row.file_name),
    mimeType: String(row.mime_type),
    sha256: String(row.sha256),
    byteSize: Number(row.byte_size ?? 0),
    status: row.status as GeneratedEngineeringArtifact["status"],
    sheetOrSlideCount: Number(row.sheet_or_slide_count ?? 0),
    provenance: (row.provenance as GeneratedEngineeringArtifact["provenance"]) ?? ({} as never),
    warnings: (row.warnings as string[]) ?? [],
    contentBase64: String(row.content_base64 ?? ""),
    createdAt: String(row.created_at),
    supersededById: (row.superseded_by_id as string | null) ?? null,
    lineageKind: row.lineage_kind === "RETURNED_FROM_ENGINEER" ? "RETURNED_FROM_ENGINEER" : "GENERATED_DRAFT",
    originArtifactId: (row.origin_artifact_id as string | null) ?? null,
    originGenerationRunId: (row.origin_generation_run_id as string | null) ?? null,
    originSha256: (row.origin_sha256 as string | null) ?? null,
    returnedBy: (row.returned_by as string | null) ?? null,
    returnedAt: (row.returned_at as string | null) ?? null,
    malwareScanStatus: String(row.malware_scan_status ?? "NOT_APPLICABLE"),
  };
}

function mapRun(row: Record<string, unknown>): EngineeringArtifactGenerationRun {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    workPlanId: String(row.work_plan_id),
    templateCode: String(row.template_code),
    templateVersion: String(row.template_version),
    artifactType: row.artifact_type as EngineeringArtifactGenerationRun["artifactType"],
    outputFormat: row.output_format as EngineeringArtifactGenerationRun["outputFormat"],
    requestedBy: (row.requested_by as string | null) ?? null,
    generatedAt: String(row.generated_at),
    workPlanInputFingerprint: String(row.work_plan_input_fingerprint),
    artifactId: (row.artifact_id as string | null) ?? null,
    status: row.status as EngineeringArtifactGenerationRun["status"],
    warnings: (row.warnings as string[]) ?? [],
    explanation: (row.explanation as string | null) ?? null,
    metrics: (row.metrics as EngineeringArtifactGenerationRun["metrics"]) ?? {
      sourceRefsConsumed: 0,
      requirementsConsumed: 0,
      durationMs: 0,
      byteSize: 0,
      sheetOrSlideCount: 0,
    },
  };
}

export class SupabaseArtifactStore implements ArtifactStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listArtifacts(workspaceId: string, workPlanId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_generated_artifacts")
      .select("id,tenant_id,workspace_id,project_id,generation_run_id,work_plan_id,template_code,template_version,artifact_type,output_format,file_name,mime_type,sha256,byte_size,status,sheet_or_slide_count,provenance,warnings,created_at,superseded_by_id,lineage_kind,origin_artifact_id,origin_generation_run_id,origin_sha256,returned_by,returned_at,malware_scan_status")
      .eq("workspace_id", workspaceId)
      .eq("work_plan_id", workPlanId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map((row) => mapArtifact({ ...row, content_base64: "" }));
  }

  async getArtifact(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_generated_artifacts").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapArtifact(data as Record<string, unknown>) : null;
  }

  async saveArtifact(row: GeneratedEngineeringArtifact) {
    const { data, error } = await db(this.supabase)
      .from("engineering_generated_artifacts")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        generation_run_id: row.generationRunId,
        work_plan_id: row.workPlanId,
        template_code: row.templateCode,
        template_version: row.templateVersion,
        artifact_type: row.artifactType,
        output_format: row.outputFormat,
        file_name: row.fileName,
        mime_type: row.mimeType,
        sha256: row.sha256,
        byte_size: row.byteSize,
        status: row.status,
        sheet_or_slide_count: row.sheetOrSlideCount,
        provenance: row.provenance,
        warnings: row.warnings,
        content_base64: row.contentBase64,
        created_at: row.createdAt,
        superseded_by_id: row.supersededById,
        lineage_kind: row.lineageKind,
        origin_artifact_id: row.originArtifactId,
        origin_generation_run_id: row.originGenerationRunId,
        origin_sha256: row.originSha256,
        returned_by: row.returnedBy,
        returned_at: row.returnedAt,
        malware_scan_status: row.malwareScanStatus,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapArtifact(data as Record<string, unknown>);
  }

  async listRuns(workspaceId: string, workPlanId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_artifact_generation_runs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("work_plan_id", workPlanId)
      .order("generated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRun);
  }

  async getRun(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_artifact_generation_runs").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRun(data as Record<string, unknown>) : null;
  }

  async saveRun(row: EngineeringArtifactGenerationRun) {
    const { data, error } = await db(this.supabase)
      .from("engineering_artifact_generation_runs")
      .upsert({
        id: row.id,
        tenant_id: row.tenantId,
        workspace_id: row.workspaceId,
        project_id: row.projectId,
        work_plan_id: row.workPlanId,
        template_code: row.templateCode,
        template_version: row.templateVersion,
        artifact_type: row.artifactType,
        output_format: row.outputFormat,
        requested_by: row.requestedBy,
        generated_at: row.generatedAt,
        work_plan_input_fingerprint: row.workPlanInputFingerprint,
        artifact_id: row.artifactId,
        status: row.status,
        warnings: row.warnings,
        explanation: row.explanation,
        metrics: row.metrics,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRun(data as Record<string, unknown>);
  }
}
