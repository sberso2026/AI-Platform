# EOS-D1I-R1 Twin Identity and State Reference Foundation

## Scope

This phase implements the first bounded structural digital-twin runtime. It records twin identity and pinned state references. It does not select governing current state, create snapshots, answer as-of queries, resolve conflicts, ingest telemetry, infer engineering state, calibrate a model, or automate capacity, adequacy, rating, prediction, or repair.

The maturity is STRUCTURAL_DIGITAL_TWIN_IDENTITY_STATE_REFERENCE_RUNTIME_FOUNDATION_IMPLEMENTED. That is not a complete digital twin, not engineer validation, and not conformance validation.

## D1I-0 reuse

R1 reuses the D1I-0 architecture contracts and the post-D1H roadmap. No parallel architecture is created. The canonical name remains STRUCTURAL DIGITAL TWIN. D1H, C10, D1F, and D1G maturity are not promoted.

## Digital thread and identity reuse

R1 reuses the existing digital-thread provenance and fingerprint conventions, including fingerprintCanonical. It does not create a parallel thread. Structural targets are existing D1A and D1F identities: structural system, member, connection, support, and foundation. A twin is not that asset identity.

## Twin identity

createTwin requires an authorized human or governed-system actor, an explicit purpose, a governance profile, and a governed structural target in the same tenant, workspace, and project. An orphan twin is rejected. A target that is not current is rejected. AI cannot create a governing twin. Purpose is not inferred from asset type, file name, analysis, inspection content, or AI.

Supported scopes are STRUCTURAL_SYSTEM and BOUNDED_STRUCTURAL_ASSET_SCOPE. A bounded scope must name its parent structural system. Geometry, proximity, and file name are rejected. Multiple twins may bind the same target when their purposes differ. An exact retry returns the existing twin. The twin fingerprint covers tenant, workspace, project, scope, target, purpose, authority, profile, and version.

## Source resolvers

Registration resolves a canonical upstream record. The caller may supply a domain, an allowlisted object type, an object id, a compatible state class, and optional expected version or fingerprint. The caller cannot establish source fingerprint, source authority, source validation, or known-at time.

Supported domains are D1A design or reference identity, D1F structural identity, D1F analysis, D1G external analysis, and D1H inspection condition. FUTURE_TELEMETRY and OTHER_GOVERNED_SOURCE fail closed. There is no generic object fetch. Selectors that contain paths, URLs, or query-like text are rejected.

A new registration fails when the source cannot be resolved. UNRESOLVED_REFERENCE is only a later status of a previously valid pin whose source can no longer be resolved.

## Allowlists and state classes

D1A identity and D1F structural-system identity map only to DESIGN_OR_REFERENCE_STATE. They are not measured or observed state. Registration still requires a canonical effective time on that identity record.

D1F and D1G analysis results map only to ANALYTICAL_STATE. Raw, normalized, and governed classes stay distinct. Analysis cannot be registered as observed or measured state. Failed and nonconverged results may be pinned as historical context. They do not govern physical state.

D1H structural findings map only to OBSERVED_STATE. Evidence is not treated as observed state automatically. Measurements map only to MEASURED_STATE. Interpretations map only to ENGINEERING_INTERPRETED_STATE. Condition states map only to CONDITION_STATE. A condition rating is not a condition state.

There is no inference engine and no prediction engine. Freeform inferred, predicted, and telemetry state is rejected.

## Time

Effective time comes from the source. Design identity uses its canonical effective time when present. Analysis uses the analysis timestamp. Findings, interpretations, and condition states use the inspection context inspection time. Measurements use the measurement time. Record creation time is preserved as source creation time and is not used as effective time. A missing required effective time fails closed.

knownAtTime is assigned by the clock injected into the R1 store. A caller-supplied known-at value is rejected. An inspection effective on 1 June that is registered on 10 June keeps those times distinct. Tests use a fixed clock.

## Reference status

CURRENT_REFERENCE means the reference record is active and not superseded. It does not select governing physical state. No current-state selector and no current-selection record exist in R1. HISTORICAL_REFERENCE is used for failed or nonconverged analysis context. Later evaluation may mark a pin stale, invalid, unresolved, or superseded. R1 does not run as-of or as-known queries. Snapshot and conflict counts are zero.

## Bodies, fingerprints, and history

A state reference stores identity and pin metadata only. It does not copy analysis arrays, inspection statements, measurement values, condition bodies, documents, images, or geometry. No display label is stored.

The reference fingerprint includes the resolved source fingerprint, source version, state class, domain, target, effective time, trusted known-at time, authorities, and version. The same finalized record fingerprints identically under the same clock.

History is append-only for twin creation and for reference registration, supersession, staleness, and invalidation. A reference cannot change its source object, version, or fingerprint in place. A correction creates a successor. Upstream supersession or an unexpected fingerprint change leaves the stored pin unchanged and marks the reference stale or invalid. Invalidation does not mutate the upstream source and does not delete history.

Target staleness and source staleness both propagate to the reference status. Withdrawn or invalid source authority marks the reference invalid.

## Provenance and authority

Provenance runs from structural target to twin to state reference to the exact upstream object. Analysis pins also keep model and run identity. Each record preserves tenant, workspace, project, actor, registration authority, source authority, source validation, both times, version, and fingerprint. Creating a twin, registering a reference, and authoring the source remain different authority layers. Registration does not promote source authority or validation.

AI cannot select a source, a target, a state class, an effective time, a known-at time, or an authority upgrade.

## Boundaries

A reference does not change capacity, section properties, material properties, the analysis model, supports, releases, or loads. It does not execute a solver, rate a condition, judge adequacy, predict deterioration, diagnose cause, or design a repair. There is no telemetry, structural health monitoring, BIM, CAD, or 3D runtime, and no person twin.

Completeness of an R1 result means only the declared registration scope. It does not mean a complete physical twin, a healthy structure, or structural adequacy. Runtime diagnostics are not findings and not twin state. Events record creation, registration, supersession, staleness, and invalidation. An event is not engineering approval.

An exact retry returns the existing reference. The same source pinned twice inside one twin is not independent evidence. Different governed twins may pin the same source when each scope allows that target.

## R2 handoff

The next phase is EOS-D1I-R2-TEMPORAL-SNAPSHOT-CURRENT-AS-OF-STATE-GOVERNANCE. It can consume twin identity, governed target, state-reference identity, source domain, state class, resolved source identity, version, fingerprint, source authority, source validation, effective time, known-at time, source times, reference status, registration authority, provenance, fingerprint, history, and staleness. It must not implement conflict resolution or telemetry.

No database migration and no engineering formula are added.
