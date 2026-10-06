# EOS-D1E-EU-1 Eurocode Concrete Standard Binding

Governed Eurocode reinforced-concrete **standards context** for future EOS concrete design. This phase is family, generation, edition, part, National Annex, NDP, project context, calculation snapshot, source precedence, material-boundary, and fail-closed selection. It does **not** implement EN 1992 member resistances, invent Nationally Determined Parameters, infer edition, select a default annex, or claim Eurocode conformance.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. Product claim is `EU_CONCRETE_STANDARD_PROFILE_FOUNDATION`. Implementation maturity is `STANDARD_BINDING_FRAMEWORK`. `EU_CONCRETE_PACK_CERTIFIED = NO`.

## Scope

- Bind the EN 1992 family using the global D1B / Eurocode standard architecture already proven by structural steel
- Register EN 1992 parts with explicit identifiers; initial general design part is EN 1992-1-1
- Govern National Annex and NDP identity without populating values
- Snapshot issued calculation context for historical reproducibility
- Prepare material-response, stress-block, strain-limit, partial-factor, flexure, axial-flexure, shear, punching, serviceability, durability, detailing, and second-order **profiles**
- Reuse the D1E-1 common RC section kernel for future numerical methods

## Non-scope

Numerical EN 1992 flexure, N-M / N-Mx-My, shear, punching, torsion, crack control, deflection, creep/shrinkage calculations, cover rules, detailing limits, development/laps, prestress, fire, seismic detailing, connections, and pack certification.

## EN 1992 family

EN 1992 is a Eurocode family, not EU membership. The global Eurocode family catalog already registers EN 1990–EN 1999; this slice binds EN 1992 for concrete without creating a parallel standard framework. Edition remains `UNKNOWN_PENDING_CONFIRMATION`. Amendment state is likewise unconfirmed. Silent edition inference is forbidden.

## Generation / edition model

Generation families (`FIRST_GENERATION`, `SECOND_GENERATION`, `UNKNOWN_PENDING_CONFIRMATION`) are explicit. Cross-generation mixing fails closed. A later catalog update must not mutate an issued calculation snapshot.

## Part model

EN 1992 is not one indivisible rule set. Registered parts include EN 1992-1-1 (general buildings — architecture), 1-2 (fire), 2 (bridges), 3 (containment), and 4 (fastenings). Listing a part does not implement it. Future numerical methods must declare the part(s) they depend on and cannot silently take a parameter from an unrelated part.

## National Annex

A National Annex is first-class metadata: identity, country/profile, family, part, edition compatibility, authority, effective period where known, version, provenance, and validation state. It is separate from family, part, edition, jurisdiction, and project location.

There is **no default** Germany, France, UK, Ireland, Netherlands, Belgium, or any other annex. User or project UI location is contextual evidence only and is never automatic engineering authority.

## NDP

NDP records preserve parameter identity, part, generation, annex, value, units, source authority, version, provenance, and validation state. The governed catalog is empty: **no values are populated or guessed**. Missing required NDP yields `CHECK_UNDETERMINED` / `STANDARD_CONTEXT_INCOMPLETE`. An NDP from one generation/edition cannot silently enter another.

## Multi-country, UK, and international use

Multiple Eurocode concrete profiles may coexist across projects in one workspace. There is no globally selected National Annex. UK Eurocode use is extensible via the `united-kingdom` jurisdiction profile plus an explicit GB annex, without treating UK as an EU member-state. Projects outside Europe may use a contractual EN 1992 profile without asserting EU jurisdiction or local statutory compliance.

## Project standard context and calculation snapshot

`EurocodeConcreteProjectContext` records project, jurisdiction, generation, edition, amendment, parts, annex, NDP set, material/reinforcement product standards, load/durability/serviceability context refs, overrides, authority, provenance, validation, and conformance. Every issued evaluation snapshots its resolved calculation context; that snapshot is immutable.

## Source precedence and overrides

Deterministic precedence is: EN 1992 base standard, National Annex, project requirement, client requirement, engineering design criteria, validated project override. Conflicts are not resolved silently. Project overrides must preserve base standard, part, edition, annex/NDP context, authority, scope, reason, reviewer, and version.

## Material / design-standard separation

Concrete design standard, concrete material/product standard, and reinforcing-steel product standard remain separate. Grade/designation does not synthesize properties. EU material and reinforcement catalogue adapters are ready and unpopulated. There is no default national reinforcement catalog.

## D1E-1 kernel reuse

Section geometry, reinforcement geometry, geometric clearance, fingerprints, bar containment, section properties, plane-section kinematics, section integration, and the equilibrium solver are reused from D1E-1. No parallel EU geometry, integrator, or neutral-axis solver is created. Geometric clearance is not EN 1992 cover compliance. No Eurocode cover requirement is implemented in EU-1.

## Material-response, stress-block, strain, and partial-factor dependencies

The EU adapter exposes governed-dependency slots for compression response, explicit tension treatment, reinforcement response, strain limits, stress-block coefficients, and partial factors (including annex/NDP-variable parameters). Values remain unpopulated. Eurocode partial-factor semantics stay in the EU adapter; the global concrete safety-factor model remains jurisdiction-neutral.

## Future method profiles

Uniaxial flexure, axial-flexure (N-M / N-Mx-My), shear, punching, serviceability (crack/deflection/stress/long-term), time-dependent (no default creep/shrinkage model), durability, cover, detailing, development/anchorage, second-order member stability (not steel stability rules), and prestress extensibility are profile-ready. None are numerical in this phase. Fire, seismic, and connection design remain unimplemented.

## AI boundary

AI may identify missing annex/NDP, conflicting profiles, and questions for an engineer. AI may not select edition or annex, invent NDP/partial factor/stress block/strain limit, originate capacity, claim conformance, or approve design. Inverse-design and optimizer candidates must bind this standard context and pass deterministic D1E-1 plus applicable EU checks; `CHECK_UNDETERMINED` is not design-valid. Generative models cannot select annex or NDP.

## Inverse design, optimization, and MTO

Candidates must bind explicit Eurocode concrete context before code evaluation. Quantity handoff reuses D1E-1. No default EU cost or carbon factors are added.

## Validation, conformance, and debt

Intended profile is not conformance. Unknown edition prevents an affirmative EN 1992 conformance claim. Human confirmation covers generation, edition, part, National Annex, NDP set, material standards, and project overrides. EU-specific validation debt tracks generation, edition, parts, annexes, NDPs, materials, partial factors, stress blocks, strain limits, flexure through seismic, and third-party comparison.

## Next D1E-EU phase

Canonical remaining D1E-EU work is **bounded Eurocode RC uniaxial flexure** using the D1E-1 kernel and this governed EN 1992 standard context. No copyrighted EN 1992 or National Annex text is required at runtime or committed here.
