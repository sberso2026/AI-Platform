# EOS-D1F-0 Structural Systems Architecture

Phase: `EOS-D1F-0-STRUCTURAL-SYSTEMS-ARCHITECTURE`

Parent development state: `EOS-D1E-EU-C10-R3A-ENGINEER-REVIEW-PACK-PREPARATION`

Permitted claim: `STRUCTURAL_SYSTEMS_FOUNDATION`

Maturity: `ARCHITECTURE_DEFINED`

This phase defines how a structural system is identified, connected, and handed to existing steel and concrete checks. It does not analyse a structure. Finite-element analysis, frame analysis, truss analysis, matrix stiffness, P-Delta, eigenvalue, dynamic, modal, response-spectrum, nonlinear, shell, and plate analysis stay unimplemented. Connection-design formulas, foundation-design formulas, and new steel or concrete formulas stay unimplemented.

Runtime structural-system analysis count: 0. Runtime structural-system orchestrator count: 0. Numerically validated D1F methods: 0. Engineer-validated D1F methods: 0. Formal conformance: no. Schema change: no.

## Purpose

Connect project structural context, physical members, topology, joints, supports, load context, analysis-model representations, governed analysis results, member design actions, existing D1D steel and D1E concrete checks, connection interfaces, foundation interfaces, provenance, fingerprints, invalidation, and human engineering decisions.

## Scope boundary

The concrete C10 validation lane stays `PENDING_QUALIFIED_HUMAN_REVIEW`. D1F does not modify review-pack content or fingerprints and does not promote engineer validation, conformance, or certification.

AI may help organize, navigate, explain, trace, propose candidate mappings, and identify anomalies. AI does not originate support conditions, connectivity, idealization, effective length, releases, stiffness assumptions, load paths, analysis forces, or structural acceptance.

Repository visibility, context meaning, event workflow, and human judgment stay separate. A structural-system object does not mean analysis is complete.

## Existing architecture inventory

D1F reuses the current domain. It does not create a parallel structural domain, member model, load model, combination engine, material engine, rule registry, or capability manifest.

| Concept | Existing source | D1F action |
|---|---|---|
| Project | Engineering Core | Reference |
| Discipline | D0 capability; `StructuralSystem.discipline` | Reference |
| Structural member | D1A `StructuralMember` | Physical member |
| Node | D1A `StructuralNode` | Reuse |
| Geometry | D1A section reference; D1E section kernel | Reuse |
| Material | D1A `StructuralMaterial`; D1D and D1E properties | Reuse |
| Load | D1C load applications | Reuse |
| Load case | D1A `StructuralLoadCase` | Reuse |
| Load combination | D1A `StructuralLoadCombination`; D1C combination engine | Reuse |
| Action effect | D1C demand result | Handoff contract |
| Support | D1A `StructuralSupport` | Restraint semantics |
| Design context | D1B `StructuralStandardContext` | Reuse |
| Analysis model | D1A `StructuralAnalysisModel` | Separate identity |
| Analysis result | D1A `StructuralAnalysisResult` | Authority states |
| Connection | D1A `StructuralConnection` | Interface only |
| Foundation | D1A `StructuralFoundationInterface` | Interface only |
| Design check | D1A `StructuralDesignCheck`; D1D and D1E methods | Reuse |
| Engineering result | D1A capacity and utilization | Reuse |
| Provenance | `EosGlobalProvenanceContract` | Chain |
| Fingerprint | Existing canonical fingerprint helper | Subject fingerprints |
| Digital thread | EOS-A8A | Event names only |

## Physical, analytical, and design separation

These objects may be related. They are not interchangeable.

- Physical structure is not an analysis model.
- An analytical element is not a design member.
- A solver result is not engineering acceptance.
- A member check is not system adequacy.
- Topology is not structural analysis.

Permitted relationships include one physical member to one analytical element, one physical member to many analytical elements, many physical components to one simplified analytical member, and one analytical element to one or more design evaluation segments. One-to-one is allowed. It is not assumed.

## System hierarchy

The canonical hierarchy uses existing owners:

1. Project, owned by Engineering Core.
2. Structural discipline context, owned by D1B.
3. Structural system, owned by D1A.
4. Physical entities: members, nodes, supports, frames, and connection representations, owned by D1A.
5. Analysis representations: D1A analysis model plus the D1F model and run identity.
6. Design members: existing D1D steel and D1E concrete evaluation identities.
7. Design checks, owned by D1A and the existing method packs.

## Topology and connectivity

Topology records members, nodes, connections, supports, member-to-member relationships, member-to-support relationships, and system grouping. Recording topology does not run analysis.

