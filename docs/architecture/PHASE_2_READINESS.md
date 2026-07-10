# Phase 2 Readiness Checklist

Phase 1.5 hardening must be complete before Engineering OS development begins.

## Platform Kernel Services

| Service | Package | Status |
|---------|---------|--------|
| AI Director | `@rtb/platform-kernel` | Complete (mock adapter) |
| Event Bus | `@rtb/platform-kernel` | Complete |
| Background Jobs | `@rtb/platform-kernel` | Complete |
| Workflow Engine | `@rtb/platform-kernel` | Complete |
| Knowledge Graph | `@rtb/platform-kernel` | Foundation only |
| AI Memory | `@rtb/platform-kernel` | Complete |
| Digital Twin | `@rtb/platform-kernel` | Foundation only |
| API Gateway | `@rtb/platform-kernel` | Complete |
| Notifications | `@rtb/platform-kernel` | Complete |
| Telemetry | `@rtb/platform-kernel` | Foundation only |
| Plugin Lifecycle | `@rtb/platform-kernel` | Complete |

## Completion Criteria

- [x] Platform builds cleanly (`pnpm build`)
- [x] All kernel tables with RLS migrations
- [x] Tenant-scoped services
- [x] Command Centre → AI Director integration
- [x] Event publish and view
- [x] Background job create and view
- [x] Workflow define and instantiate
- [x] Knowledge graph node/edge creation
- [x] Digital twin registration
- [x] Notification creation from events
- [x] Plugin register, version, install
- [x] Platform admin UI at `/platform/*`
- [x] Kernel tests
- [x] Documentation updated

## Phase 2 First Steps

1. Replace `MockModelAdapter` with OpenAI/Anthropic providers
2. Build Engineering OS as a plugin (`engineering-os`)
3. Add RAG pipeline (document.index job handler)
4. Wire knowledge graph auto-creation from agent runs
5. Add Inngest/BullMQ worker for background job processing

## Not Started (Intentionally)

- Engineering Operating System domain logic
- Full RAG / vector search
- Live telemetry streaming
- 3D digital twin visualization
- Production model provider credentials
