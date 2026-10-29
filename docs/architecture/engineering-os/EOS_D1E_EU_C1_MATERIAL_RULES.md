# EOS-D1E-EU-C1 Eurocode Concrete Material / Design Rule Pack

C1 inherits C1B policy: licensed standard files are not an implementation gate; copyrighted standard text is not reproduced; formal EN 1992 conformance remains unclaimed.

`EU_CONCRETE_PRODUCT_CLAIM_LEVEL` remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Conformance remains `INTENDED_PROFILE`. Pack remains uncertified. Flexure methods remain `NONE`.

## Implemented rule IDs

Exactly the C1B implementation-ready subset:

- `EU_C1_CONCRETE_CHAR_PROPERTIES`
- `EU_C1_REINFORCEMENT_CHAR_PROPERTIES`
- `EU_C1_CONCRETE_TENSION_TREATMENT`

No additional rule was invented. Characteristic values are calculation inputs, not pack constants. The only pack constant is the provenanced boolean `concreteTensionIncludedInUlsFlexure = false`.

## Authority and triangulation

Authority type: `ESTABLISHED_ENGINEERING_MECHANICS`.

Primary source: D1E-1 fail-closed material contracts (`requireConcreteMaterialProperties`, `requireReinforcementMaterialProperties`, explicit-null ULS tension treatment).

Corroboration: governed-property types, D1E-1 tests, EU-1 unpopulated constitutive slots. LLM memory is not an authority.

## Formula fingerprints and parameter provenance

Executable operations are hashed with the C1B FNV-1a fingerprint. Silent formula drift fails closed. Every runtime parameter keeps id, value or value-mode, units, authority, source, applicability, version, and validation status. SI prefix conversions (Pa/GPa/m2) are explicit; MPa/mm2 are not assumed.

## Applicability, Annex/NDP, units

Applicability is EN 1992 / `EN_1992_1_1` intended profile, ULS/SLS material input or ULS flexure tension omission. Generation/edition/amendment remain `UNKNOWN_PENDING_CONFIRMATION` and are not inferred. These three rules are evidence-classified as independent of National Annex. No default annex. Location does not infer an annex. NDP values are not guessed.

Unsupported family/part, invented tension, missing units, NaN/Infinity, invalid signs, or missing provenance return `UNSUPPORTED_SCOPE` or `CHECK_UNDETERMINED`.

## Golden-case validation and tolerances

Independent golden files do not import production evaluators. Coverage per rule: normal, second independent value, boundary, unit-converted equivalent, invalid input, out-of-applicability. Identity cases require exact match. Converted cases use abs `1e-9` / rel `1e-12`.

Maturity per implemented rule: `NUMERICALLY_VALIDATED`. Engineer validation: pending. Conformance validation: not claimed.

## C2 readiness

`EU_C1_RULE_PACK_READY_FOR_FLEXURE = NO`. C2 must consume this pack through `consumeEuC1RulePack` and must not inline partial factors, strain limits, stress-block constants, or duplicated material formulas.

Exact missing C2 rule IDs:

- `EU_C1_CONCRETE_DESIGN_PROPERTIES`
- `EU_C1_REINFORCEMENT_DESIGN_PROPERTIES`
- `EU_C1_PARTIAL_FACTOR_GAMMA_C`
- `EU_C1_PARTIAL_FACTOR_GAMMA_S`
- `EU_C1_CONCRETE_COMPRESSION_RESPONSE`
- `EU_C1_CONCRETE_STRAIN_LIMITS`
- `EU_C1_REINFORCEMENT_RESPONSE`
- `EU_C1_REINFORCEMENT_STRAIN_STATES`
- `EU_C1_STRESS_BLOCK_OR_SECTION_MODEL`

Next phase type: `BOUNDED_RULE_GAP_IMPLEMENTATION` (`EOS-D1E-EU-C1C`).

## C1C gap classification

