# EOS 3.3 Knowledge Source and Authority Model

`EOS_3_KNOWLEDGE_TIER_MODEL_IMPLEMENTED=YES`

`EOS_3_KNOWLEDGE_SOURCE_REGISTRY_IMPLEMENTED=YES`

`EOS_3_CONTROLLED_DOCUMENT_INGESTION_FOUNDATION=YES`

`EOS_3_DOCUMENT_STATUS_AWARENESS=PASS`

`EOS_3_CHUNK_PROVENANCE=PASS`

`EOS_3_KNOWLEDGE_INVALIDATION_MODEL_IMPLEMENTED=YES`

## Tiers

| Tier | Authority |
| --- | --- |
| 1 Canonical engineering state | AUTHORITATIVE_STRUCTURED_STATE |
| 2 Controlled project documents | CONTROLLED_DOCUMENT |
| 3 Enterprise knowledge | ENTERPRISE_KNOWLEDGE |
| 4 External references | EXTERNAL_REFERENCE |
| 5 Model inference | MODEL_INFERENCE |

## Registry fields

Source ID, tenant, workspace, project scope, source type, authority class, revision/status, owner, provenance, ingestion/index status, access scope, jurisdiction/standards context, effective/superseded state.

Unowned non-model sources cannot be registered for indexing.

## Ingestion stages

`REGISTER → VALIDATE → AUTHORIZE → EXTRACT → CHUNK → INDEX → VERIFY → AVAILABLE`

## Document status

`draft | issued | approved | superseded | withdrawn | unknown`

## Chunk provenance

Source document, revision/version, page/section, project/workspace, authority, ingestion record, current/superseded status. Vectors cannot detach from source.

## Invalidation

Superseded / withdrawn / deleted / access-revoked / reclassified sources clear retrievable embeddings and mark index removed.
