# EOS-D1I-R4 External Telemetry and Monitoring Reference Interface

This phase implements a bounded reference interface for external telemetry and monitoring. It records monitoring-source identity, device and channel identity, governed structural-target binding, and exact dataset or observation references. It does not ingest sensor streams, store sample payloads, or infer engineering state.

## Scope and reuse

R4 reuses the D1I-0 architecture, R1 twin identity and exact state references, R2 selections and snapshots, and R3 compatibility, conflict, and composition runtimes. The canonical source domain remains FUTURE_TELEMETRY and the canonical state class remains TELEMETRY_STATE. No parallel twin, temporal, conflict, sensor, or time-series platform is created. Digital-thread conventions for events, history, provenance, fingerprints, authority, and staleness are reused.

The external monitoring source remains authoritative for its data. R4 owns reference metadata only.

## Provider neutrality and network boundary

Provider kinds are an allowlist: data logger, building management, supervisory control, IoT platform, vendor export, and other governed provider. Other does not grant network access. R4 has no polling client, message subscriber, industrial protocol client, vendor SDK, generic web client, or filesystem reader. An external locator is not fetch permission. An artifact id, when supplied, is an inert reference to the existing artifact identity and does not open a second file repository. Reference records do not store keys, passwords, tokens, or connection strings.

## Identity

A monitoring source is identified by its governed registration, not by a vendor display name. A device is identified by its immutable external device id. The same display name, model, or channel label on a replacement sensor creates a new device identity or an explicit successor. A channel is identified by its external channel id. Quantity and unit are explicit. Directional quantities require an explicit axis. A declared coordinate system is preserved and is not inferred. Existing unit checks are reused for quantities that system already converts. Missing units are not invented.

## Target binding

Binding a channel to a structural target uses D1A and D1F identity and requires mapping authority. Coordinates, nearest-member guesses, channel names, and AI classification do not create a binding. A binding interval exists only when both ends are explicitly supplied. Relocation appends a successor binding. The prior binding target and fingerprint stay in history.

## Dataset reference

A telemetry reference points at an external dataset or observation id and a governed source fingerprint. A caller checksum cannot establish that fingerprint. If the observed fingerprint later differs, the reference becomes stale and the stored fingerprint is not replaced. Raw, source-processed, source-derived, and source alert or event classes stay distinct. Derived output is not raw and is not a direct measurement. An external alert does not create an inspection finding, a conflict, or an unsafe result. Sample arrays, binary payloads, and encoded payloads are rejected. A sample count and a time window do not prove a complete or continuous dataset. Gap detection is not performed.

## Time, calibration, and quality

Device time, gateway time, observation time, dataset start and end, external record time, and EOS known-at time are separate. Known-at time comes from the trusted registration clock. Callers cannot backdate it. Unknown or source-reported clock synchronization is not treated as confirmed synchronization, and close timestamps are not alignment. R4 does not align series.

Calibration status is stored as supplied. Unknown calibration stays unknown. No default validity interval is created. Calibration is not source validation, model validation, or structural adequacy. A later calibration record does not rewrite the calibration identity stored on an earlier dataset reference. Omitted source quality stays unknown and is not engineering acceptance.

## State integration

R1 resolves only a published TELEMETRY_DATA_REFERENCE pin. The resulting state reference is TELEMETRY_STATE. It is not measured state, inferred state, or condition state. Registration does not select an R2 current state, mutate an existing snapshot, or create an R3 compatibility assessment or conflict. The R3 comparator registry is unchanged. A dataset window is not a state validity interval. A single observation, or an explicit reference point, is the effective time used for the pin. Late registration keeps the earlier device time and the later known-at time, and it does not rewrite prior as-known history.

Acceleration is not integrated. Strain is not converted to stress or force. Displacement is not analysis displacement or damage. Temperature does not update a model. Vibration is not diagnosed. No threshold, alarm, streaming, analytics, diagnosis, calibration engine, solver, capacity, prediction, deterioration, or repair runtime is added.

## Provenance, history, and invalidation

Provenance runs from structural target to twin to monitoring source to device to channel to binding to dataset reference to the R1 telemetry-state reference. Fingerprints cover source, device, channel semantics, binding, and dataset identity. History is append-only for registration, supersession, and staleness. Source withdrawal, device replacement, target supersession, and fingerprint mismatch mark dependent references stale without deleting history or mutating the external source.

## R5 handoff

The next canonical phase is EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT. Closeout can audit architecture, identity, temporal governance, conflict composition, and this monitoring reference interface. Streaming, sensor analytics, diagnosis, model updating, and structural adequacy remain unimplemented.
