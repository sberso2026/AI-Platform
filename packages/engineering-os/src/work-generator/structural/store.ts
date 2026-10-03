import type { SupabaseClient } from "@rtb/database";
import type { PersistedStructuralCalculation } from "./types";
import { isVerifiedImmutable } from "./compose";

export interface StructuralCalculationStore {
  list(workspaceId: string, projectId: string, workPlanId?: string | null): Promise<PersistedStructuralCalculation[]>;
  get(id: string): Promise<PersistedStructuralCalculation | null>;
  save(row: PersistedStructuralCalculation): Promise<PersistedStructuralCalculation>;
}

export function createMemoryStructuralStore(): StructuralCalculationStore {
  const rows = new Map<string, PersistedStructuralCalculation>();
  return {
    async list(workspaceId, projectId, workPlanId) {
      return [...rows.values()].filter((row) =>
        row.workspaceId === workspaceId
        && row.projectId === projectId
        && (workPlanId == null || row.workPlanId === workPlanId),
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async save(row) {
      const existing = rows.get(row.id);
      if (existing && isVerifiedImmutable(existing)) {
        const mutated =
          existing.inputFingerprint !== row.inputFingerprint
          || JSON.stringify(existing.result?.results) !== JSON.stringify(row.result?.results)
          || existing.manifest.inputFingerprint !== row.manifest.inputFingerprint;
        if (mutated) throw new Error("verified_calculation_immutable");
      }
      rows.set(row.id, structuredClone(row));
      return structuredClone(row);
    },
  };
}

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function fromRow(row: Record<string, unknown>): PersistedStructuralCalculation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    workPlanId: String(row.work_plan_id ?? ""),
    workKind: row.work_kind as PersistedStructuralCalculation["workKind"],
    revision: String(row.revision),
    status: row.status as PersistedStructuralCalculation["status"],
    reviewStatus: row.review_status as PersistedStructuralCalculation["reviewStatus"],
    inputFingerprint: String(row.input_fingerprint),
    engineId: String(row.engine_id),
    engineVersion: String(row.engine_version),
    manifest: row.manifest as PersistedStructuralCalculation["manifest"],
    result: (row.result as PersistedStructuralCalculation["result"]) ?? null,
    designBasis: row.design_basis as PersistedStructuralCalculation["designBasis"],
    missingCodes: (row.missing_codes as PersistedStructuralCalculation["missingCodes"]) ?? [],
    supersedesId: row.supersedes_id ? String(row.supersedes_id) : null,
    createdAt: String(row.created_at),
    createdBy: row.created_by ? String(row.created_by) : null,
    executedAt: row.executed_at ? String(row.executed_at) : null,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : null,
    thread: (row.thread as PersistedStructuralCalculation["thread"]) ?? [],
  };
}

function toRow(row: PersistedStructuralCalculation): Record<string, unknown> {
  return {
    id: row.id,
    tenant_id: row.tenantId,
    workspace_id: row.workspaceId,
    project_id: row.projectId,
    work_plan_id: row.workPlanId,
    work_kind: row.workKind,
    revision: row.revision,
    status: row.status,
    review_status: row.reviewStatus,
    input_fingerprint: row.inputFingerprint,
    engine_id: row.engineId,
    engine_version: row.engineVersion,
    manifest: row.manifest,
    result: row.result,
    design_basis: row.designBasis,
    missing_codes: row.missingCodes,
    supersedes_id: row.supersedesId,
    created_at: row.createdAt,
    created_by: row.createdBy,
    executed_at: row.executedAt,
    reviewed_at: row.reviewedAt,
    reviewed_by: row.reviewedBy,
    thread: row.thread,
  };
}

export class SupabaseStructuralCalculationStore implements StructuralCalculationStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(workspaceId: string, projectId: string, workPlanId?: string | null) {
    let query = db(this.supabase)
      .from("engineering_structural_calculations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (workPlanId) query = query.eq("work_plan_id", workPlanId);
    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(fromRow);
  }

  async get(id: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_structural_calculations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as Record<string, unknown>) : null;
  }

  async save(row: PersistedStructuralCalculation) {
    const { data, error } = await db(this.supabase)
      .from("engineering_structural_calculations")
      .upsert(toRow(row), { onConflict: "id" })
      .select("*")
      .single();
    if (error) {
      if (/verified_calculation_immutable/i.test(error.message ?? "")) throw new Error("verified_calculation_immutable");
      throw error;
    }
    return fromRow(data as Record<string, unknown>);
  }
}
