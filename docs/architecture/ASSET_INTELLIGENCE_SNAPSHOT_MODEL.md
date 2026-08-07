# Asset Snapshot Model

`AssetSnapshot` is a **read-composed view**:
- canonical `AssetIdentityReference` (Shared Domain)
- selected intelligence states as-of a point in time
- provenance per contribution

Rules:
- NOT a second asset registry (`isAssetRegistry = false`)
- MUST NOT mutate identity (`mutatesIdentity = false`)
- Used for as-of queries via Historical Intelligence Timeline

See `packages/asset-intelligence/src/domain/snapshot.ts`.
