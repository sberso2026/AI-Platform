# EOS-D1F-R2 Analysis Result Contract and Member Action Binding

## Scope

D1F-R2 is one provider-neutral runtime for analysis-model identity, analysis-run identity, raw results, canonical normalized results, and member action-effect binding. A provider result is not a governed EOS result. A governed result is not a design input. A design input is not engineering acceptance. Solver convergence is not engineering acceptance.

The runtime reuses the D1F-R1 topology fingerprint, mapping identity, authority, and provenance. It reuses D1C unit conversion for force, moment, and length. It binds into the existing D1D steel demand slots and the existing D1E concrete section-action tuple. It does not execute those checks and it does not add a solver, an envelope engine, or a persistence migration.

## Analysis model and provider authority

An analysis model records its id, version, structural system, source topology fingerprint, mapping fingerprint, provider id, provider version, provider class, model type, unit system, coordinate systems, sign convention, assumptions, source reference, fingerprint, authority, provenance, and status.

Status is DRAFT, GOVERNED, PENDING_VERIFICATION, STALE, INVALID, SUPERSEDED, or ARCHIVED. Safe, approved, and pass are not model states. A model without its source topology fingerprint cannot govern. A changed topology, mapping, or normalization rule makes the model and its downstream results stale.

Provider classes remain governed external solver, governed internal deterministic engine, human-authored governed analysis, and imported unverified result. An imported unverified result may be stored and cannot govern. The provider name does not define units, axes, signs, or trust.

## Analysis run and raw result

An analysis run records its id, model fingerprint, topology fingerprint, provider identity and version, analysis type, input fingerprint, load-case ids, combination ids, status, convergence, warnings, result-set fingerprint, timestamp, authority, and provenance.

Run status is PENDING, RUNNING, COMPLETED, COMPLETED_WITH_WARNINGS, FAILED, NONCONVERGED, STALE, INVALID, or SUPERSEDED. Failed and nonconverged runs cannot govern. Provider warnings are copied onto the binding result.

A raw result keeps the provider value, unit, coordinate system, sign convention, location, case or combination, category, authority, and provenance. Normalization writes a separate canonical result. It does not change the raw value.

## Normalization

Canonical member actions are N, V_MAJOR, V_MINOR, M_MAJOR, M_MINOR, and T. Force values use the existing force conversion. Moment and torsion values use the existing moment conversion. Unknown or incompatible units fail closed.

When the provider frame and the canonical frame differ, an explicit transform reference is required. The reference names the source frame, target frame, method, version, authority, provenance, and a component map. The runtime does not invent a transform and does not add an analysis transform engine. A same-frame result records an explicit same-frame reference.

Sign conversion is one explicit factor of plus or minus one, recorded in the normalization chain. A second sign conversion is rejected. The provider name is not a sign convention.

Locations are member start, member end, station, section, critical location, or a governed envelope location. A missing location does not become midspan. A station requires a coordinate, a length unit or a dimensionless convention, an origin, and an orientation. A reversed analytical element uses an explicit end map. Ends and signs are not swapped silently.

Every governing action names a D1C load-case id or combination id. Generic labels such as ultimate, service, and worst case cannot govern.

## Result set, staleness, and mappings

The result-set fingerprint covers the run, model, topology, provider and version, case and combination ids, raw values, units, locations, normalization rule, transform version, and sign convention. Collection order does not change the fingerprint.

A change to topology, the analysis model, the run, the mapping, or the normalization rule marks dependent results and bindings stale. Stale results cannot govern. A later run is appended. It does not overwrite the prior raw or normalized result.

Physical-to-analytical cardinalities remain one-to-one, one-to-many, and many-to-one. Analytical-to-design mappings are reused. Multiple analytical elements keep distinct actions, locations, and cases. The runtime does not choose the largest absolute value, does not sum forces, and does not build an envelope. A supplied envelope is accepted only when its value already exists on a named source result and its selection rule is not max-abs, minimum, absolute, worst case, or sum.

## Steel and concrete binding

When the declared scope has explicit axial, major shear, and major moment evidence, the runtime fills the existing steel demand slots for axial, shear, and moment. Capacity is not present. Deflection is left unimplemented rather than derived. No steel check runs.

Concrete binding fills the existing section-action tuple. A missing component is absent. An explicit source zero is a present zero. Absence is not converted to a design zero. Pure bending, axial plus one-axis bending, and biaxial actions are represented as that tuple. No C2 through C9 calculation runs.

Action axes come from an explicit governed map. AI and UI cannot author that map.

## Authority, provenance, and events

Result authority is verified governed, imported pending verification, stale, invalid, incomplete, or failed analysis. Promotion from pending to verified requires an explicit human evidence reference. AI and automatic promotion are rejected. Verified use also requires model-validation evidence. Missing evidence cannot silently govern.

Provenance follows structural system, analysis model, analysis run, raw result, normalized result, analytical element, physical member, design member, and action binding.

Events record model binding, run recording, result-set recording, normalization, staleness, binding creation, and binding invalidation. An event is not engineering approval.

Binding completeness is complete for the declared scope, incomplete, invalid, undetermined, or stale. Complete binding is not a design pass and is not system adequacy.

## Provider-neutral boundary and R3

The core does not embed SpaceGass, ETABS, SAP2000, STAAD, Robot, or OpenSees assumptions. Those connectors remain later work. R3 can orchestrate existing steel and concrete checks from the R2 binding identity: analysis model, analysis run, result set, canonical results, member action binding, completeness, authority, provenance, fingerprints, and invalidation. R3 does not add structural analysis.
