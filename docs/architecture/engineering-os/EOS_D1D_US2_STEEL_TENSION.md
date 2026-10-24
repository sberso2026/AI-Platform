# EOS-D1D-US-2 US Steel Tension

Bounded AISC-profile **tension member** capability. Jurisdiction-neutral mechanics (`force = stress × area`) are reused from the common steel core. AISC-profile LRFD design strength, ASD allowable strength, φ / Ω factors, shear-lag / effective-net-area, and hole-deduction rules are **not** guessed and remain `VALIDATION_REQUIRED` / `FRAMEWORK_ONLY`.

`US_STEEL_PACK_CERTIFIED = NO`. `US_STEEL_DESIGN_AVAILABLE = NO`. `US_STEEL_IMPLEMENTATION_MATURITY = FRAMEWORK_PLUS_BOUNDED_METHODS`. Standard conformance remains `INTENDED_PROFILE`. Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`. AISC edition remains `UNKNOWN_PENDING_CONFIRMATION`.

## Scope

Implemented numerical methods (mechanics references, independently hand-benchmarked):

- `US_TENSION_GROSS_YIELD_MECHANICS` — Fy × Ag
- `US_TENSION_NET_FRACTURE_MECHANICS` — Fu × An

Registered, not implemented (fail closed / `CHECK_UNDETERMINED`):

- LRFD gross-yield and net-fracture design strength (φ unpopulated)
- ASD gross-yield and net-fracture allowable strength (Ω unpopulated)
- Effective-net-area / shear-lag (U unpopulated)
- Hole-deduction synthesis
- Block shear, connection tension, seismic tension, fatigue

US-3 (compression / member stability) is out of scope.

## US standard context

Every US tension evaluation reuses US-1 binding: jurisdiction profile, building-code adoption or **direct-contract** AISC profile, AISC family, edition/errata (or `UNKNOWN_PENDING_CONFIRMATION`), explicit **LRFD or ASD**, independent unit system (`US_CUSTOMARY` or `SI`), load-standard dependency, local-amendment context, project/calculation context, and method version. Edition, design method, and jurisdiction are never inferred from user location or model knowledge. Unknown edition cannot claim `CONFORMANCE_VALIDATED`.

A direct-contract AISC profile may be used outside US geography. It is not building-code compliance.

## LRFD / ASD and units

Design method is explicit and is not a unit system. Common mechanics are shared across LRFD and ASD; physics is not duplicated. Silent LRFD↔ASD conversion is forbidden. Each code-profile method binds to LRFD, ASD, or genuinely common `BOTH`. LRFD factors cannot be used in ASD and vice versa.

Load-basis compatibility is enforced: a governed STRENGTH demand basis is incompatible with ASD, and a governed ALLOWABLE demand basis is incompatible with LRFD. Unknown load basis does not invent combinations; D1C remains the demand engine.

## Common mechanics reuse

AU and EU tension were reviewed. Stress×area conversion is jurisdiction-neutral and lives in `structural-steel/mechanics`. AU method IDs, AS 4100 φNt, Eurocode γM, National Annex, and NDP values are not reused as AISC authority. Identical physical inputs produce the same mechanics output in AU, EU, and US adapters; code-profile labels remain adapter-specific. Mechanics results are `ENGINEERING_MECHANICS_REFERENCE` and are not AISC design strength or AISC nominal strength unless a future governed method establishes that equivalence.

## Gross / net / effective area

Gross and net areas must be governed properties with units and provenance. Missing values fail closed. Net area is never silently set equal to gross area. Hole dimensions, clearance, stagger, and path rules are not invented. Effective net area / shear-lag is a framework only; U is never guessed.

AUST300 is not a US default. EU catalogues are not a US default. A US section catalogue is optional; explicit engineer-supplied properties are acceptable.

## Material provenance

Fy and Fu must be governed. AISC is not assumed to be the material-property source. ASTM, manufacturer catalogs, project specifications, and approved databases remain allowed future sources. Strength is not inferred from a grade designation alone.

## Factors

Any future LRFD φ or ASD Ω must have explicit source, edition applicability, limit-state applicability, method version, and validation state. US-2 does not populate these values. Unknown factor → fail closed / `CHECK_UNDETERMINED`.

## Validation and conformance

Numerical validation of mechanics: `BENCHMARKED` against independent hand calculations (not self-referential). An LRFD benchmark would not validate ASD, and a common-mechanics benchmark is not AISC conformance. Engineering validation: **required**. Standard conformance: `INTENDED_PROFILE`.

Utilization of mechanics is not labelled as an AISC code check. `CHECK_SATISFIED` is not engineering, construction, IFC, or building-code approval.

## AI boundary

AI may identify missing inputs, missing design method, load/method mismatch, missing edition, or missing hole/effective-area data, and may explain a deterministic result. AI may not select LRFD/ASD, invent φ / Ω / U / hole deduction / net area / material strength / AISC equations, originate code strength, claim AISC or building-code compliance, or approve design.

## US-3 dependency

Compression / member stability must reuse this tension bind, D1C demand handoff, explicit LRFD/ASD, and fail-closed factor pattern. Do not invent AISC buckling curves or φc / Ωc in US-2.
