# EOS-D1F-R6 Structural Systems Closeout

## Purpose

D1F closeout reconciles the bounded structural-system track. It is not general structural analysis, complete structural design, engineer validation, code conformance, or general availability.

The canonical chain is project and D1B context, then R1 structural system and governed topology, then R2 analysis model, run, and result, then R2 canonical action binding, then an R3 governed evaluation plan, then bounded member execution, then bounded system aggregation. Separately, R1 and R2 feed the R4 connection and member-end force-transfer interface. R1, R2, and R4 feed the R5 support and foundation interface.

## Phase inventory

D1F-0 defines the architecture, fingerprint subjects, and formula scan. D1F-R1 implements one topology runtime and no structural analysis. D1F-R2 implements one analysis-result runtime and one member-action binding runtime and no solver. D1F-R3 implements one system orchestrator. It is numerically validated for its declared routes and is not engineer validated. D1F-R4 implements one connection-interface runtime and one force-transfer context and no connection design. D1F-R5 implements one foundation-interface runtime and one support-reaction context and no foundation or geotechnical design. Each phase keeps its types, tests, documentation, and capability rows. No parallel structural domain, member model, node model, support model, load model, combination engine, material engine, rule registry, or capability manifest is created.

## Entity separation

Physical system, physical member, analytical element, design member, physical connection, analytical joint, design connection, structural support, analytical restraint, foundation identity, analysis result, action binding, and design result remain distinct. A member-end action is not a connection design demand. A support reaction is not a foundation design demand.

## R3 limits and Concrete ceiling

R3 steel dispatch is D1D EU tension only. That does not remove the broader D1D member methods already present for AU, EU, and US. Exposing those methods through system dispatch requires a future phase and is not done here. Concrete system routes are the existing C9 beam, column, solid slab, and wall section routes. Their results cannot exceed the Concrete C10 maturity ceiling. C10 remains pending qualified human review.

## Provenance, fingerprints, and invalidation

A governed fixture traces the system result to the member evaluation, action binding, normalized result, raw result, analysis run, analysis model, and topology. The same fixture traces the connection interface to its force-transfer context and the foundation interface to its support-reaction context. Fingerprints cover the structural system, topology, analysis model, analysis run, result set, action binding, evaluation plan, member evaluation, system evaluation, connection, force-transfer context, foundation, support-reaction context, and foundation interface. A topology change marks downstream binding, member evaluation, connection interface, and foundation interface stale. A result-set change marks the dependent binding, member evaluation, force-transfer context, and support-reaction context stale. An evaluation-plan change changes the system fingerprint. A connection mapping change and a foundation or geotechnical reference change mark those interfaces stale. New revisions do not overwrite historical results. Cross-project and cross-tenant bindings are rejected.

## Authority and claims

AI cannot govern topology, connectivity, supports, releases, axes, result normalization, evaluation plans, governing actions, connections, foundations, soil parameters, or engineering acceptance. A system result cannot approve a design. The permitted claim is bounded structural system member evaluation. The product claim matrix marks topology, result ingestion, action binding, and the connection and foundation interfaces as implemented, steel and concrete system evaluation as bounded, and analysis, connection design, foundation design, geotechnical design, model validation, governing-action selection, and load-path validation as not implemented or deferred. There is no structural digital twin, CAD or BIM intelligence, or concept-to-detailed design claim. D1I, D1M, and D1N remain the owners of those subjects. No D2 through D9 discipline runtime is implemented. The reusable patterns are authority states, provenance, fingerprints, invalidation, bounded orchestration, human judgment separation, result normalization, and scope completeness.

## Debt

The canonical debt remains: no structural solver, no external solver connector, R3 steel dispatch limited to D1D EU tension, no generic steel system orchestration, no connection design, no foundation design, no geotechnical design, no automated analysis-model validation, no automatic governing-action selection, no automatic envelope engine, no complete load-path verification, Concrete C10 human review pending, D1F orchestrator engineer review pending, and GA security debt. Solver and design gaps block a general structural-design claim. The missing connector is future capability and does not by itself block a later provider-neutral adapter. Human-review gaps block engineer-validated and conformance claims. GA security debt blocks general availability.

Connection design should remain a future D1F structural subtrack. Structural concrete foundation design should remain a future structural subtrack. Ground resistance, bearing, settlement, and soil parameters remain D3.

## D1G readiness

D1F already provides the provider-neutral contracts D1G must satisfy: system identity, topology fingerprint, model and run identity, provider authority, units, coordinates, signs, cases and combinations, locations, raw and normalized results, result-set fingerprints, stale semantics, physical and design mappings, action binding, model-validation evidence, warnings, provenance, and historical preservation. External solver integration readiness is therefore yes. General structural design readiness remains no. A vendor connector must not bypass D1F normalization or result authority. The recommended sequence is a provider-neutral fixture adapter first, then a provider-specific adapter only after that contract is proven. The first D1G phase is EOS-D1G-R1 provider-neutral solver adapter foundation, because D1F-0 and R2 already define the architecture the adapter must obey. The fixture provider must supply model identity, run identity, provider version, units, coordinates, signs, cases, member forces, support reactions, warnings, and convergence. No production connector is included.

## Maturity

The final D1F maturity is structural systems bounded runtime and orchestration implemented. Runtime counts are one topology foundation, one analysis-result runtime, one action-binding runtime, one system orchestrator, one connection interface, one force-transfer context, one foundation interface, and one support-reaction context. Analysis methods, connection-design methods, foundation-design methods, geotechnical-design methods, and new engineering formulas are zero. Numerically validated orchestrators are one. Engineer-validated and conformance-validated orchestrators are zero. Human review remains pending for R1, R2, R3, R4, and R5. Release classification stays an internal engineering reference and is not promoted.

No schema migration is required.
