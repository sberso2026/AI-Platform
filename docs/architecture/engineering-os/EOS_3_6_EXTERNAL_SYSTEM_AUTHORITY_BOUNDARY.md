# EOS 3.6 External System Authority Boundary

`EOS_3_IMPORT_PROVENANCE=PASS`

`EOS_3_EXPORT_PROVENANCE=PASS`

`EOS_3_IMPORT_IDEMPOTENCY=PASS`

`EOS_3_EXTERNAL_SOURCE_OWNERSHIP=PASS`

`EOS_3_EXTERNAL_REVISION_MAPPING=PASS`

`EOS_3_INTEGRATION_CONFLICT_VISIBILITY=PASS`

`EOS_3_DMS_BOUNDARY_PRESERVED=YES`

`EOS_3_EXTERNAL_SYSTEM_OF_RECORD_CLASSIFICATION=PASS`

`EOS_3_CONNECTOR_EVENT_INTEGRATION=PASS`

`EOS_3_CONNECTOR_WORKFLOW_INTEGRATION=PASS`

`EOS_3_CONNECTOR_KNOWLEDGE_INTEGRATION=PASS`

`EOS_3_UNAUTHORIZED_IMPORT_NOT_INDEXED=PASS`

## Rules

- External source remains external (`eosOwnsSource=false`)
- Export does not imply external acceptance
- Conflicts surface visibly; no silent canonical overwrite
- EOS is not a full enterprise DMS; external DMS may remain document system of record
- External revision → governed event → review work item (not automatic engineering acceptance)
- Retrieval indexing only when import is authorized for index
