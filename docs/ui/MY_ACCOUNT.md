# My Account

## Route

`/my-account`

Implementation: `apps/web/src/app/(platform)/my-account/page.tsx`

## Purpose

End-user view of assigned products, applications, workspace access, and personal usage. Unlike System Administration pages, **My Account** is available to all authenticated tenant users (viewer tier and above).

## API

`GET /api/platform/administration/my-account`

No commerce-admin guard. Builds view from:

- `ctx.commerce.entitlements.check` — Engineering OS and Project Intelligence access
- `ctx.commerce.usage.aggregateByTenant` — current calendar month
- Active workspaces query (`workspaces` table, tenant-scoped)

Assembly: `buildMyAccountView()` in `my-account-administration-service.ts`.

## Sections

### Assigned Operating Systems

Products the user is entitled to access. Engineering OS appears when product entitlement check passes, with seat type and workspace names.

### Assigned applications

Applications with allowed entitlement (e.g. Project Intelligence) include an **Open** link to the application route.

### Personal usage

User-scoped usage metrics for the current month via `mapUsageMetrics()`. Empty when no usage records exist.

### Workspace access

List of active workspaces in the tenant the user can see.

## Access control

| Layer | Rule |
|-------|------|
| Route | `canAccessPlatformRoute` — viewer minimum |
| Sidebar | Not in System Administration; linked from user menu / profile |
| Data | Entitlement-gated — users only see products/apps they can access |

## Test hooks

Cards expose `data-testid="my-account-os"` and `data-testid="my-account-apps"` for E2E verification.

## Related documentation

- [CUSTOMER_ADMINISTRATION_ACCESS.md](../security/CUSTOMER_ADMINISTRATION_ACCESS.md)
