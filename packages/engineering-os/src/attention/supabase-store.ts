import type { SupabaseClient } from "@rtb/database";
import type { AttentionStore } from "./memory-store";
import type { AttentionAcknowledgement, AttentionPreference } from "./types";

function db(client: SupabaseClient): { from(name: string): any } {
  return client as unknown as { from(name: string): any };
}

function mapAck(row: Record<string, unknown>): AttentionAcknowledgement {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    userId: String(row.user_id),
    fingerprint: String(row.fingerprint),
    acknowledgedAt: String(row.acknowledged_at),
    snoozedUntil: row.snoozed_until == null ? null : String(row.snoozed_until),
  };
}

function mapPref(row: Record<string, unknown>): AttentionPreference {
  return {
    userId: String(row.user_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    fyiDisplay: Boolean(row.fyi_display),
    digestMode: row.digest_mode === "DIGEST" ? "DIGEST" : "IMMEDIATE",
    mutedFyi: Boolean(row.muted_fyi),
    updatedAt: String(row.updated_at),
  };
}

export class SupabaseAttentionStore implements AttentionStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listAcknowledgements(workspaceId: string, userId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_attention_acknowledgements")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Record<string, unknown>[]).map(mapAck);
  }

  async saveAcknowledgement(row: AttentionAcknowledgement) {
    const { error } = await db(this.supabase).from("engineering_attention_acknowledgements").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      user_id: row.userId,
      fingerprint: row.fingerprint,
      acknowledged_at: row.acknowledgedAt,
      snoozed_until: row.snoozedUntil,
    });
    if (error) throw new Error(error.message);
    return row;
  }

  async getPreference(workspaceId: string, userId: string) {
    const { data, error } = await db(this.supabase)
      .from("engineering_attention_preferences")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapPref(data as Record<string, unknown>) : null;
  }

  async savePreference(row: AttentionPreference) {
    const { error } = await db(this.supabase).from("engineering_attention_preferences").upsert({
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      user_id: row.userId,
      fyi_display: row.fyiDisplay,
      digest_mode: row.digestMode,
      muted_fyi: row.mutedFyi,
      updated_at: row.updatedAt,
    }, { onConflict: "tenant_id,workspace_id,user_id" });
    if (error) throw new Error(error.message);
    return row;
  }
}
