# EOS-D1E-US-1 US Reinforced Concrete Standard Binding

Governed US ACI 318-type **standards context** for future EOS concrete design. This phase is family, edition, amendment/errata, building-code adoption, local amendment, direct-contract profile, project context, calculation snapshot, source precedence, material-boundary, and fail-closed selection. It does **not** implement ACI 318 member resistances, invent strength-reduction factors, infer edition, select a default building code, or claim ACI or adopted-building-code conformance.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. Product claim is `US_CONCRETE_STANDARD_PROFILE_FOUNDATION`. Implementation maturity is `STANDARD_BINDING_FRAMEWORK`. `US_CONCRETE_PACK_CERTIFIED = NO`.

## Scope

- Bind the ACI 318 family using the global D1B / D1D-US steel / D1E-EU-1 standard-governance architecture
- Keep edition, amendment, and errata explicit as `UNKNOWN_PENDING_CONFIRMATION` until independently confirmed
- Separate jurisdiction from standard, and building code from ACI concrete specification
- Record building-code adoption context without choosing a default edition
- Support direct-contract ACI profiles, including international contractual use
- Snapshot issued calculation context for historical reproducibility
- Prepare material-response, stress-block, strain-limit, strength-reduction, flexure, axial-flexure, shear, punching, torsion, serviceability, durability, detailing, and second-order **profiles**
- Reuse the D1E-1 common RC section kernel for future numerical methods

## Non-scope

Numerical ACI flexure, N-M / N-Mx-My, shear, punching, torsion, crack control, deflection, creep/shrinkage calculations, cover rules, detailing limits, development/laps, prestress, fire, seismic detailing, connections, pack certification, and general concrete FEA.

## ACI family binding

ACI 318 is a concrete design-standard family, not a US geography lock and not a building code. The global US pack already registers ACI 318 beside ASCE 7 and AISC 360; this slice binds ACI 318 for concrete without creating a parallel standard framework. Edition remains `UNKNOWN_PENDING_CONFIRMATION`. Amendment and errata states are likewise unconfirmed. Silent edition inference is forbidden.

## Edition / amendment / errata model

Standard identity, amendment, and errata are first-class and remain unknown until a governed source confirms them. An unknown edition can describe an intended profile. It cannot support an affirmative ACI conformance claim. A later catalog update must not mutate an issued calculation snapshot.

## Jurisdiction vs standard

US geography, UI location, tenant address, IP, or locale must not automatically select ACI edition, building-code edition, local amendment, or load-standard edition. Jurisdiction profile and ACI identity remain separate.

## Building code vs ACI

A building code (for example an IBC-family adoption profile) is not an ACI concrete specification. Future valid ACI member design must not automatically equal adopted-building-code compliance. Direct-contract ACI use also does not imply statutory US building-code compliance.

## Building-code adoption context

Adoption records preserve adopting jurisdiction/authority, building-code family, edition, effective date where known, referenced concrete standard and edition, local amendments, source authority, version, provenance, and validation state. There is **no default** building-code edition. The adoption resolver is deterministic and does not query model memory for engineering authority.

Unresolved conflicts fail closed: building-code edition mismatch, ACI referenced-edition mismatch, effective-date conflict, local-amendment conflict, and project-override conflict.

## Direct-contract profiles and international ACI use

Projects may contractually specify an ACI concrete profile without relying on local US building-code adoption. ACI-profile design is not hardcoded to US geography. A project outside the United States may use a contractual ACI profile without asserting US statutory compliance.

## Local amendments

Every amendment preserves identity, authority, base building-code family, base edition, affected standard/profile, scope, effective period where known, version, provenance, and validation state. The governed catalog is empty: **no values are populated or guessed**. Location alone cannot create amendment values. An amendment tied to the wrong base-code edition fails closed.

## Project standard context and calculation snapshot

`UsConcreteProjectStandardContext` records project, jurisdiction, building-code context, ACI family/edition/amendment/errata, load-standard and seismic-standard dependencies, material/reinforcement product standards, local amendments, direct-contract profile, durability/serviceability refs, overrides, authority, provenance, validation, and conformance. Every issued evaluation snapshots its resolved calculation context; that snapshot is immutable. Standard-rule versions are not rewritten in place when a new ACI or building-code edition is later bound.

