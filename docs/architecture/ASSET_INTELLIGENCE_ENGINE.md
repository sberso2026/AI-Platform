# Asset Intelligence Engine (orchestration)

Thin orchestrator for Asset Intelligence — **not** a workflow engine, AI runtime, Knowledge Graph, Digital Twin, or CMMS.

## Pipeline
1. Resolve `AssetIdentityReference` from Shared Domain (read-only)
2. Lookup source in Intelligence Source Registry (fail-closed)
3. Contract-governed ingestion (II public contracts `1.0.0` for condition slice)
4. Persist intelligence state(s)
5. Derive Health Index or abstain
6. Append Historical Intelligence Timeline
7. Compose Asset Snapshot
8. Emit governed events

## Implementation
`packages/asset-intelligence/src/domain/engine.ts` → `AssetIntelligenceEngine`
