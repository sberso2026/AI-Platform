# Tool Registry

## Purpose

Catalog of executable AI tools for RTB AI Platform: schema, risk class, permissions, assignments to agents/plugins, usage logs, and health checks.

## Service Class

`ToolRegistryService` — `@rtb/platform-intelligence`

Key methods: `listTools`, `getToolByKey`, `createTool`, assign/permission helpers, usage + health recording.

## Key Tables

| Table | Role |
|-------|------|
| `ai_tools` | Tool definition (`tool_key`, category, risk, schemas, status) |
| `ai_tool_versions` | Immutable version snapshots |
| `ai_tool_permissions` | Principal execute/admin grants |
| `ai_tool_assignments` | Agent or plugin bindings |
| `ai_tool_usage_logs` | Execution audit |
| `ai_tool_health_checks` | Latency / health status |

Risk levels: `low` | `medium` | `high` | `critical`  
Status: `draft` | `active` | `deprecated` | `disabled`

## API Route

`GET|POST /api/platform/tools`  
Auth via `getAuthContext()`; tenant-scoped through `kernel.intelligence.tools`.

## UI Route

`/platform/tools` — Tool Registry admin page.

## Integration Points

- **Policy Engine** — high/critical risk tools trigger `require_approval`
- **Capability Registry** — tools can be capability assignees
- **Cost Engine** — `tool_call` cost events
- **AI Director / agents** — assigned tools available during runs
- **Secrets** — tool-scoped credentials via Secret Management
