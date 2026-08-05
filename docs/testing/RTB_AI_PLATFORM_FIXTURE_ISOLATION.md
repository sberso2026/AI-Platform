# RTB AI Platform — Fixture Isolation

**Phase:** 7B  
**Package:** `@rtb/platform-certification`

## Rules

- Every hosted certification run uses a unique `runId` (`GITHUB_RUN_ID` preferred, else `PLATFORM_CERT_RUN_ID`).
- Tenant slug prefix: `cert-platform-7b-{runId}`.
- Workspace slugs: `alpha-{runId}`, `beta-{runId}`.
- Users: `cert-7b-{role}-{runId}@rtb-cert.test` for owner, admin, eng_admin, engineer, viewer, unentitled.
- Provisioning is idempotent for the same run slug (delete prior same-slug tenant + auth users, then recreate).
- Cleanup runs on pass and fail (`finally` in `scripts/run-certification.ts`).
- Concurrent GitHub runs cannot mutate the same fixture — runId uniqueness enforces isolation.
- Do not run local destructive certification against hosted staging while a CI run is active for the same project without a distinct `PLATFORM_CERT_RUN_ID`.

## Fixture contents

- One certification tenant
- Two workspaces
- Engineering OS installation (independent licence, seats, workspace assignments)
- Certification-only `reference-os` installation (independent licence, seats, workspace assignments)
- No shared static fixture identities

## Cleanup scope

Removes: users, memberships, seats, licences, installations, reference-os commerce rows for the tenant, temporary workspaces, certification tenant.

Bounded orphan sweep deletes stale `cert-platform-7b-*` tenants (limit 20) and reports them in `artifacts/cleanup-report.json`.
