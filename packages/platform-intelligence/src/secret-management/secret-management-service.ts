import type { SupabaseClient } from "@rtb/database";
import type { SecretAccessInput } from "@rtb/types";
import { createHash, randomBytes } from "crypto";

export class SecretManagementService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listSecrets(tenantId: string) {
    const { data, error } = await this.supabase
      .from("secrets")
      .select("id, tenant_id, secret_key, name, description, scope, scope_id, storage_type, status, rotation_due_at, created_at, updated_at")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw new Error(`Failed to list secrets: ${error.message}`);
    return data ?? [];
  }

  async createSecret(input: {
    tenantId: string;
    secretKey: string;
    name: string;
    value: string;
    scope: string;
    scopeId?: string;
    description?: string;
    createdBy?: string;
    externalRef?: boolean;
  }) {
    const { data: secret, error } = await this.supabase
      .from("secrets")
      .insert({
        tenant_id: input.tenantId,
        secret_key: input.secretKey,
        name: input.name,
        description: input.description ?? null,
        scope: input.scope,
        scope_id: input.scopeId ?? null,
        storage_type: input.externalRef ? "external_ref" : "encrypted",
        created_by: input.createdBy ?? null,
      })
      .select("id, tenant_id, secret_key, name, scope, status, created_at")
      .single();
    if (error) throw new Error(`Failed to create secret: ${error.message}`);

    const encryptedValue = input.externalRef
      ? null
      : this.encryptPlaceholder(input.value);

    await this.supabase.from("secret_versions").insert({
      secret_id: secret.id,
      version: 1,
      encrypted_value: encryptedValue,
      external_ref: input.externalRef ? input.value : null,
      is_active: true,
    });

    return secret;
  }

  async accessSecret(input: SecretAccessInput): Promise<{ success: boolean; ref?: string }> {
    await this.supabase.from("secret_access_logs").insert({
      tenant_id: input.tenantId,
      secret_id: input.secretId,
      accessor_id: input.accessorId ?? null,
      access_type: input.accessType,
      success: true,
    });

    const { data: version } = await this.supabase
      .from("secret_versions")
      .select("external_ref, encrypted_value")
      .eq("secret_id", input.secretId)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (!version) return { success: false };

    // Never return decrypted values — only external refs for service use
    return {
      success: true,
      ref: (version.external_ref as string) ?? `[encrypted:${(version.encrypted_value as string)?.slice(0, 8)}...]`,
    };
  }

  async listAccessLogs(tenantId: string, secretId?: string) {
    let query = this.supabase
      .from("secret_access_logs")
      .select("id, secret_id, accessor_id, access_type, success, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (secretId) query = query.eq("secret_id", secretId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to list access logs: ${error.message}`);
    return data ?? [];
  }

  private encryptPlaceholder(value: string): string {
    const salt = randomBytes(8).toString("hex");
    return createHash("sha256").update(`${salt}:${value}`).digest("hex");
  }
}