C1C reloaded C1B evidence and the C1 rule pack. Initial C2 gap count remains 9. Every remaining gap is `BLOCKED_RULE_AUTHORITY`. None is `IMPLEMENTATION_READY`. Adapter slots for `gamma_c`, `gamma_s`, constitutive response, strain limits, and `eta`/`lambda` remain unpopulated. Framework `ndpCapable` flags are not legal NDP status. Dependency class for all nine gaps is `UNRESOLVED` (not assumed National Annex/NDP/base-standard). No source conflict IDs. Section resistance strategy remains `UNRESOLVED`.

Implemented C1C numerical rule IDs: none. Formula fingerprints and golden cases are not required until a governed source exists. Fail-closed evaluators return `CHECK_UNDETERMINED` / `BLOCKED_RULE_AUTHORITY` with no silent fallback.

C2 remaining missing rule IDs are unchanged (the nine IDs above). `EU_C1_RULE_PACK_READY_FOR_FLEXURE = NO`. `EU_C2_REQUIRED_RULE_DEPENDENCIES_COMPLETE = NO`. Engineer validation remains pending. Conformance remains `INTENDED_PROFILE`. Licensed PDF absence is not the blocker.

## AI authority and validation debt

AI may explain rules, identify missing dependencies, and suggest test vectors. AI may not invent parameters or formulas, resolve source conflicts, select NDPs, promote maturity, claim conformance, or approve design.

Validation debt reduced only for the executed characteristic-property/tension-omission contract. Flexure, N-M, shear, serviceability, detailing, and formal conformance debts remain.

## C1C-EVIDENCE public / governed triangulation

C1C-EVIDENCE reloaded C1B/C1/C1C records. The original nine C2 gap IDs are unchanged. Minimum bounded-C2 uniaxial-flexure dependencies, given D1E-1 geometry/kinematics/fiber integration/equilibrium and the C1 characteristic/tension pack, are seven rules:

- `EU_C1_CONCRETE_DESIGN_PROPERTIES`
- `EU_C1_REINFORCEMENT_DESIGN_PROPERTIES`
- `EU_C1_PARTIAL_FACTOR_GAMMA_C`
- `EU_C1_PARTIAL_FACTOR_GAMMA_S`
- `EU_C1_CONCRETE_COMPRESSION_RESPONSE`
- `EU_C1_CONCRETE_STRAIN_LIMITS`
- `EU_C1_REINFORCEMENT_RESPONSE`

`EU_C1_STRESS_BLOCK_OR_SECTION_MODEL` is classified `SATISFIED_BY_MATERIAL_INTEGRATION`. A simplified stress block is an alternative first-generation method (Walraven workshop 3.1.7) and is not required. `EU_C1_REINFORCEMENT_STRAIN_STATES` remains `UNRESOLVED` as a separate rule.

Section-resistance strategy: `MATERIAL_INTEGRATION`. Strategy is resolved. Constitutive parameters required by that strategy are not yet governed.

### Bound sources (no licensed EN PDF; no copyrighted standard tables copied)

TIER_A: JRC113687 Table 8 (EN 1992-1-1 2.4.2.4(1); CEN recommended γc=1.5, γs=1.15; DNK diverges); JRC Eurocodes harmonisation page (material partial factors are NDPs); JRC71599 (recommended γC/γS; fcd=fck/γC and fyd=fyk/γS identities); JRC Arrieta 2011 workshop (example γc=1,50, γs=1,15); JRC Walraven 2011 workshop (stress-block example path; fcd=25/1,5).

TIER_B independent group TCC_UK: Concrete Centre lecture 2 (2016) corroborates Table 2.1N/NA persistent γC=1.50, γS=1.15 and the identity fcd=αcc fck/γc. UK αcc=0.85 for flexure is National Annex practice and is not packed.

TIER_D web summaries and unauthorized full-standard PDFs are not numerical authority.

Profile identity is recorded as first-generation EN 1992-1-1 clause sources. Second-generation FprEN 2023 constitutive notes are not mixed into first-generation parameter binding. Pack generation/edition remain `UNKNOWN_PENDING_CONFIRMATION`.

### Implementation-ready (evidence only; numerical count 0)

