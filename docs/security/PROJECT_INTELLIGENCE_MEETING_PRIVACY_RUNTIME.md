# Project Intelligence Meeting Privacy Runtime

Phase: 6C-3B Meeting Intelligence foundation → **Phase 8D production closure**.

## Scope

Runtime privacy boundaries for Project Intelligence Meeting Intelligence feature
(`module=project_intelligence`, `feature=meeting_intelligence`).

This document does **not** encode universal legal advice. Jurisdiction, retention,
and consent policy values are tenant-configured metadata.

## Phase 8D readiness notes

- AI cannot override consent.
- Deletion blocked by active legal hold (policy metadata).
- Provider credentials never exposed to clients.
- Retention/deletion automation beyond foundation controls remains explicitly
  deferred where not implemented — no false production claims.
- Teams live connector remains `conditionally_deferred` and is not required for
  Meeting Intelligence production readiness.

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
