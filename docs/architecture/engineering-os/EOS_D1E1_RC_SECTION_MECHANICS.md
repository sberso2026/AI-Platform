# EOS-D1E-1 — Reinforced-concrete section mechanics foundation

Jurisdiction-neutral geometry, kinematics, and bounded linear-elastic section infrastructure. Not AS 3600 capacity, Eurocode 2 resistance, or ACI 318 strength.

## Mission / scope

D1E-1 implements the common RC section kernel that future AU / EU / US adapters consume:

- explicit local coordinates, sign conventions, and unit safety
- deterministic section geometry (rectangle, circle, T/flanged, L/asymmetric, polygon, voids, multi-region composition)
- gross and principal section properties with provenance
- reinforcement geometry, containment, geometric clearance, and bar-to-bar spacing
- plane-section strain kinematics and bar strain without bond-slip
- governed generic material-response contract plus bounded linear-elastic references
- deterministic Cartesian-cell discretization and generic resultant integration
- equilibrium residual and a bounded Newton solver that never labels resultants as code capacity

## Non-scope

No national concrete-code equations; no stress-block parameters; no ultimate strains; no φ/γ/strength-reduction factors; no min/max reinforcement; no shear/punching/torsion/crack-width/development/lap/cover rules; no default creep/shrinkage; no prestress, construction-stage, connection, seismic, fire, or general FEA claims.

## Coordinate system and signs

Local section axes: origin recorded explicitly; `+x` right; `+y` up; length unit `mm`.

Kinematics: `ε(x,y) = ε0 − φx (y − y0) − φy (x − x0)`.

- `ε0` positive = longitudinal tension
- `φx` positive produces compression at `+y`
- `φy` positive produces compression at `+x`
- `N` positive = tension
- `Mx`, `My` are energy-conjugates of `φx`, `φy`

Silent mixing of mm/m, MPa/Pa, N/kN, or N·mm/kN·m is forbidden. Explicit conversion helpers only.

## Section geometry

Regions are rectangles, circles (exact π formulas), or polygons (shoelace / Green second moments). T and flanged sections are composed rectangles. L and generic polygons support asymmetry. Voids are subtracted after containment and overlap validation. Self-intersecting, zero-area, non-finite, or degenerate polygons fail closed. Overlapping solids or voids fail closed.

`ConcreteSectionGeometryProperties` records gross area, centroid, `Ix`/`Iy`/`Ixy`, principal moments and orientation, geometry version, units, derivation method, implementation version, and provenance. Result authority is `GEOMETRY_RESULT`.

## Reinforcement geometry

D1E-0 bar/group/layer models are reused. Area is explicit/governed; ungoverned designation does not synthesize area. Kernel computes bar count, steel area, group/layer centroids, geometric second moments, bar-to-bar clear distance, and geometric surface clearance. Clearance is not AS 3600 / EN 1992 / ACI cover compliance. No default minimum cover. Bars outside concrete, inside voids, or crossing an invalid boundary fail closed.

Reinforcement displacement treatment is an explicit input: `CONCRETE_GROSS_SEPARATE`, `SUBTRACT_REINFORCEMENT_AREA`, or `OTHER_GOVERNED_TREATMENT`. There is no hidden code default.

## Fingerprint / invalidation

SHA-256 of canonical geometry, layout, material refs, unit context, and displacement treatment. Geometry or reinforcement changes alter the fingerprint and invalidate dependent results.

## Material response

The D1E-0 material-response interface is reused. Models must declare `modelId`, authority type (`ESTABLISHED_ENGINEERING_MECHANICS` for this kernel), technical basis, applicability, required properties, version, and validation state. LLM-generated material laws are forbidden. No global code stress block.

Bounded linear-elastic concrete and reinforcement references exist only when `E` / `Es` are explicitly governed. Grade does not synthesize `E`. Tension treatment is explicit (`ELASTIC_TENSION` / `NO_TENSION` / `OTHER_GOVERNED`). Crack state is `UNCRACKED_REFERENCE` or `CRACK_STATE_NOT_EVALUATED`. No default cracking, ultimate concrete strain, or reinforcement strain limit. Elastic reference is not code capacity and excludes cracking, tension stiffening, creep, shrinkage, nonlinear concrete, yield, stress blocks, and ultimate strength. Modular ratio is `Es/Ec` from governed moduli only.

## Discretization and integration

Cartesian cells on the bounding box, centers classified by point-in-section. Same geometry, resolution, and algorithm version reproduce the same mesh. Area, centroid, and second-moment conservation are checked against analytic geometry inside declared tolerances (`RC_NUMERICAL_TOLERANCE`). The generic integrator combines concrete cells and bar points with a strain field and governed responses to produce `N`, `Mx`, `My` as `MECHANICS_REFERENCE` / `ELASTIC_REFERENCE` resultants with full provenance. Never `CODE_DESIGN_CAPACITY`.

## Equilibrium and neutral axis

D1E-0 equilibrium contract is reused. Residuals are `rN`, `rMx`, `rMy`. A bounded Newton–Raphson solver may recover a strain state for governed elastic responses. Non-convergence returns `NOT_CONVERGED` / `CHECK_UNDETERMINED`; the last iterate is not accepted as capacity. Neutral-axis geometry may be derived from a strain state and is not a code-capacity condition.

## D1C and adapter handoff

D1C supplies `N`/`Mx` (and `My` when present). This is not a second analysis engine and is not general slab/wall/solid analysis. Flexure and axial-flexure adapters later supply constitutive rules, stress blocks, factors, strain limits, and detailing without modifying this kernel. AU / EU / US editions remain `UNKNOWN_PENDING_CONFIRMATION`. No National Annex default. Design standard remains separate from material/product standards.

## Inverse design, optimization, MTO

Generative candidates must pass deterministic geometry/containment/unit/material screening. AI cannot override the kernel or invent numerical results. Optimization handoff exposes area, centroid, moments, reinforcement geometry, clearance, material refs, volume hooks, fingerprint, and validation state. MTO exposes cross-section area, reinforcement area, bar count, and length/volume only when member geometry supplies them. No emission factors.

## AI / human review

AI may propose geometry, identify invalid inputs, and explain deterministic results. AI may not invent `E`, stress, capacity, cover, or conformance, and may not approve design. Section mechanics is not engineering approval.

## Validation debt and next phase

D1E-1 reduces geometry/kinematics/elastic-integration debt to partial. Remaining: code material models, stress blocks, flexural and axial-flexural capacity, biaxial interaction, shear, punching, torsion, crack control, long-term behavior, stability, durability, cover compliance, detailing, anchorage, laps, and jurisdiction conformance.

Canonical D1E internal roadmap after this phase: **D1E-AU** first bounded AS 3600 slice after common section mechanics, then D1E-EU / D1E-US.

D1E-1 does not claim standard conformance. Product claim: `DETERMINISTIC_RC_SECTION_GEOMETRY_AND_MECHANICS_FOUNDATION`.
