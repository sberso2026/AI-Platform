# EOS-D1G-R1 Provider-Neutral Solver Adapter Foundation

## Scope

D1G-R1 adds one provider-neutral adapter runtime and one deterministic fixture provider. The adapter is a translator into the existing D1F analysis-result contracts. It is not a structural solver, not an engineering approver, and not a commercial connector.

No network call, vendor API, vendor SDK, or vendor command-line execution is implemented. ETABS, SAP2000, STAAD, Robot, and SPACE GASS are not integrated. The fixture provider returns static result rows. Those rows are not computed from geometry, stiffness, or equilibrium.

D1F maturity is unchanged. Concrete C10 remains pending qualified human review. D1F R3 steel system dispatch remains D1D_EU_TENSION only.

## Adapter identity

An adapter records adapterId, adapterVersion, adapterSchemaVersion, providerId, supportedProviderVersions, adapterType, capabilityManifestRef, mappingManifestRef, status, authority, provenance, and an execution fingerprint.

The adapter type taxonomy is FIXTURE_PROVIDER, FILE_BASED_PROVIDER, API_PROVIDER, SDK_PROVIDER, COMMAND_LINE_PROVIDER, and OTHER. R1 implements only FIXTURE_PROVIDER.

Authority is translator, not result authority. Ingestion does not set VERIFIED_GOVERNED unless the caller supplies that existing D1F authority explicitly together with model-validation evidence. A provider success flag is not acceptance. A completed provider state is not convergence unless a separate explicit convergence token says so.

## Provider identity

Every execution requires providerId, providerName, and providerVersion. Model revision and run revision are retained when the source supplies them. An undeclared provider version fails closed.

The provider name does not select units, axes, signs, member-end convention, quantity meaning, load-case meaning, or trust.

## Capability manifest

Declared capabilities may include MODEL_METADATA, NODES, ANALYTICAL_ELEMENTS, LOAD_CASES, LOAD_COMBINATIONS, MEMBER_END_FORCES, MEMBER_STATION_FORCES, SUPPORT_REACTIONS, NODE_DISPLACEMENTS, WARNINGS, CONVERGENCE_STATUS, MODAL_RESULTS, BUCKLING_RESULTS, and OTHER.

Negotiation returns only the declared list. The provider name adds nothing. An undeclared capability is retained as unsupported and is not invented.

## Source payload and raw preservation

A source records sourcePayloadId, provider identity, source type, source name, source version, source timestamp, project, tenant, workspace, model identity, run identity, warnings, cases, combinations, results, and unknown fields.

The raw source is copied before mapping and is not mutated. Equivalent source data reproduces the same source fingerprint. Raw provider values are not the normalized D1F values. Normalization remains a separate D1F step.

A source name cannot address a local path. Payload bytes, result count, nesting depth, and identifier length are bounded. Unknown fields are retained and do not change mapped engineering values. Payload text is not executed.

## Provider model and object mapping

Provider model metadata may include model id, revision, analysis type, unit context, coordinate context, and sign context. That metadata does not create or govern topology. A provider model must map explicitly to an existing D1F analysis model and structural system.

Provider object ids are scoped to the provider model and run. The same object id in another model is not assumed to be the same object. Each entry maps explicitly to analytical element, node, support, physical member, and design member where those governed ids exist. Mapping authority must be explicit and governed. AI mapping cannot govern. An unmapped object stays in the unmapped set and blocks complete adapter scope.

## Run mapping and warnings

Run extraction records provider run id, model identity, provider version, analysis type, mapped run state, mapped convergence state, warnings, cases, combinations, timestamp, and source fingerprint.

Run states and convergence states come only from the mapping manifest. An unknown state cannot govern. Provider warnings keep their original id, code, and text. A transport category may be attached. An unlisted warning stays attached as unclassified. Transport category is not a governing severity.

## Cases, combinations, and results

Provider case ids and combination ids map to D1C ids only through manifest entries. The labels ULTIMATE, SERVICE, and WORST_CASE cannot govern.

A provider result records its id, object id, category, quantity name, raw value, raw unit, coordinate system, sign convention, location, station semantics, case or combination, and provenance. Categories map explicitly. Member-force rows may become D1F member action effects. Support reactions and nodal displacements are transported on the D1F raw contract and are not design inputs.

Quantity names such as P, N, Fx, V2, M3, and T do not map by resemblance. Only a manifest entry maps a provider quantity onto N, V_MAJOR, V_MINOR, M_MAJOR, M_MINOR, or T. An unknown category is retained and is not recast.

## Units, coordinates, signs, ends, and locations

