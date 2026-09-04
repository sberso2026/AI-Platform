# EOS-COMMERCE-APP-1 application matrix

Target: RTB controlled Engineering OS Preview / pilot tenant only.

| UI name | applicationKey | Catalog / product | Release | Plan inclusion (Enterprise seed) | Route | Guard |
|---|---|---|---|---|---|---|
| Engineering OS | n/a (product `engineering-os`) | `c1000000-0000-4000-8000-000000000001` | GA / active | product_access | `/engineering` | product licence + installation |
| Project Intelligence | `project_intelligence` | Engineering OS application | V1.0 GA | yes | `/engineering/apps/project-intelligence` | application licence |
| Inspection Intelligence | `inspection_intelligence` | Engineering OS application | V1.0 GA | yes | `/engineering/apps/inspection-intelligence` | application licence |
| Asset Intelligence | `asset_intelligence` | Engineering OS application | V1.0 GA | no (pilot licence) | `/engineering/apps/asset-intelligence` | application licence |
| Project Controls | `project_controls` | Engineering OS application | V1.0 GA | yes | `/engineering/apps/project-controls` | application licence |
| Digital Twin | `digital_twin` | Engineering OS application | V1.0 GA | no (pilot licence) | `/engineering/apps/digital-twin` | application licence |
| Engineering Models | `engineering_model_interoperability` | Engineering OS application | V1.0 GA | no (pilot licence) | `/engineering/apps/model-interoperability` | application licence |

## Eligibility

| Application | Category | Action |
|---|---|---|
| Project Intelligence | 1 — implemented and entitled | Keep; install if missing |
| Inspection Intelligence | 1 — implemented and entitled | Keep; install if missing |
| Project Controls | 1 — implemented and entitled | Keep; install if missing |
| Asset Intelligence | 2 — implemented, not entitled | Pilot licence + install |
| Digital Twin | 2 — implemented, not entitled | Pilot licence + install |
| Engineering Models | 2 — implemented, not entitled | Pilot licence + install |

All six are `PRODUCTION_V1_MODULE_KEYS`. None are registered placeholders.

## Matrix states

| State | Badge | Action |
|---|---|---|
| Installed + accessible | Installed | Open system |
| Entitled / accessible, not installed | Available | Open system if guard allows; otherwise Install |
| Not in plan | Not included | View plan |
| Preview / non-release | Preview | View details |
| Other deny | Unavailable | no Open system |

Open system is never shown when `entitlements.check` would deny.
