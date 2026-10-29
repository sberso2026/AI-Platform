# EOS-D1I-R2 Temporal Snapshot and Current As-Of State Governance

This phase records governed current-state selections, immutable twin snapshots, and bitemporal views on exact D1I-R1 state references. It reuses twin identity, structural target binding, source identity, source fingerprint, source authority, source validation, effective time, known-at time, reference history, staleness, provenance, and fingerprints from R1. It does not create a second twin identity runtime or a second state-reference runtime.

A current selection is not structural truth. A snapshot is not structural adequacy. An as-of view does not choose governing engineering truth.

## Current selection lanes

A lane is the twin, the structural target, the state class, the source domain, and the purpose. One active selection is allowed in one exact lane. Analytical, measured, observed, and condition selections can coexist. A measured selection does not displace an analytical or condition selection. There is no universal current state and no universal ordering among state classes or source domains.

Selection requires a human or other governed authority. An AI actor cannot select the current reference, set an effective interval, or create a governing snapshot. selectedAt comes from the trusted runtime clock. The caller cannot backdate it. R2 does not invent a retroactive effectiveFrom. If a caller supplies one, the request is rejected and selectedAt remains the history time.

A selection must name an existing R1 state reference on the same twin. The reference must match the lane target, state class, and source domain. Invalid, unresolved, superseded, and stale references cannot be newly selected. R2 does not add a review bypass for stale references. Selection does not promote source authority or source validation, and it is not engineering approval, a safe determination, or an adequacy determination. An unvalidated measurement stays unvalidated after it is selected.

A replacement appends a successor and marks the prior selection superseded. The prior record stays available for history replay. Repeating the same active lane, reference, and basis returns the existing selection. A newer reference does not change an existing selection. If the selected reference later becomes stale, invalid, superseded, or unresolved, or the twin target becomes stale, or the selection authority is withdrawn, the selection becomes stale or invalid. R2 does not switch to another reference.

## Snapshots

Every snapshot declares its purpose and scope. Purpose values are engineering review context, historical record, as-of reconstruction, current reference set, and comparison context. Purpose does not change the authority of the contained sources. Scope names targets, state classes, source domains, and purpose. Completeness is evaluated only against that declared scope. The states are complete for the declared scope, partial, incomplete, stale, invalid, and undetermined. A complete snapshot is not healthy and not adequate. An incomplete snapshot is not damaged. R2 does not assume that every twin must contain analysis, measurement, condition, observation, or telemetry.

An explicit snapshot stores caller-selected R1 reference identities and fingerprints after authorization and scope checks. It does not become the current selection. A current snapshot copies the exact active selection records for the declared lanes. It does not recompute current from timestamps. Both modes store identities and fingerprints only. They do not copy source bodies or R1 reference bodies. Conflict identifiers stay empty.

Once recorded, the reference set is immutable. A different composition creates a new snapshot and does not delete the older one. Input order does not change the fingerprint. The same scope, mode, cutoff, and reference set returns the existing snapshot. Later source staleness can mark the snapshot stale for current use and appends status history. It does not rewrite the stored identifiers, fingerprints, or provenance.

## Effective time and known-at time

AS_OF_EFFECTIVE_TIME returns references whose effective-time point equals the query time and whose known-at time is at or before the recorded knowledge cutoff. An effective-time point is not an interval. R2 does not treat the latest earlier reference as valid until the next reference. A measurement or observation at one time is not extended to a later query time. Condition references keep the effective time already resolved by R1 from the inspection context. Analysis timestamps remain analytical temporal metadata. They are not physical asset time.

If the caller omits the knowledge cutoff, the trusted query clock is used and stored on the view. A caller may request an earlier cutoff. The caller cannot rewrite R1 known-at time or inject status history. No project-location timezone is inferred. The view records the query mode, effective time, cutoff, scope, reference identities, execution time, and fingerprint. A view is not automatically stored as a snapshot.

AS_KNOWN_AT_TIME returns only references whose known-at time is at or before the query. Status is reconstructed from append-only R1 history events recorded at or before that time, beginning with the status stored on the registration event. The status stored on the reference today is not used. Later staleness, later supersession, and later authority withdrawal do not rewrite the earlier knowledge state.

Late data keeps both rules. A condition whose effective point is 1 June and whose R1 registration is 10 June is absent from a known-at query on 5 June. A later as-of query for 1 June, with a cutoff after 10 June, can include it because the point matches and the reference is known by that cutoff. That later query does not rewrite the 5 June view or a snapshot recorded before the registration.

If several references are eligible in the same scope and no governed selection names one of them, the view preserves all of them and may report multiple eligible references. It does not choose one. Other diagnostics are current selection missing, current selection stale, and temporal applicability unresolved. A diagnostic is not a conflict record and not a structural finding. R2 does not create conflict records. A current view is built only from explicit active selections and returns each lane independently. An R1 current-reference status, by itself, is not an R2 current selection. A required lane with no selection stays missing.

## Provenance, boundaries, and the next phase

The provenance chain is structural target, twin, exact R1 state reference, current selection, temporal view, and a snapshot only when snapshot creation is explicit. Upstream edges remain references. Selection, snapshot, and view operations do not mutate R1 references, D1H history, or analysis history. A current analytical selection is not the current physical state. A current condition selection does not modify the D1H condition. A current measurement does not mean the measured value remained physically valid after the measurement time. A current observation does not mean the observed condition continues to exist.

R2 does not compute health scores, condition scores, worst or best state, average state, or aggregate adequacy. It does not run telemetry, sensor ingestion, inference, prediction, deterioration, causal diagnosis, model calibration, analysis-model updates, solver execution, capacity assessment, repair recommendation, or repair design. It does not implement a person twin, employee surveillance, or person profiling. Cross-project and cross-tenant selection and snapshot requests are rejected. Query input is limited to twin, target scope, state classes, source domains, purpose, effective time, and known-at cutoff. Arbitrary expressions are rejected.

The next phase is EOS-D1I-R3 state conflict and multi-source composition. It can use twin identity, state-reference identity, source domain, state class, effective time, known-at time, reference history, current-selection identity and lane, selection history, snapshot identity, declared scope, temporal view identity, as-of and as-known semantics, completeness, provenance, fingerprints, and staleness. It should preserve conflicts and record governed review. It should not average sources, select engineering truth automatically, ingest telemetry, calibrate models, or automate adequacy or capacity.
