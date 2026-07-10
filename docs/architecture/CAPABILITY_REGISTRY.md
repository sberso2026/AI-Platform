# Capability Registry

## Purpose

Declares what RTB AI Platform and installed Operating Systems can do. Capabilities are platform templates or tenant copies, with versions, assignments, and dependencies.

## Service Class

`CapabilityRegistryService` — `@rtb/platform-intelligence`

Key methods: `listCapabilities`, `findByKey`, create/assign/dependency helpers.

## Key Tables

| Table | Role |
|-------|------|
| `capabilities` | Capability definition (`capability_key`, OS scope, `is_platform`) |
| `capability_versions` | Versioned schemas |
| `capability_assignments` | Bind to agent, plugin, tool, or workflow |
| `capability_dependencies` | Required peer capabilities |

Platform seeds include: `document_search`, `agent_orchestration`, `workflow_automation`, `telemetry_query`, `digital_twin_query`.

## API Route

`GET|POST /api/platform/capabilities`  
→ `kernel.intelligence.capabilities`

## UI Route

`/platform/capabilities`

## Integration Points

- **Plugins / Domain OSes** — install manifests map to capability keys
- **Policy Engine** — `operating_system_scope` conditions
- **Tool Registry** — tools assigned capabilities
- **Feature Flags** — OS modules gated independently of capability catalog
- **Workflow Engine** — workflows as capability assignees
