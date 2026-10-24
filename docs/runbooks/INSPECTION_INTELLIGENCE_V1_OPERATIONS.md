# Inspection Intelligence V1 — Production Operations Runbook

**Module version:** `1.0.0`  
**Marker:** `inspection-intelligence-v1-ready`

## Deployment
1. Deploy Engineering OS web + workers with Inspection Intelligence package `1.0.0`.
2. Apply pending Supabase migrations in order; verify schema identity.
3. Confirm Capability/Service/Pack registries and module manifest agree (`detectModuleRegistryDrift`).

## Schema migration
- Forward-only migrations; dual-run for breaking public-contract majors.
- On failure: stop workers, restore DB snapshot, follow rollback runbook.

## Worker / event / evidence failures
- Worker failure: restart worker; replay idempotent queue; inspect dead-letter.
- Event processing failure: check platform event bus lag; replay by event id (no duplicate business records).
- Evidence upload failure: verify Platform Files health; retry with same idempotency key.

## Offline sync
- Backlog: drain via reconciliation; alert when queue depth exceeds SLO warning.
- Reconciliation failure: inspect conflict ledger; do not claim server acceptance for queued-only work.
- Service worker recovery: rehydrate offline store; re-auth; revalidate entitlements server-side.
- Storage outage: fail closed on writes; preserve local queue.

## AI Vision
- Provider outage: fail closed; show provider-unavailable; no unapproved fallback.
- Policy rejection: record denial; keep original immutable.
- Queued offline vision: not inference completion.

## Packs / entitlements
- Pack loading failure: deny incompatible versions; keep prior pin.
- Entitlement outage / licence expiry / workspace or user revocation: server policy at commit time wins; reject stale snapshots.
- Stuck workflow: escalate via incident response; do not auto-close governed records.

## Security
- Corrupted derivative: verify hashes; quarantine derivative; originals remain immutable.
- Secret rotation: rotate provider credentials via platform secret store; never log secrets.

## API / reporting / notifications / providers
See SLO catalog (`domain/slo-catalog.ts`) for thresholds and alerts.
