# EOS 3.5 Event Model and Causation

`EOS_3_GOVERNED_EVENT_ARCHITECTURE_IMPLEMENTED=YES`

`EOS_3_EVENT_SCHEMA_VERSIONING=PASS` (`1.0.0`)

`EOS_3_EVENT_TAXONOMY_IMPLEMENTED=YES`

`EOS_3_EVENT_AUTHORITY_SEPARATION=PASS`

`EOS_3_EVENT_IDEMPOTENCY=PASS`

`EOS_3_EVENT_ORDERING_CONTROL=PASS`

`EOS_3_EVENT_REPLAY_MODEL_IMPLEMENTED=YES`

`EOS_3_EVENT_REPLAY_SAFETY=PASS`

`EOS_3_EVENT_FAILURE_HANDLING=PASS`

`EOS_3_EVENT_CASCADE_CONTROL=PASS`

`EOS_3_EVENT_CYCLE_DETECTION=PASS`

## Envelope fields

event ID, type, category, tenant, workspace, project, object, revision, actor, authority, timestamp, sequence, correlation ID, causation ID, source, provenance, generation, payload version. `grantsAuthority` is always `false`.

## Categories (owned)

`STATE_CHANGE`, `REVISION_CHANGE`, `INTERFACE_CHANGE`, `REQUIREMENT_CHANGE`, `ASSUMPTION_CHANGE`, `IMPACT_CHANGE`, `DECISION_CHANGE`, `DELIVERABLE_CHANGE`, `BASELINE_CHANGE`, `KNOWLEDGE_CHANGE`, `OPTIMIZATION_RESULT`, `SECURITY_GOVERNANCE`.

## Controls

- **Idempotency:** same `idempotencyKey` → `SUPPRESSED_DUPLICATE`
- **Ordering:** older `sequenceHint` for an object → `REJECTED_OUT_OF_ORDER` (no canonical regression)
- **Cascade:** causation depth capped at 8; excess throws `event_cascade_depth_exceeded`
- **Failure:** retry then `DEAD_LETTER`; no infinite loops
- **Replay:** audit-only; `createdApproval=false`, `bypassedAuthority=false`
- **Ingress:** untrusted client injection denied (`trustedIngress` required)

## Example

`DECISION_RECOMMENDATION_CREATED` / `OPTIMIZATION_COMPLETED` must not transition a Decision to `DECIDED` without authorized human action.
