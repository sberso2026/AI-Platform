# EOS-D1E-0 Concrete Design Foundation

Global, jurisdiction-neutral foundation for concrete design. Architecture, domain, and contracts only. This phase does **not** implement AS 3600, EN 1992, or ACI 318 design-code equations.

Canonical D1 roadmap scope remains **D1E Concrete Design Capability**. D1D frozen contracts are preserved. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Mission

Establish reusable contracts for concrete elements, materials, reinforcement, sections, cover, durability, actions, section analysis, limit states, strength-result semantics, serviceability, detailing, provenance, validation, conformance, human review, and optimization. Prepare AU / EU / US adapters without hard-coding editions or rules into the common core.

## Scope

- Common concrete object model on D1A
- Governed concrete and reinforcement materials
- Explicit reinforcement layout and deterministic geometry aggregation
- Cover and durability context without default numeric limits
- D1C demand reuse
- Jurisdiction-neutral limit-state taxonomy and section-analysis interfaces
- Flexure, axial-flexure, shear, punching, torsion, serviceability, cracking, time-dependent, second-order, development, lap, and detailing **frameworks**
- AU AS 3600-family, EU EN 1992-family, and US ACI 318-family adapters in `FRAMEWORK_ONLY`
- Capability-manifest extension of the D1D structural manifest
- Fail-closed orchestration and optimization recheck contracts

## Non-scope

No invented stress-block parameters, phi/partial/strength-reduction factors, reinforcement ratios, crack-width or deflection limits, cover requirements, development or lap lengths, shear or punching equations, creep/shrinkage models, or exposure classes in the common core. No general nonlinear concrete FEA, prestressed design, composite design, connection design, seismic detailing, fire design, geotechnical capacity, engineering approval, or concrete certification.

## Global concrete architecture

```
COMMON STRUCTURAL DOMAIN
        ↓
COMMON CONCRETE OBJECT MODEL
        ↓
JURISDICTION-NEUTRAL GEOMETRY / MECHANICS
        ↓
CONCRETE STANDARD ADAPTERS
        ↓
CODE-SPECIFIC DESIGN RULES
        ↓
MEMBER / ELEMENT ORCHESTRATION
        ↓
VALIDATION / CONFORMANCE
        ↓
HUMAN ENGINEERING REVIEW
```

One global core. `PARALLEL_AU/EU/US_CONCRETE_CORE_CREATED = NO`.

## Domain objects

Concrete-specific objects (`ConcreteElement`, `ConcreteMember`, `ConcreteSection`, `ConcreteMaterial`, `ReinforcementMaterial`, `ReinforcementBar` / `Group` / `Layer` / `Layout`, `ConcreteCover`, `ConcreteDesignContext`, `ConcreteActionSet`, `ConcreteDesignCheck`, `ConcreteCapacityResult`, `ConcreteServiceabilityResult`, `ConcreteDetailingRequirement`, `ConcreteValidationState`) reference D1A identities. They do not duplicate Core/D1A ownership.

## Element dimensionality

Types BEAM, COLUMN, SLAB, WALL, PEDESTAL, PILE, FOOTING, MAT_RAFT, OTHER_CONCRETE_ELEMENT are classified as `MEMBER_1D`, `AREA_2D`, or `SOLID_3D`. Object existence is not numerical support. `GENERAL_CONCRETE_FEA_CLAIMED = NO`. D1E-0 prepares primarily for reinforced-concrete member/section design.

## Concrete materials

Governed properties (compressive/tensile strength, modulus, density, Poisson ratio, age, reference age) require value, units, provenance, and source authority. A grade/designation does **not** synthesize properties.

Design standard, concrete product/material standard, and reinforcement product standard remain separate.

## Reinforcement materials and layout

Governed yield/ultimate/modulus and product-standard references. Bars have identifier, size, explicit area, count, coordinates, layer, face, direction, spacing, group, material, anchorage/lap metadata, and provenance. Ungoverned designation does not generate area.