## Source precedence and overrides

Deterministic precedence is: building-code adoption, ACI standard profile, local amendment, project requirement, client requirement, engineering design criteria, validated project override. Conflicts are not resolved silently. Project overrides must preserve base standard, edition, building-code context, local-amendment context, authority, scope, reason, reviewer, and version.

## Load-standard and seismic-standard dependencies

Referenced structural load standards (for example ASCE 7) are modeled separately from ACI. Load-standard edition is not inferred. D1C remains the common action/demand layer; this slice does not create US concrete load combinations. A future seismic-standard dependency slot exists and is unimplemented. Seismic concrete design is not claimed.

## Material / design-standard separation

ACI design standard, concrete material/product standards, and reinforcement material/product standards remain separate. Grade/designation does not synthesize properties. US material and reinforcement catalogue adapters are ready and unpopulated. There is no default product table.

## D1E-1 kernel reuse

Section geometry, reinforcement geometry, geometric clearance, fingerprints, bar containment, section properties, plane-section kinematics, section integration, and the equilibrium solver are reused from D1E-1. No parallel US geometry, integrator, or neutral-axis solver is created. Geometric clearance is not ACI cover compliance. No ACI cover requirement is implemented in US-1.

## Material-response, stress-block, strain, and strength-reduction dependencies

The US adapter exposes governed-dependency slots for compression response, explicit tension treatment, reinforcement response, strain limits, stress-block coefficients, and strength-reduction factors. Values remain unpopulated. Factor architecture may later depend on limit state, strain state, member type, design condition, standard edition, and seismic/design context. ACI strength-reduction semantics stay in the US adapter; the global concrete safety-factor model remains jurisdiction-neutral. Steel LRFD/ASD semantics are not inherited.

## Future method profiles

Uniaxial flexure, axial-flexure (N-M / N-Mx-My), shear, punching, torsion, serviceability (deflection/cracking/stress/long-term), time-dependent (no default creep/shrinkage model), durability (no default exposure class), cover, detailing, development/anchorage, second-order member stability (not steel stability rules), and prestress extensibility are profile-ready. None are numerical in this phase. Fire, seismic, connection, and general FEA design remain unimplemented.

## AI boundary

AI may identify missing standard context, adoption conflict, missing local amendment, missing material source, explain code dependencies, and suggest questions for an engineer. AI may not choose ACI edition or building-code edition, invent adoption or local amendment, choose load-standard edition, invent strength-reduction factor, stress-block coefficient, or strain limit, originate code capacity, claim ACI or building-code compliance, or approve design. Inverse-design and optimizer candidates must bind this standard context and pass deterministic D1E-1 plus applicable US checks; `CHECK_UNDETERMINED` is not design-valid. Generative models cannot silently change ACI edition, building-code profile, local amendment set, or load-standard profile unless an engineer explicitly defines those as scenario dimensions.

## Inverse design, optimization, and MTO

Candidates must bind explicit US concrete context before code evaluation. Quantity handoff reuses D1E-1. No default US cost or carbon factors are added.

## Validation, conformance, and debt

Intended profile is not conformance. Unknown edition prevents an affirmative ACI conformance claim. Human confirmation covers ACI edition, amendment/errata, building-code adoption, referenced standard profile, local amendments, load-standard context, material-standard context, and project overrides. US-specific validation debt tracks edition, amendment/errata, building-code adoption, load-standard contexts, local amendments, materials, strength-reduction factors, stress blocks, strain limits, flexure through seismic/fire, and third-party comparison.

## Three-jurisdiction concrete architecture

AU, EU, and US now share one common RC section kernel, one common concrete domain model, one validation architecture, and one capability manifest, with jurisdiction-specific authority adapters. AU and EU concrete parameters must not leak into US, and US parameters must not leak into AU, EU, or the common kernel.

## Next D1E phase

D1E-US-2 closed bounded ACI-profile uniaxial flexure on this standard-binding foundation. Canonical remaining D1E work is **D1E architecture closeout**; no further generic concrete framework phase. No copyrighted ACI 318, building-code, load-standard, or material-standard text is required at runtime or committed here.
