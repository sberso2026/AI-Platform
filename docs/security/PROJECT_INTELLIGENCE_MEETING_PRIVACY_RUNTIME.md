# Project Intelligence Meeting Privacy Runtime

Phase: 6C-3B Meeting Intelligence foundation.

## Scope

Runtime privacy boundaries for Project Intelligence Meetings feature
(`application=project-intelligence`, `feature=meetings`).

This document does **not** encode universal legal advice. Jurisdiction, retention,
and consent policy values are tenant-configured metadata.

## Recording notice

Values: `required` | `not_required` | `unknown`

When `recording_notice_required = required`, a meeting **must not** enter
`recording`, `transcribing`, `live`, or `paused` until session consent is resolved.

Resolved consent values: `granted` | `not_applicable`.

Unresolved values (`not_requested`, `pending`, `declined`, `withdrawn`) produce
exact error `meeting_consent_unresolved` (HTTP 403).

## Consent status

Session and participant consent statuses:

- `not_requested`
- `pending`
- `granted`
- `declined`
- `withdrawn`
- `not_applicable`

Participant consent changes emit immutable `consent.updated` events.

## Privacy classification

- `public`
- `internal`
- `confidential`
- `restricted`

Classification changes emit `privacy.updated` events.

## Retention and legal hold

- `retention_policy_id` references tenant retention configuration (deletion runtime deferred).
- `legal_hold = true` blocks destructive participant removal and future deletion paths.
- Archive preserves evidence; archived rows are not purged in 6C-3B.

## Provider scopes (Phase 6C-3B)

| Provider | Status | Join UI | Bot claim | Transcript AI |
|----------|--------|---------|-----------|---------------|
| manual | certified_candidate | N/A (manual controls) | none | deferred |
| microsoft_teams | unavailable | disabled | none | deferred |
| zoom | unavailable | disabled | none | deferred |
| google_meet | unavailable | disabled | none | deferred |

## Service-role usage

Service-role writes are allowed only for audited server operations that:

1. Validate tenant/workspace scope from the authenticated principal
2. Emit meeting events with correlation ID and actor identity
3. Never mutate `tenant_id` / `workspace_id` after insert

Unaudited service-role bypass is prohibited for certification.

## Email privacy

Participant `email` is not returned to unauthorized clients. API responses omit email
unless the caller has an explicit include-email admin path.
