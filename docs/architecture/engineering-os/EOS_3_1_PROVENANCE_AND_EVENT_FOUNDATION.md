# EOS 3.1 Provenance and Event Foundation

`EOS_3_UNIVERSAL_PROVENANCE_FOUNDATION_IMPLEMENTED=YES`

`EOS_3_AI_EVIDENCE_CLASSIFICATION_FOUNDATION=PASS`

`EOS_3_EVENT_ENVELOPE_FOUNDATION_IMPLEMENTED=YES`

`EOS_3_EVENT_AUTHORITY_BOUNDARY=PASS`

`EOS_3_RETRIEVAL_AUTHORITY_FOUNDATION_IMPLEMENTED=YES`

`EOS_3_AI_AUTHORITY_BOUNDARY=PASS`

`EOS_3_CONFIGURABLE_LIFECYCLE_FOUNDATION_IMPLEMENTED=YES` (`IMPLEMENTED_BOUNDED`)

`EOS_3_JURISDICTION_PROFILE_FOUNDATION_IMPLEMENTED=YES`

`EOS_2_DATA_RESIDENCY_STATE_UNCHANGED=YES`

## Provenance fields

Tenant, workspace, project, object, revision, generation/version, source, actor, authority, timestamp, method, tool/model/solver, evidence classification, qualification state.

## Evidence classification

Preserved: `FACT` | `INFERENCE` | `ASSUMPTION` | `RECOMMENDATION` | `RESULT` | `HUMAN_DECISION`.

AI-generated content cannot be stored as authoritative `FACT`.

## Event envelope

Supports event type, tenant, workspace, project, object, revision, actor, authority, timestamp, correlation/causation, provenance/audit link, generation/version.

Events do not bypass authorization or RLS (`eventBypassesAuthorization === false`).

No broad event-driven workflows in this phase.

## Retrieval authority precedence

1. canonical structured engineering state  
2. approved controlled documents  
3. indexed enterprise knowledge  
4. secondary references  
5. model inference  

Embeddings are not authoritative system-of-record data.

## AI authority

AI may not approve engineering, finalize materiality, approve deliverables, release IFC, certify compliance, or authorize Production releases.

## Lifecycle / jurisdiction scaffolding

Lifecycle profile scaffold provides configurable stages without hard-coding global stage names into EOS 2 projects (`IMPLEMENTED_BOUNDED`; full profile binding deferred).

Jurisdiction profile holds region / engineering-standards / privacy-residency / compliance keys without embedding legal conclusions. EOS 2 Production residency configuration unchanged.
