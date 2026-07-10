# Cost Engine

## Purpose

Records and allocates AI and platform spend on RTB AI Platform across tenants, workspaces, plugins, operating systems, agents, and users. Supports rates, budgets, and threshold alerts.

## Service Class

`CostEngineService` — `@rtb/platform-intelligence`

Key methods: `listEvents`, `recordEvent(CostEventInput)`, budget/alert helpers.

## Key Tables

| Table | Role |
|-------|------|
| `cost_events` | Atomic spend events |
| `cost_allocations` | Split by dimension |
| `cost_rates` | Unit rates by event type |
| `cost_budgets` | Limits by dimension/period |
| `cost_alerts` | Threshold notifications |

**Event types:** `model_call`, `tool_call`, `background_job`, `document_processing`, `embedding_generation`, `telemetry_processing`, `report_generation`.

**Allocation dimensions:** tenant, workspace, project, plugin, operating_system, agent, user.

## API Route

`GET|POST /api/platform/costs`  
→ `kernel.intelligence.costs`

## UI Route

`/platform/costs`  
Gated by feature `cost_dashboard` (default enabled).

## Integration Points

- **Model Registry** — token costs from model rates
- **Tool Registry** — tool_call events
- **Background Jobs / Kernel** — job and document processing costs
- **Feature Flags** — dashboard visibility
- **Observability** — correlate spend with traces / runs