Dimensioned results require explicit provider unit metadata. The adapter does not convert units and does not own a parallel unit engine. D1F unit normalization consumes the raw unit.

Directional results require a provider coordinate system. When that system differs from the canonical system, an explicit transform is required. The adapter does not rewrite component values. A guessed transform or a transform selected from the provider name is rejected.

Sign convention is explicit. The sign factor is recorded for D1F to apply once. The adapter does not apply it and does not infer it from the provider brand.

Member ends such as I, J, START, END, and LOCAL-I map only through the manifest. A reversed element keeps the mapped end on the raw row. D1F applies the explicit reversal map. The adapter does not swap ends silently.

Result location is required. A missing location does not become midspan. A station result requires station value, unit, origin, and orientation.

## Member forces, reactions, absence, and partial sets

Member-end forces, station forces, and support reactions are copied from the fixture. None are calculated. An absent provider value stays absent. An explicit zero stays zero. A bare zero is not treated as an explicit zero.

A source may omit reactions, leave an object unmapped, or include an unsupported category. The retained rows stay visible. Completeness may be COMPLETE_FOR_DECLARED_ADAPTER_SCOPE, PARTIAL, INCOMPLETE, INVALID, UNSUPPORTED, or STALE. Partial scope does not imply a complete required scope.

Duplicate provider result identity within one model and run is rejected.

## Mapping manifest and D1F handoff

The mapping manifest is versioned. It carries category, quantity, sign, member-end, location, case, combination, run-state, convergence, and warning maps. A semantic that is not in the manifest fails closed for the affected row. A manifest change changes the manifest fingerprint and the execution fingerprint.

The handoff is a D1F-R2 evaluation input. D1F normalizes units and signs, checks coordinates, assigns result authority, fingerprints the result set, and applies stale-result rules. The adapter does not create steel or concrete design input. designTarget stays unset. Member design execution is not added.

Topology, mapping, or normalization identity that no longer matches makes the D1F binding stale. A new adapter execution does not overwrite the prior execution. Successor recording keeps the prior fingerprint and marks the returned prior revision superseded.

## Fingerprints, provenance, and determinism

The execution fingerprint covers adapter version, provider version, source fingerprint, mapping-manifest fingerprint, object-mapping fingerprint, and required scope. The same source and the same mapping replay to the same fingerprint. A change of source value, provider version, adapter version, manifest version, or object mapping changes the relevant fingerprint.

Provenance runs from the normalized D1F result through the raw result, adapter output, provider result, provider run, provider model, source payload, adapter version, and mapping manifest.

## Security boundary

Provider payload is data. It is not code. The adapter does not evaluate payload text, does not deserialize executable content, and does not accept a local file path as a source identity. Non-finite values and non-numeric engineering values cannot govern. Nested payload depth, result count, identifier length, and payload size stop at caller-bounded limits.

Cross-project, cross-tenant, and cross-workspace binding is rejected. The adapter does not bypass authorization.

## Conformance harness

assessAdapterConformance checks provider identity, provider version, adapter version, source fingerprint, capability declaration, warning preservation, unit metadata, coordinate metadata, sign metadata, case or combination mapping, result location, object mapping, raw preservation, D1F handoff, provenance, fingerprint, authority, and the absence of calculated forces or reactions. Future provider adapters can be placed against the same harness.

## Fixture provider

D1G_FIXTURE_SOLVER is the only provider. It supplies identity, version, model id, run id, a finished and separately converged state, one warning, unit metadata, coordinate metadata, sign metadata, one load case, one combination, two analytical elements, member-end forces, one station force, one support reaction, and one nodal displacement. The numbers are literals.

## Commercial boundary and maturity freeze

EXTERNAL_SOLVER_ADAPTER_FOUNDATION is implemented as provider-neutral. EXTERNAL_COMMERCIAL_SOLVER_CONNECTOR is not implemented. The permitted claim is a provider-neutral external solver adapter foundation. The runtime does not claim a commercial solver integration, automated structural analysis, or general structural design.

Counts: one provider-neutral adapter runtime, one fixture provider, zero commercial connectors, zero solver executions, zero new engineering formulas.

## Roadmap

D1G-R1 is this provider-neutral adapter foundation.

D1G-R2 should add a bounded versioned provider-neutral result package and secure ingestion using this contract, still without a commercial solver.

D1G-R3 is the first provider-specific connector.

D1G-R4 is cross-provider consistency.

D1G-R5 is solver-integration closeout.

R2 requires the R1 adapter identity, capability manifest, source payload identity, mapping manifest, object mappings, run extraction, result extraction, unit and axis and sign metadata, case and combination mapping, raw D1F handoff, fingerprints, provenance, and the conformance harness.
