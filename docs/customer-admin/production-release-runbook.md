# Customer Administration — Production Release Runbook

Use this runbook before promoting Customer Administration / Commerce Lifecycle to production.

## 1. Pre-release checklist

- [ ] Phase 4 certification passed on the release commit
- [ ] `pnpm customer-admin:release-check` passes locally or in CI
- [ ] Working tree clean (or `CUSTOMER_ADMIN_ALLOW_DIRTY=1` only in approved CI)
- [ ] Migrations applied to hosted staging and verified
- [ ] No open P0/P1 defects on lifecycle routes (uninstall, upgrade, rollback, seats, licences)
- [ ] Rollback plan reviewed with on-call owner

## 2. Environment variable checklist

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Hosted project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client-safe anon key only |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side only; never in `NEXT_PUBLIC_*` |
| `CERT_USER_PASSWORD` | Yes | Certification admin user |
| `COMMERCE_AUTH_SECRET` | Yes | Commerce scheduler/auth |
| `COMMERCE_SCHEDULER_SECRET` | Yes | Scheduler endpoints |
| `CUSTOMER_ADMIN_CERTIFICATION_TARGET` | Yes | `hosted_staging` or `hosted_production` |
| `ALLOW_PRODUCTION_CERTIFICATION` | Prod only | Must be `true` for production cert |
| `CUSTOMER_ADMIN_RELEASE_CHECK` | Release check | Set to `1` by release-check script |

**Safety defaults**

- `CUSTOMER_ADMIN_CERTIFICATION_TARGET=hosted_staging`
- `ALLOW_PRODUCTION_CERTIFICATION=false`

Production destructive certification is blocked unless both target is `hosted_production` and `ALLOW_PRODUCTION_CERTIFICATION=true`.

## 3. Migration checklist

- [ ] Review new migrations under `supabase/migrations/`
- [ ] Apply to staging: `pnpm db:migrate` (or approved hosted pipeline)
- [ ] Run hosted schema gate: `pnpm --filter @rtb/customer-administration-certification verify-hosted-schema`
- [ ] Confirm build identity migration checksums in certification artifact
- [ ] Apply to production during approved window
- [ ] Re-run smoke tests post-migrate

## 4. Release command

From repository root:

```bash
pnpm customer-admin:release-check
```

This runs, in order:

1. Environment safety checks
2. Git cleanliness (unless `CUSTOMER_ADMIN_ALLOW_DIRTY=1`)
3. `pnpm typecheck`
4. Customer-admin unit + regression tests
5. Source scan for weakened status allowlists
6. Full `pnpm customer-admin:certify`
7. Certification artifact schema validation

For local development with uncommitted changes:

```bash
CUSTOMER_ADMIN_ALLOW_DIRTY=1 pnpm customer-admin:release-check
```

## 5. Expected artifact paths

| Artifact | Path |
|----------|------|
| Phase 4 certification | `packages/customer-administration-certification/artifacts/generated/customer-administration/phase-4-certification.json` |
| Phase 5 release check | `packages/customer-administration-certification/artifacts/generated/customer-administration/phase-5-release-check.json` |
| Fixture manifest | `packages/customer-administration-certification/artifacts/generated/customer-administration/phase4-cert-fixtures.json` |

Validate artifact fields: `commitSha`, `supabaseProjectRef`, `gateSummary`, `environmentSafety`, zero `serverErrorCaptureCount`.

## 6. Rollback procedure

1. Identify last known-good commit from `phase-4-certification.json` or `phase-5-release-check.json`
2. Revert application deploy to that commit/build
3. If schema migration is backward-compatible, no DB rollback; otherwise run approved down migration
4. Run post-rollback smoke: install list, seat assign, uninstall blocked-deps scenario
5. Record incident with correlation IDs from failed requests

## 7. Uninstall failure handling

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| 422 `active_dependencies_exist` | Dependent apps still active | Remove or uninstall dependents first |
| 409 lifecycle conflict | Wrong installation state | Inspect status via GET installation |
| 500 `internal_error` | Server fault | Check logs with `requestId`; do not retry blindly |
| 200 but still visible | Cache/replication lag | Poll GET until `uninstalled` or 404 |

Happy-path uninstall **must** return exactly **200** with `status: uninstalled`.

## 8. Dependency-blocked uninstall handling

1. Confirm response: **422** with code `active_dependencies_exist`
2. Verify installation state remains **active** (not `uninstall_pending`)
3. List dependent applications via administration UI or API
4. Uninstall or detach dependents
5. Retry uninstall; expect 200

Audit events to inspect: `installation.uninstall.blocked_by_dependencies`, `installation.uninstall.requested`.

## 9. Audit / log inspection

Structured lifecycle events include:

- `tenant_id`, `workspace_id`, `installation_id`
- `actor_id`, `actor_role`
- `operation`, `result`, `error_code`
- `correlation_id` / `request_id`
- `timestamp`

Search commerce event store or server logs by `correlation_id` from API error body:

```json
{
  "error": {
    "code": "active_dependencies_exist",
    "message": "...",
    "requestId": "..."
  }
}
```

Do not log or paste secrets (service role keys, passwords).

## 10. Post-release smoke tests

- [ ] Admin login and installation list loads
- [ ] Seat assign + remove on non-production tenant
- [ ] Upgrade + rollback on test installation
- [ ] Uninstall blocked by dependency returns 422
- [ ] Happy-path uninstall returns 200 and GET returns 404
- [ ] Licence suspend + resume

## 11. Emergency disable steps

1. Disable destructive admin actions at edge/WAF if needed (POST uninstall/upgrade/rollback)
2. Set feature flag or maintenance banner in admin UI (if configured)
3. Revoke certification/production deploy pipeline
4. Communicate status with last good `commitSha` from release artifact
5. Root-cause with correlation IDs before re-enabling

## References

- CI instructions: [ci-release-check.md](./ci-release-check.md)
- Fixture isolation: [fixture-isolation-roadmap.md](./fixture-isolation-roadmap.md)
- Certification package: `packages/customer-administration-certification/`
