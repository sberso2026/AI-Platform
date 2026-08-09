# Engineering Model Interoperability V1.0 — Performance Baseline

Bounded production baselines (fixture / hosted probe scale — **not claimed** as enterprise BIM throughput):

| Operation | Baseline note |
| --- | --- |
| Model registration | Sub-second acceptance for metadata-only create |
| IFC parsing | Bounded STEP extractor on sample fixture |
| Element lookup | Index lookup by elementRefId |
| Mapping lookup | Index lookup by mappingId |
| Result reference lookup | Index lookup by resultRefId |
| ETABS federation lookup | Export-fixture federation path |
| SPACE GASS federation lookup | Export/model federation path |
| Digital Twin binding | Reference bind only (DT package unmodified) |
| Execution host health | Host health probe (host ≠ solver certified) |

## Cost model per operation

Operations are metadata/reference oriented. Model binaries are not stored in Postgres. No batch_90 migration is required for GA metadata.

## Explicit non-claims

No enterprise BIM throughput claims beyond tested workload. No live solver latency claims.
