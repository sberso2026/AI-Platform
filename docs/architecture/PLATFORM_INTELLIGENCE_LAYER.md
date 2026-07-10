# Platform Intelligence Layer

## Purpose

Batch 1.75 control plane for governed AI operations on RTB AI Platform. Ten services register tools, capabilities, policies, prompts, models, cost, observability, flags, secrets, and evaluations — consumed by the AI Director and future domain OSes.

## Package

`@rtb/platform-intelligence` via `createPlatformIntelligence(supabase)`.

Attached on the kernel as `kernel.intelligence.*`.

## Ten Services

| # | Service | Class | API | UI |
|---|---------|-------|-----|----|
| 1 | Tool Registry | `ToolRegistryService` | `/api/platform/tools` | `/platform/tools` |
| 2 | Capability Registry | `CapabilityRegistryService` | `/api/platform/capabilities` | `/platform/capabilities` |
| 3 | Policy Engine | `PolicyEngineService` | `/api/platform/policies` | `/platform/policies` |
| 4 | Prompt Registry | `PromptRegistryService` | `/api/platform/prompts` | `/platform/prompts` |
| 5 | Model Registry | `ModelRegistryService` | `/api/platform/models` | `/platform/models` |
| 6 | Cost Engine | `CostEngineService` | `/api/platform/costs` | `/platform/costs` |
| 7 | Observability | `ObservabilityService` | `/api/platform/observability` | `/platform/observability` |
| 8 | Feature Flags | `FeatureFlagService` | `/api/platform/features` | `/platform/features` |
| 9 | Secret Management | `SecretManagementService` | `/api/platform/secrets` | `/platform/secrets` |
| 10 | AI Evaluation | `EvaluationFrameworkService` | `/api/platform/evaluations` | `/platform/evaluations` |

## Key Tables (by area)

Migrations: `supabase/migrations/20260202000000_batch_175_intelligence_tables.sql`

- Tools: `ai_tools`, `ai_tool_versions`, `ai_tool_permissions`, `ai_tool_assignments`, `ai_tool_usage_logs`
- Capabilities: `capabilities`, `capability_versions`, `capability_assignments`, `capability_dependencies`
- Policies: `policies`, `policy_conditions`, `policy_actions`, `policy_evaluations`, `policy_violations`
- Prompts / Models / Cost / Observability / Flags / Secrets / Evals — see individual docs

## Integration Points

- **AI Director** — policy evaluation, prompt versions, model routes, traces on `agent_runs`
- **Plugins / OSes** — capability assignment and feature-gated install
- **Cost + Observability** — record usage from model/tool calls
- **Navigation** — `INTELLIGENCE_NAVIGATION` in `@rtb/platform-core`

## Seed / Feature Gate

Platform feature `platform_intelligence` defaults enabled. Domain OS flags (`engineering_os`, etc.) default off.