- `EU_C1_PARTIAL_FACTOR_GAMMA_C` / `EU_C1_PARTIAL_FACTOR_GAMMA_S`: `NDP_DEPENDENT`. Next C1C implementation may apply a declared National Annex or validated project override. CEN recommended values are evidence, not pack constants. No silent fallback. No location-inferred annex.
- `EU_C1_CONCRETE_DESIGN_PROPERTIES`: derived identity `fcd = αcc · fck / γc` with declared `αcc` and declared `γc`. `αcc` is NDP; 0.85 and 1.0 are not defaulted.
- `EU_C1_REINFORCEMENT_DESIGN_PROPERTIES`: derived identity `fyd = fyk / γs` with declared `γs`.

### Still blocked

- `EU_C1_CONCRETE_COMPRESSION_RESPONSE`
- `EU_C1_CONCRETE_STRAIN_LIMITS` (no generic `ecu` collapse; required strain-state IDs unbound)
- `EU_C1_REINFORCEMENT_RESPONSE`
- `EU_C1_REINFORCEMENT_STRAIN_STATES`

New-rule golden cases / numerical validation / deterministic execution: `NOT_APPLICABLE`. Existing C1 regression remains separately PASS. Partial-factor resolver behavior remains fail-closed PASS; factor authority class is now resolved as NDP.

C1C resume gate: FAIL (constitutive minimum dependencies remain blocked). C2 numerical pack: incomplete. Ready to resume C1C only for the evidence-ready subset. Conformance remains `INTENDED_PROFILE`. Pack uncertified. Product claim unchanged.

## C1C-RESUME-1 implemented NDP-dependent subset

R1 implements exactly the four C1C-EVIDENCE `IMPLEMENTATION_READY` rules. It does not implement compression response, strain limits, reinforcement response, reinforcement strain states, a stress block, or member flexure. D1E-1 material integration remains the bounded-C2 section-resistance strategy.

### Implemented rule IDs (cumulative 7)

C1 (3) plus:

- `EU_C1_PARTIAL_FACTOR_GAMMA_C`
- `EU_C1_PARTIAL_FACTOR_GAMMA_S`
- `EU_C1_CONCRETE_DESIGN_PROPERTIES`
- `EU_C1_REINFORCEMENT_DESIGN_PROPERTIES`

### Authority evidence

TIER_A JRC113687 / JRC harmonisation / JRC71599 / Arrieta 2011, independently corroborated by TIER_B TCC lecture 2 (2016). Formula fingerprints are the C1C-EVIDENCE candidates:

- gamma rules: require declared NDP or project override; forbid silent CEN recommended-value default; forbid location-inferred annex
- concrete design: `fcd = αcc · fck / γc` with declared `αcc` and declared `γc`
- reinforcement design: `fyd = fyk / γs` with declared `γs`

No packed `1.5`, `1.15`, `0.85`, or `1.0`. Adapter partial-factor slots remain unpopulated. Historical C1C `resolveEuC1cPartialFactor()` without declared context remains fail-closed.

### NDP dependency

`gamma_c`, `gamma_s`, and `αcc` are `NDP_DEPENDENT`. Execution requires a declared National Annex identity or a governed project override plus declared values with units, provenance, and version. Missing NDP returns `STANDARD_CONTEXT_INCOMPLETE`. Implemented does not mean always executable.

### Parameter provenance and validation

Each result records parameter IDs, units, source refs, profile, NDP dependency, evidence version `c1c-evidence.0`, implementation version `c1c-r1.0`, and `NUMERICALLY_VALIDATED` with engineer state `PENDING_HUMAN_ENGINEERING_REVIEW`. Independent golden cases cover representative, second, boundary, and unit-converted inputs without calling production from the golden module. Fail-closed cases cover missing gamma/NDP, invalid characteristic properties, invalid units, NaN, Infinity, unsupported family, and stale versions. Changing NDP, characteristic property, rule version, fingerprint, or evidence version invalidates dependent design-property results.

### Remaining minimum C2 dependencies

- `EU_C1_CONCRETE_COMPRESSION_RESPONSE`
- `EU_C1_CONCRETE_STRAIN_LIMITS`
- `EU_C1_REINFORCEMENT_RESPONSE`

