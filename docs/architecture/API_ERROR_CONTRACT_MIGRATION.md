# API Error Contract Migration

Canonical envelope for Customer Administration and Commerce lifecycle APIs:

```json
{
  "error": {
    "code": "machine_readable_code",
    "message": "User-safe message",
    "requestId": "correlation-id",
    "details": {}
  }
}
```

Implementation: `apps/web/src/lib/lifecycle-api.ts`

## Deprecation boundary

- **Phase 5 (current):** Lifecycle mutation routes use nested envelope; parsers accept both shapes.
- **Phase 6 target:** All `platform/commerce`, `platform/installations`, and `platform/administration` routes emit nested envelope only.
- **Removal date:** First major platform API version bump after Phase 6 certification (TBD).

## Migrated routes (nested envelope)

### Commerce
- `POST /api/platform/commerce/seats/assign`
- `POST /api/platform/commerce/seats/remove`
- `POST /api/platform/commerce/licenses/[id]/suspend`
- `POST /api/platform/commerce/licenses/[id]/resume`

### Installations (mutations)
- `POST /api/platform/installations/[id]/uninstall`
- `POST /api/platform/installations/[id]/upgrade`
- `POST /api/platform/installations/[id]/rollback`
- `POST /api/platform/installations/[id]/suspend`
- `POST /api/platform/installations/[id]/resume`

## Legacy flat routes (documented — Phase 6 migration)

### Commerce (31 routes)
All remaining `platform/commerce/**` routes except the four migrated above. Common pattern:

```typescript
NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

Shared blocker: `requireCommerceAdmin` in `with-commerce-entitlement.ts` returns flat `{ error: "Commerce permission denied" }`.

### Installations (4 routes)
- `GET/POST /api/platform/installations`
- `GET /api/platform/installations/[id]`
- `GET /api/platform/installations/[id]/events`
- `GET /api/platform/installations/[id]/health`

### Administration (6 routes)
- `platform/administration/growth-credits`
- `platform/administration/licenses-seats`
- `platform/administration/my-account`
- `platform/administration/products/[productSlug]`
- `platform/administration/subscription-billing`
- `platform/administration/installations/[id]/progress`

## Migration priority

1. **High risk (state-changing):** subscriptions, trials, license issue/revoke, bulk seat operations
2. **Medium:** read routes returning 403/404 with flat errors
3. **Low:** analytics, catalog, marketplace read-only endpoints

## Compatibility

Certification parsers (`parseUninstallError`, `parseLifecycleErrorBody`) accept both:

- Nested: `{ error: { code, message, requestId } }`
- Flat: `{ error: string, code: string }`

## Schema tests

Add route contract tests in Phase 6 asserting nested envelope for all lifecycle mutations.

## Security requirements

- No stack traces in responses
- No SQL or internal details
- Always include `requestId` for server-generated errors
- Never log or return secrets
