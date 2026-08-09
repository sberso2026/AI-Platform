# Engineering OS V1 Packaging

Status: FROZEN · `EngineeringOSCommercialProductReady = true` · Version `1.0.0`

Engineering OS is the purchasable/installable **product container**.
Reuse Platform Commerce only — no duplicate commerce engine.

## Entitlement layers

| Layer | Scope |
| --- | --- |
| Base Engineering OS | Shell, Home, launcher, search shell, AI workspace entry, shared domains access |
| Module entitlements | PI · II · Asset Intelligence · Project Controls · Digital Twin · Interop |
| Premium capabilities | Advisory predictive, vision, advanced controls contributors |
| Tool execution | Engineering Tool Framework invoke families |
| External solver orchestration | Execution-host admin/execute |
| Workspace / user policy | Seat and role scoped |

## Critical distinction

**Commercial solver orchestration entitlement ≠ commercial solver licence.**

| Flag | Value |
| --- | --- |
| `commercialSolverLicenseOwnedByRTBRequired` | `false` |
| `clientRetainsCommercialSolverLicenseOwnership` | `true` |
| `clientLicensedETABSExecutionCertified` | `false` |
| `clientLicensedSPACEGASSExecutionCertified` | `false` |

Do not market live ETABS/SPACE GASS execution as certified.