`EU_C1_REINFORCEMENT_STRAIN_STATES` is `NOT_CURRENT_MINIMUM_DEPENDENCY` until a reinforcement response model is selected. Next phase type: targeted constitutive/strain evidence recovery. Not broad C1C. Conformance remains `INTENDED_PROFILE`. Pack uncertified. Product claim unchanged.

## C1C-CONSTITUTIVE implemented first-generation constitutive pack

This phase recovers governed public authority for the three remaining minimum-C2 constitutive rules and implements them through the existing D1E-1 `RcMaterialResponse` contract. No parallel RC kernel, material engine, equilibrium solver, or capability manifest was created. Licensed EN 1992 PDF text is not required at runtime or in-repository. No copyrighted standard tables are reproduced.

### Target rule IDs (cumulative 10)

C1 (3) + R1 (4) plus:

- `EU_C1_CONCRETE_COMPRESSION_RESPONSE`
- `EU_C1_CONCRETE_STRAIN_LIMITS`
- `EU_C1_REINFORCEMENT_RESPONSE`

### Source hierarchy

TIER_A JRC Walraven 2008 workshop (parabola-rectangle section-analysis law; `fck ≤ 50 MPa` strain identities). Independent corroboration: TIER_B Concrete Centre lecture 2 (2016); Oasys AdSec parabola-rectangle theory (`n = 2` for `fc ≤ 50 MPa`); Plevris et al. EC2 ULS section paper (horizontal-top reinforcement branch without a separate `εud` check). Public web copies are corroboration only. GeoStru high-strength `εcu2` disagrees with JRC/TCC; that conflict fails closed and high-strength parameters are not packed.

Profile evidence: sources claim first-generation EN 1992-1-1 section analysis. Pack generation/edition remain `UNKNOWN_PENDING_CONFIRMATION`. Second-generation FprEN parameters are not mixed.

### Selected models

Concrete compression: parabola-rectangle for section analysis. Kernel sign convention remains D1E-1 tension-positive; EC2 compression-positive strains are mapped explicitly. Tension is omitted (C1 `NO_TENSION`). Required strain states are `eps_c2` and `eps_cu2` (not a generic `ecu`). Exponent `n` and the `fck` constant-strain limit are provenanced parameters. Applicability: normal-weight concrete, static ULS, ambient temperature, `fck` at or below the constant-strain-parameter limit.

Reinforcement: new EU rule using the existing material-response interface. Elastic branch uses governed `Es`; plateau is `±fyd` from the R1 identity `fyd = fyk/γs`. Horizontal top branch. `EU_C1_REINFORCEMENT_STRAIN_STATES` is `NOT_REQUIRED_FOR_BOUNDED_C2`. Common linear-elastic D1E-1 reinforcement remains available and is not a ULS design response.

Section resistance strategy remains `MATERIAL_INTEGRATION`. No separate Eurocode stress-block engine.

### Fingerprints / provenance / golden cases

Deterministic formula fingerprints cover compression, strain states, and reinforcement response. Every packed numerical value has `parameterId`, units, source authority, source reference, profile/material applicability, version `c1c-constitutive.0`, and `NUMERICALLY_VALIDATED`. Independent golden cases cover zero, initial, intermediate, transition, plateau, ultimate, elastic, yield, post-yield, compression, and fail-closed outside-domain/NaN/Infinity/missing-property/high-strength-conflict/stale states without calling production from the golden module.

### C2 closure

Minimum C2 dependency set recomputed from implemented rules: remaining gap `NONE` / `0`. Authority complete: yes. Numerical pack complete: yes. Bounded pre-integration smoke test (governed context → D1E-1 plane-section strain → concrete response → reinforcement response → D1E-1 integration) passes. Smoke-test NDPs are labelled `TEST_ONLY_NON_CONFORMANCE` and must never become default runtime NDPs. The smoke test does not compute or claim member flexural resistance.

Engineer validation remains `PENDING_HUMAN_ENGINEERING_REVIEW`. Conformance remains `INTENDED_PROFILE`. Pack uncertified. Product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Next phase: `EOS-D1E-EU-C2`.
