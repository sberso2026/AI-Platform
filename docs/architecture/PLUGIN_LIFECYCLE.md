# Plugin Lifecycle

## Overview

Full plugin lifecycle extending the Phase 1 plugin SDK.

## Tables

- `plugins` — Global plugin registry
- `plugin_versions` — Versioned manifests
- `plugin_installations` — Per-tenant installations
- `plugin_permissions` — Declared permissions per version
- `plugin_dependencies` — Inter-plugin dependencies

## Lifecycle

1. **Register** — `PluginLifecycleService.registerPlugin()` creates plugin + version
2. **Install** — Per-tenant installation with config
3. **Enable/Disable** — `setStatus(tenantId, installationId, status)`
4. **Audit** — `plugin.installed` event published on install

## Rules

- Operating Systems install as plugins
- Plugins declare required permissions (validated at install)
- Versioning supported via `plugin_versions`
- Plugins cannot bypass tenant RLS

## SDK

Continue using `@rtb/plugin-sdk` for manifest validation. `PluginLifecycleService` handles database persistence.
