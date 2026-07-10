import type { SupabaseClient } from "@rtb/database";

export class CapabilityRegistryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listCapabilities(tenantId: string) {
    const { data, error } = await this.supabase
      .from("capabilities")
      .select("*")
      .or(`tenant_id.eq.${tenantId},and(tenant_id.is.null,is_platform.eq.true)`)
      .order("name");
    if (error) throw new Error(`Failed to list capabilities: ${error.message}`);
    return data ?? [];
  }

  async findByKey(tenantId: string, capabilityKey: string) {
    const { data } = await this.supabase
      .from("capabilities")
      .select("*")
      .eq("capability_key", capabilityKey)
      .or(`tenant_id.eq.${tenantId},and(tenant_id.is.null,is_platform.eq.true)`)
      .eq("status", "enabled")
      .limit(1)
      .single();
    return data;
  }

  async routeByIntent(tenantId: string, intent: string) {
    const capabilities = await this.listCapabilities(tenantId);
    const match = capabilities.find(
      (c) =>
        c.status === "enabled" &&
        (c.capability_key === intent ||
          (c.metadata as Record<string, unknown>)?.intents?.toString().includes(intent))
    );
    if (!match) return null;

    const { data: assignments } = await this.supabase
      .from("capability_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("capability_id", match.id as string)
      .eq("is_active", true);

    return { capability: match, assignments: assignments ?? [] };
  }

  async registerFromPlugin(input: {
    tenantId: string;
    capabilityKey: string;
    name: string;
    description?: string;
    operatingSystem?: string;
    pluginId: string;
  }) {
    const { data: cap, error } = await this.supabase
      .from("capabilities")
      .upsert({
        tenant_id: input.tenantId,
        capability_key: input.capabilityKey,
        name: input.name,
        description: input.description ?? null,
        operating_system: input.operatingSystem ?? null,
        status: "enabled",
        is_platform: false,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to register capability: ${error.message}`);

    await this.supabase.from("capability_assignments").upsert({
      tenant_id: input.tenantId,
      capability_id: cap.id,
      assignee_type: "plugin",
      assignee_id: input.pluginId,
      is_active: true,
    });

    return cap;
  }

  async assignToAgent(tenantId: string, capabilityId: string, agentId: string) {
    const { data, error } = await this.supabase
      .from("capability_assignments")
      .upsert({
        tenant_id: tenantId,
        capability_id: capabilityId,
        assignee_type: "agent",
        assignee_id: agentId,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to assign capability: ${error.message}`);
    return data;
  }

  async setStatus(tenantId: string, capabilityId: string, status: "enabled" | "disabled" | "deprecated") {
    const { data, error } = await this.supabase
      .from("capabilities")
      .update({ status })
      .eq("id", capabilityId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw new Error(`Failed to update capability status: ${error.message}`);
    return data;
  }
}
