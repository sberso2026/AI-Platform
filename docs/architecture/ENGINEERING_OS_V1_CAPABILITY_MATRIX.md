# Engineering OS V1 Capability Matrix

Status: Phase 14E GA · Version `1.0.0` · FROZEN with product

## Classification taxonomy

`production` · `production_bounded` · `experimental` · `reserved` · `unavailable` · `blocked_external_dependency`

## Module / capability classification

| Capability | Classification | Notes |
| --- | --- | --- |
| Project Intelligence | production | V1 GA |
| Inspection Intelligence | production | V1 GA |
| Asset Intelligence (non-predictive certified surface) | production | V1 GA |
| Asset Intelligence predictive governance | production_bounded | advisory |
| Project Controls | production | governed/advisory surface |
| Digital Twin | production | bounded certified surface |
| Engineering Model Interoperability | production | federation surface |
| IFC federation | production_bounded | bounded schema support |
| SPACE GASS export/result federation | production_bounded | V1 |
| SPACE GASS live execution | blocked_external_dependency | licensed env unavailable |
| ETABS export/result federation | production_bounded | V1 |
| ETABS live execution | unavailable / not_certified | not certified |
| CalculiX linear static | production_bounded | RTB-certified open execution |
| Controlled Engineering Execution Host | production_bounded | host ≠ solver cert |
| PoF | unavailable | |
| RUL | unavailable | |
| SHM | unavailable / reserved | |
| Analysis-model generation | unavailable / reserved | |
| SAP2000 / SAFE / CSiBridge | reserved | |
| Revit / Navisworks / Tekla native | reserved | |

## Registry hygiene

Phase 14B closed registry/launcher drift. GA requires
`moduleRegistryTruthful = true` and `moduleRegistryDriftDetected = false`.
