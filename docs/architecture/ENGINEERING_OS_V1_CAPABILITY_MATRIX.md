# Engineering OS V1 Capability Matrix

Status: Phase 14A · `EngineeringOSCapabilityMatrixReady = true`

## Classification taxonomy

`production` · `production_bounded` · `experimental` · `reserved` · `unavailable` · `blocked_external_dependency`

## Module / capability classification

| Capability | Classification | Notes |
| --- | --- | --- |
| Project Intelligence | production | V1 GA |
| Inspection Intelligence | production | V1 GA; mobile/offline bounded to II |
| Asset Intelligence (non-predictive core) | production | V1 GA |
| Asset Intelligence predictive governance | production_bounded | advisory; no autonomous approval |
| PoF | unavailable | unless independently certified later |
| RUL | unavailable | unless independently certified later |
| Project Controls | production_bounded | advisory/governed V1 |
| Digital Twin | production_bounded | V1 GA bounded surface |
| Engineering Model Interoperability | production | federation V1 GA |
| IFC federation | production_bounded | bounded schema support |
| SPACE GASS export/result federation | production | V1 |
| SPACE GASS live execution | blocked_external_dependency | licensed env unavailable |
| ETABS export/result federation | production | V1 |
| ETABS live COM/execution | unavailable | not_certified |
| CalculiX linear static | production_bounded | DT/ETF owned |
| Controlled Engineering Execution Host | production_bounded | host ≠ solver cert |
| SAP2000 / SAFE / CSiBridge | reserved | CSI product separation |
| Revit/Navisworks/Tekla native | reserved | |
| Analysis-model generation | reserved / unavailable | not in V1 modules |

## Registry hygiene findings

- Stale OS module registry statuses for PC/DT (`coming_soon` while certified)
- Modules launcher marks II `coming_soon` while certified
- Asset Intelligence missing from some launcher/registry surfaces
- Treat as UI/registry reconciliation gaps (see Gap Register), not capability demotion
