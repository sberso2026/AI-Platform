import { describe, expect, it } from "vitest";
import { pluginManifestSchema, validatePluginManifest } from "./index";

const manifest = {
  id: "geotech",
  name: "Geotech",
  version: "1.2.3",
  description: "Records geotechnical context",
  author: "RTB",
  entry_point: "./main",
  permissions: [{ resource: "project", action: "read", scope: "workspace" as const }],
  settings_schema: { units: "kPa", optional: null },
};

describe("plugin manifest schema on patched zod", () => {
  it("parses objects, enums, records, defaults, and optional fields", () => {
    const parsed = validatePluginManifest(manifest);
    expect(parsed.permissions).toEqual(manifest.permissions);
    expect(parsed.settings_schema).toEqual({ units: "kPa", optional: null });
    const withDefaults = pluginManifestSchema.parse({ ...manifest, permissions: undefined });
    expect(withDefaults.permissions).toEqual([]);
    expect(pluginManifestSchema.safeParse({ ...manifest, version: "1" }).success).toBe(false);
    expect(pluginManifestSchema.safeParse({ ...manifest, operating_system: "mechanical" }).success).toBe(false);
    expect(pluginManifestSchema.safeParse({ ...manifest, permissions: [{ resource: "project", action: "read", scope: "global" }] }).success).toBe(false);
    expect(pluginManifestSchema.safeParse({ ...manifest, id: "" }).success).toBe(false);
  });
});