Common geometry mechanics sum bar/group/layer/total area and area-weighted centroid. No code min/max reinforcement-ratio rules.

Transverse reinforcement (type, legs, size/area, spacing, orientation, zone, material, provenance) is represented without shear-capacity formulas.

## Cover and durability

Cover is explicit (nominal and modelled, face, group, source, governing context, provenance). No default minimum cover. Durability context holds environment, design life, material/cover/crack-control dependencies, source, and project requirements. Jurisdiction exposure classes are **not** in the common core. Design life does not infer durability rules.

## Section geometry

RECTANGULAR, CIRCULAR, T_SECTION, L_SECTION, FLANGED, POLYGONAL, GENERIC_PROFILE with explicit geometry. Voids/openings/ducts/embedded regions are modelled with `numericalDesignSupported = false`.

## Action model

D1C demand is reused. No parallel concrete demand engine. Checks preserve member/element, load case/combination, analysis revision, value, units, sign convention, and provenance.

## Limit states and strength-result semantics

Taxonomy: FLEXURE, AXIAL_COMPRESSION, AXIAL_TENSION, AXIAL_FLEXURE, BIAXIAL_AXIAL_FLEXURE, SHEAR, TORSION, PUNCHING_SHEAR, BEARING, CRACK_CONTROL, DEFLECTION, SECOND_ORDER_STABILITY, DURABILITY, ANCHORAGE, DEVELOPMENT, LAP_SPLICE, DETAILING, OTHER_SERVICEABILITY.

Result classes: MECHANICS_REFERENCE, NOMINAL_CAPACITY, CODE_DESIGN_CAPACITY, CODE_ALLOWABLE_CAPACITY, SERVICEABILITY_RESULT. The common core does not assume phi-only, gamma-only, LRFD-only, or ASD-only safety-factor semantics.

## Material-response and section compatibility

Interfaces exist for future concrete compression/tension response, reinforcement stress-strain, and prestressing extension. No global code stress block. Future section analysis requires strain compatibility plus force and moment equilibrium. Neutral-axis search/residual/resultants are a deterministic contract, not code design until constitutive/code rules are governed. Layered, fiber, and discrete integration are extensible without a nonlinear FE solver.

## Flexure, axial-flexure, interaction surfaces

Frameworks record required dependencies. `NUMERICAL_CONCRETE_CODE_FLEXURE_IMPLEMENTED = NO`. No universal interaction equation. Future P-M and biaxial P-M-M surfaces must be generated from governed section analysis, not a universal linear relationship.

## Shear, punching, torsion

Frameworks and transverse-reinforcement representation only. No code shear, punching, or torsion equations. Punching does not assume critical perimeter, effective depth, column-face definition, or shear-stress rule.

## Serviceability, cracking, time-dependent behavior

Common SLS contract for future deflection, cracking, crack width, stress limits, vibration, camber, and long-term deformation. D1C elastic deflection may be reused where valid; it is **not** cracked RC, creep, shrinkage, long-term, or tension-stiffening deflection. Crack-control framework exists without code crack-width equations. Creep/shrinkage/age-dependent interfaces exist with **no default models**.

## Second-order / column stability

RC slenderness/stability framework is separate from steel column rules. `STEEL_STABILITY_RULE_REUSED_FOR_CONCRETE = NO`.

## Detailing, development, anchorage, laps

Detailing is a governed check category, not capacity. Capacity does not equal detailing compliance. Development/anchorage/hooks/headed bars/mechanical anchorage and lap-splice architectures exist without numeric code lengths. Constructability metadata (congestion, layers, spacing, cover, placement) does not auto-approve.

## MTO and carbon

Deterministic geometry quantities only: volume, reinforcement mass/length/count, formwork-area metadata. No fabricated rates/cost. Carbon handoff has quantity/provenance hooks and **no default emission factors**.

## Prestressed, composite, precast, construction stages

