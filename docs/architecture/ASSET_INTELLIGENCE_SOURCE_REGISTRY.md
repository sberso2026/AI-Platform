# Intelligence Source Registry

Versioned registry of sources Asset Intelligence may consume.

Active (Phase 10B):
- `inspection_intelligence.public_contracts` @ `1.0.0`
- `shared_domain.asset_identity` (read-only)

Reserved future: PI shared contracts, SHM signals, twin state refs, maintenance feedback.

Each entry: sourceKey, contractFamily/version, ownership, trustTier, allowedStateKinds, evidenceDuplicationForbidden, writeBackToSharedDomainIdentityForbidden.

Fail closed on unknown or inactive sources.

Forbidden: II private tables/repos/schemas; Shared Domain identity write-back from AI.

See `packages/asset-intelligence/src/domain/source-registry.ts`.
