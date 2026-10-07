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

## AI authority and validation debt

AI may explain rules, identify missing dependencies, and suggest test vectors. AI may not invent parameters or formulas, resolve source conflicts, select NDPs, promote maturity, claim conformance, or approve design.

Validation debt reduced only for the executed characteristic-property/tension-omission contract. Flexure, N-M, shear, serviceability, detailing, and formal conformance debts remain.
