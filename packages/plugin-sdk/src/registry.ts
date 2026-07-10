import type { InstalledPlugin } from "@rtb/types";
import type { PluginDefinition } from "./index";

/**
 * In-memory plugin registry.
 * Production deployments will persist installed plugins in the database
 * and load plugin modules dynamically at runtime.
 */
export class PluginRegistry {
  private definitions = new Map<string, PluginDefinition>();
  private installed = new Map<string, InstalledPlugin>();

  register(definition: PluginDefinition): void {
    this.definitions.set(definition.manifest.id, definition);
  }

  unregister(pluginId: string): void {
    this.definitions.delete(pluginId);
  }

  getDefinition(pluginId: string): PluginDefinition | undefined {
    return this.definitions.get(pluginId);
  }

  listDefinitions(): PluginDefinition[] {
    return Array.from(this.definitions.values());
  }

  setInstalled(tenantId: string, plugin: InstalledPlugin): void {
    this.installed.set(`${tenantId}:${plugin.id}`, plugin);
  }

  getInstalled(tenantId: string): InstalledPlugin[] {
    return Array.from(this.installed.entries())
      .filter(([key]) => key.startsWith(`${tenantId}:`))
      .map(([, plugin]) => plugin);
  }

  isInstalled(tenantId: string, pluginId: string): boolean {
    const plugin = this.installed.get(`${tenantId}:${pluginId}`);
    return plugin?.status === "active";
  }
}

export const globalPluginRegistry = new PluginRegistry();
