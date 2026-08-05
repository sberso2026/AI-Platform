# Project Intelligence — Meeting Privacy, Consent, and Retention

**Phase:** 6C-3A Discovery Lock  
**Rule:** Do **not** encode one universal legal rule. Controls must be **configurable** by tenant/workspace/jurisdiction policy.

## Purpose

Define required privacy and retention control surfaces for Meeting Intelligence before schema/runtime design in 6C-3B+.

## Frozen gap summary

At `ab1f442` the standalone stack:

- Captures mic/transcript without a first-class recording notice or consent state
- Can create Graph webhook sessions without participant notice UX
- Lacks retention / legal-hold columns on meeting tables
- Speaks a welcome voice that does not disclose recording

These gaps must not be reintroduced as “defaults that cannot be configured.”

## Required configurable controls

| Control | Intent | Design notes |
|---------|--------|--------------|
| **Recording notice** | Inform participants that capture/transcription may occur | Display before `recording`/`live`; store notice version + timestamp |
| **Consent state** | Capture agreement or documented override | Per session and/or per participant; states e.g. `not_required`, `pending`, `granted`, `denied`, `waived_by_policy` |
| **Jurisdiction metadata** | Record which policy pack applies | Tenant/workspace jurisdiction codes; no hard-coded single GDPR/CCPA rule |
| **Participant privacy** | Limit PII exposure | Speaker labels vs identity; redaction hooks; access by role |
| **Transcript retention** | Time-bound storage | Configurable TTL; archive vs hard delete |
| **Deletion** | Right-to-erasure / tenant offboarding | Cascading PI meeting deletes; Core approved records retained |
| **Legal hold** | Suspend deletion | Hold flag blocks purge jobs |
| **Provider scopes** | Least privilege for Teams/Zoom/Meet/Graph | Explicit OAuth scopes; audit when expanded |
| **Encryption** | Protect transcripts at rest/in transit | Platform standards; no plaintext in logs |
| **Audit** | Who accessed/exported transcripts/minutes | Correlation ids; export events |
| **Service-role access** | Worker access only | No browser service-role; audited RPCs |

## Proposed session privacy fields (design — not migrated yet)

Illustrative only for 6C-3B schema design:

- `recording_notice_version`, `recording_notice_acknowledged_at`
- `consent_policy_id`, `consent_state`
- `jurisdiction_codes` (text[]/jsonb)
- `retention_policy_id`, `retain_until`
- `legal_hold` (boolean)
- `privacy_metadata` (jsonb for tenant extensions)

## Participant privacy fields (design)

- `display_name` vs `user_id` linkage
- `consent_state` override
- Speakers may remain labels until verified

## Processing rules

1. Deny transition to `recording` / `live` when policy requires consent and state is not `granted` / `not_required` / approved waiver.
2. Deny export when legal hold or consent denial applies.
3. Purge jobs skip `legal_hold=true`.
4. Provider adapters must not expand scopes silently.

## Logging and secrets

- Never log raw audio blobs or full transcript bodies in application logs by default
- Never log provider tokens
- Correlation ids required on privacy-relevant errors

## Relation to Document Intelligence

Meeting evidence that cites documents inherits Document Intelligence access controls. Citation does not grant broader document download rights than the caller already has.
