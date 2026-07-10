# Observability

## Purpose

First-party tracing, metrics, errors, and health status for RTB AI Platform intelligence and kernel operations. Complements (does not replace) future OpenTelemetry exporters.

## Service Class

`ObservabilityService` — `@rtb/platform-intelligence`

Key methods: `listTraces`, `startTrace`, span complete, metric/error/health recording.

## Key Tables

| Table | Role |
|-------|------|
| `traces` | Request/operation root span container |
| `trace_spans` | Nested spans |
| `metric_events` | Numeric metrics with dimensions |
| `error_events` | Structured errors (optional `trace_id`) |
| `health_checks` | Point-in-time service health |
| `service_status` | Last heartbeat / operational status |

`agent_runs.trace_id` links director runs to traces.

## API Route

`GET|POST /api/platform/observability`  
→ `kernel.intelligence.observability`

## UI Route

`/platform/observability`

## Integration Points

- **AI Director** — start/complete traces around agent runs
- **Tool / Model registries** — span child operations; log errors
- **Cost Engine** — join costs to traces via metadata / run IDs
- **Policy Engine** — record evaluation outcomes as metrics
- **Kernel Telemetry** — distinct from operational telemetry sensors; this layer is control-plane observability