Extension points for pretensioned/post-tensioned/unbonded/bonded. Prestressed design is not implemented. Steel-concrete composite, precast composite, and composite slabs are not ordinary RC. CAST_IN_SITU / PRECAST metadata exists; lifting/transport/temporary-state design does not. Construction-stage context exists; stage analysis does not.

## AU / EU / US adapter readiness

- AU: AS 3600-type family; edition `UNKNOWN_PENDING_CONFIRMATION`
- EU: EN 1992 family/part/generation/National Annex/NDP architecture; no default annex; edition unknown
- US: ACI 318-type family plus building-code adoption/local amendment/direct-contract architecture; edition unknown

Adapters are `ready: true`, `implemented: false`. Missing edition, annex (when required), material, reinforcement geometry, cover where required, standard context, code rule, serviceability criterion, detailing rule, durability context, unvalidated method, or stale result fails closed to `CHECK_UNDETERMINED`.

## Validation and conformance

Reuses D1D dimensions: implementation maturity, numerical validation, engineering validation, standard conformance, product release, software certification, project approval. Intended profile ≠ conformance validated. D1E-0 claims neither. Engineering-rule authority is reused; LLM_MEMORY_ONLY / unsourced web / unverified generated rules are rejected.

## AI boundary

AI may identify intent, classify element type, list missing inputs, suggest candidate dimensions/reinforcement concepts, explain deterministic results, identify likely checks, and generate optimization candidates. AI may not invent strength, stress-block coefficients, code factors, reinforcement limits, cover, crack-width limits, development length, shear capacity, originate code-compliant capacity, claim conformance, or approve design.

## Optimization and inverse-design compatibility

Candidates (dimensions, depth, reinforcement amount/layout, grade, bar configuration) require deterministic governed recheck. `CHECK_UNDETERMINED` is not design-valid. Inverse-design pipeline: requirements → candidate geometry/reinforcement → deterministic engine → code checks → MTO/cost/carbon → Pareto → engineer selection. Generative models have no engineering authority and are not implemented here.

## Unsupported scope

General slab/shell/solid FEA; nonlinear cracked-section or material-nonlinear FEA; plastic hinges; strut-and-tie / deep-beam / D-region numerical design; connections/joints/anchors; soil bearing/settlement/pile capacity/SSI; fire design; seismic concrete detailing; prestressed design; copyrighted standards text at runtime.

## Validation debt

`D1E_VALIDATION_DEBT_REGISTER` records standard editions, material/reinforcement authority, section analysis, stress-block, flexure, axial-flexure, biaxial interaction, shear, torsion, punching, second-order, cracking, deflection, creep, shrinkage, cover, durability, development, anchorage, laps, detailing, slabs, walls, footings, prestressed, connections, seismic, fire, external-tool comparison, and human validation.

## Risk status

D1E-0 closes **NONE**. Reduced: D0-R01 (adapter architecture exists; standards implementation remains open). Introduced: **NONE**. Remaining canonical set: D0-R01, D0-R04, D0-R05, D0-R07, D0-R08, D0-R10, D0-R11, D0-R12.

## D1E internal roadmap

Consistent with canonical D1 (adapter architecture + first bounded AU 3600 slice; EN/ACI stubs):

0. D1E-0 this foundation
1. **D1E-1** common RC section mechanics / deterministic geometry foundation
2. D1E-AU first bounded AS 3600 slice
3. D1E-EU EN 1992 bind then bounded methods
4. D1E-US ACI 318 bind then bounded methods

`CONCRETE_IMPLEMENTATION_MATURITY = FRAMEWORK_ONLY`. `CONCRETE_STANDARD_CONFORMANCE_STATE = INTENDED_PROFILE`. Product gating distinguishes FRAMEWORK / MECHANICS_REFERENCE / CODE_PROFILE_IMPLEMENTED / VALIDATED / CONFORMANCE_VALIDATED / CERTIFIED. D1E-0 does not expose code-certified concrete design.
