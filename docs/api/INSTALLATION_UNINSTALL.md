# Installation Uninstall API

`POST /api/platform/installations/{installationId}/uninstall`

Logical uninstall transitions an active product installation through `uninstall_pending` → `uninstalling` → `uninstalled`, removes workspace product assignments, and preserves commercial subscription and billing records.

## Authorization

- Requires authenticated session
- Requires commerce administrator permission (`owner` or `admin` with commerce admin permissions)
- Installation lifecycle permission: `owner` or `admin` role slug

## Request body

```json
{
  "reason": "optional human-readable reason"
}
```

## Success response — HTTP 200

```json
{
  "data": {
    "id": "uuid",
    "status": "uninstalled",
    "tenant_id": "uuid",
    "product_id": "uuid",
    "subscription_id": "uuid",
    "installed_version": "1.0.0"
  }
}
```

## Error response

```json
{
  "error": "Human-readable message",
  "code": "machine_readable_code"
}
```

| HTTP | Code | Scenario |
|------|------|----------|
| 401 | — | Unauthenticated |
| 403 | `commerce_permission_denied` | Viewer, engineer, or non-commerce admin |
| 404 | `installation_not_found` | Installation ID not found in tenant scope |
| 409 | `invalid_installation_transition` | Installation not in a state that permits uninstall |
| 422 | `active_dependencies_exist` | Active application installations depend on this product |

## Invariants

- Active dependent application installations block uninstall (422)
- Workspace assignments are removed on successful uninstall
- Subscription and licence records are not deleted
- Installation events include `installation.uninstall_requested`, `installation.uninstalling`, and `installation.uninstalled`

## Certification

Scenario-specific tests live in `packages/customer-administration-certification/src/uninstall-http-certification.ts` and Playwright Flow N.
