# EOS-D1E-EU-C1A Eurocode Concrete Rule-Evidence Recovery

Recovery subphase after EOS-D1E-EU-C1 blocked on `AUTHORITATIVE_EN1992_PROFILE_REQUIRED`.

This phase binds a governed evidence manifest and human-confirmation contract. It does **not** implement numerical EN 1992 design rules, invent coefficients, infer edition, infer National Annex, infer NDP values, or copy copyrighted standard text.

`EU_CONCRETE_PRODUCT_CLAIM_LEVEL` remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`. Conformance remains `INTENDED_PROFILE`. Pack remains uncertified.

## Existing governed evidence

Found in-repo:

- EN 1992 family bound (EOS-D1E-EU-1)
- EN 1992-1-1 registered as the initial general-design part
- generation, edition, and amendment tokens `UNKNOWN_PENDING_CONFIRMATION`
- empty governed NDP catalog
- unpopulated adapter slots (`gamma_c`, `gamma_s`, `ecu`, `esu`, `eta`, `lambda`)
- framework-intended `ndpCapable` flags without edition-confirmed NDP legal status
- authority policy forbidding `LLM_MEMORY_ONLY` and silent edition inference

Not found: human-confirmed generation, edition, amendment/corrigendum, technical-basis identifier, authority/source identifier, or any numerical EN 1992 coefficient.

## Confirmed / unbound profile

| Field | State |
|---|---|
| Family | EN 1992 confirmed |
| Part | EN_1992_1_1 confirmed as v1 general-design part |
| Generation | UNKNOWN_PENDING_CONFIRMATION |
| Edition | UNKNOWN_PENDING_CONFIRMATION |
| Amendment | UNKNOWN_PENDING_CONFIRMATION |
| Pilot National Annex | UNBOUND |
| Exact profile resolved | NO |

A base EN 1992 profile without a National Annex is architecturally supported for genuinely base-standard-fixed rules. No such rules are implementable until generation/edition are human-confirmed, so the annex remaining unbound is not itself the primary C1 blocker.

## Human confirmation contract

An engineer must supply, without committing copyrighted standard PDFs or clause text:

- standard family (EN 1992)
- part (EN 1992-1-1)
- generation (`FIRST_GENERATION` or `SECOND_GENERATION`)
- edition
- amendment/corrigendum state
- technical basis identifier
- authority/source identifier
- confirmer identity and timestamp

Optional: explicit National Annex reference. NDP values remain forbidden unless the confirmed profile plus annex/authority bind them.

## Parameter dependency classification

Every C1-required parameter is classified **UNRESOLVED**. Framework slots that listed `gamma_c` / `gamma_s` / `ecu` / `eta` / `lambda` as NDP-capable are recorded as intended-profile architecture, not as authoritative NDP legal status.

`gamma_c` and `gamma_s` are not authority-bound. Concrete strain parameter set is not identified (the slot id `ecu` is not treated as a universal Eurocode parameter). Section-model parameter set is not identified (`eta`/`lambda` terminology is not assumed for every generation/material range). No values are populated.

## Planned C1 rule identifiers

Stable IDs (no copyrighted clause text):

`EU_C1_CONCRETE_CHAR_PROPERTIES`, `EU_C1_CONCRETE_DESIGN_PROPERTIES`, `EU_C1_REINFORCEMENT_CHAR_PROPERTIES`, `EU_C1_REINFORCEMENT_DESIGN_PROPERTIES`, `EU_C1_PARTIAL_FACTOR_GAMMA_C`, `EU_C1_PARTIAL_FACTOR_GAMMA_S`, `EU_C1_CONCRETE_COMPRESSION_RESPONSE`, `EU_C1_CONCRETE_TENSION_TREATMENT`, `EU_C1_CONCRETE_STRAIN_LIMITS`, `EU_C1_REINFORCEMENT_RESPONSE`, `EU_C1_REINFORCEMENT_STRAIN_STATES`, `EU_C1_STRESS_BLOCK_OR_SECTION_MODEL`.

Technical basis for all planned rules: `UNBOUND_PENDING_CONFIRMED_EN1992_EDITION`. Readiness: `BLOCKED_STANDARD_PROFILE` or `BLOCKED_HUMAN_CONFIRMATION`. Implementable C1 numerical rule count: 0.

## C2 dependency forecast

Bound: D1E-1 kernel, EU standard-binding architecture, EU-2 flexure framework.

Unbound: concrete/reinforcement design properties, partial factors, compression/strain/reinforcement response, stress-block/section model, National Annex/NDP context.

## C1 resume gate

`FAIL`. Present blockers:

`MISSING_STANDARD_GENERATION`, `MISSING_STANDARD_EDITION`, `MISSING_AMENDMENT_STATE`, `MISSING_RULE_AUTHORITY`, `MISSING_PARTIAL_FACTOR_AUTHORITY`, `MISSING_STRAIN_RULE_AUTHORITY`, `MISSING_SECTION_MODEL_AUTHORITY`, `HUMAN_CONFIRMATION_REQUIRED`.

Next phase remains **EOS-D1E-EU-C1** after a human-confirmed EN 1992 profile is bound into this evidence manifest.

## AI / architecture

AI remains advisory. It cannot invent coefficients, partial factors, strain limits, or edition. D1E frozen architecture is preserved. No parallel RC kernel, standard/annex/NDP/validation framework, or capability manifest was created.
