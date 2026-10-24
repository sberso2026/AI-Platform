# EOS-D1F-R5 Foundation and Support Interface Foundation

## Scope

This phase records one structural support and foundation interface runtime and one support-reaction context runtime. It connects R1 support identity, R2 governed analysis results, and R4 base or support connection references. It does not design a foundation and it does not perform geotechnical design.

A structural support is not a foundation. An analytical restraint is not a foundation property. A support reaction is not a foundation design demand. A foundation identity is not foundation adequacy. A geotechnical input reference is not geotechnical acceptance.

## Entity separation

The interface keeps these identities separate: structural support, analytical support or restraint, support reaction source, base or support connection, physical foundation, design foundation, geotechnical context, and foundation interface result. R1 support records are reused. No parallel support model is created.

## Foundation identity and authority

A foundation identity carries its identifier, structural system, project, support references, base connection references, location, explicit classification, profile, authority, provenance, status, version, and fingerprint. Governing authority is human authored, human confirmed, governed imported, or an explicit governed model. An unconfirmed candidate cannot govern. AI cannot author a governing foundation.

## Taxonomy

An explicit classification may be an isolated footing, strip footing, combined footing, raft or mat, pile cap, pile foundation, pedestal, ground-beam interface, or other. The family does not define capacity, dimensions, reinforcement, or a soil model. Classification is not inferred by an LLM, from a reaction pattern, from a member type, or from geometry alone.

## Support and foundation mapping

A mapping relates supports and base connections to a foundation. Cardinality may be one to one, one to many, or many to one. One support is not assumed to equal one foundation. Several columns may share one combined footing. Several supports may share one raft. One support may relate to a pile group represented by one foundation object. One foundation object may reference several geotechnical elements. Every mapping carries authority. An AI mapping cannot govern.

## Reaction source

Support reactions must come from a governed R2 analysis-result contract. A raw unnormalized provider reaction cannot govern. Unverified, stale, nonconverged, and failed-analysis reactions cannot govern. A model-validation reference is required. A missing validation reference cannot create a governed foundation context.

## Support-reaction context

The context records the support, mapped foundation, connection, analysis model, run, result set, reaction identifiers, load cases, combinations, location, coordinate reference, sign convention, authority, provenance, status, and fingerprint. Canonical components are FX, FY, FZ, MX, MY, and MZ. Those labels are not reinterpreted as vertical load, horizontal load, overturning, uplift, or sliding load.

## Case preservation and absent values

Each reaction keeps its exact load case or load combination. An absent component stays absent. A missing component is not invented as zero. An explicit zero stays zero.

## No automatic demand

The runtime does not aggregate reactions, build an envelope, select a generic absolute maximum, or synthesize a foundation action across combinations. A supplied governed envelope is retained only when it already carries source reaction identifiers, a selection rule, cases, quantity, location, governing state, authority, provenance, and fingerprint. Several supports on one foundation stay as separate reaction states. Different combinations, coordinate systems, and reference points are not combined. Moment transport between points is not automatic. Multi-support aggregation is deferred to future foundation design orchestration.

## Coordinates and signs

Coordinate kinds are global, system, explicit support local, explicit foundation local, and analysis-provider local. A foundation local axis is not inferred. AI has no axis authority. R2 coordinate normalization is reused. No parallel transform engine is created. Sign conversion remains traceable and is not applied twice. A reaction location is required.

## Support versus foundation

A fixed, pinned, or spring restraint does not define a foundation type or foundation stiffness. A structural spring value is not a soil modulus, subgrade modulus, or geotechnical stiffness. Eccentricity between a reaction location and a foundation reference is deferred. Provider reactions are not assumed to be globally equilibrated. A global equilibrium diagnostic remains a deferred non-governing diagnostic and is not foundation demand.

## Geotechnical interface

The geotechnical contract is a reference only. It may point to a ground model, investigation, design report, soil parameter set, groundwater context, bearing recommendation, settlement assessment, pile recommendation, and site or geohazard context. Each reference carries authority, provenance, status, units, applicability, location or depth, version, and fingerprint. Soil parameters are not calculated or inferred. AI cannot author a soil parameter. An unconfirmed candidate cannot govern. A value is not site-wide by default. Missing location applicability blocks governing use. Geotechnical engineering remains future D3. Bearing resistance, settlement, slope stability, and pile capacity are not implemented.

## Design input and availability

A foundation design input context may reference identity, reaction context, profile, explicit geometry, explicit materials, geotechnical references, and design requirements. That context is not a design result and is not a pass. Foundation design and geotechnical design availability are both not implemented. Isolated, combined, strip, and raft footing design are not implemented. Pile axial, lateral, group, and pile-cap design are not implemented. Sliding, overturning, uplift, bending, one-way shear, punching, and reinforcement design are not implemented. Base-plate and anchor design remain outside this phase and stay with the R4 boundary. Soil-structure interaction and soil-derived stiffness are not implemented.

## Scope, completeness, and system integration

Scope states are foundation not in declared scope, foundation required and not evaluated, foundation interface complete, foundation design unavailable, and foundation result available. Completeness states are complete for the declared scope, incomplete, invalid, undetermined, and stale. Interface completeness is not design completion, a pass, or adequacy. A satisfied member result cannot hide a required foundation gap. A complete connection interface cannot hide a required foundation gap. Historical R3 and R4 results are not rewritten.

## Provenance, fingerprints, invalidation, and history

Provenance runs from the structural system through the support, base connection, analysis model and run, support reaction, reaction context, foundation identity, geotechnical references, and the interface result. Fingerprints cover foundation identity, mappings, connections, authority, classification, location, coordinates, profile, geotechnical references, reaction identifiers, model and result fingerprints, cases, units, signs, completeness, and version. Equivalent collections fingerprint the same way regardless of order. Support topology, mapping, base connection, analysis, reaction, coordinate or sign, classification, geotechnical reference, and profile changes mark the interface stale. A stale interface cannot be current. A stale reaction context cannot govern. A successor keeps the prior result and does not overwrite it.

## Events and AI

Events record foundation identity creation, mapping change, reaction-context creation and invalidation, geotechnical reference change, and interface evaluation and invalidation. An event is not engineering approval. AI may suggest candidate mappings, missing records, missing evidence, review priorities, and possible reaction anomalies. AI may not select a governing reaction, size a foundation, invent soil parameters, select bearing resistance, choose pile count, choose footing dimensions, or approve foundation or geotechnical adequacy.

## Profile

The project design profile is explicit. Jurisdiction is not inferred from location. A geotechnical standard is not selected by AI.

## Preserved debt

R3 steel dispatch remains D1D EU tension only and is not general AU, EU, or US steel system orchestration. This phase does not expand that dispatch. Concrete C10 remains pending qualified human review. The debt carried to R6 is: no structural solver, no external solver connector, R3 steel dispatch limited to D1D EU tension, no generic steel system orchestration, no connection design, no foundation design, no geotechnical design, no automated analysis-model validation, no automatic governing-action selection, no automatic envelope engine, no complete load-path verification, concrete C10 human review pending, D1F system orchestrator engineer review pending, and GA security debt remaining.

## R6 handoff

The next phase is EOS-D1F-R6 structural systems closeout. R6 inventories R1 topology, R2 analysis-result and action binding, R3 system-member evaluation, R4 connection interface, and this foundation and support interface. It reconciles maturity, debt, claims, provenance, fingerprints, invalidation, and D1G external-solver readiness without adding a major engineering capability.

No schema migration is required.
