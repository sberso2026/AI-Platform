import { createHash, randomBytes } from "crypto";
import type { Json, SupabaseClient } from "@rtb/database";
import type { ApiKey } from "@rtb/types";

export class ApiGatewayService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createApiKey(input: {
    tenantId: string;
    name: string;
    permissions: { resource: string; action: string }[];
    createdBy?: string;
    expiresAt?: string;
  }): Promise<{ apiKey: ApiKey; secret: string }> {
    const secret = `rtb_${randomBytes(32).toString("hex")}`;
    const keyPrefix = secret.slice(0, 12);
    const keyHash = createHash("sha256").update(secret).digest("hex");

    const { data, error } = await this.supabase
      .from("api_keys")
      .insert({
        tenant_id: input.tenantId,
        name: input.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        created_by: input.createdBy ?? null,
        expires_at: input.expiresAt ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create API key: ${error?.message}`);

    for (const perm of input.permissions) {
      await this.supabase.from("api_key_permissions").insert({
        api_key_id: data.id,
        resource: perm.resource,
        action: perm.action,
      });
    }

    return { apiKey: mapApiKey(data), secret };
  }

  async validatePermission(
    keyHash: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const { data: key } = await this.supabase
      .from("api_keys")
      .select("id, is_active, expires_at")
      .eq("key_hash", keyHash)
      .single();

    if (!key || !(key as Record<string, unknown>).is_active) return false;
    const keyRow = key as Record<string, unknown>;
    if (keyRow.expires_at && new Date(keyRow.expires_at as string) < new Date()) return false;

    const { data: perms } = await this.supabase
      .from("api_key_permissions")
      .select("resource, action")
      .eq("api_key_id", keyRow.id as string);

    return (perms ?? []).some(
      (p) => {
        const row = p as Record<string, unknown>;
        return (
          (row.resource === resource && (row.action === action || row.action === "admin"))
        );
      }
    );
  }

  async logUsage(input: {
    tenantId: string;
    apiKeyId?: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    latencyMs?: number;
    ipAddress?: string;
  }): Promise<void> {
    await this.supabase.from("api_usage_logs").insert({
      tenant_id: input.tenantId,
      api_key_id: input.apiKeyId ?? null,
      endpoint: input.endpoint,
      method: input.method,
      status_code: input.statusCode ?? null,
      latency_ms: input.latencyMs ?? null,
      ip_address: input.ipAddress ?? null,
    });
  }

  async listKeys(tenantId: string): Promise<ApiKey[]> {
    const { data, error } = await this.supabase
      .from("api_keys")
      .select("id, tenant_id, name, key_prefix, is_active, expires_at, last_used_at, created_by, created_at, updated_at")
      .eq("tenant_id", tenantId);

    if (error) throw new Error(`Failed to list API keys: ${error.message}`);
    return (data ?? []).map(mapApiKey);
  }
}

function mapApiKey(row: Record<string, unknown>): ApiKey {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    name: row.name as string,
    key_prefix: row.key_prefix as string,
    is_active: row.is_active as boolean,
    expires_at: row.expires_at as string | undefined,
    last_used_at: row.last_used_at as string | undefined,
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
