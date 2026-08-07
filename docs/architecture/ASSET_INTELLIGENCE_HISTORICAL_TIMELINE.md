# Historical Intelligence Timeline

Ordered timeline of intelligence state changes per `assetId`.

Entry fields: entryId, stateId, kind, recordedAt, sourceKey, provenance, governance metadata.

Supports as-of queries used by Asset Snapshot.

No raw evidence blobs or secrets in timeline records.

See `packages/asset-intelligence/src/domain/timeline.ts` and repository `listTimeline`.
