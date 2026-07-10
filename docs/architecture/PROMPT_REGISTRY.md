# Prompt Registry

## Purpose

Versioned, approvable prompt library for RTB AI Platform agents. Supports variables, usage logs, and safety-critical review workflows before activation.

## Service Class

`PromptRegistryService` — `@rtb/platform-intelligence`

Key methods: `listPrompts`, `getActiveVersion`, create/version/approve/usage helpers.

## Key Tables

| Table | Role |
|-------|------|
| `prompts` | Prompt header (`prompt_key`, agent type, safety flag) |
| `prompt_versions` | Versioned content + lifecycle status |
| `prompt_variables` | Named variables per version |
| `prompt_usage_logs` | Agent/run usage audit |
| `prompt_approvals` | Reviewer decisions |

Status flow: `draft` → `review` → `approved` → `active` (also `deprecated` / `archived`).

`agent_runs.prompt_version_id` links runs to the prompt version used.

## API Route

`GET|POST /api/platform/prompts`  
→ `kernel.intelligence.prompts`

## UI Route

`/platform/prompts`

## Integration Points

- **AI Director** — resolve active prompt version for agent type
- **AI Evaluation** — eval runs bind `prompt_version_id`
- **Policy Engine** — safety-critical prompts may require review
- **Observability** — prompt usage correlated via agent run / trace
