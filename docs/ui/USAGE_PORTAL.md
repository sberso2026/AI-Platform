# Usage Portal

## Route

`/system/usage`

Implementation: `apps/web/src/app/(platform)/system/usage/page.tsx`

## Purpose

Tenant-scoped consumption versus included allowances for the current billing period. Aggregates come from `UsageService`; presentation metrics are mapped in `@rtb/platform-core`.

## API

`GET /api/platform/commerce/usage`

Returns `CommercialUsageAggregate[]` for the tenant. The page calls `mapUsageMetrics()` to produce `UsageMetricView[]`.

## Summary metrics

| Card | Logic |
|------|-------|
| Metrics tracked | Count of aggregate rows |
| Threshold alerts | Metrics where consumption ≥ 85% of included allowance |
| Billing period | Current month (display label) |

## Usage table

| Column | Field |
|--------|-------|
| Metric | `name` (from known metric labels or aggregate name) |
| Included | `includedAllowance` |
| Consumed | `consumed` |
| Remaining | `remaining` |
| Projected | `projectedPeriodUsage` (simple period projection) |
| Unit | `unit` |

### Known metric keys

Configured allowances in `usage-administration-service.ts`:

- `ai_operations`, `document_pages`, `images_analyzed`, `reports_generated`
- `storage_gb`, `api_calls`, `telemetry_events`, `digital_twin_computations`

Threshold alert fires at 85% of allowance. Overage estimates are available in the mapper but not shown on this page by default.

## Empty state

"No usage recorded for the current billing period." when no aggregates exist — no fabricated usage.

## Access

Admin tier. Commerce admin entitlement enforced on underlying commerce route.

## Related documentation

- [PLATFORM_COMMERCE_ENGINE.md](../architecture/PLATFORM_COMMERCE_ENGINE.md) — Usage module
