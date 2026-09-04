# EOS-COMMERCE-APP-1 root cause

`APPLICATION_ACCESS_DENIAL_ROOT_CAUSE=` Canonical Engineering OS catalog/plan never registered `asset_intelligence`, `digital_twin`, or `engineering_model_interoperability` as product applications. `EntitlementService.evaluateApplication` finds no application licence and no `commercial_plan_entitlements.application_access` row, so it denies `application_not_in_plan`. Engineering Systems ignored Commerce and hard-coded Available + Open system.

## Denial path

1. Application layouts use `ApplicationEntitlementLayout` + `ENGINEERING_PAGE_POLICIES`.
2. `assertCommercePolicyForPage` calls `ctx.commerce.entitlements.check`.
3. `EntitlementService.evaluateApplication` (`packages/platform-commerce/src/services/entitlement-service.ts`):
   - no `license_type=application` licence
   - plan entitlements lack `application_access` for the key
   - returns `DENY_APPLICATION_NOT_IN_PLAN`
4. Redirect `/access-denied?reason=application_not_in_plan`
5. Copy: “This application is not included in your current plan.”

Project Intelligence, Inspection Intelligence, and Project Controls already had catalog rows, plan entitlements, and Batch 31 application licences, so their route guards allowed access.

## What this ticket changed

- Catalog identity for the three GA applications (migration + `ensureApplications`). No Enterprise plan entitlement mutation.
- Tenant-scoped pilot licence reconcile through `LicenseIssuanceService.reconcilePilotProfile`.
- Canonical application installation after licence issue.
- Engineering Systems matrix driven by Commerce access, not a hardcoded Available/Open pair.
- Subscriptions UI uses Engineering OS / plan names instead of `product_id.slice(0, 8)`.
