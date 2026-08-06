# Project Intelligence — Knowledge Graph Data Ownership

**Phase:** 8G

## Rule

The knowledge graph stores **relationships and references only**.  
Authoritative business records remain owned by Engineering Core or the emitting
Project Intelligence feature.

| Entity | Owner |
|--------|-------|
| Projects, assets, registers | Engineering Core |
| Document chunks / embeddings | Document Intelligence |
| Meeting sessions / transcripts | Meeting Intelligence |
| Findings lifecycle | Findings Intelligence |
| Executive dashboard metrics | Reporting Intelligence (live aggregation) |
| Knowledge edges / search refs | Knowledge Intelligence (refs only) |

## Forbidden

- Parallel Core register tables
- Duplicate document/meeting/finding payloads as source of truth
- Private AI embedding or model clients outside Platform AI Runtime
