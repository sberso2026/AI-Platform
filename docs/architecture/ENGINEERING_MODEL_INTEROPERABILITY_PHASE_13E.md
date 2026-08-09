# Engineering Model Interoperability — Phase 13E (ETABS Export Federation)

Status: **etabs_federation** · Version: **0.4.0-etabs-federation** · Phase: **13E**
Public contracts: **0.4.0-etabs-federation** (prerelease, **not** GA `1.0.0`)

## Summary

Phase 13E adds CSI ETABS **export/fixture federation** and a fail-closed
`ETABSSolverAdapter` to Engineering Model Interoperability, while retaining IFC
and SPACE GASS model federation. Live native COM / hosted / controlled ETABS
execution are **not** certified.

## Honesty flags

| Flag | Value |
| --- | --- |
| `ETABSModelFederationReady` | true |
| `ETABSResultFederationReady` | true |
| `ETABSAdapterImplemented` | true |
| `ETABSSolverAdapterReady` | true |
| `ETABSHostedExecutionCertified` | **false** |
| `ETABSControlledExecutionCertified` | **false** |
| `SAP2000AdapterImplemented` | false |
| `SAFEAdapterImplemented` | false |
| `CSiBridgeAdapterImplemented` | false |
| `IFCFederationReady` | true |
| `SpaceGassFederationReady` | true |
| `SPACEGASSLiveExecutionCertified` | **false** |
| `ControlledEngineeringExecutionHostReady` | true (via dependency) |
| `silentSolverFallbackAllowed` | false |
| `analysisModelGenerationImplemented` | false |
| `releaseEligible` | true |
| `phase13FReady` | true (**flag only** — do not start 13F) |

## Deliverables

- Domain: `packages/engineering-model-interoperability/src/domain/etabs/`
- Fixture: `fixtures/etabs/sample-project.etabs.json`
- CSIInteropCore (internal helper only)
- Migration: `batch_89` additive tables
- HTTP: `/api/engineering/model-interoperability/etabs`
- UI: `data-testid="engineering-model-etabs-ready"`
- Certification: Phase 13E gates + workflow
- Reconciliation: `ENGINEERING_INTEROPERABILITY_ETABS_IMPLEMENTATION_RECONCILIATION.md`

## Pins

- Digital Twin V1: `a94425ed009ca087c2f44c9d3757c0c82bd936b1`
- Phase 13B: `1540f806ada0cf70179c3cfdffe4157f29620778`
- Phase 13C: `a1c73721326927b507bb7c2f456d6188dd00e8b9`
- Phase 13D.1: `0bbe0c7bc686615231167f9d56cad2481c627026`

## Non-goals

- Live native COM / hosted / controlled ETABS execution certification
- SPACE GASS live corrective work
- SAP2000 / SAFE / CSiBridge adapters
- Analysis-model generation
- Phase 13F implementation
- DT package modifications
