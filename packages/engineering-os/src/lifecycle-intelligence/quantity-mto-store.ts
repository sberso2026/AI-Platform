import type { SupabaseClient } from "@rtb/database";
import type { ThreadRelation } from "../digital-thread/types";
import {
  itemFromRow,
  itemInsertRow,
  snapshotHeaderFromRow,
  snapshotInsertRow,
  type PersistedMtoSnapshot,
} from "./quantity-mto-persist";

export interface QuantityMtoStore {
  listSnapshots(workspaceId: string, projectId: string, workPlanId?: string | null): Promise<PersistedMtoSnapshot[]>;
  getSnapshot(id: string): Promise<PersistedMtoSnapshot | null>;
  saveSnapshot(row: PersistedMtoSnapshot): Promise<PersistedMtoSnapshot>;
  updateSnapshotHeader(row: PersistedMtoSnapshot): Promise<PersistedMtoSnapshot>;
  updateItem(snapshotId: string, item: PersistedMtoSnapshot["items"][number]): Promise<void>;
}

export function createMemoryQuantityMtoStore(): QuantityMtoStore {
  const rows = new Map<string, PersistedMtoSnapshot>();
  return {
    async listSnapshots(workspaceId, projectId, workPlanId) {
      return [...rows.values()].filter((row) =>
        row.workspaceId === workspaceId
        && row.projectId === projectId
        && (workPlanId == null || row.workPlanId === workPlanId),
      );
    },
    async getSnapshot(id) {
      return rows.get(id) ?? null;
    },
    async saveSnapshot(row) {
      const existing = rows.get(row.id);
      if (existing && (existing.status === "VERIFIED" || existing.status === "SUPERSEDED") && existing.snapshotFingerprint !== row.snapshotFingerprint) {
        throw new Error("verified_mto_immutable");
      }
      rows.set(row.id, structuredClone(row));
      return structuredClone(row);
    },
    async updateSnapshotHeader(row) {
      const existing = rows.get(row.id);
      if (!existing) throw new Error("not_found");
      if ((existing.status === "VERIFIED" || existing.status === "SUPERSEDED") && existing.snapshotFingerprint !== row.snapshotFingerprint) {
        throw new Error("verified_mto_immutable");
      }
      const next = { ...existing, ...row, items: existing.items.map((item) => {
        const replacement = row.items.find((candidate) => candidate.id === item.id);
        return replacement ?? item;
      }) };
      if (row.items.length) next.items = row.items;
      rows.set(row.id, next);
      return structuredClone(next);
    },
    async updateItem(snapshotId, item) {
      const existing = rows.get(snapshotId);
      if (!existing) throw new Error("not_found");
      if (existing.status === "VERIFIED" || existing.status === "SUPERSEDED") throw new Error("verified_mto_immutable");
      existing.items = existing.items.map((row) => (row.id === item.id || row.itemCode === item.itemCode ? item : row));
      rows.set(snapshotId, existing);
    },
  };
}

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

async function loadItems(client: SupabaseClient, snapshot: ReturnType<typeof snapshotHeaderFromRow>): Promise<PersistedMtoSnapshot> {
  const { data, error } = await db(client)
    .from("engineering_mto_items")
    .select("*")
    .eq("snapshot_id", snapshot.id)
    .order("item_code");
  if (error) throw new Error(error.message);
  const items = ((data ?? []) as Record<string, unknown>[]).map((row) => itemFromRow(row, snapshot));
  return { ...snapshot, items, itemCount: items.length };
}

export class SupabaseQuantityMtoStore implements QuantityMtoStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listSnapshots(workspaceId: string, projectId: string, workPlanId?: string | null) {
    let query = db(this.supabase)
      .from("engineering_mto_snapshots")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (workPlanId) query = query.eq("work_plan_id", workPlanId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const headers = ((data ?? []) as Record<string, unknown>[]).map((row) => snapshotHeaderFromRow(row, []));
    return Promise.all(headers.map((row) => loadItems(this.supabase, row)));
  }

  async getSnapshot(id: string) {
    const { data, error } = await db(this.supabase).from("engineering_mto_snapshots").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return loadItems(this.supabase, snapshotHeaderFromRow(data as Record<string, unknown>, []));
  }

  async saveSnapshot(row: PersistedMtoSnapshot) {
    const { error } = await db(this.supabase).from("engineering_mto_snapshots").insert(snapshotInsertRow(row));
    if (error) throw new Error(error.message);
    if (row.items.length) {
      const { error: itemError } = await db(this.supabase)
        .from("engineering_mto_items")
        .insert(row.items.map((item) => itemInsertRow(row, item)));
      if (itemError) throw new Error(itemError.message);
    }
    await this.insertThread(row);
    return row;
  }

  async updateSnapshotHeader(row: PersistedMtoSnapshot) {
    const { error } = await db(this.supabase)
      .from("engineering_mto_snapshots")
      .update({
        status: row.status,
        verification_state: row.verificationState,
        staleness: row.staleness,
        verified_at: row.verifiedAt,
        verified_by: row.verifiedBy,
        item_count: row.itemCount,
        export_disclaimer: row.exportDisclaimer,
      })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
    return (await this.getSnapshot(row.id)) ?? row;
  }

  async updateItem(snapshotId: string, item: PersistedMtoSnapshot["items"][number]) {
    const { error } = await db(this.supabase)
      .from("engineering_mto_items")
      .update({
        verification_status: item.verificationStatus === "ENGINEER_ACCEPTED" ? "VERIFIED" : item.verificationStatus === "NEEDS_INFORMATION" ? "NEEDS_INFORMATION" : item.verificationStatus === "REJECTED" ? "REJECTED" : "UNVERIFIED",
        verified_at: item.verifiedAt ?? null,
        verified_by: item.verifiedBy ?? null,
        status: item.status,
      })
      .eq("snapshot_id", snapshotId)
      .eq("id", item.id);
    if (error) throw new Error(error.message);
  }

  private async insertThread(row: PersistedMtoSnapshot) {
    if (!row.thread.length) return;
    const payload = row.thread.map((link: ThreadRelation) => ({
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      from_type: link.fromType,
      from_id: link.fromId,
      to_type: link.toType,
      to_id: link.toId,
      relationship: link.relationship,
      relationship_governed: true,
      created_by: row.createdBy,
    }));
    const { error } = await db(this.supabase).from("engineering_object_links").insert(payload);
    if (error) throw new Error(error.message);
  }
}
