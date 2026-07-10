import { z } from "zod";
import type {
  InstalledPlugin,
  PluginManifest,
  PluginNavItem,
  PluginRoute,
} from "@rtb/types";

export * from "./registry";

const permissionSchema = z.object({
  resource: z.string(),
  action: z.string(),
  scope: z.enum(["own", "workspace", "tenant", "platform"]).optional(),
});

export const pluginManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+/),
  description: z.string(),
  author: z.string(),
  operating_system: z
    .enum([
      "platform",
      "business",
      "engineering",
      "industrial",
      "fleet",
      "infrastructure",
      "smart-building",
      "smart-city",
      "autonomous",
    ])
    .optional(),
  entry_point: z.string(),
  permissions: z.array(permissionSchema).default([]),
  routes: z
    .array(
      z.object({
        path: z.string(),
        component: z.string(),
        title: z.string(),
        permissions: z.array(permissionSchema).optional(),
      })
    )
    .optional(),
  navigation: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        icon: z.string(),
        path: z.string(),
        group: z.string().optional(),
        order: z.number().optional(),
        permissions: z.array(permissionSchema).optional(),
      })
    )
    .optional(),
  settings_schema: z.record(z.unknown()).optional(),
});

export type ValidatedPluginManifest = z.infer<typeof pluginManifestSchema>;

export function validatePluginManifest(manifest: unknown): PluginManifest {
  return pluginManifestSchema.parse(manifest) as PluginManifest;
}

export interface PluginContext {
  tenantId: string;
  workspaceId: string;
  userId: string;
  config: Record<string, unknown>;
}

export interface PluginDefinition {
  manifest: PluginManifest;
  onInstall?: (ctx: PluginContext) => Promise<void>;
  onUninstall?: (ctx: PluginContext) => Promise<void>;
  onEnable?: (ctx: PluginContext) => Promise<void>;
  onDisable?: (ctx: PluginContext) => Promise<void>;
}

export function createPlugin(definition: PluginDefinition): PluginDefinition {
  validatePluginManifest(definition.manifest);
  return definition;
}

export function getPluginRoutes(plugins: InstalledPlugin[]): PluginRoute[] {
  return plugins
    .filter((p) => p.status === "active")
    .flatMap((p) => p.manifest.routes ?? []);
}

export function getPluginNavigation(plugins: InstalledPlugin[]): PluginNavItem[] {
  return plugins
    .filter((p) => p.status === "active")
    .flatMap((p) => p.manifest.navigation ?? [])
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
