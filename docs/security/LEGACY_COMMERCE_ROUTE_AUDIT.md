# Legacy Commerce Route Audit — Phase 4

Audit date: Phase 4 final batch. State-changing legacy commerce routes require `requireCommerceAdmin` or owner-only guards at the API layer.

| Route | Method | Purpose | Guard | Required role |
|-------|--------|---------|-------|---------------|
| `/api/platform/commerce/billing` | GET | Invoices/accounts | Owner only | owner |
| `/api/platform/commerce/subscriptions` | GET/POST | Subscriptions | Commerce admin | admin+ |
| `/api/platform/commerce/subscriptions/[id]/[action]` | POST | Lifecycle | Commerce admin | admin+ |
| `/api/platform/commerce/seats/assign` | POST | Assign seat | Commerce admin | admin+ |
| `/api/platform/commerce/seats/remove` | POST | Remove seat | Commerce admin | admin+ |
| `/api/platform/administration/*` | GET | Phase 4 BFF | Admin / owner | admin+ / owner |
| `/api/platform/workspace-product-assignments` | POST/DELETE | Workspace | Installation admin | admin+ |
| `/api/platform/installations` | POST | Install request | Installation admin | admin+ |

Legacy pages `/system/billing`, `/system/subscriptions` remain hidden from navigation; primary routes are `/system/subscription-billing` and `/system/licenses-seats`.
