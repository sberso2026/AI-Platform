# Model Registry

## Purpose

Provider and model catalog for RTB AI Platform: capabilities, pricing, intent routing, usage logs, and tenant allow/deny policies. Replaces ad-hoc model config for governed routing.

## Service Class

`ModelRegistryService` — `@rtb/platform-intelligence`

Key methods: `listModels`, `listProviders`, route resolution, usage logging, tenant policy checks.

## Key Tables

| Table | Role |
|-------|------|
| `model_providers` | Provider (`mock`, `openai`, `anthropic`, `gemini`, `azure_openai`, `local`) |
| `model_registry` | Model metadata, costs, modality flags, risk class |
| `model_capabilities` | Capability tags per model |
| `model_routes` | Intent → model priority routing |
| `model_usage_logs` | Token/latency usage |
| `tenant_model_policies` | Allow/deny by provider or model |

Default seed: system `mock` provider + `mock-gpt` model.

## API Route

`GET|POST /api/platform/models`  
→ `kernel.intelligence.models`

## UI Route

`/platform/models`

## Integration Points

- **AI Director** — resolve route by intent; prefer registered models over hardcoding
- **Cost Engine** — `model_call` events from `cost_input_per_1k` / `cost_output_per_1k`
- **Policy Engine** — `model_provider_allowed` conditions
- **AI Evaluation** — eval runs bind `model_id`
- **Secrets** — provider API keys stored via Secret Management (never in model config plaintext)
