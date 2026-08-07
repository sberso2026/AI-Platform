# Phase 10B.1 — Hosted Persistence

Production adapter: `PostgresAssetIntelligenceRepository`  
Memory adapter: test-only (`productionMemoryRepositoryAllowed = false`)

Tables:
- asset_intelligence_condition_states
- asset_intelligence_snapshots
- asset_intelligence_timeline
- asset_intelligence_source_provenance
- asset_intelligence_idempotency
- asset_intelligence_outbox_events

Migration: `20260807120000_batch_51_asset_intelligence_hosted_persistence.sql`

Canonical asset ownership unchanged (`engineering_assets`). No `asset_intelligence_assets` table.