Connectivity is explicit, imported from governed model data, or human-confirmed. An AI proposal remains `UNCONFIRMED_CANDIDATE`. Proximity is not connectivity.

## Supports, restraints, and releases

A governed support can distinguish translation restraint, rotation restraint, release, spring, and support reference. D1F-0 does not calculate spring or restraint stiffness.

Member-end releases are explicit on a named end and axis. Member type, connection appearance, CAD or BIM proximity, and AI interpretation do not create a release.

## Coordinates, signs, and units

Coordinate systems are `GLOBAL`, `SYSTEM`, `MEMBER_LOCAL`, `SECTION_LOCAL`, and `ANALYSIS_PROVIDER_LOCAL`.

A transform between them must carry an identifier, source system, target system, deterministic method reference, version, and provenance. AI has no transform authority. UI orientation does not define an engineering axis. A missing transform fails closed.

Sign metadata separately records force sign, moment sign, local axis orientation, member-end convention, solver convention, and design-method convention. A solver product name does not select the convention. A missing convention fails closed.

Every analysis or design handoff carries an explicit unit. A blank unit, a missing unit, or a solver-default unit fails closed.

## Load context and load path

Load cases, combinations, and action context stay in D1C. D1F does not create a combination engine.

A load path may be stored as a human-declared or governed-imported annotation. D1F-0 does not determine the load path, and an AI inference is not governing.

## Analysis identity and authority

Analysis-model identity is separate from the physical system. It records model id, version, provider, model type, coordinate-system reference, unit-system reference, source model, created and imported timestamps, model fingerprint, and assumptions reference.

Provider classes are:

- `GOVERNED_EXTERNAL_SOLVER`
- `GOVERNED_INTERNAL_DETERMINISTIC_ENGINE`
- `HUMAN_AUTHORED_GOVERNED_ANALYSIS`
- `IMPORTED_UNVERIFIED_RESULT`

External solver connectors, solver APIs, solver file import, and solver execution belong to D1G. D1F defines the contract D1G must satisfy and does not implement it.

An analysis run records run id, model fingerprint, provider identity and version, analysis type, input fingerprint, load-case and combination set, run status, convergence metadata, result-set fingerprint, and timestamp or version.

Result authority states are `VERIFIED_GOVERNED`, `IMPORTED_PENDING_VERIFICATION`, `STALE`, `INVALID`, `INCOMPLETE`, and `FAILED_ANALYSIS`. Availability does not make a result governed. Solver convergence is not engineering acceptance. A completed analysis is not a validated model. An available result is not a design pass.

Provider-neutral result categories, which a later provider may populate in part, are nodal displacement, nodal reaction, member force or action effect, element stress, support reaction, modal result, buckling factor, analysis warning, and convergence state. No provider must supply every category. D1F-0 computes none of them.

## Action effects, location, and envelopes

The governed handoff to D1D and D1E can carry `N`, `V_MAJOR`, `V_MINOR`, `M_MAJOR`, `M_MINOR`, and `T`, or the existing canonical slot that already represents that quantity. Values are not invented. A governed effect requires a finite sourced value, unit, location, sign-convention reference, coordinate-transform reference, provenance, and a `VERIFIED_GOVERNED` source.

Location is member start, member end, station, section, critical location, or governing envelope location.

D1F-0 has no automatic envelope engine. An envelope record, when a later phase creates one, must keep source cases, quantity, location, selection rule, governing value, governing case, unit, and sign treatment. The largest absolute value is not automatically the governing engineering case. Different checks may govern on different combinations.

## Steel and concrete binding

Steel binding is feasible. `SteelCapacityEngineInput.demand` already consumes D1C axial, shear, moment, deflection, member, and combination identity. D1F maps a governed action effect onto those slots. It adds no steel formula and does not change D1D jurisdiction architecture.

Concrete binding is feasible. Bounded D1E member orchestration already consumes explicit section actions such as axial and major or minor moment, plus the existing shear and torsion method inputs where those methods apply. D1F maps governed effects onto those slots. Concrete validation maturity stays unchanged: engineer-validated methods remain 0, engineer-validated orchestrators remain 0, and formal conformance remains no.

Unsupported design targets are rejected. A candidate mapping cannot become authoritative by itself.

## System-to-member flow and aggregation

The flow is governed system context, governed analysis result, governed action-effect mapping, existing member check, member result, then a system-level result index.

Aggregation states are:

- `SYSTEM_EVALUATION_COMPLETE_FOR_DECLARED_SCOPE`
- `SYSTEM_EVALUATION_INCOMPLETE`
- `SYSTEM_NOT_SATISFIED`
- `SYSTEM_UNDETERMINED`

