import type { Json, SupabaseClient } from "@rtb/database";
import type { PluginInstallation, PluginRecord } from "@rtb/types";
import type { EventBusService } from "../event-bus";

export class PluginLifecycleService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly eventBus?: EventBusService
  ) {}

  async registerPlugin(input: {
    pluginId: string;
    name: string;
    description?: string;
    author: string;
    operatingSystem?: string;
    version: string;
    manifest: Record<string, unknown>;
    permissions?: { resource: string; action: string; description?: string }[];
  }): Promise<PluginRecord> {
    let pluginDbId: string;

    const { data: existing } = await this.supabase
      .from("plugins")
      .select("id")
      .eq("plugin_id", input.pluginId)
      .single();

    if (existing) {
      pluginDbId = (existing as Record<string, unknown>).id as string;
    } else {
      const { data: plugin, error } = await this.supabase
        .from("plugins")
        .insert({
          plugin_id: input.pluginId,
          name: input.name,
          description: input.description ?? null,
          author: input.author,
          operating_system: input.operatingSystem ?? null,
        })
        .select()
        .single();

      if (error || !plugin) throw new Error(`Failed to register plugin: ${error?.message}`);
      pluginDbId = (plugin as Record<string, unknown>).id as string;
    }

    const { data: version, error: verError } = await this.supabase
      .from("plugin_versions")
      .insert({
        plugin_id: pluginDbId,
        version: input.version,
        manifest: input.manifest as Json,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (verError) throw new Error(`Failed to create plugin version: ${verError.message}`);

    for (const perm of input.permissions ?? []) {
      await this.supabase.from("plugin_permissions").insert({
        plugin_version_id: (version as Record<string, unknown>).id as string,
        resource: perm.resource,
        action: perm.action,
        description: perm.description ?? null,
      });
    }

    const { data: plugin } = await this.supabase
      .from("plugins")
      .select("*")
      .eq("id", pluginDbId)
      .single();

    return mapPlugin(plugin!);
  }

  async install(input: {
    tenantId: string;
    pluginId: string;
    version: string;
    config?: Record<string, unknown>;
    installedBy?: string;
  }): Promise<PluginInstallation> {
    const { data: plugin } = await this.supabase
      .from("plugins")
      .select("id")
      .eq("plugin_id", input.pluginId)
      .single();

    if (!plugin) throw new Error(`Plugin not found: ${input.pluginId}`);

    const pluginRow = plugin as Record<string, unknown>;

    const { data: version } = await this.supabase
      .from("plugin_versions")
      .select("id")
      .eq("plugin_id", pluginRow.id as string)
      .eq("version", input.version)
      .single();

    if (!version) throw new Error(`Plugin version not found: ${input.version}`);

    const { data: installation, error } = await this.supabase
      .from("plugin_installations")
      .upsert({
        tenant_id: input.tenantId,
        plugin_id: pluginRow.id as string,
        plugin_version_id: (version as Record<string, unknown>).id as string,
        status: "enabled",
        config: (input.config ?? {}) as Json,
        installed_by: input.installedBy ?? null,
      }, { onConflict: "tenant_id,plugin_id" })
      .select()
      .single();

    if (error || !installation) throw new Error(`Failed to install plugin: ${error?.message}`);

    await this.eventBus?.publish({
      tenantId: input.tenantId,
      eventType: "plugin.installed",
      source: "plugin-lifecycle",
      payload: { plugin_id: input.pluginId, version: input.version },
    });

    return mapInstallation(installation);
  }

  async setStatus(tenantId: string, installationId: string, status: PluginInstallation["status"]) {
    await this.supabase
      .from("plugin_installations")
      .update({ status })
      .eq("id", installationId)
      .eq("tenant_id", tenantId);
  }

  async listPlugins(): Promise<PluginRecord[]> {
    const { data, error } = await this.supabase.from("plugins").select("*");
    if (error) throw new Error(`Failed to list plugins: ${error.message}`);
    return (data ?? []).map(mapPlugin);
  }

  async listInstallations(tenantId: string): Promise<PluginInstallation[]> {
    const { data, error } = await this.supabase
      .from("plugin_installations")
      .select("*")
      .eq("tenant_id", tenantId);

    if (error) throw new Error(`Failed to list installations: ${error.message}`);
    return (data ?? []).map(mapInstallation);
  }
}

function mapPlugin(row: Record<string, unknown>): PluginRecord {
  return {
    id: row.id as string,
    plugin_id: row.plugin_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    author: row.author as string,
    operating_system: row.operating_system as string | undefined,
    is_official: row.is_official as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapInstallation(row: Record<string, unknown>): PluginInstallation {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    plugin_id: row.plugin_id as string,
    plugin_version_id: row.plugin_version_id as string,
    status: row.status as PluginInstallation["status"],
    config: (row.config as Record<string, unknown>) ?? {},
    installed_by: row.installed_by as string | undefined,
    installed_at: row.installed_at as string,
    updated_at: row.updated_at as string,
  };
}
