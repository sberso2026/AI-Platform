# Asset Intelligence V1.0 — Commercial Packaging

- Product: RTB AI Platform → Engineering OS → **Asset Intelligence**
- Commercial name: Asset Intelligence
- Version: **1.0.0** (`asset-intelligence-v1.0.0`)
- Product key: `engineering-os`
- Application key: `asset_intelligence`
- Route: `/engineering/apps/asset-intelligence`

## What is sold

Asset Intelligence is the engineering intelligence layer **about** assets. It
does not own asset identity — that stays in the Engineering OS Shared Asset
Domain — and it does not replace a CMMS.

Included in V1.0:

- Asset condition intelligence derived from Inspection Intelligence 1.0.0
- Asset criticality assessment (consequence dimension, governed review)
- Qualitative reliability intelligence
- Failure intelligence over a governed failure taxonomy
- Engineering time series ingestion and change detection
- Trend and governed degradation analysis
- Lifecycle intelligence (advisory over canonical lifecycle)
- Asset decision context composition
- Advisory risk signals and risk candidates
- Maintenance recommendations (recommendation only)
- Priority context
- Multi-source fusion and reconciliation with provenance
- Predictive **governance**: objective registry, method registry, eligibility,
  fixture-bounded qualification, governed review
- Health composition and evidence confidence
- Append-only intelligence timeline and composed snapshot read view

## Entitlement model

Seat-based within Engineering OS, workspace-scoped.

| Entitlement | Grants |
| --- | --- |
| `asset_intelligence.read` | Read all published intelligence states |
| `asset_intelligence.assess` | Run an assessment (draft state) |
| `asset_intelligence.submit` | Submit an assessment for review |
| `asset_intelligence.review` | Review a submitted assessment |
| `asset_intelligence.approve` | Approve a reviewed assessment |
| `asset_intelligence.publish` | Publish an approved state |
| `asset_intelligence.admin` | Manage module configuration |

Segregation of duties is enforced server-side: the submitter cannot approve.
Entitlement decisions are server-authoritative; the UI never grants access.

## Explicit commercial exclusions

The following are **not sold, not licensed and not delivered** as part of Asset
Intelligence V1.0. They must not appear in a proposal, demo script, datasheet or
statement of work as a V1.0 capability.

| Excluded | Why |
| --- | --- |
| Predictive execution | No predictive method runs in V1.0. Governance only. |
| Probability of Failure (PoF) | Registered objective, permanently not-ready in V1.0. |
| Remaining Useful Life (RUL) | Registered objective, permanently not-ready in V1.0. |
| Machine-learning predictions | ML methods are registered and suspended from execution. |
| Certified predictive accuracy | No method is certified; qualification ≠ certification. |
| Quantitative reliability (MTBF, failure rate) | V1.0 reliability is qualitative. |
| Source trust model | Reserved. Fusion uses explicit reconciliation rules. |
| CMMS work order execution | Asset Intelligence recommends; it does not dispatch work. |
| Automatic canonical Risk mutation | Canonical Engineering Risk is owned by Engineering Core. |
| Digital Twin | Out of scope for V1.0. |
| Asset identity mastering | Owned by the Engineering OS Shared Asset Domain. |

If a customer requires PoF, RUL or executed predictive methods, that is a
post-V1.0 conversation gated on method certification, not a configuration flag.

## Packaging dependencies

- Requires an Engineering OS product entitlement and an active workspace.
- Consumes Inspection Intelligence public contracts 1.0.0. Inspection
  Intelligence is licensed separately; without it the condition surface has no
  inspection-derived evidence and reports reduced evidence confidence rather
  than failing.
- Requires hosted Supabase persistence. In-memory repositories are refused in
  production (`PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false`).

## Support boundary

Advisory outputs (`ga_advisory` in the capability matrix) are decision support.
Engineering authority for any action stays with the accountable engineer. RTB
does not warrant an engineering outcome derived from an advisory output.
