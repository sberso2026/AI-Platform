# EOS-D1G-R4 SPACE GASS Read-Only Connector Implementation

## Decision

The connector runtime reads SPACE GASS results. It does not analyse the structure, validate the model, or approve a result. The product claim is SPACE_GASS_READ_ONLY_RESULT_CONNECTOR_IMPLEMENTED. LIVE_PROVIDER_VALIDATION_PENDING. It is not a SPACE GASS analysis engine, not model authoring, and not general structural analysis.

The integration mode remains the local REST read selected in D1G-R3. The official authentication and versioning pages, already in the R3 source register, document the service at http://localhost:34560/api/v1. The connector accepts that host and the loopback address 127.0.0.1 on port 34560. A governed configuration may select another loopback port because the authentication page documents a custom local port. A package, provider payload, or model path cannot change the host.

## Version and licence

R5 corrected the version claim. API generation v1 is the supported contract. Desktop versions 15.0.2 and 15.1.0 remain SDK pairing examples and are not a proven REST compatibility range. A missing version still fails closed. A non-v1 API generation fails closed. A reported desktop version is recorded and is not accepted as compatible. The connector does not guess a version from a file name or an install path. The documented local API uses no API key. No licence key is read or stored. A licence failure is returned as LICENSE_UNAVAILABLE and is not bypassed.

## Transport

Permitted method is GET. The allowlist is job units, nodes, members, node restraints, load cases, combination load cases, an existing run status by numeric run id, node reactions, and member intermediate forces. Open, save, close, and run-linear are not called. Query parameters are limited to LoadCases, Members, Nodes, and NodeType=Restrained. Redirects are errors. Each request has a timeout and a response byte limit equal to the R2 file bound. Concurrency is one. A transient unavailable response may be retried twice. Other failures are not retried.

## Snapshot and identity

Each read response is preserved as exact text. The native fingerprint covers those bytes. Replay uses the snapshot and does not call the vendor. A model path is display text only and cannot open a file or a process. Model identity is a safe display name when one is present, otherwise the snapshot fingerprint. Run identity is the documented run id. If it is absent, the run is unresolved and cannot govern. Completed, Failed, and Cancelled are the only terminal states. Completed is not convergence, not model validation, and not engineering acceptance.

## Semantics that remain unresolved

Member-end result endpoint name, reaction moment field names, object-id stability across save or renumber, any desktop version below the 15.x examples, a nonlinear convergence flag, and major or minor axes without a governed section transpose state. None of these are inferred. A station at distance zero stays a station. A missing reaction component is not zero. An explicit zero is kept.

## Mapping

One versioned manifest maps station categories, native force names, sign factors, locations, and run states. Sign factors are plus one, which preserves the documented native sign: positive axial is compression, positive shear and torsion follow the official member statements, and positive reactions follow the positive global axes. Local y and z are not design major and minor. Those components are marked DESIGN_AXIS_MAPPING_UNRESOLVED and cannot feed a governing member check. Case and combination titles are not EOS identifiers. Caller-supplied maps are required. Combination factors are provenance only.

## Scale

Results that exceed the R2 count or byte bounds are split into deterministic chunks: station forces, support reactions, and warnings with run status. Each chunk is a version-1 result package produced from the same mapped records. The bundle fingerprint sorts chunk ids, so chunk order does not change it. A missing chunk makes the bundle incomplete. Chunking does not create an envelope or a governing case.

## Handoff and authority

The mapped records enter the existing D1G-R1 adapter and, as package bytes, the existing D1G-R2 ingestion and D1F normalization. The connector does not promote result authority. D1F still requires model-validation evidence and a convergence state the provider has not established, so a completed import does not govern. Steel dispatch remains D1D_EU_TENSION only. Concrete review remains pending.

## Security and fixtures

Offline tests use synthetic JSON shaped like the documented fields. No vendor sample file is stored. The live read flag defaults to off. No process is spawned and no vendor SDK is loaded. Provenance runs from the normalized result back to the snapshot, provider version, connector version, and mapping version. A change of topology, mapping, or provider version follows the existing D1F staleness path. A later import does not overwrite the prior execution object.

## Feature flag

d1g.spaceGass.readOnlyConnector defaults to false. A live local read also requires an explicit opt-in. The default test state is NOT_RUN_NOT_CONFIGURED.
