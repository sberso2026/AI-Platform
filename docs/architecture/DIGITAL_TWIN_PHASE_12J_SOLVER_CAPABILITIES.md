# DIGITAL_TWIN_PHASE_12J_SOLVER_CAPABILITIES

## Baseline

| Item | Value |
| --- | --- |
| Prior phase | 12I PASS |
| Prior commit | `6989d310a91b04db5949954a57db060782dd8dec` |
| Hosted 12I | `31265781321` |
| Prior version | `0.9.0-external-solver` |
| This version | `0.10.0-solver-capabilities` |
| Status | `solver_capabilities` |
| Phase | `12J` |

## Delivered

- EngineeringSolverCapabilityRegistry (multi-provider, per-solver capabilities)
- Capability metadata (discipline, analysis category, units, limitations, assumptions, qualification, certification history, I/O classes)
- SolverCapabilityQualification (capability ≠ whole-solver)
- SolverProviderCompatibilityMatrix (deterministic queries, no execution)
- Adapter version governance (supported/deprecated/revoked; historic reproducible)
- EngineeringCapabilityDiscoveryService (query-only; reject execute-on-discover)
- Additive Simulation Package capability extension
- `digital_twin.capability_review` workflow
- Capability domain events (identifiers only)
- Seed: CalculiX linear_static qualified; other CalculiX capabilities reserved; other solvers reserved
- batch_83 tables + outbox extensions on `digital_twin_outbox_events`
- HTTP capability routes + UI `digital-twin-solver-capabilities-ready`
- Certification gates A–BZ (78) + CalculiX CI install retained for 12I truthfulness

## Flags

| Flag | Value |
| --- | --- |
| `SolverCapabilityRegistryReady` | true |
| `ProviderCompatibilityMatrixReady` | true |
| `CapabilityDiscoveryReady` | true |
| `SimulationPackageExtended` | true |
| `FourLayerQualificationIntact` | true |
| `RealSolverExecutionCertified` | true (preserve 12I) |
| `CalculiXAdapterIntact` | true |
| `ExternalSolverAdapterFrameworkReady` | true |
| `firstRealEngineeringSolver*` | true |
| `silentSolverFallbackAllowed` | false |
| `nativeEngineeringSolverImplemented` | false |
| `PHASE_12K_READY` | true (flag only) |
| prediction / SHM / calibration / actuation / optimization / spatialOwnershipFullyResolved / productionDigitalTwinReady | false |

## Gate count

**78 gates (A–BZ)** — 12A–12I regression + capability registry + boundaries + hosted/HTTP/UI/docs.

## Stop condition

Do **not** start Phase 12K implementation in this phase. Do not move V1 tags.
Do not modify batch_75–82. Do not add new solver execution paths for reserved capabilities.