Completion of a declared scope does not claim system adequacy. An empty required member set cannot pass. A required member with no applicable deterministic method cannot pass. A missing required action effect cannot pass. A failed required member check makes the declared scope `SYSTEM_NOT_SATISFIED` and preserves the member findings.

## Connection and foundation interfaces

A connection interface distinguishes the physical joint, the analytical joint, the connection design object, member-end force transfer, and the connection result. Steel connection design, concrete joint design, base-plate design, bolt design, and weld design are not implemented.

A foundation interface can transfer support reactions, support coordinates, foundation or support identity, load-combination references, and interface assumptions. Bearing capacity, settlement, pile design, footing design, and foundation capacity design are not implemented.

## Cross-discipline seams

D1F records future seams with civil, geotechnical, mechanical, piping, electrical, and instrumentation and control. Integrated orchestration remains with D1K. D1F does not start D2–D9 and does not run cross-discipline orchestration.

## Assumptions and model-validation evidence

Assumption classes are member idealization, restraint, release, effective stiffness, rigid zone, and diaphragm. Each assumption is human-authored, governed-imported, or explicitly approved. AI cannot approve an assumption, and D1F-0 does not invent values.

Future validation evidence classes are connectivity review, support review, load review, mass review, member-property review, release review, units review, coordinate-system review, and solver-warning review. No model is validated automatically.

## Provenance, events, fingerprints, and invalidation

The provenance chain is project requirement, structural context, physical entity, analysis representation, analysis run, result, mapped action effect, design check, engineering result, and human decision.

Digital-thread event names that can later participate in the existing EOS thread are model created, topology changed, support changed, analysis rerun, result superseded, member check rerun, and design decision changed. This is not a digital-twin claim.

Fingerprints cover the structural system, physical topology, analysis model, analysis run, result set, member binding, and system evaluation. They reuse the existing canonical fingerprint helper.

Upstream change invalidates downstream use:

- support changed, analysis stale
- release changed, analysis stale
- member geometry changed, related analysis and design stale
- load combination changed, action and result mapping stale
- profile or method version changed, design result stale

Stale analysis results and stale member bindings cannot be reused. Historical result sets stay immutable. A new run supersedes; it does not replace the old result in place. Revision states are current, superseded, stale, invalidated, and archived.

Future revision comparison may be represented. AI does not accept a model change as engineering acceptance.

## Generative design, optimization, and MTO

A future generative proposal still requires deterministic analysis, governed member checks, and human judgment. A generative model cannot create governed analysis results and cannot bypass structural checks.

Optimization may later consume analysis results, member checks, MTO, cost, and carbon. D1F-0 implements no optimization engine.

System and member identities may retain a link to an existing deterministic MTO object. Cost and carbon are not calculated here.

## Later-phase boundaries

D1G owns external solver integration and must supply provider identity and version, model identity and fingerprint, analysis-run identity, analysis type, unit system, coordinate systems, load cases and combinations, run and convergence state, warnings, result-set fingerprint, action effects, result locations, and provenance.

D1H condition assessment and D1I structural digital twin are not implemented. D1M CAD or BIM intelligence and D1N concept-to-detailed orchestration are not implemented.

## Roadmap

Repository gaps support this sequence:

1. `EOS-D1F-R1-STRUCTURAL-SYSTEM-CONTEXT-TOPOLOGY` — bounded system context, physical topology, connectivity, supports, coordinates, signs, units, provenance, fingerprints, and invalidation, without analysis.
2. `EOS-D1F-R2-ANALYSIS-RESULT-CONTRACT-MEMBER-ACTION-BINDING`
3. `EOS-D1F-R3-SYSTEM-TO-MEMBER-EVALUATION-ORCHESTRATION`
4. `EOS-D1F-R4-CONNECTION-JOINT-INTERFACE-FOUNDATION`
5. `EOS-D1F-R5-FOUNDATION-SUPPORT-INTERFACE-FOUNDATION`
6. `EOS-D1F-R6-STRUCTURAL-SYSTEMS-CLOSEOUT`
7. `EOS-D1G-EXTERNAL-STRUCTURAL-SOLVER-INTEGRATION`

## Release reconciliation

The canonical structural capability manifest records `D1F.STRUCTURAL_SYSTEMS.ARCHITECTURE` as `ARCHITECTURE_DEFINED`, `NOT_VALIDATED`, and `INTENDED_PROFILE`, with release classification `INTERNAL_ENGINEERING_REFERENCE`. That is not an implemented analysis capability. No parallel manifest is created. No feature flag exposes the architecture. The deployment profile is unchanged. No migration is added.

Tenant, workspace, and project authorization remain required on structural-system identity. D1F-0 does not weaken isolation.
