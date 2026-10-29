# Engineering Model Interoperability V1.0 — Capability Matrix

Release tag: `engineering-model-interoperability-v1.0.0`
Baseline Phase 13E: `0d01d970b444f878b63cc655a283279cf0683123` / hosted `31292577801`

## Classification (locked)

| Maturity | Meaning |
| --- | --- |
| `ga` | Production capability |
| `ga_bounded` | Production within certified bounded scope |
| `unavailable` | Not a production function of V1.0 |
| `reserved` | Explicitly reserved for a later track |
| `blocked_external_dependency` | Blocked pending licensed external environment |

## Certified / bounded production

| Capability | Maturity |
| --- | --- |
| IFC model federation | `ga` |
| IFC element/property/material/topology federation | `ga_bounded` |
| SPACE GASS export federation | `ga` |
| SPACE GASS result federation | `ga_bounded` |
| ETABS export federation | `ga` |
| ETABS result federation | `ga_bounded` |
| Mapping / review / change-impact | `ga` |
| Controlled Engineering Execution Host | `ga` |

## Unavailable / blocked / reserved

| Capability | Maturity |
| --- | --- |
| SPACE GASS live API | `blocked_external_dependency` |
| SPACE GASS execution | `blocked_external_dependency` |
| ETABS live COM/API | `unavailable` |
| ETABS execution | `unavailable` |
| SAP2000 / SAFE / CSiBridge | `reserved` |
| Revit / Navisworks / Tekla native | `reserved` |
| Analysis-model generation | `reserved` |
| Source-model mutation | `unavailable` |
| Automatic mapping approval | `unavailable` |

CalculiX remains owned/certified through Digital Twin / Engineering Tool Framework — not claimed as an interoperability V1 solver product.
