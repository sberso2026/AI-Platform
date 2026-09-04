# EOS-COMMERCE-APP-1 commerce reconciliation

## Catalog

`commercial_product_applications` for Engineering OS now includes:

- `project_intelligence`
- `inspection_intelligence`
- `project_controls`
- `documents` / `meetings` / `knowledge` / `structural_intelligence` (pre-existing)
- `asset_intelligence`
- `digital_twin`
- `engineering_model_interoperability`

Added via idempotent migration `20260904000000_eos_commerce_app_1_engineering_os_applications.sql` and runtime `ProductApplicationRepository.ensureApplications`.

`commercial_plan_entitlements` was not changed. Enterprise plan still does not globally include the three missing applications.

## Pilot entitlement

`POST /api/platform/commerce/licenses/reconcile-pilot`

- `requireCommerceAdmin`
- `requireInstallationAdmin` (`owner` / `admin`)
- `COMMERCE_PILOT_TENANT_ID` match when set
- `LicenseIssuanceService.reconcilePilotProfile` issues tenant-scoped application licences
- then `applicationInstallationLifecycle.requestInstallation` per pilot key
- `installation_conflict` is treated as idempotent skip
- audited as `licence.issued` with `source: "pilot_reconcile"`

## Installation vs entitlement vs access

- ENTITLED: active application licence (or plan entitlement + licence)
- INSTALLED: `commercial_application_installations` in an access-granting status
- ACCESSIBLE: `entitlements.check` allowed (the route-guard result)

These are projected separately in `/api/engineering/modules/access`.

## Display names

Customer-facing product name for slug `engineering-os` is **Engineering OS**.
Internal UUID `c1000000-0000-4000-8000-000000000001` remains diagnostics-only.

## Adapter alignment

`AVAILABLE_ENGINEERING_APP_KEYS` now includes `engineering_model_interoperability`.
